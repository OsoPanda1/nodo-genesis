/* ================================================================== */
/* MENSAJERÍA — Bus interno de mensajes del Nodo Cero                 */
/* ================================================================== */
/* Sistema de mensajería entre módulos, agentes y dominios: tópicos    */
/* (pub/sub) y mensajes directos con estado de lectura.                */
/* ================================================================== */

export interface RdmMessage {
  id: string;
  from: string;
  to: string | null; // null = difusión por tópico
  topic: string;
  text: string;
  at: number;
  read: boolean;
}

type TopicListener = (message: RdmMessage) => void;

let msgSeq = 0;
const topicListeners = new Map<string, Set<TopicListener>>();
const inbox: RdmMessage[] = [];
const MAX_INBOX = 300;

export function sendMessage(
  from: string,
  text: string,
  options: { topic?: string; to?: string } = {},
): RdmMessage {
  msgSeq += 1;
  const message: RdmMessage = {
    id: `msg-${Date.now().toString(36)}-${msgSeq.toString(36)}`,
    from,
    to: options.to ?? null,
    topic: options.topic ?? 'general',
    text,
    at: Date.now(),
    read: false,
  };
  inbox.push(message);
  if (inbox.length > MAX_INBOX) inbox.shift();
  const listeners = topicListeners.get(message.topic);
  if (listeners) {
    for (const listener of listeners) listener(message);
  }
  return message;
}

export function subscribeTopic(topic: string, listener: TopicListener): () => void {
  let set = topicListeners.get(topic);
  if (!set) {
    set = new Set();
    topicListeners.set(topic, set);
  }
  set.add(listener);
  return () => set.delete(listener);
}

export function inboxFor(actor: string, limit = 50): RdmMessage[] {
  return inbox
    .filter(m => m.to === actor || m.to === null)
    .slice(-limit)
    .reverse();
}

export function topicMessages(topic: string, limit = 50): RdmMessage[] {
  return inbox.filter(m => m.topic === topic).slice(-limit).reverse();
}

export function markMessageRead(id: string): void {
  const message = inbox.find(m => m.id === id);
  if (message) message.read = true;
}

export function unreadFor(actor: string): number {
  return inbox.filter(m => (m.to === actor || m.to === null) && !m.read).length;
}

export function clearInbox(): void {
  inbox.length = 0;
}

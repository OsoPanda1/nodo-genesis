import { ISABELLA_VOICE_MAX_CHARS } from './constants';

export function normalizeForSpeech(input: string): string {
  return input
    .replace(/```[\s\S]*?```/g, ' Se mostró código en pantalla. ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/https?:\/\/\S+/g, ' enlace disponible en pantalla ')
    .replace(/[*_#>`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, ISABELLA_VOICE_MAX_CHARS);
}

export function splitSpeechSegments(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [text];
  const result: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const candidate = `${current} ${sentence}`.trim();

    if (candidate.length > 350 && current) {
      result.push(current);
      current = sentence.trim();
      continue;
    }

    current = candidate;
  }

  if (current) result.push(current);

  return result;
}

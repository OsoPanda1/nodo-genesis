import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getCorsHeaders } from "../_shared/cors";

const processedEvents = new Set<string>();
const PROCESSED_TTL = 60 * 60 * 1000;

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    if (processedEvents.size > 1000) processedEvents.clear();
  }, PROCESSED_TTL).unref();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = (req.headers.origin as string | undefined) ?? null;
  const cors = getCorsHeaders(origin);
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: "missing_signature" });
  }

  try {
    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const { verifyWebhookSignature } = await import("../_shared/stripe");
    const event = verifyWebhookSignature(body, sig, webhookSecret);

    if (processedEvents.has(event.id)) {
      return res.status(200).json({ received: true, deduplicated: true });
    }
    processedEvents.add(event.id);
    setTimeout(() => processedEvents.delete(event.id), PROCESSED_TTL).unref();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as { customer?: string; subscription?: string; metadata?: Record<string, string> };
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as { id?: string; status?: string };
        break;
      }
      default:
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(400).json({ error: "webhook_error" });
  }
}

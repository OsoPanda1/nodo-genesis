import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeInstance = new Stripe(key, { apiVersion: "2025-02-24.acacia" });
  }
  return stripeInstance;
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
): Stripe.Event {
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}

/** Mask sensitive strings for safe logging */
function mask(val: string): string {
  return val.length > 8 ? val.slice(0, 4) + "****" : "****";
}

export async function handleStripeWebhook(
  rawBody: string | Buffer,
  signature: string | null,
): Promise<{ event: Stripe.Event | null; error?: string }> {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature) return { event: null, error: "Missing stripe-signature header" };
  if (!secret) return { event: null, error: "STRIPE_WEBHOOK_SECRET not configured" };

  try {
    const event = verifyWebhookSignature(rawBody, signature, secret);
    return { event };
  } catch (err: any) {
    console.error(`[STRIPE] Webhook signature verification failed: ${mask(signature)}`);
    return { event: null, error: `Signature verification failed: ${err.message}` };
  }
}

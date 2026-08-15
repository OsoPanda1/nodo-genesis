import type { Request, Response } from "express";
import Stripe from "stripe";
import { publishEvent } from "../../../core/tamv-os-kernel/src/event-bus";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-10-28.acacia",
});

export async function handleWebhook(req: Request & { rawBody: Buffer }, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const event = stripe.webhooks.constructEvent(
    req.rawBody,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await publishEvent({
      id: session.id,
      type: "PAYMENT_COMPLETED",
      federation: "MDD_TAMV",
      payload: {
        amount_total: session.amount_total,
        currency: session.currency,
        customer: session.customer,
        metadata: session.metadata,
      },
      source: "BACKOFFICE",
    });
  }

  res.status(200).send("ok");
}

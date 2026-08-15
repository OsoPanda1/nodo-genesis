const API_BASE = import.meta.env.VITE_API_URL || "/api";

export interface CheckoutResponse {
  ok: boolean;
  ref: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
  merchantKey?: string;
  serverTime: number;
}

export const paymentsApi = {
  async createDonation({ amount, currency, message }: { amount: number; currency: string; message: string }) {
    const res = await fetch(`${API_BASE}/payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount,
        currency,
        concept: message,
        type: "donation",
        method: "card",
      }),
    });

    const raw: unknown = await res.json().catch(() => ({}));
    const data = raw as Partial<CheckoutResponse>;

    if (!res.ok || data.ok === false) {
      const errorMessage =
        typeof (raw as Record<string, unknown>).error === "string"
          ? ((raw as Record<string, unknown>).error as string)
          : `La API territorial respondió ${res.status}`;
      throw new Error(errorMessage);
    }

    return {
      data: {
        url: `/apoya?success=true&ref=${encodeURIComponent(data.ref ?? "")}`,
        checkout: data as CheckoutResponse,
      },
    };
  },
};

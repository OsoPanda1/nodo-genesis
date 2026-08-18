import { consentEvents, reviews, reviewsScore } from "@/infra/metrics/prometheus";

const ALLOWED_TERRITORIES = new Set(["RDM", "PACHUCA", "HIDALGO"]);

function sanitizeTerritory(raw?: string) {
  const normalized = (raw ?? "RDM").toUpperCase().slice(0, 24);
  return ALLOWED_TERRITORIES.has(normalized) ? normalized : "RDM";
}

function sanitizeComment(raw?: unknown) {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[<>\\{}$`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const territory = sanitizeTerritory(body.territory);
  const consent = typeof body.consent === "boolean" ? body.consent : null;
  const rating = typeof body.rating === "number" ? Math.min(5, Math.max(1, Math.round(body.rating))) : null;
  const comment = sanitizeComment(body.comment);

  if (rating !== null) {
    const type = rating >= 4 ? "positive" : rating <= 2 ? "negative" : "neutral";
    reviews.inc({ territory, type });
    reviewsScore.observe(rating);
  }

  if (consent !== null) {
    consentEvents.inc({ territory, status: consent ? "granted" : "denied" });
  }

  return new Response(JSON.stringify({ ok: true, territory, consent, rating, comment }), {
    headers: { "Content-Type": "application/json" },
  });
}

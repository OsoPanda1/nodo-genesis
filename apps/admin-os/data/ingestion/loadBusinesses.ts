import fs from "node:fs";
import path from "node:path";

interface BusinessSeed {
  id: string;
  name: string;
  category: string;
  tags: string[];
  location: { lat: number; lng: number };
  media: Array<{ type: string; url: string }>;
  open_hours?: Record<string, string>;
}

const INPUT_PATH = path.resolve("data/seeds/businesses.json");
const API_URL = process.env.RDM_API_URL ?? "http://localhost:4000/business";
const BATCH_SIZE = Number(process.env.INGEST_BATCH ?? 25);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postBusiness(payload: BusinessSeed, retries = 3): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return;
    } catch (error) {
      lastError = error;
      await sleep(attempt * 200);
    }
  }

  throw lastError;
}

async function run() {
  const raw = fs.readFileSync(INPUT_PATH, "utf-8");
  const businesses = JSON.parse(raw) as BusinessSeed[];

  let uploaded = 0;

  for (let i = 0; i < businesses.length; i += BATCH_SIZE) {
    const batch = businesses.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map((business) => postBusiness(business)));
    uploaded += batch.length;
    console.log(`Uploaded ${uploaded}/${businesses.length}`);
  }
}

void run();

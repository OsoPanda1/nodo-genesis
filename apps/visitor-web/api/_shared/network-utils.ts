import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isIP } from "net";
import dns from "dns";
import { promisify } from "util";

const resolveDns = promisify(dns.resolve);

// ── Existing exports (preserved for backward compat) ──

export function absoluteUrl(req: VercelRequest): string {
  const host = req.headers.host || "localhost";
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) || "https";
  const url = req.url || "/";
  return url.startsWith("http") ? url : `${proto}://${host}${url}`;
}

export function normalizeHeaders(headers: VercelRequest["headers"]): Headers {
  const next = new Headers();
  for (const [key, value] of Object.entries(headers)) {
    if (Array.isArray(value)) {
      for (const item of value) next.append(key, item);
    } else if (value !== undefined) {
      next.set(key, String(value));
    }
  }
  return next;
}

export function vercelRequestToWebRequest(req: VercelRequest): Request {
  const method = req.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
  const body = hasBody && req.body !== undefined
    ? typeof req.body === "string" || req.body instanceof Buffer
      ? req.body
      : JSON.stringify(req.body)
    : undefined;

  return new Request(absoluteUrl(req), {
    method,
    headers: normalizeHeaders(req.headers),
    body,
  });
}

export async function sendWebResponse(res: VercelResponse, response: Response) {
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const text = await response.text();
  return res.status(response.status).send(text);
}

// ── SSRF Protection Layer ──

export function isPrivateIP(ip: string): boolean {
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("172.")) {
    const parts = ip.split(".").map(Number);
    if (parts[1] >= 16 && parts[1] <= 31) return true;
  }
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("169.254.")) return true;
  if (ip === "::1" || ip.startsWith("fe80:") || ip.startsWith("fc00:") || ip.startsWith("fd00:")) return true;
  return false;
}

export async function validateSafeUrl(urlString: string): Promise<string> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new Error("Invalid URL format");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(`Protocol not allowed: ${url.protocol}`);
  }
  const hostname = url.hostname;
  if (isIP(hostname)) {
    if (isPrivateIP(hostname)) throw new Error("Access denied: private IP target");
    return urlString;
  }
  try {
    const addresses = await resolveDns(hostname);
    for (const ip of addresses) {
      if (isPrivateIP(ip)) throw new Error("Access denied: domain resolves to private IP");
    }
  } catch {
    throw new Error(`DNS resolution failed for: ${hostname}`);
  }
  return urlString;
}

export async function safeFetch(urlString: string, options: RequestInit = {}): Promise<Response> {
  const safeUrl = await validateSafeUrl(urlString);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    return await fetch(safeUrl, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

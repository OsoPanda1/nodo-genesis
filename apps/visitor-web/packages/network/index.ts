export function absoluteUrl(req: { headers: { host?: string }; url?: string }): string {
  const host = req.headers.host || "localhost";
  const proto = (req.headers["x-forwarded-proto"] as string | undefined) || "https";
  const url = req.url || "/";
  return url.startsWith("http") ? url : `${proto}://${host}${url}`;
}

export function normalizeHeaders(headers: Record<string, string | string[] | undefined>): Headers {
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

export function vercelRequestToWebRequest(req: {
  method?: string;
  body?: unknown;
  headers: { host?: string; [key: string]: string | string[] | undefined };
  url?: string;
}): Request {
  const method = req.method || "GET";
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
  const body =
    hasBody && req.body !== undefined
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

export async function sendWebResponse(
  res: { setHeader: (k: string, v: string) => void; status: (s: number) => { send: (t: string) => void } },
  response: Response,
) {
  response.headers.forEach((value, key) => res.setHeader(key, value));
  const text = await response.text();
  return res.status(response.status).send(text);
}

export function parseQueryString(url: string): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const searchParams = new URL(url).searchParams;
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  } catch {
    // Invalid URL, return empty
  }
  return params;
}

export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

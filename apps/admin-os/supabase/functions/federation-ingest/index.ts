import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const OWNER = "OsoPanda1";
const SIGNALS = ["rdm", "real-del-monte", "real del monte", "smart", "city", "digital", "twin", "gemelo", "tamv", "nodo", "cero", "ltos", "anubis", "isabella"];

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const sha256 = async (value: unknown) => {
  const data = new TextEncoder().encode(JSON.stringify(value));
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

const federationFor = (repo: { name: string; language?: string | null; description?: string | null }) => {
  const text = `${repo.name} ${repo.description ?? ""}`.toLowerCase();
  if (text.includes("anubis") || text.includes("guard")) return "ANUBIS";
  if (text.includes("book") || text.includes("data")) return "BOOKPI";
  if (text.includes("tamv") || text.includes("rdm")) return "MDD_TAMV";
  if (text.includes("phoenix") || text.includes("fenix")) return "PHOENIX";
  if (text.includes("kaos") || text.includes("xr")) return "KAOS";
  if (text.includes("chronos") || text.includes("planner")) return "CHRONOS";
  return "DEKATEOTL";
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!["POST", "GET"].includes(req.method)) return json({ error: "Método no permitido" }, 405);

  const url = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const githubToken = Deno.env.get("GITHUB_TOKEN");
  if (!url || !serviceKey) return json({ error: "Backend no configurado" }, 500);

  const gh = await fetch(`https://api.github.com/users/${OWNER}/repos?per_page=100&sort=updated`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "RDM-Digital-Federation-Ingest",
      ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
    },
  });
  if (!gh.ok) return json({ error: `GitHub respondió ${gh.status}` }, 502);
  const repos = await gh.json();

  const related = repos.filter((repo: any) => {
    const haystack = `${repo.name ?? ""} ${repo.description ?? ""} ${repo.topics?.join(" ") ?? ""}`.toLowerCase();
    return SIGNALS.some((signal) => haystack.includes(signal));
  });

  const rows = await Promise.all(related.map(async (repo: any, index: number) => {
    const payload = {
      role: "repo_federado",
      modules: repo.topics?.length ? repo.topics : [repo.language ?? "N/A", "RDM_DIGITAL"],
      contribution: repo.description ?? "Repositorio federado al Nodo Cero RDM Digital.",
      stack: repo.language ?? "N/A",
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      updated_at: repo.updated_at,
    };
    return {
      source_repo: repo.name,
      federation: federationFor(repo),
      stream_type: "GITHUB_REPO_SYNC",
      payload,
      integrity_hash: await sha256(payload),
      upstream_repo: related[index - 1]?.name ?? null,
      downstream_repo: related[index + 1]?.name ?? related[0]?.name ?? null,
      sync_status: "active",
      last_synced_at: new Date().toISOString(),
    };
  }));

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.from("federation_data_streams").upsert(rows, { onConflict: "source_repo" });
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, owner: OWNER, ingested: rows.length, repos: rows.map((r) => r.source_repo) });
});
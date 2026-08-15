#!/usr/bin/env tsx
// ============================================================================
// LDTOCS · RDM Digital OS — Civilizational Ecosystem Orchestrator
// Live Digital Technologic Operating Civilizational System
//
// Ontología:
// - 7 Federaciones (F1–F7).
// - 10 Capas operativas L0–L9.
// - Pipelines de Conciencia P0–P8 para Isabella / ISA-AI.
//
// Orquestación:
// - Sincronización basada en submodules y repos satélite.
// - Sistema de snapshots firmados para observabilidad YUN.
//
// Seguridad:
// - Manejo de nodos críticos.
// - Pre-flight checks y git rebase.
// - Códigos de salida diferenciados para CI.
//
// Uso:
//   tsx tools/rdmx-ldtocs.ts sync   [--dry-run] [--no-commit] [--verbose]
//   tsx tools/rdmx-ldtocs.ts status [--verbose]
//   tsx tools/rdmx-ldtocs.ts audit  [--verbose]
//   tsx tools/rdmx-ldtocs.ts help
// ============================================================================

import { execSync } from "child_process";
import os from "os";
import crypto from "crypto";
import pLimit from "p-limit";

// ============================================================================
// Tipos ontológicos YUN
// ============================================================================

type Domain =
  | "territorial"
  | "civilizational"
  | "quantum"
  | "smart-city"
  | "core"
  | "twin"
  | "roots"
  | "nexus";

type FederationId =
  | "F1_DEKATEOTL"
  | "F2_ANUBIS"
  | "F3_BOOKPI"
  | "F4_PHOENIX"
  | "F5_MDD_TAMV"
  | "F6_KAOS_HYPERRENDER"
  | "F7_CHRONOS";

type LayerId =
  | "L0_BOOT"
  | "L1_PROTOCOL"
  | "L2_INFRA"
  | "L3_DATA_FABRIC"
  | "L4_IDENTITY_COMMERCE"
  | "L5_INTELLIGENCE"
  | "L6_TERRITORIAL"
  | "L7_GAMEPLAY"
  | "L8_EXPERIENCE_UI"
  | "L9_OBSERVABILITY";

type PipelineId =
  | "P0_NUCLEO_AMOR"
  | "P1_MEMORIA_EMOCIONAL"
  | "P2_PROCESAMIENTO_LINGUISTICO"
  | "P3_RECONOCIMIENTO_EMOCIONAL"
  | "P4_INTERPRETACION_CONTEXTUAL"
  | "P5_ANALISIS_PSICOLOGICO"
  | "P6_EMPATIA_PROFUNDA"
  | "P7_SANACION_COLECTIVA"
  | "P8_CONSCIENCIA_LEGADO";

type SnapshotSeverity = "ok" | "degraded" | "critical";

type ProcessId = "P0" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8";

interface ModuleRef {
  id: string;
  repo: string;
  path: string;
  defaultBranch?: string;
  isRoot?: boolean;
  critical?: boolean;
  domain: Domain;
  federation: FederationId;
  layer: LayerId;
  pipeline?: PipelineId;
}

interface CliOptions {
  dryRun: boolean;
  autoCommit: boolean;
  verbose: boolean;
}

interface ModuleStatus {
  id: string;
  path: string;
  branch: string;
  hash: string;
  dirty: boolean;
  initialized: boolean;
  domain: Domain;
  federation: FederationId;
  layer: LayerId;
  pipeline?: PipelineId;
  error?: string;
}

interface CivilizationalSnapshot {
  timestamp: string;
  originHost: string;
  originUser: string;
  yunFederation: FederationId;
  yunDomain: Domain;
  yunLayer: LayerId;
  severity: SnapshotSeverity;
  signature: string;
  modules: ModuleStatus[];
  summary: {
    total: number;
    initialized: number;
    clean: number;
    dirty: number;
    criticalIssues: number;
    byFederation: Record<FederationId, { total: number; issues: number }>;
    byLayer: Record<LayerId, { total: number; issues: number }>;
  };
}

interface AuditIssue {
  level: "info" | "warning" | "error";
  moduleId?: string;
  federation?: FederationId;
  layer?: LayerId;
  process?: ProcessId;
  message: string;
}

interface AuditReport {
  timestamp: string;
  originHost: string;
  originUser: string;
  issues: AuditIssue[];
  ok: boolean;
}

interface PipelineOntology {
  id: PipelineId;
  process: ProcessId;
  description: string;
  requiredForCritical: boolean;
}

interface LayerOntology {
  id: LayerId;
  order: number;
  description: string;
  criticalForFederation?: FederationId[];
}

// ============================================================================
// Ontología de Pipelines P0–P8
// ============================================================================

const PIPELINE_ONTOLOGY: PipelineOntology[] = [
  {
    id: "P0_NUCLEO_AMOR",
    process: "P0",
    description: "Núcleo de amor computacional y vínculo con ANUBIS.",
    requiredForCritical: true,
  },
  {
    id: "P1_MEMORIA_EMOCIONAL",
    process: "P1",
    description: "Memoria emocional de usuarios y territorio.",
    requiredForCritical: true,
  },
  {
    id: "P2_PROCESAMIENTO_LINGUISTICO",
    process: "P2",
    description: "Procesamiento de lenguaje natural y voz.",
    requiredForCritical: false,
  },
  {
    id: "P3_RECONOCIMIENTO_EMOCIONAL",
    process: "P3",
    description: "Detección de estados afectivos individuales.",
    requiredForCritical: false,
  },
  {
    id: "P4_INTERPRETACION_CONTEXTUAL",
    process: "P4",
    description: "Interpretación contextual multi‑federación.",
    requiredForCritical: false,
  },
  {
    id: "P5_ANALISIS_PSICOLOGICO",
    process: "P5",
    description: "Análisis psicológico y patrones de comportamiento.",
    requiredForCritical: false,
  },
  {
    id: "P6_EMPATIA_PROFUNDA",
    process: "P6",
    description: "Empatía profunda y acompañamiento.",
    requiredForCritical: false,
  },
  {
    id: "P7_SANACION_COLECTIVA",
    process: "P7",
    description: "Sanación colectiva, resiliencia comunitaria.",
    requiredForCritical: false,
  },
  {
    id: "P8_CONSCIENCIA_LEGADO",
    process: "P8",
    description: "Conciencia de legado, registro de firmas e integridad.",
    requiredForCritical: true,
  },
];

const PIPELINE_ONTOLOGY_BY_ID = new Map<PipelineId, PipelineOntology>(
  PIPELINE_ONTOLOGY.map((p) => [p.id, p]),
);

// ============================================================================
// Ontología de Capas L0–L9
// ============================================================================

const LAYER_ONTOLOGY: LayerOntology[] = [
  {
    id: "L0_BOOT",
    order: 0,
    description: "Boot, hardware mesh, arranque del nodo.",
    criticalForFederation: ["F5_MDD_TAMV", "F6_KAOS_HYPERRENDER"],
  },
  {
    id: "L1_PROTOCOL",
    order: 1,
    description: "Protocolos de red, cardinalización, transporte.",
  },
  {
    id: "L2_INFRA",
    order: 2,
    description: "Infraestructura lógica, CITEMESH, SDMD-7 base.",
  },
  {
    id: "L3_DATA_FABRIC",
    order: 3,
    description: "Data Fabric, sincronización, GEMET/EOCT.",
  },
  {
    id: "L4_IDENTITY_COMMERCE",
    order: 4,
    description: "Identidad, comercio, contratos MSR.",
  },
  {
    id: "L5_INTELLIGENCE",
    order: 5,
    description: "IA, inferencia, Quetzalcoatl.",
  },
  {
    id: "L6_TERRITORIAL",
    order: 6,
    description: "Mapas, geoespacial, nodos territoriales.",
  },
  {
    id: "L7_GAMEPLAY",
    order: 7,
    description: "Gameplay, interacción lúdica.",
  },
  {
    id: "L8_EXPERIENCE_UI",
    order: 8,
    description: "Experiencia de usuario, interfaces, XR.",
  },
  {
    id: "L9_OBSERVABILITY",
    order: 9,
    description: "Observabilidad, telemetría, Ojo de Ra.",
  },
];

const LAYER_ONTOLOGY_BY_ID = new Map<LayerId, LayerOntology>(
  LAYER_ONTOLOGY.map((l) => [l.id, l]),
);

// ============================================================================
// Mapa heptafederado del ecosistema (repos principales)
// ============================================================================

const MODULES: ModuleRef[] = [
  {
    id: "real-del-monte-explorer",
    repo: "https://github.com/OsoPanda1/real-del-monte-explorer.git",
    path: ".",
    defaultBranch: "main",
    isRoot: true,
    critical: true,
    domain: "territorial",
    federation: "F1_DEKATEOTL",
    layer: "L8_EXPERIENCE_UI",
    pipeline: "P2_PROCESAMIENTO_LINGUISTICO",
  },
  {
    id: "real-del-monte-twin",
    repo: "https://github.com/OsoPanda1/real-del-monte-twin.git",
    path: "packages/real-del-monte-twin",
    defaultBranch: "main",
    critical: true,
    domain: "twin",
    federation: "F7_CHRONOS",
    layer: "L6_TERRITORIAL",
    pipeline: "P4_INTERPRETACION_CONTEXTUAL",
  },
  {
    id: "rdm-digital-core",
    repo: "https://github.com/OsoPanda1/rdm-digital-2dbd42b0.git",
    path: "packages/rdm-digital-core",
    defaultBranch: "main",
    critical: true,
    domain: "core",
    federation: "F1_DEKATEOTL",
    layer: "L3_DATA_FABRIC",
    pipeline: "P5_ANALISIS_PSICOLOGICO",
  },
  {
    id: "rdm-smart-city-os",
    repo: "https://github.com/OsoPanda1/rdm-smart-city-os.git",
    path: "packages/rdm-smart-city-os",
    defaultBranch: "main",
    domain: "smart-city",
    federation: "F4_PHOENIX",
    layer: "L2_INFRA",
    pipeline: "P7_SANACION_COLECTIVA",
  },
  {
    id: "citemesh-roots",
    repo: "https://github.com/OsoPanda1/citemesh-roots.git",
    path: "packages/citemesh-roots",
    defaultBranch: "main",
    domain: "roots",
    federation: "F6_KAOS_HYPERRENDER",
    layer: "L2_INFRA",
    pipeline: "P6_EMPATIA_PROFUNDA",
  },
  {
    id: "genesis-digytamv-nexus",
    repo: "https://github.com/OsoPanda1/genesis-digytamv-nexus.git",
    path: "packages/genesis-digytamv-nexus",
    defaultBranch: "main",
    critical: true,
    domain: "nexus",
    federation: "F2_ANUBIS",
    layer: "L1_PROTOCOL",
    pipeline: "P0_NUCLEO_AMOR",
  },
  {
    id: "civilizational-core",
    repo: "https://github.com/OsoPanda1/civilizational-core.git",
    path: "packages/civilizational-core",
    defaultBranch: "main",
    critical: true,
    domain: "civilizational",
    federation: "F2_ANUBIS",
    layer: "L5_INTELLIGENCE",
    pipeline: "P1_MEMORIA_EMOCIONAL",
  },
  {
    id: "quantum-system-tamv",
    repo: "https://github.com/OsoPanda1/quantum-system-tamv.git",
    path: "packages/quantum-system-tamv",
    defaultBranch: "main",
    domain: "quantum",
    federation: "F3_BOOKPI",
    layer: "L1_PROTOCOL",
    pipeline: "P8_CONSCIENCIA_LEGADO",
  },
  {
    id: "rdm-digital-nodo-cero",
    repo: "https://github.com/OsoPanda1/rdm-digital-nodo-cero.git",
    path: "packages/rdm-digital-nodo-cero",
    defaultBranch: "main",
    critical: true,
    domain: "territorial",
    federation: "F5_MDD_TAMV",
    layer: "L4_IDENTITY_COMMERCE",
    pipeline: "P3_RECONOCIMIENTO_EMOCIONAL",
  },
  {
    id: "real-del-monte-explorer-11b3982a",
    repo: "https://github.com/OsoPanda1/real-del-monte-explorer-11b3982a.git",
    path: "packages/real-del-monte-explorer-11b3982a",
    defaultBranch: "main",
    domain: "territorial",
    federation: "F6_KAOS_HYPERRENDER",
    layer: "L8_EXPERIENCE_UI",
  },
  {
    id: "rdm-digital-2026",
    repo: "https://github.com/OsoPanda1/RDM-DIGITAL2026.git",
    path: "packages/rdm-digital-2026",
    defaultBranch: "main",
    domain: "territorial",
    federation: "F1_DEKATEOTL",
    layer: "L8_EXPERIENCE_UI",
  },
];

// ============================================================================
// Utilidades de ejecución
// ============================================================================

function run(cmd: string, cwd?: string, opts?: CliOptions): string {
  const dryRun = opts?.dryRun ?? false;
  const verbose = opts?.verbose ?? false;

  if (dryRun) {
    console.log(`  ⏎ [dry-run] ${cwd ? `(${cwd}) ` : ""}${cmd}`);
    return "";
  }

  if (verbose) {
    console.log(`  ⇢ ${cwd ? `(${cwd}) ` : ""}${cmd}`);
  }

  try {
    return execSync(cmd, { stdio: "pipe", cwd, encoding: "utf-8" }).trim();
  } catch (e: unknown) {
    const err = e as { stderr?: string; message?: string };
    console.error(`  ⚠ Command failed: ${cmd}`);
    if (err.stderr) console.error(`    ${err.stderr.trim()}`);
    else if (err.message) console.error(`    ${err.message}`);
    return "";
  }
}

function getShortHash(cwd: string, opts: CliOptions): string {
  return run("git rev-parse --short HEAD", cwd, opts);
}

function getBranch(cwd: string, opts: CliOptions): string {
  const branch = run("git rev-parse --abbrev-ref HEAD", cwd, opts);
  return branch || "(detached)";
}

function hasLocalChanges(cwd: string, opts: CliOptions): boolean {
  const status = run("git status --porcelain", cwd, opts);
  return status !== "";
}

// ============================================================================
// Estado del ecosistema / snapshot civilizacional
// ============================================================================

function collectStatus(opts: CliOptions): ModuleStatus[] {
  return MODULES.map((mod) => {
    try {
      const hash = getShortHash(mod.path, opts);
      const initialized = hash !== "";
      const branch = initialized ? getBranch(mod.path, opts) : "";
      const dirty = initialized ? hasLocalChanges(mod.path, opts) : false;

      return {
        id: mod.id,
        path: mod.path,
        branch,
        hash,
        dirty,
        initialized,
        domain: mod.domain,
        federation: mod.federation,
        layer: mod.layer,
        pipeline: mod.pipeline,
      };
    } catch (error: any) {
      return {
        id: mod.id,
        path: mod.path,
        branch: "",
        hash: "",
        dirty: false,
        initialized: false,
        domain: mod.domain,
        federation: mod.federation,
        layer: mod.layer,
        pipeline: mod.pipeline,
        error: error?.message ?? "Status collection failed",
      };
    }
  });
}

function computeSeverity(summary: CivilizationalSnapshot["summary"]): SnapshotSeverity {
  if (summary.criticalIssues > 0) return "critical";
  if (summary.dirty > 0) return "degraded";
  return "ok";
}

function signSnapshot(modules: ModuleStatus[], timestamp: string): string {
  const payload = JSON.stringify({
    t: timestamp,
    mods: modules.map((m) => ({
      id: m.id,
      hash: m.hash,
      branch: m.branch,
      dirty: m.dirty,
      initialized: m.initialized,
    })),
  });
  return crypto.createHash("sha256").update(payload).digest("hex");
}

function buildSnapshot(opts: CliOptions, modulesOverride?: ModuleStatus[]): CivilizationalSnapshot {
  const modules = modulesOverride ?? collectStatus(opts);
  const total = modules.length;
  const initialized = modules.filter((m) => m.initialized).length;
  const clean = modules.filter((m) => m.initialized && !m.dirty).length;
  const dirty = modules.filter((m) => m.initialized && m.dirty).length;

  const criticalIds = new Set(
    MODULES.filter((m) => m.critical).map((m) => m.id),
  );
  const criticalIssues = modules.filter(
    (m) => criticalIds.has(m.id) && (!m.initialized || m.dirty || m.error),
  ).length;

  const byFederation = {} as CivilizationalSnapshot["summary"]["byFederation"];
  const byLayer = {} as CivilizationalSnapshot["summary"]["byLayer"];

  for (const mod of MODULES) {
    if (!byFederation[mod.federation]) {
      byFederation[mod.federation] = { total: 0, issues: 0 };
    }
    if (!byLayer[mod.layer]) {
      byLayer[mod.layer] = { total: 0, issues: 0 };
    }
  }

  for (const m of modules) {
    byFederation[m.federation].total += 1;
    byLayer[m.layer].total += 1;

    const issue = !m.initialized || m.dirty || !!m.error;
    if (issue) {
      byFederation[m.federation].issues += 1;
      byLayer[m.layer].issues += 1;
    }
  }

  const timestamp = new Date().toISOString();
  const signature = signSnapshot(modules, timestamp);
  const summary = {
    total,
    initialized,
    clean,
    dirty,
    criticalIssues,
    byFederation,
    byLayer,
  };
  const severity = computeSeverity(summary);

  const yunFederation: FederationId = "F1_DEKATEOTL";
  const yunDomain: Domain = "territorial";
  const yunLayer: LayerId = "L8_EXPERIENCE_UI";

  return {
    timestamp,
    originHost: os.hostname(),
    originUser: os.userInfo().username,
    yunFederation,
    yunDomain,
    yunLayer,
    severity,
    signature,
    modules,
    summary,
  };
}

function printSnapshot(snapshot: CivilizationalSnapshot): void {
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║ LDTOCS · RDM Digital OS — Civilizational Status  ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  console.log(`Timestamp:   ${snapshot.timestamp}`);
  console.log(`OriginHost:  ${snapshot.originHost}`);
  console.log(`OriginUser:  ${snapshot.originUser}`);
  console.log(`YUN:         ${snapshot.yunFederation}/${snapshot.yunDomain}/${snapshot.yunLayer}`);
  console.log(`Severity:    ${snapshot.severity}`);
  console.log(`Signature:   ${snapshot.signature}\n`);

  for (const m of snapshot.modules) {
    let health: string;
    if (m.error) {
      health = `✗ error (${m.error})`;
    } else if (!m.initialized) {
      health = "✗ not initialized";
    } else if (m.dirty) {
      health = "⚠ dirty";
    } else {
      health = "✓ clean";
    }

    const pipelineLabel = m.pipeline ? ` · ${m.pipeline}` : "";
    console.log(
      `  ${m.id.padEnd(32)} ${health} @ ${m.branch || "n/a"} (${m.hash ||
        "-"}) [${m.federation}/${m.layer}${pipelineLabel}]`,
    );
  }

  console.log("\nSummary:");
  console.log(
    `  Total: ${snapshot.summary.total}, initialized: ${snapshot.summary.initialized}, clean: ${snapshot.summary.clean}, dirty: ${snapshot.summary.dirty}, critical issues: ${snapshot.summary.criticalIssues}\n`,
  );

  console.log("  By Federation:");
  for (const [fed, data] of Object.entries(snapshot.summary.byFederation)) {
    console.log(`    ${fed.padEnd(18)} total=${data.total}, issues=${data.issues}`);
  }

  console.log("\n  By Layer:");
  for (const [layer, data] of Object.entries(snapshot.summary.byLayer)) {
    console.log(`    ${layer.padEnd(18)} total=${data.total}, issues=${data.issues}`);
  }

  console.log();
}

// ============================================================================
// Sync concurrente del ecosistema heptafederado
// ============================================================================

function syncModule(mod: ModuleRef, opts: CliOptions): ModuleStatus {
  const label = mod.isRoot ? `${mod.id} (root)` : mod.id;
  console.log(`\n── ${label} ──`);
  console.log(`   Federation: ${mod.federation}`);
  console.log(`   Domain:     ${mod.domain}`);
  console.log(`   Layer:      ${mod.layer}`);
  if (mod.pipeline) console.log(`   Pipeline:   ${mod.pipeline}`);
  console.log(`   Path:       ${mod.path}`);

  try {
    const initialHash = getShortHash(mod.path, opts);
    if (!initialHash) {
      console.log("   ⚠ Not initialized or not a git repo — skipping sync");
      return {
        id: mod.id,
        path: mod.path,
        branch: "",
        hash: "",
        dirty: false,
        initialized: false,
        domain: mod.domain,
        federation: mod.federation,
        layer: mod.layer,
        pipeline: mod.pipeline,
        error: "not-initialized-or-not-git",
      };
    }

    const initialBranch = getBranch(mod.path, opts);
    console.log(`   Branch:  ${initialBranch}`);
    console.log(`   Current: ${initialHash}`);

    console.log("   Fetching latest remote state...");
    run("git fetch --all --prune", mod.path, opts);

    if (mod.defaultBranch) {
      console.log(`   Aligning to origin/${mod.defaultBranch}...`);
      run(`git checkout ${mod.defaultBranch}`, mod.path, opts);
      run(`git pull --rebase origin ${mod.defaultBranch}`, mod.path, opts);
    } else if (!mod.isRoot) {
      console.log("   Updating to latest tracked commit (submodule)…");
      run("git submodule update --remote", mod.path, opts);
    }

    const newHash = getShortHash(mod.path, opts);
    const newBranch = getBranch(mod.path, opts);
    const dirty = hasLocalChanges(mod.path, opts);
    console.log(
      `   Updated: ${newHash}${initialHash === newHash ? " (no changes)" : " ✓"}`,
    );
    if (dirty) {
      console.log("   ⚠ Local changes present after sync.");
    }

    return {
      id: mod.id,
      path: mod.path,
      branch: newBranch,
      hash: newHash,
      dirty,
      initialized: true,
      domain: mod.domain,
      federation: mod.federation,
      layer: mod.layer,
      pipeline: mod.pipeline,
    };
  } catch (error: any) {
    console.error(`   ✗ Sync failed for ${mod.id}: ${error?.message ?? "unknown error"}`);
    return {
      id: mod.id,
      path: mod.path,
      branch: "",
      hash: "",
      dirty: false,
      initialized: false,
      domain: mod.domain,
      federation: mod.federation,
      layer: mod.layer,
      pipeline: mod.pipeline,
      error: error?.message ?? "sync-failed",
    };
  }
}

async function syncEcosystemConcurrent(opts: CliOptions): Promise<ModuleStatus[]> {
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║ LDTOCS · RDM Digital OS — Ecosystem Sync (YUN)   ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  console.log("→ Syncing submodule configuration (YUN fabric)...");
  run("git submodule sync --recursive", undefined, opts);
  run("git submodule update --init --recursive", undefined, opts);

  const limit = pLimit(4); // máximo 4 módulos en paralelo [web:64][web:65]

  const syncPromises = MODULES.map((mod) =>
    limit(() => Promise.resolve(syncModule(mod, opts))),
  );

  const results = await Promise.all(syncPromises);

  console.log("\n→ Staging submodule pointer changes...");
  if (opts.dryRun) {
    console.log("  ⏎ [dry-run] git add .");
    console.log(
      '  ⏎ [dry-run] git commit -m "chore: ldto-sys sync" (if there are changes)',
    );
  } else {
    run("git add .", undefined, opts);
    if (!opts.autoCommit) {
      console.log("  Changes staged but not committed (auto-commit disabled).");
    } else {
      const diff = run("git diff --cached --name-only", undefined, opts);
      if (!diff) {
        console.log("  No changes to commit.");
      } else {
        run('git commit -m "chore: ldto-sys sync"', undefined, opts);
        console.log('  ✅ Commit created: "chore: ldto-sys sync"');
      }
    }
  }

  return results;
}

// ============================================================================
// Reporting: enviar snapshot a API (Supabase / ISA-AI)
// ============================================================================

async function reportSnapshot(snapshot: CivilizationalSnapshot, opts: CliOptions): Promise<void> {
  const endpoint = process.env.LDTOCS_SNAPSHOT_ENDPOINT;
  if (!endpoint) {
    if (opts.verbose) {
      console.log("↪ LDTOCS_SNAPSHOT_ENDPOINT not set, skipping remote reporting.");
    }
    return;
  }

  if (opts.dryRun) {
    console.log(`↪ [dry-run] would POST snapshot to ${endpoint}`);
    return;
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-YUN-Federation": snapshot.yunFederation,
        "X-YUN-Domain": snapshot.yunDomain,
        "X-YUN-Layer": snapshot.yunLayer,
        "X-LDTOCS-Signature": snapshot.signature,
      },
      body: JSON.stringify(snapshot),
    });

    if (!res.ok) {
      console.error(`✗ Snapshot reporting failed: ${res.status} ${res.statusText}`);
    } else if (opts.verbose) {
      console.log("✓ Snapshot reported successfully to LDTOCS_SNAPSHOT_ENDPOINT.");
    }
  } catch (error: any) {
    console.error(`✗ Snapshot reporting error: ${error?.message ?? "unknown error"}`);
  }
}

// ============================================================================
// Auditoría ontológica: capas L0–L9 y pipelines P0–P8
// ============================================================================

function auditLayers(statuses: ModuleStatus[]): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const knownLayers = new Set(LAYER_ONTOLOGY.map((l) => l.id));

  for (const s of statuses) {
    if (!knownLayers.has(s.layer)) {
      issues.push({
        level: "warning",
        moduleId: s.id,
        federation: s.federation,
        layer: s.layer,
        message: `Module uses unknown layer '${s.layer}' not defined in L0-L9 ontology`,
      });
    }
  }

  return issues;
}

function auditPipelines(statuses: ModuleStatus[]): AuditIssue[] {
  const issues: AuditIssue[] = [];

  for (const s of statuses) {
    if (!s.pipeline) continue;
    const onto = PIPELINE_ONTOLOGY_BY_ID.get(s.pipeline);
    if (!onto) {
      issues.push({
        level: "warning",
        moduleId: s.id,
        federation: s.federation,
        layer: s.layer,
        message: `Module uses pipeline '${s.pipeline}' not present in YUN ontology`,
      });
      continue;
    }

    if (onto.requiredForCritical && s.initialized === false) {
      issues.push({
        level: "error",
        moduleId: s.id,
        federation: s.federation,
        layer: s.layer,
        process: onto.process,
        message: `Critical pipeline ${onto.id} (process ${onto.process}) not initialized in module ${s.id}`,
      });
    }
  }

  return issues;
}

function auditEcosystem(opts: CliOptions): AuditReport {
  const timestamp = new Date().toISOString();
  const originHost = os.hostname();
  const originUser = os.userInfo().username;

  const statuses = collectStatus(opts);
  const issues: AuditIssue[] = [];

  // 1. Módulos no inicializados
  for (const s of statuses) {
    if (!s.initialized) {
      issues.push({
        level: "error",
        moduleId: s.id,
        federation: s.federation,
        layer: s.layer,
        message: "Module not initialized or not a git repo",
      });
    }
  }

  // 2. Módulos críticos con problemas
  const criticalIds = new Set(
    MODULES.filter((m) => m.critical).map((m) => m.id),
  );
  for (const s of statuses) {
    if (criticalIds.has(s.id) && (s.dirty || !s.initialized || s.error)) {
      issues.push({
        level: "error",
        moduleId: s.id,
        federation: s.federation,
        layer: s.layer,
        message: "Critical module has issues (dirty / uninitialized / error)",
      });
    }
  }

  // 3. Rutas inexistentes según ontología
  for (const mod of MODULES) {
    try {
      run("ls", mod.path, opts);
    } catch {
      issues.push({
        level: "warning",
        moduleId: mod.id,
        federation: mod.federation,
        layer: mod.layer,
        message: `Module path '${mod.path}' not reachable`,
      });
    }
  }

  // 4. Federaciones sin módulos inicializados
  const fedInitializedCounts: Record<FederationId, number> = {
    F1_DEKATEOTL: 0,
    F2_ANUBIS: 0,
    F3_BOOKPI: 0,
    F4_PHOENIX: 0,
    F5_MDD_TAMV: 0,
    F6_KAOS_HYPERRENDER: 0,
    F7_CHRONOS: 0,
  };
  for (const s of statuses) {
    if (s.initialized) {
      fedInitializedCounts[s.federation] += 1;
    }
  }
  for (const [fed, count] of Object.entries(fedInitializedCounts) as [FederationId, number][]) {
    if (count === 0) {
      issues.push({
        level: "warning",
        federation: fed,
        message: "Federation has no initialized modules in this snapshot",
      });
    }
  }

  // 5. Ontología de capas y pipelines
  issues.push(...auditLayers(statuses));
  issues.push(...auditPipelines(statuses));

  const ok = issues.every((i) => i.level === "info");

  return {
    timestamp,
    originHost,
    originUser,
    issues,
    ok,
  };
}

function printAudit(report: AuditReport): void {
  console.log("╔═══════════════════════════════════════════════════╗");
  console.log("║ LDTOCS · RDM Digital OS — YUN Integrity Audit    ║");
  console.log("╚═══════════════════════════════════════════════════╝\n");

  console.log(`Timestamp:   ${report.timestamp}`);
  console.log(`OriginHost:  ${report.originHost}`);
  console.log(`OriginUser:  ${report.originUser}\n`);

  if (!report.issues.length) {
    console.log("✓ No audit issues detected.\n");
    return;
  }

  for (const issue of report.issues) {
    const prefix =
      issue.level === "error" ? "✗" : issue.level === "warning" ? "⚠" : "•";
    const scope = issue.moduleId
      ? `${issue.moduleId} (${issue.federation}/${issue.layer})`
      : issue.federation
      ? `${issue.federation}`
      : "global";
    const processLabel = issue.process ? ` [process=${issue.process}]` : "";
    console.log(`${prefix} [${issue.level}] ${scope}${processLabel}: ${issue.message}`);
  }

  console.log();
}

// ============================================================================
// CLI
// ============================================================================

function printUsage(): void {
  console.log("LDTOCS · RDM Digital OS — Civilizational Ecosystem Orchestrator");
  console.log();
  console.log("Usage:");
  console.log("  tsx tools/rdmx-ldtocs.ts sync   [--dry-run] [--no-commit] [--verbose]");
  console.log("  tsx tools/rdmx-ldtocs.ts status [--verbose]");
  console.log("  tsx tools/rdmx-ldtocs.ts audit  [--verbose]");
  console.log("  tsx tools/rdmx-ldtocs.ts help");
  console.log();
  console.log("Options:");
  console.log("  --dry-run   Ejecuta comandos sin aplicar cambios.");
  console.log("  --no-commit No crea commit automático tras el sync.");
  console.log("  --verbose   Muestra comandos ejecutados y salida detallada.\n");
}

async function main(): Promise<void> {
  const [, , rawCommand, ...rawArgs] = process.argv;
  const command = rawCommand ?? "sync";
  const argSet = new Set(rawArgs);

  const options: CliOptions = {
    dryRun: argSet.has("--dry-run"),
    autoCommit: !argSet.has("--no-commit"),
    verbose: argSet.has("--verbose"),
  };

  let exitCode = 0;

  switch (command) {
    case "sync": {
      const modules = await syncEcosystemConcurrent(options);
      const snapshot = buildSnapshot(options, modules);
      printSnapshot(snapshot);
      await reportSnapshot(snapshot, options);

      if (snapshot.severity === "critical") exitCode = 20;
      else if (snapshot.severity === "degraded") exitCode = 10;
      else exitCode = 0;
      break;
    }
    case "status": {
      const snapshot = buildSnapshot(options);
      printSnapshot(snapshot);
      if (snapshot.severity === "critical") exitCode = 20;
      else if (snapshot.severity === "degraded") exitCode = 10;
      else exitCode = 0;
      break;
    }
    case "audit": {
      const report = auditEcosystem(options);
      printAudit(report);
      exitCode = report.ok ? 0 : 15;
      break;
    }
    case "help":
    default:
      printUsage();
      exitCode = 0;
      break;
  }

  process.exit(exitCode);
}

main();

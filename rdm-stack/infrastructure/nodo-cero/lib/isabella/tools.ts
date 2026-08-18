import { RDM_BUSINESSES, RDM_DICHOS, RDM_EVENTS, RDM_ROUTES } from '@/lib/data/rdm-tourism';
import { YUN_CORES, RDM_NODES_35, RDM_POIS } from '@/lib/data/rdm-data';
import { TOPOLOGY_snapshot } from './engines';
import { getGamificationStatus } from '@/lib/gamification/status';
import { getWorldRuntimeStatus } from '@/lib/gamification/world/status';
import { createWorldProposal, listWorldProposals } from '@/lib/gamification/world/proposals';
import { DEFAULT_WORLD_ID } from '@/lib/gamification/world/seed';

export interface IsabellaTool {
  name: string;
  description: string;
  parameters: Record<string, string>;
  execute: (args: Record<string, unknown>) => unknown;
}

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const ISABELLA_TOOLS: IsabellaTool[] = [
  {
    name: 'get_territory_status',
    description: 'Estado operativo actual del territorio: núcleos, nodos, POIs y telemetría.',
    parameters: {},
    execute: () => {
      const t = TOPOLOGY_snapshot();
      return {
        place: t.place,
        status: t.status,
        cores: t.cores,
        nodes: t.nodes,
        pois: t.pois,
        syncPercent: t.syncPercent,
        temperatureC: t.temperatureC,
        weather: t.weather,
        altitudeMeters: t.altitudeMeters,
      };
    },
  },
  {
    name: 'get_upcoming_events',
    description: 'Próximos eventos y festividades del Real del Monte.',
    parameters: { limit: 'number' },
    execute: args => {
      const limit = Math.max(1, Math.min(20, Number(args.limit) || RDM_EVENTS.length));
      return RDM_EVENTS.slice(0, limit).map(e => ({
        name: e.name,
        month: e.month,
        date: e.date,
        place: e.place,
        description: e.description,
      }));
    },
  },
  {
    name: 'get_tourism_routes',
    description: 'Rutas turísticas recomendadas por la comarca.',
    parameters: { limit: 'number' },
    execute: args => {
      const limit = Math.max(1, Math.min(10, Number(args.limit) || RDM_ROUTES.length));
      return RDM_ROUTES.slice(0, limit).map(r => ({
        name: r.name,
        duration: r.duration,
        distance: r.distance,
        difficulty: r.difficulty,
        stops: r.stops.map(s => s.name),
        description: r.description,
      }));
    },
  },
  {
    name: 'get_rdm_dicho',
    description: 'Un dicho o refrán tradicional de la raza minera.',
    parameters: {},
    execute: () => {
      const dicho = pick(RDM_DICHOS);
      return { text: dicho.text, meaning: dicho.meaning, origin: dicho.origin };
    },
  },
  {
    name: 'get_business_directory',
    description: 'Directorio de comercios verificados con sello RDM.',
    parameters: { category: 'string', limit: 'number' },
    execute: args => {
      const category = typeof args.category === 'string' ? args.category : null;
      const limit = Math.max(1, Math.min(30, Number(args.limit) || 6));
      const list = category
        ? RDM_BUSINESSES.filter(b => b.category === category)
        : RDM_BUSINESSES;
      return list.slice(0, limit).map(b => ({
        name: b.name,
        category: b.category,
        area: b.area,
        rating: b.rating,
        description: b.description,
      }));
    },
  },
  {
    name: 'get_yun_overview',
    description: 'Resumen de la Arquitectura Heptafederada YUN: núcleos y nodos.',
    parameters: {},
    execute: () => ({
      cores: YUN_CORES.map(c => ({ id: c.id, name: c.name, subtitle: c.subtitle })),
      nodes: RDM_NODES_35.length,
      nodesPerCore: YUN_CORES.map(c => ({
        coreId: c.id,
        count: RDM_NODES_35.filter(n => n.coreId === c.id).length,
      })),
    }),
  },
  {
    name: 'get_poi_info',
    description: 'Información de puntos de interés phygital del territorio.',
    parameters: { name: 'string', limit: 'number' },
    execute: args => {
      const name = typeof args.name === 'string' ? args.name.toLowerCase() : null;
      const limit = Math.max(1, Math.min(15, Number(args.limit) || RDM_POIS.length));
      const list = name ? RDM_POIS.filter(p => p.name.toLowerCase().includes(name)) : RDM_POIS;
      return list.slice(0, limit).map(p => ({
        name: p.name,
        category: p.category,
        status: p.status,
        rating: p.rating,
        phygitalBadge: p.phygitalBadge,
        sensors: p.sensors,
        description: p.description,
      }));
    },
  },
  {
    name: 'get_gamification_status',
    description: 'Estado de la gamificación territorial: puntos, capturas, oleadas y ranking de guardianes del Nodo.',
    parameters: {},
    execute: () => getGamificationStatus(),
  },
  {
    name: 'get_zombie_challenge',
    description: 'Contexto del reto Zombies RDM Invasion: multiplicadores de zona y tiempo activos en la comarca.',
    parameters: {},
    execute: () => ({
      game: 'Zombies RDM Invasion',
      domain: 'gameplay',
      multipliers: {
        zonaMina: 1.2,
        noche: 1.3,
        niebla: 1.5,
        mesEvento: 2,
      },
      note: 'El backend YUN es la fuente de verdad de puntos; el cliente solo reporta eventos firmados.',
    }),
  },
  {
    name: 'get_world_status',
    description:
      'Estado del World Runtime Territorial: revisión publicada, entidades del manifiesto, sesiones activas y propuestas pendientes de aprobación humana.',
    parameters: { worldId: 'string' },
    execute: (args) => {
      const worldId = typeof args.worldId === 'string' && args.worldId.length > 0 ? args.worldId : undefined;
      return getWorldRuntimeStatus(worldId);
    },
  },
  {
    name: 'list_world_proposals',
    description:
      'Lista propuestas de cambio al mundo territorial (Isabella solo propone; un curador aprueba).',
    parameters: { worldId: 'string', status: 'string' },
    execute: (args) => {
      const worldId =
        typeof args.worldId === 'string' && args.worldId.length > 0 ? args.worldId : DEFAULT_WORLD_ID;
      const status =
        typeof args.status === 'string' && args.status.length > 0
          ? (args.status as 'pending_approval' | 'approved' | 'rejected' | 'published' | 'draft' | 'validated' | 'superseded')
          : 'pending_approval';
      return listWorldProposals({ worldId, status }).map((p) => ({
        proposalId: p.proposalId,
        intent: p.intent,
        status: p.status,
        origin: p.origin,
        source: p.provenance.source,
        riskClassification: p.riskClassification,
        requiresApproval: p.requiresApproval,
        submittedAt: p.submittedAt,
      }));
    },
  },
  {
    name: 'propose_world_change',
    description:
      'Crea una PROPUESTA de cambio al mundo territorial (nunca aplica efectos directos). Requiere aprobación humana antes de publicar una nueva revisión del manifiesto.',
    parameters: {
      intent: 'string',
      worldId: 'string',
      riskClassification: 'string',
      requestedBy: 'string',
    },
    execute: (args) => {
      const intent =
        typeof args.intent === 'string' && args.intent.trim().length >= 8
          ? args.intent.trim().slice(0, 4000)
          : null;
      if (!intent) {
        return {
          ok: false,
          error: 'intent es requerido (mínimo 8 caracteres). Isabella solo propone, no publica.',
        };
      }
      const worldId =
        typeof args.worldId === 'string' && args.worldId.length > 0 ? args.worldId : DEFAULT_WORLD_ID;
      const requestedBy =
        typeof args.requestedBy === 'string' && args.requestedBy.length > 0
          ? args.requestedBy.slice(0, 128)
          : 'isabella';
      const riskRaw = typeof args.riskClassification === 'string' ? args.riskClassification : 'medium';
      const riskClassification =
        riskRaw === 'low' || riskRaw === 'medium' || riskRaw === 'high' || riskRaw === 'critical'
          ? riskRaw
          : 'medium';

      const proposal = createWorldProposal({
        worldId,
        intent,
        requestedBy,
        source: 'isabella',
        origin: 'ai-assisted',
        riskClassification,
        modelRunId: typeof args.modelRunId === 'string' ? args.modelRunId.slice(0, 128) : undefined,
      });

      return {
        ok: true,
        note: 'Propuesta registrada. Un curador humano debe aprobar antes de publicar.',
        proposalId: proposal.proposalId,
        status: proposal.status,
        requiresApproval: proposal.requiresApproval,
        worldId: proposal.worldId,
        intent: proposal.intent,
        riskClassification: proposal.riskClassification,
      };
    },
  },
];

export function getTool(name: string): IsabellaTool | undefined {
  return ISABELLA_TOOLS.find(t => t.name === name);
}

export function executeTool(
  name: string,
  args: Record<string, unknown> = {}
): { ok: boolean; result?: unknown; error?: string } {
  const tool = getTool(name);
  if (!tool) {
    return { ok: false, error: `Herramienta no autorizada: ${name}` };
  }
  try {
    return { ok: true, result: tool.execute(args) };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error desconocido en la herramienta' };
  }
}

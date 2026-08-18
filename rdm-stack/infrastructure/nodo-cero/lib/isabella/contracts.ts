export type PerceptionType = 'chat' | 'event' | 'signal' | 'api' | 'ui';
export type RiskLevel = 'low' | 'medium' | 'high';
export type PolicyStatus = 'allowed' | 'denied' | 'requires_approval';
export type MemoryScope = 'immediate' | 'session' | 'project' | 'territorial' | 'historical';
export type EngineName = 'ORION' | 'SOPHIA' | 'ARGUS' | 'MNEMOS' | 'LUMEN' | 'KERNEL' | 'TOPOLOGY';
export type ToolStatus = 'pending' | 'success' | 'error' | 'denied';

export interface IsabellaTerritoryContext {
  federationId?: string;
  domain?: string;
  place?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  geosite?: string;
  status?: string;
  [key: string]: unknown;
}

export interface IsabellaPerception {
  id: string;
  type: PerceptionType;
  actorId: string;
  sessionId: string;
  payload: {
    text?: string;
    intent?: string;
    riskLevel?: RiskLevel;
    action?: string;
    targetDomain?: string;
    [key: string]: unknown;
  };
  timestamp: string;
  metadata?: Record<string, unknown>;
  territory?: IsabellaTerritoryContext;
}

export interface IsabellaToolCall {
  id: string;
  tool: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  status: ToolStatus;
  durationMs?: number;
}

export interface IsabellaDecision {
  id: string;
  perceptionId: string;
  summary: string;
  confidence: number;
  riskLevel: RiskLevel;
  policyStatus: PolicyStatus;
  engines: EngineName[];
  toolCalls: IsabellaToolCall[];
  details: Record<string, unknown>;
  sources?: string[];
  createdAt: string;
}

export interface IsabellaMemoryItem {
  id: string;
  scope: MemoryScope;
  content: string;
  tags: string[];
  relevance: number;
  checksum: string;
  expiresAt?: string;
  createdAt: string;
  actorId: string;
  sessionId: string;
}

export interface IsabellaPolicy {
  id: string;
  name: string;
  version: number;
  status: 'active' | 'draft' | 'superseded';
  riskLevel: RiskLevel;
  action: 'allow' | 'deny' | 'require_approval';
  scope: string[];
  rule: string;
  match?: RegExp;
  domain?: string;
  priority?: number;
}

export interface IsabellaAuditEvent {
  eventId: string;
  eventType: string;
  domain: string;
  traceId: string;
  actorId: string;
  sessionId: string;
  federationId: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export interface YunEvent {
  event_id: string;
  event_type: string;
  domain: string;
  federation_id: string;
  trace_id: string;
  source: string;
  entity_id?: string;
  severity?: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface IsabellaProcessResult {
  traceId: string;
  sessionId: string;
  decision: IsabellaDecision;
  auditEvents: IsabellaAuditEvent[];
  events: YunEvent[];
  memoryItems: IsabellaMemoryItem[];
}

export interface PolicyGateResult {
  status: PolicyStatus;
  reason: string;
  appliedPolicies: string[];
}

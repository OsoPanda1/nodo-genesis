import { IsabellaPolicy } from './contracts';

export const YUN_CONSTITUTION_VERSION = '2.0.0';
export const YUN_FEDERATIONS = ['Fed1', 'Fed2', 'Fed3', 'Fed4', 'Fed5', 'Fed6', 'Fed7'];
export const DEFAULT_FEDERATION = 'Fed1';
export const DEFAULT_DOMAIN = 'knowledge';

export const ISABELLA_POLICIES: IsabellaPolicy[] = [
  {
    id: 'pol-economic-sovereignty',
    name: 'Soberanía Económica Absoluta',
    version: 1,
    status: 'active',
    riskLevel: 'high',
    action: 'deny',
    scope: ['commerce', 'economy'],
    rule: 'Queda prohibido ejecutar acciones de congelamiento económico o bloqueo financiero sobre el territorio o sus agentes.',
    match: /(financial_lock|apply_economic_freeze|freeze_assets|economic_sanction)/i,
  },
  {
    id: 'pol-no-secrets',
    name: 'Secreto fuera del código',
    version: 1,
    status: 'active',
    riskLevel: 'high',
    action: 'deny',
    scope: ['*'],
    rule: 'Ningún secreto, API key o credencial puede circular en percepciones, decisiones o payloads de eventos.',
    match: /(api[_-]?key|secret|password|bearer|authorization|private[_-]?key|access[_-]?token)/i,
  },
  {
    id: 'pol-domain-isolation',
    name: 'Aislamiento de dominios',
    version: 1,
    status: 'active',
    riskLevel: 'high',
    action: 'deny',
    scope: ['identity', 'commerce', 'knowledge', 'telemetry', 'gameplay'],
    rule: 'Un dominio no puede acceder directamente a los datos de otro dominio; solo a través del Data Fabric YUN.',
    match: /(direct[_ -]?access|cross[_-]?domain|bypass.*fabric)/i,
  },
  {
    id: 'pol-authorized-tools',
    name: 'Herramientas autorizadas',
    version: 1,
    status: 'active',
    riskLevel: 'medium',
    action: 'deny',
    scope: ['*'],
    rule: 'Isabella solo puede invocar herramientas registradas en su catálogo autorizado.',
  },
  {
    id: 'pol-high-risk-approval',
    name: 'Aprobación humana para riesgo alto',
    version: 1,
    status: 'active',
    riskLevel: 'high',
    action: 'require_approval',
    scope: ['*'],
    rule: 'Cualquier percepción con riesgo alto requiere aprobación humana antes de ejecutar acciones.',
  },
];

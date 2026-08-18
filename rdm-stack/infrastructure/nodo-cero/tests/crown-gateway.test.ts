import { describe, it, expect } from 'vitest';
import { getGatewayStatus, getGatewayProviders, PROVIDERS } from '@/lib/isabella/crown-gateway';

describe('bóveda CROWN · agentes de ingeniería', () => {
  it('el copiloto de ingeniería está registrado en la bóveda', () => {
    expect(PROVIDERS.opencode).toBeDefined();
    expect(PROVIDERS.opencode.kind).toBe('agent');
    expect(PROVIDERS.opencode.model).toBe('big-pickle');
  });

  it('el agente es soberano: sin egress y no enrutado como modelo', () => {
    const agent = PROVIDERS.opencode;
    expect(agent.egress).toBe('blocked');
    const status = getGatewayStatus();
    const opencode = status.providers.find(p => p.id === 'opencode');
    expect(opencode?.egress).toBe('blocked');
    expect(opencode?.configured).toBe(true);
    for (const rule of Object.values(status.routing)) {
      expect(rule.chain.includes('opencode')).toBe(false);
    }
  });

  it('la bóveda conserva cero proveedores propietarios', () => {
    const status = getGatewayStatus();
    expect(status.security.proprietaryProviders).toBe(0);
    expect(status.security.agents).toBe(1);
  });

  it('no altera los transportes de inferencia existentes', () => {
    expect(PROVIDERS.simulation).toBeDefined();
    expect(PROVIDERS.ollama).toBeDefined();
    expect(getGatewayProviders().qwen).toBeDefined();
  });

  it('registra el proveedor OpenCode Zen con egress permitido', () => {
    const zen = PROVIDERS.zen;
    expect(zen).toBeDefined();
    expect(zen.kind).toBe('openai-compatible');
    expect(zen.baseUrl).toBe('https://opencode.ai/zen/v1');
    expect(zen.envKey).toBe('OPENCODE_ZEN_API_KEY');
    expect(zen.egress).toBe('allowed');
  });
});

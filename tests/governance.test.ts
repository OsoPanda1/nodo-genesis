import { describe, it, expect } from 'vitest';
import {
  apiCatalog,
  getContract,
  checkCompatibility,
  deployPolicy,
  contractsNeedingAttention,
  type ApiContract,
} from '@/lib/governance/contracts';

describe('gobernanza · catálogo de contratos', () => {
  it('expone al menos 10 contratos con semver y dueño federado', () => {
    const catalog = apiCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(10);
    for (const contract of catalog) {
      expect(contract.id).toMatch(/^api\./);
      expect(contract.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(contract.owner).toBeTruthy();
      expect(contract.methods.length).toBeGreaterThan(0);
    }
  });

  it('encuentra contratos por id', () => {
    const c = getContract('api.isabella.reason');
    expect(c).toBeDefined();
    expect(c?.path).toBe('/api/isabella/isa/reason');
    expect(getContract('no.existe')).toBeUndefined();
  });

  it('clasifica compatibilidad semver', () => {
    expect(checkCompatibility('api.isabella.reason', '4.0.0', '5.0.0').compatible).toBe(false);
    expect(checkCompatibility('api.isabella.reason', '4.0.0', '4.5.0').compatible).toBe(true);
    expect(checkCompatibility('api.desconocido', '1.0.0', '1.0.1').compatible).toBe(false);
  });

  it('define política de despliegue por ciclo de vida', () => {
    const stable = getContract('api.isabella.chat') as ApiContract;
    expect(deployPolicy(stable)).toBe('stable');
    const preview: ApiContract = { ...stable, id: 'api.preview', lifecycle: 'preview' };
    expect(deployPolicy(preview)).toBe('canary');
    const sunset: ApiContract = { ...stable, id: 'api.sunset', lifecycle: 'sunset' };
    expect(deployPolicy(sunset)).toBe('blue-green');
  });

  it('no señala contratos estables como urgentes', () => {
    const attention = contractsNeedingAttention();
    expect(Array.isArray(attention)).toBe(true);
    for (const entry of attention) {
      expect(['deprecated', 'sunset']).toContain(entry.lifecycle);
    }
  });
});

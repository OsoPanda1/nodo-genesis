import { connectorRegistry } from "../ConnectorRegistry";
import { tokenVault } from "../TokenVault";
import { triggerRouter } from "../TriggerRouter";
import { federationBus } from "@/federaciones/FederationBus";
import type { FusionOperation, FusionResult } from "./UnionTypes";
import { FusionError, FusionErrors } from "./UnionTypes";
import { getContract, type ContractVersion, type ConnectorContract } from "./contracts";

function makeTraceId(op: FusionOperation): string {
  return `fusion-${op.type.replace(":", "-")}-${Date.now()}`;
}

function emitFederationEvent(op: FusionOperation, phase: string, payload: Record<string, unknown>, traceId: string) {
  federationBus.emit({
    type: `FUSION_${phase}`,
    source: "ANUBIS",
    payload: { operation: op.type, ...payload },
    traceId,
  });
}

function validateOperation(contract: ConnectorContract, op: FusionOperation): void {
  if (op.type === "connector:register" && "config" in op) {
    const config = (op as Extract<FusionOperation, { type: "connector:register" }>).config;
    if (!contract.supportedTypes.includes(config.type)) {
      throw FusionErrors.ContractViolation(
        `Connector type "${config.type}" not supported in contract ${contract.version}`,
      );
    }
  }
  if (op.type === "token:issue" && "subject" in op) {
    const subject = (op as Extract<FusionOperation, { type: "token:issue" }>).subject;
    if (!contract.allowedSubjectTypes.includes(subject.type)) {
      throw FusionErrors.SubjectRejected(
        `Subject type "${subject.type}" not allowed in contract ${contract.version}`,
      );
    }
  }
}

class FusionGateway {
  async execute(op: FusionOperation): Promise<FusionResult> {
    const traceId = makeTraceId(op);
    emitFederationEvent(op, "OPERATION_STARTED", {}, traceId);

    try {
      const version: ContractVersion = op && "version" in op && op.version ? op.version : "latest";
      const contract = getContract(version);

      emitFederationEvent(op, "IDENTIFY", { version }, traceId);

      validateOperation(contract, op);

      emitFederationEvent(op, "AUTHORIZE", {}, traceId);
      emitFederationEvent(op, "EXECUTE", {}, traceId);

      let result: FusionResult;

      switch (op.type) {
        case "token:issue": {
          const connector = connectorRegistry.get(op.connectorUid);
          if (!connector) return { ok: false, operation: op.type, error: FusionErrors.ConnectorNotFound(op.connectorUid) };
          const res = await tokenVault.issue(connector, op.subject, op.scopes, op.installationId);
          result = { ok: true, operation: op.type, data: res };
          break;
        }
        case "token:verify": {
          const record = await tokenVault.verify(op.token);
          result = { ok: true, operation: op.type, data: record !== null };
          break;
        }
        case "token:revoke": {
          const ok = await tokenVault.revoke(op.tokenId);
          result = { ok: true, operation: op.type, data: ok };
          break;
        }
        case "connector:register": {
          const created = connectorRegistry.register(op.config);
          result = { ok: true, operation: op.type, data: created };
          break;
        }
        case "connector:get": {
          const found = connectorRegistry.get(op.uid);
          result = { ok: true, operation: op.type, data: found ?? null };
          break;
        }
        case "connector:unregister": {
          const removed = connectorRegistry.unregister(op.uid);
          result = { ok: true, operation: op.type, data: removed };
          break;
        }
        case "connector:list": {
          const all = connectorRegistry.list();
          result = { ok: true, operation: op.type, data: all };
          break;
        }
        case "installation:add": {
          connectorRegistry.addInstallation(op.connectorUid, op.installation);
          result = { ok: true, operation: op.type, data: undefined as unknown as void };
          break;
        }
        case "trigger:register": {
          triggerRouter.register(op.dest);
          result = { ok: true, operation: op.type, data: undefined as unknown as void };
          break;
        }
        case "trigger:forward": {
          await triggerRouter.forward(op.event);
          result = { ok: true, operation: op.type, data: undefined as unknown as void };
          break;
        }
        case "inspect:stats": {
          const stats = {
            connectors: connectorRegistry.getStats(),
            tokens: tokenVault.getStats(),
            triggers: { totalDestinations: triggerRouter.list().length },
            version: contract.version,
          };
          result = { ok: true, operation: op.type, data: stats as Record<string, unknown> };
          break;
        }
        default: {
          const unknownOp = op as FusionOperation;
          result = { ok: false, operation: unknownOp.type, error: FusionErrors.Internal(`Unknown operation: ${unknownOp.type}`) };
        }
      }

      emitFederationEvent(op, "OPERATION_COMPLETED", { success: true }, traceId);
      return result;
    } catch (err) {
      const error = err instanceof FusionError ? err : FusionErrors.Internal(err instanceof Error ? err.message : "Unknown error");
      emitFederationEvent(op, "OPERATION_FAILED", { code: error.code, message: error.message }, traceId);
      return { ok: false, operation: op.type, error };
    }
  }
}

export const fusionGateway = new FusionGateway();

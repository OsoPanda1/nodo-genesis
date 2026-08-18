/* ================================================================== */
/* SERVER FN — Guardian: resolución HITL sellada en BookPI            */
/* ================================================================== */

import { createServerFn } from "@tanstack/react-start";
import { GuardianResolveSchema, GuardianResolveResultSchema } from "../lib/contracts";
import { sealBookPIEntry } from "../lib/bookpi/registry";
import { appendEntry, lastEntry } from "../lib/bookpi";
import { publishEvent, runWithTrace } from "../lib/events";
import { getPrisma } from "../lib/db";

export const guardianResolve = createServerFn({ method: "POST" })
  .validator(GuardianResolveSchema)
  .handler(({ data }) => {
    return runWithTrace({}, () => {
      const prisma = getPrisma();
      const prev = lastEntry();
      const seal = sealBookPIEntry({
        id: `evt-gdn-${Date.now().toString(36)}`,
        type: "guardian.resolution",
        source: "guardian-svc",
        domain: "guardian",
        timestamp: new Date().toISOString(),
        data: {
          actionId: data.actionId,
          decision: data.decision,
          guardianId: data.guardianId,
          note: data.note ?? null,
        },
        prevHash: prev?.hash ?? null,
      });

      const entry = {
        id: `evt-gdn-${Date.now().toString(36)}`,
        type: "guardian.resolution",
        source: "guardian-svc",
        domain: "guardian",
        timestamp: new Date().toISOString(),
        data: {
          actionId: data.actionId,
          decision: data.decision,
          guardianId: data.guardianId,
          note: data.note ?? null,
        },
        hash: seal,
        prevHash: prev?.hash ?? null,
      };

      appendEntry(entry);

      if (prisma) {
        void prisma.guardianResolution.create({
          data: {
            actionId: data.actionId,
            decision: data.decision,
            guardianId: data.guardianId,
            note: data.note ?? null,
            hash: seal,
            sealed: true,
          },
        });
      }

      publishEvent({
        type: "guardian.resolution.sealed",
        source: "guardian-svc",
        domain: "guardian",
        data: { actionId: data.actionId, decision: data.decision, hash: seal },
        meta: { entityId: data.actionId },
      });

      const result = GuardianResolveResultSchema.parse({
        ok: true,
        actionId: data.actionId,
        decision: data.decision,
        sealed: true,
        hash: seal,
      });
      return result;
    });
  });

/* ================================================================== */
/* SERVER FN — BookPI: escritura y consulta del registro encadenado   */
/* ================================================================== */

import { createServerFn } from "@tanstack/react-start";
import { BookPIWriteRequestSchema, BookPIQuerySchema } from "../lib/contracts";
import { lastEntry, appendEntry, listEntries } from "../lib/bookpi";
import { sealWrite, verifyChain } from "../lib/bookpi/registry";
import { publishEvent, runWithTrace } from "../lib/events";
import { getPrisma } from "../lib/db";

export const bookpiWrite = createServerFn({ method: "POST" })
  .validator(BookPIWriteRequestSchema)
  .handler(({ data }) => {
    return runWithTrace({}, () => {
      const prisma = getPrisma();
      const prev = lastEntry();
      const entry = sealWrite({ ...data, prevHash: prev?.hash ?? null });

      if (prisma) {
        void prisma.bookpiEntry.create({
          data: {
            id: entry.id,
            type: entry.type,
            source: entry.source,
            domain: entry.domain,
            timestamp: new Date(entry.timestamp),
            hash: entry.hash,
            prevHash: entry.prevHash,
            data: entry.data as object,
          },
        });
      }
      appendEntry(entry);

      publishEvent({
        type: "bookpi.write",
        source: "tamv-core",
        domain: "bookpi",
        data: { id: entry.id, domain: entry.domain },
        meta: { entityId: entry.id },
      });

      return { ok: true, entry, prevHash: entry.prevHash };
    });
  });

export const bookpiQuery = createServerFn({ method: "GET" })
  .validator(BookPIQuerySchema)
  .handler(({ data }) => {
    const { limit, domain } = data;
    const entries = listEntries(limit, domain);
    return {
      ok: true,
      count: entries.length,
      chainValid: verifyChain([...entries].reverse()),
      entries,
    };
  });

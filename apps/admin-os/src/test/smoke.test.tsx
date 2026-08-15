import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock supabase to avoid network during smoke tests
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null } }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }), }),
    }),
    functions: { invoke: () => Promise.resolve({ data: { modules: [] } }) },
  },
}));

import platforms from "@/data/ltos-platforms.json";
import { LTOS_COORDINATES } from "@/data/ltos-coordinates";
import DedicationBanner from "@/components/DedicationBanner";

describe("Smoke · LTOS data integrity", () => {
  it("every platform has verified coordinates", () => {
    for (const p of platforms.platforms) {
      const c = LTOS_COORDINATES[p.slug];
      expect(c, `missing coords for ${p.slug}`).toBeDefined();
      expect(c.lat).toBeGreaterThan(20);
      expect(c.lat).toBeLessThan(21);
      expect(c.lng).toBeLessThan(-98);
      expect(c.lng).toBeGreaterThan(-99);
    }
  });

  it("dedication banner renders the dedication", () => {
    const { container } = render(
      <MemoryRouter>
        <DedicationBanner />
      </MemoryRouter>,
    );
    expect(container.textContent).toContain("Reina Trejo Serrano");
    expect(container.textContent).toContain("Orgullosamente Realmontenses");
  });
});

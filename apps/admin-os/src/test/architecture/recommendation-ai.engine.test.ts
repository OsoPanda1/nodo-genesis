import { describe, expect, it } from "vitest";
import { generateResponse, rankBusinesses } from "../../../services/recommendation-ai/engine";

describe("recommendation-ai rankBusinesses", () => {
  const user = {
    location: { lat: 20.1422, lng: -98.6707 },
    preferences: ["romantico", "cafe"],
    localHour24: 10,
  };

  it("prioriza cercanía y afinidad", () => {
    const ranked = rankBusinesses(user, [
      {
        id: "1",
        name: "Café Centro",
        category: "cafe",
        tags: ["romantico", "vista"],
        location: { lat: 20.1423, lng: -98.6708 },
        rating: 4.7,
        isOpen: true,
        trendScore: 4.4,
      },
      {
        id: "2",
        name: "Restaurante Lejano",
        category: "restaurante",
        tags: ["familiar"],
        location: { lat: 20.5, lng: -99.2 },
        rating: 5,
        isOpen: true,
        trendScore: 5,
      },
    ]);

    expect(ranked[0].id).toBe("1");
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("genera respuesta textual con top 3", () => {
    const ranked = rankBusinesses(user, [
      {
        id: "1",
        name: "Café Centro",
        category: "cafe",
        tags: ["romantico", "vista"],
        location: { lat: 20.1423, lng: -98.6708 },
        rating: 4.7,
        isOpen: true,
        trendScore: 4.4,
      },
    ]);

    const text = generateResponse("cafés con vista", ranked);
    expect(text).toContain("Café Centro");
    expect(text).toContain("score");
  });
});

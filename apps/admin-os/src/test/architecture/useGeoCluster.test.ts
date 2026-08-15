import { describe, expect, it } from "vitest";
import { clusterGeoPoints } from "../../../packages/hooks/useGeoCluster";

describe("clusterGeoPoints", () => {
  it("agrupa puntos por celda y omite inválidos", () => {
    const clusters = clusterGeoPoints([
      { id: "a", lat: 20.1, lng: -98.6 },
      { id: "b", lat: 20.12, lng: -98.62 },
      { id: "c", lat: 19.5, lng: -99.3 },
      { id: "bad", lat: Number.NaN, lng: -99.3 },
    ]);

    const sizes = clusters.map((group) => group.length).sort((a, b) => b - a);
    expect(sizes).toEqual([2, 1]);
  });
});

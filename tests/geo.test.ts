import { describe, expect, it } from "vitest";
import { haversineKm, NEAR_RADIUS_KM } from "@/lib/geo";

describe("haversineKm", () => {
  it("devuelve 0 para el mismo punto", () => {
    expect(haversineKm({ lat: 42.13, lng: -0.41 }, { lat: 42.13, lng: -0.41 })).toBe(0);
  });

  it("está cerca de la distancia real entre Huesca y Barbastro", () => {
    const km = haversineKm({ lat: 42.1362, lng: -0.4089 }, { lat: 42.0353, lng: 0.1269 });
    expect(km).toBeGreaterThan(45);
    expect(km).toBeLessThan(47);
  });

  it("es simétrico", () => {
    const a = { lat: 42.13, lng: -0.41 };
    const b = { lat: 42.0, lng: 0.1 };
    expect(haversineKm(a, b)).toBeCloseTo(haversineKm(b, a), 6);
  });
});

describe("NEAR_RADIUS_KM", () => {
  it("es un radio de 10 km", () => {
    expect(NEAR_RADIUS_KM).toBe(10);
  });
});
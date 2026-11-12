import { describe, expect, it } from "vitest";
import { normalizedTitle, sameEventAcrossSources } from "@/lib/event-dedup";

describe("event-dedup", () => {
  describe("normalizedTitle", () => {
    it("lowercase y sin espacios extras", () => {
      expect(normalizedTitle("  Vuelta a BIESCAS  ")).toBe("vuelta a biescas");
    });

    it("quita tildes", () => {
      expect(normalizedTitle("Semana Cultural de Huesca")).toBe(
        "semana cultural de huesca"
      );
    });

    it("colapsa espacios internos", () => {
      expect(normalizedTitle("Concierto\tde   Jazz")).toBe("concierto de jazz");
    });
  });

  describe("sameEventAcrossSources", () => {
    it("empareja mismo título y fecha normalizados entre fuentes", () => {
      expect(
        sameEventAcrossSources("Feria de la Ciencia", "2026-09-30", "fEria de la ciencia", "2026-09-30")
      ).toBe(true);
    });

    it("no empareja misma fecha con títulos distintos", () => {
      expect(
        sameEventAcrossSources("Maratón", "2026-09-30", "Feria de la Ciencia", "2026-09-30")
      ).toBe(false);
    });

    it("no empareja mismo título con fechas distintas", () => {
      expect(
        sameEventAcrossSources("Concierto", "2026-09-30", "Concierto", "2026-10-02")
      ).toBe(false);
    });
  });
});
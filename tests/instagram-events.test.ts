import { describe, expect, it } from "vitest";
import {
  getHighlightIdFromUrl,
  parseInstagramHighlightText,
} from "@/lib/scraper/instagram";

function futureIso(offsetDays: number): string {
  const now = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function numericDate(offsetDays: number): string {
  const [y, m, d] = futureIso(offsetDays).split("-").map(Number);
  return `${d}/${m}/${y}`;
}

function verbalDate(offsetDays: number): string {
  const [y, m, d] = futureIso(offsetDays).split("-").map(Number);
  void y;
  const months = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${d} de ${months[m - 1]}`;
}

describe("getHighlightIdFromUrl", () => {
  it("extrae el id del highlight desde la URL", () => {
    expect(
      getHighlightIdFromUrl("https://www.instagram.com/stories/highlights/18353343727241524/?hl=es")
    ).toBe("18353343727241524");
  });

  it("devuelve null si la URL no es un highlight", () => {
    expect(getHighlightIdFromUrl("https://www.instagram.com/p/ABC/")).toBeNull();
  });
});

describe("parseInstagramHighlightText", () => {
  it("parsea un cartel numérico con hora y lugar", () => {
    const date = numericDate(30);
    const parsed = parseInstagramHighlightText(
      `AGENDA HUESCA\nCONCIERTO DE PRIMAVERA\n${date}\n20:30 h\nEn el Teatro Olimpia`
    );
    expect(parsed).not.toBeNull();
    expect(parsed!.title).toBe("CONCIERTO DE PRIMAVERA");
    expect(parsed!.startDate).toBe(futureIso(30));
    expect(parsed!.startTime).toBe("20:30");
    expect(parsed!.location).toBe("Teatro Olimpia");
    expect(parsed!.description).toContain("CONCIERTO DE PRIMAVERA");
  });

  it("parsea una fecha verbal '12 de marzo' sin año", () => {
    const parsed = parseInstagramHighlightText(
      `CINE DE VERANO\n${verbalDate(45)}\n21:30\nPlaza de San Juan`
    );
    expect(parsed).not.toBeNull();
    expect(parsed!.title).toBe("CINE DE VERANO");
    expect(parsed!.startDate).toBe(futureIso(45));
    expect(parsed!.startTime).toBe("21:30");
  });

  it("ignora los enlaces de marca de agua como título", () => {
    const date = numericDate(60);
    const parsed = parseInstagramHighlightText(
      `www.instagram.com/huescahoy\nMUSEO DE HUESCA\n${date}\n12:00`
    );
    expect(parsed).not.toBeNull();
    expect(parsed!.title).toBe("MUSEO DE HUESCA");
  });

  it("descarta texto sin fecha", () => {
    expect(parseInstagramHighlightText("Próximamente nuevos eventos")).toBeNull();
  });

  it("descarta fechas pasadas", () => {
    const past = numericDate(-10);
    expect(parseInstagramHighlightText(`Concierto\n${past}`)).toBeNull();
  });

  it("descarta fechas solo si no hay otra válida", () => {
    const valid = numericDate(15);
    const parsed = parseInstagramHighlightText(
      `MÚSICA\nDescripción sin fecha\n${numericDate(-5)}\n${valid}\n21:00`
    );
    expect(parsed).not.toBeNull();
    expect(parsed!.startDate).toBe(futureIso(15));
  });

  it("usa el mes verbal sin 'de' ('12 marzo')", () => {
    const [y, m, d] = futureIso(20).split("-").map(Number);
    void y;
    const months = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];
    const parsed = parseInstagramHighlightText(
      `MERCADO MEDIEVAL\n${d} ${months[m - 1]}\n11:00`
    );
    expect(parsed).not.toBeNull();
    expect(parsed!.startDate).toBe(futureIso(20));
  });

  it("devuelve null si solo hay una hora y datos sueltos", () => {
    expect(
      parseInstagramHighlightText("MÚSICA\n20:30 h\nTeatro Olimpia")
    ).toBeNull();
  });
});
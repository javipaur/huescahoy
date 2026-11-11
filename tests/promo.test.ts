import { describe, expect, it } from "vitest";
import {
  ORIGEN_PROMO,
  fechaCortaPromo,
  normalizarTituloPromo,
  paqueteDePromo,
  shortTimePromo,
  urlImagenPromo,
  ventanaCortaPromo,
  ventanaDelDia,
} from "@/lib/promo";

describe("ventanaDelDia", () => {
  it("publica el mismo día de domingo a viernes", () => {
    // 2026-11-11 es miércoles.
    expect(ventanaDelDia("2026-11-11")).toEqual({
      desde: "2026-11-11",
      hasta: "2026-11-11",
      etiqueta: "HOY",
    });
    // 2026-11-13 es viernes.
    expect(ventanaDelDia("2026-11-13")).toEqual({
      desde: "2026-11-13",
      hasta: "2026-11-13",
      etiqueta: "HOY",
    });
  });

  it("el sábado cubre sábado y domingo", () => {
    // 2026-11-14 es sábado.
    expect(ventanaDelDia("2026-11-14")).toEqual({
      desde: "2026-11-14",
      hasta: "2026-11-15",
      etiqueta: "ESTE FINDE",
    });
  });

  it("el domingo vuelve a ser un solo día", () => {
    // 2026-11-15 es domingo.
    expect(ventanaDelDia("2026-11-15")).toEqual({
      desde: "2026-11-15",
      hasta: "2026-11-15",
      etiqueta: "HOY",
    });
  });

  it("una fecha mal formada lanza en vez de callar", () => {
    expect(() => ventanaDelDia("no-es-fecha")).toThrow();
  });
});

describe("fechas cortas", () => {
  it("fechaCortaPromo escribe el día de la semana en caja alta", () => {
    expect(fechaCortaPromo("2026-11-11")).toBe("MIÉ 11 NOV");
    expect(fechaCortaPromo("2026-11-14")).toBe("SÁB 14 NOV");
  });

  it("fechaCortaPromo tolera un instante ISO", () => {
    expect(fechaCortaPromo("2026-11-11T00:00:00.000Z")).toBe("MIÉ 11 NOV");
  });

  it("ventanaCortaPromo escribe el mes una sola vez si no cambia", () => {
    expect(ventanaCortaPromo("2026-11-11", "2026-11-11")).toBe("MIÉ 11 NOV");
    expect(ventanaCortaPromo("2026-11-14", "2026-11-15")).toBe("14 — 15 NOV");
  });

  it("ventanaCortaPromo escribe los dos meses si cambia de mes", () => {
    expect(ventanaCortaPromo("2026-10-31", "2026-11-01")).toBe("31 OCT — 1 NOV");
  });
});

describe("normalizarTituloPromo", () => {
  it("quita el paréntesis con fecha pegado al final", () => {
    expect(normalizarTituloPromo("PAULA MATTHEUS (23 de octubre, Huesca)")).toBe(
      "PAULA MATTHEUS"
    );
  });

  it("quita un año suelto entre paréntesis", () => {
    expect(normalizarTituloPromo("Festival de Otoño (2026)")).toBe("Festival de Otoño");
  });

  it("colapsa espacios repetidos", () => {
    expect(normalizarTituloPromo("Concierto   de   jazz")).toBe("Concierto de jazz");
  });
});

describe("urlImagenPromo", () => {
  it("sin url no hay imagen", () => {
    expect(urlImagenPromo(null)).toBeNull();
    expect(urlImagenPromo(undefined)).toBeNull();
    expect(urlImagenPromo("")).toBeNull();
  });

  it("una ruta relativa se prefija con el origen", () => {
    expect(urlImagenPromo("/fotos/cartel.jpg")).toBe(`${ORIGEN_PROMO}/fotos/cartel.jpg`);
  });

  it("una url absoluta http(s) se deja tal cual", () => {
    expect(urlImagenPromo("https://cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });

  it("una url protocol-relative se resuelve a https, no como ruta del sitio", () => {
    // Empieza por `/`, pero no es una ruta de este sitio: prefijarle el origen daría un host
    // inexistente (`…javierpalacio.es//cdn…`).
    expect(urlImagenPromo("//cdn.example.com/a.jpg")).toBe("https://cdn.example.com/a.jpg");
  });

  it("un esquema que no es http(s) no sirve", () => {
    expect(urlImagenPromo("javascript:alert(1)")).toBeNull();
  });
});

describe("shortTimePromo", () => {
  it("recorta la hora al formato HH:MM", () => {
    expect(shortTimePromo("20:30")).toBe("20:30");
    expect(shortTimePromo("20:30:00")).toBe("20:30");
    expect(shortTimePromo("20")).toBe("20:00");
    expect(shortTimePromo("20h30")).toBe("20:30");
  });

  it("sin hora no hay hora", () => {
    expect(shortTimePromo(null)).toBeNull();
    expect(shortTimePromo("")).toBeNull();
    expect(shortTimePromo("por la tarde")).toBeNull();
  });
});

describe("paqueteDePromo", () => {
  const lista = [
    { slug: "concierto-jazz", title: "Concierto de jazz", location: "Palacio de Congresos", category: "Música" },
    { slug: "teatro-infantil", title: "Teatro infantil", location: "Centro Cultural", category: "Teatro" },
  ];

  it("la portada, las imágenes y los títulos cuadran", () => {
    const paquete = paqueteDePromo(lista, { desde: "2026-11-11", hasta: "2026-11-11" });
    expect(paquete.imagenes).toHaveLength(2);
    expect(paquete.titulos).toHaveLength(2);
    expect(paquete.portada.endsWith("/portada")).toBe(true);
    expect(paquete.imagenes[0]).toContain("/evento/concierto-jazz");
  });

  it("el enlace lleva la utm de la fecha", () => {
    const paquete = paqueteDePromo(lista, { desde: "2026-11-11", hasta: "2026-11-11" });
    expect(paquete.enlace).toContain("utm_content=huescahoy-2026-11-11");
    expect(paquete.enlace).toContain("utm_source=ig");
  });

  it("el texto cuenta los planes y nombra Huesca", () => {
    const paquete = paqueteDePromo(lista, { desde: "2026-11-11", hasta: "2026-11-11" });
    expect(paquete.texto).toContain("hay 2 planes");
    expect(paquete.texto).toContain("en Huesca");
    expect(paquete.texto).toContain("De música a teatro.");
  });

  it("con la lista vacía el texto no promete nada", () => {
    const paquete = paqueteDePromo([], { desde: "2026-11-11", hasta: "2026-11-11" });
    expect(paquete.imagenes).toHaveLength(0);
    expect(paquete.texto).toContain("no hay nada que recomendarte");
  });
});

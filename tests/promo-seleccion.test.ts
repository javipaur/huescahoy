import { describe, expect, it } from "vitest";
import { colapsarDiasConsecutivos, seleccionarParaPromo } from "@/lib/promo-seleccion";
import type { EventItem } from "@/lib/types";

/** Un evento con lo mínimo que mira el selector, rellenando el resto. */
function evento(parcial: Partial<EventItem> & { slug: string; title: string; startDate: string }): EventItem {
  return {
    id: 0,
    categoryId: null,
    endDate: null,
    startTime: null,
    endTime: null,
    location: null,
    price: null,
    image: "/foto.jpg",
    featured: false,
    ...parcial,
  } as EventItem;
}

describe("seleccionarParaPromo", () => {
  it("se queda solo con lo que cae dentro de la ventana, inclusive", () => {
    const lista = [
      evento({ slug: "antes", title: "Antes", startDate: "2026-11-10" }),
      evento({ slug: "primero", title: "Primero", startDate: "2026-11-11" }),
      evento({ slug: "ultimo", title: "Último", startDate: "2026-11-15" }),
      evento({ slug: "despues", title: "Después", startDate: "2026-11-16" }),
    ];
    const fuera = seleccionarParaPromo(lista, {
      desde: "2026-11-11",
      hasta: "2026-11-15",
      limite: 10,
    });
    expect(fuera.map((e) => e.slug)).toEqual(["primero", "ultimo"]);
  });

  it("un evento sin imagen no tiene diapositiva que enseñar", () => {
    const lista = [
      evento({ slug: "con-foto", title: "Con foto", startDate: "2026-11-11", image: "/a.jpg" }),
      evento({ slug: "sin-foto", title: "Sin foto", startDate: "2026-11-11", image: null }),
    ];
    const fuera = seleccionarParaPromo(lista, {
      desde: "2026-11-11",
      hasta: "2026-11-11",
      limite: 10,
    });
    expect(fuera.map((e) => e.slug)).toEqual(["con-foto"]);
  });

  it("ordena por fecha, luego por hora, y sin hora va al final del día", () => {
    const lista = [
      evento({ slug: "tarde", title: "Tarde", startDate: "2026-11-11", startTime: "20:00" }),
      evento({ slug: "sin-hora", title: "Sin hora", startDate: "2026-11-11", startTime: null }),
      evento({ slug: "manana", title: "Mañana", startDate: "2026-11-11", startTime: "10:00" }),
      evento({ slug: "otro-dia", title: "Otro día", startDate: "2026-11-12", startTime: "09:00" }),
    ];
    const fuera = seleccionarParaPromo(lista, {
      desde: "2026-11-11",
      hasta: "2026-11-12",
      limite: 10,
    });
    expect(fuera.map((e) => e.slug)).toEqual(["manana", "tarde", "sin-hora", "otro-dia"]);
  });

  it("colapsa el mismo título largo en dos días y conserva el más temprano", () => {
    const titulo = "Festival Internacional de Cine de Huesca";
    const lista = [
      evento({ slug: "domingo", title: titulo, startDate: "2026-11-15" }),
      evento({ slug: "sabado", title: titulo, startDate: "2026-11-14" }),
    ];
    const fuera = seleccionarParaPromo(lista, {
      desde: "2026-11-14",
      hasta: "2026-11-15",
      limite: 10,
    });
    expect(fuera.map((e) => e.slug)).toEqual(["sabado"]);
    expect(fuera[0].startDate).toBe("2026-11-14");
  });

  it("no colapsa títulos cortos: dos «Cine» son dos planes", () => {
    const lista = [
      evento({ slug: "cine-sab", title: "Cine", startDate: "2026-11-14" }),
      evento({ slug: "cine-dom", title: "Cine", startDate: "2026-11-15" }),
    ];
    const fuera = seleccionarParaPromo(lista, {
      desde: "2026-11-14",
      hasta: "2026-11-15",
      limite: 10,
    });
    expect(fuera.map((e) => e.slug)).toEqual(["cine-sab", "cine-dom"]);
  });

  it("corta al tope después de colapsar", () => {
    const lista = Array.from({ length: 12 }, (_, i) =>
      evento({
        slug: `e${i}`,
        title: `Evento número ${i}`,
        startDate: "2026-11-11",
        startTime: `${String(9 + i).padStart(2, "0")}:00`,
      })
    );
    const fuera = seleccionarParaPromo(lista, {
      desde: "2026-11-11",
      hasta: "2026-11-11",
      limite: 10,
    });
    expect(fuera).toHaveLength(10);
    expect(fuera[0].slug).toBe("e0");
    expect(fuera[9].slug).toBe("e9");
  });

  it("es determinista: la misma entrada da el mismo orden", () => {
    const lista = [
      evento({ slug: "b", title: "Evento B largo", startDate: "2026-11-11", startTime: "12:00" }),
      evento({ slug: "a", title: "Evento A largo", startDate: "2026-11-11", startTime: "12:00" }),
      evento({ slug: "c", title: "Evento C largo", startDate: "2026-11-11", startTime: "12:00" }),
    ];
    const primera = seleccionarParaPromo(lista, {
      desde: "2026-11-11",
      hasta: "2026-11-11",
      limite: 10,
    });
    const segunda = seleccionarParaPromo([...lista].reverse(), {
      desde: "2026-11-11",
      hasta: "2026-11-11",
      limite: 10,
    });
    expect(primera.map((e) => e.slug)).toEqual(["a", "b", "c"]);
    expect(segunda.map((e) => e.slug)).toEqual(["a", "b", "c"]);
  });

  it("una fecha rota no revienta: devuelve nada", () => {
    const lista = [evento({ slug: "x", title: "Evento", startDate: "2026-11-11" })];
    expect(seleccionarParaPromo(lista, { desde: "x", hasta: "2026-11-11", limite: 10 })).toEqual([]);
    expect(seleccionarParaPromo(lista, { desde: "2026-11-11", hasta: "y", limite: 10 })).toEqual([]);
  });
});

describe("colapsarDiasConsecutivos", () => {
  it("deja una lista ya sin repetidos intacta", () => {
    const lista = [
      evento({ slug: "a", title: "Un plan distinto", startDate: "2026-11-14" }),
      evento({ slug: "b", title: "Otro plan distinto", startDate: "2026-11-15" }),
    ];
    expect(colapsarDiasConsecutivos(lista).map((e) => e.slug)).toEqual(["a", "b"]);
  });

  it("ignora tildes y mayúsculas al comparar títulos", () => {
    const lista = [
      evento({ slug: "a", title: "CONCIERTO DE MÚSICA ANTIGUA", startDate: "2026-11-14" }),
      evento({ slug: "b", title: "Concierto de musica antigua", startDate: "2026-11-15" }),
    ];
    expect(colapsarDiasConsecutivos(lista).map((e) => e.slug)).toEqual(["a"]);
  });
});

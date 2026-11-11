import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CabeceraPromo, MarcaPromo, WordmarkPromo } from "@/lib/promo-marca";

describe("MarcaPromo", () => {
  it("inlinea el logo como data-URI, que es lo único que Satori pinta", () => {
    const html = renderToStaticMarkup(<MarcaPromo />);
    expect(html).toContain("<img");
    expect(html).toContain('src="data:image/png;base64,');
  });

  it("respeta el tamaño pedido", () => {
    const html = renderToStaticMarkup(<MarcaPromo tamano={120} />);
    expect(html).toContain('width="120"');
    expect(html).toContain('height="120"');
  });
});

describe("WordmarkPromo", () => {
  it("escribe Huesca y Hoy como dos hijos de un flex", () => {
    const html = renderToStaticMarkup(<WordmarkPromo />);
    expect(html).toContain("Huesca");
    expect(html).toContain("Hoy");
    // Dos hijos y `display: flex`: sin el flex, Satori devuelve 502 sin cuerpo.
    expect(html).toContain("display:flex");
  });
});

describe("CabeceraPromo", () => {
  it("lleva la marca y el logotipo, y un extra a la derecha si se pide", () => {
    const html = renderToStaticMarkup(<CabeceraPromo extra={<span>7 PLANES</span>} />);
    expect(html).toContain("<img");
    expect(html).toContain("Huesca");
    expect(html).toContain("7 PLANES");
  });

  it("sin extra no pinta el hueco de la derecha", () => {
    const html = renderToStaticMarkup(<CabeceraPromo />);
    expect(html).not.toContain("PLANES");
  });
});

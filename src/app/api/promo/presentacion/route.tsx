import { ImageResponse } from "next/og";
import { ORIGEN_PROMO, PALETA_PROMO, TAMANO_PROMO } from "@/lib/promo";
import { paraInstagramJpeg } from "@/lib/promo-image";
import { MarcaPromo } from "@/lib/promo-marca";

export const runtime = "nodejs";
// La presentación no cambia de un día a otro, así que se cachea mucho más que las tarjetas de
// eventos: si el texto no cambia, la imagen tampoco.
export const revalidate = 86400;

/**
 * La imagen del post de presentación: quiénes somos y qué hay en la cuenta.
 *
 * **Es una ruta y no un fichero estático.** `ImageResponse` la dibuja y un PNG generado en
 * build se quedaría congelado el día que se generara. Con una ruta, corregir una palabra es
 * desplegar y nada más.
 *
 * **El logo va inlineado con `MarcaPromo`, como en el resto del paquete.** Satori no descarga
 * ficheros externos y dentro de `ImageResponse` no hay tema que heredar: una variable de CSS
 * sale en negro.
 *
 * **El tamaño es el del resto del paquete, 1080×1350**, para que la serie de posts tenga la
 * misma gramática y no parezca un añadido suelto.
 *
 * **Acepta `?format=jpeg` igual que el carrusel**, porque Meta solo publica JPEG y esta imagen
 * también es publicable: sin el parámetro sigue sirviendo PNG.
 */
export async function GET(request: Request) {
  const renglon = (titulo: string, detalle: string) => (
    <div style={{ display: "flex", alignItems: "baseline", gap: 22, marginBottom: 26 }}>
      <div
        style={{
          display: "flex",
          fontSize: 30,
          fontWeight: 800,
          color: PALETA_PROMO.tinta,
          width: 300,
          flexShrink: 0,
        }}
      >
        {titulo}
      </div>
      <div style={{ display: "flex", fontSize: 30, color: PALETA_PROMO.tintaSuave }}>{detalle}</div>
    </div>
  );

  const imagenPromo = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PALETA_PROMO.papel,
          color: PALETA_PROMO.tinta,
          padding: 96,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", marginBottom: 28 }}>
            <MarcaPromo tamano={200} />
          </div>
          <div
            style={{
              // `display: flex` no es decorativo aquí: Satori rechaza un `<div>` con más de un
              // hijo que no lo declare, y este tiene el texto "HUESCA" y el `<span>` de "HOY".
              // Sin esto el build falla con un error que no señala la causa.
              display: "flex",
              fontSize: 104,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              marginTop: 8,
            }}
          >
            <span>HUESCA</span>
            <span style={{ color: PALETA_PROMO.acento }}>HOY</span>
          </div>
          {/*
           * **Dos líneas cortadas a mano, y no un salto automático.** A 44 px el titular no
           * cabe en los 888 px que quedan entre los márgenes, y Satori lo parte donde le sale,
           * dejando una palabra sola al final de la línea. Con dos `<span>` en un `flex column`
           * el corte es el que queríamos —una afirmación en dos tiempos— y además aguanta si
           * mañana el titular crece una palabra.
           */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 44,
              fontWeight: 800,
              color: PALETA_PROMO.acento,
              letterSpacing: "0.04em",
              marginTop: 26,
              lineHeight: 1.2,
            }}
          >
            <span>TODO HUESCA</span>
            <span>EN UN SOLO SITIO</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {renglon("Qué hay", "conciertos, teatro, cine, deporte y planes con niños")}
          {renglon("Sin buscar", "no tienes que revolver 30 webs ni grupos de Facebook")}
          {renglon("Cada día", "te decimos qué merece la pena hoy, y por qué")}
          {renglon("Gratis", "sin cuenta y sin instalar nada")}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", width: 70, height: 3, background: PALETA_PROMO.acento }} />
          <div style={{ display: "flex", fontSize: 30, color: PALETA_PROMO.tintaSuave }}>
            {ORIGEN_PROMO.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    TAMANO_PROMO
  );

  return paraInstagramJpeg(request, imagenPromo);
}

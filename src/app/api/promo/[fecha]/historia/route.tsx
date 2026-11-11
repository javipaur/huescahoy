import { ImageResponse } from "next/og";
import { getEvents } from "@/lib/db";
import { formatDayLong } from "@/lib/format";
import {
  MAX_DIAPOSITIVAS,
  PALETA_PROMO,
  TAMANO_HISTORIA,
  diaCivil,
  ventanaCortaPromo,
  ventanaDelDia,
} from "@/lib/promo";
import { paraInstagramJpeg } from "@/lib/promo-image";
import { MarcaPromo } from "@/lib/promo-marca";
import { seleccionarParaPromo } from "@/lib/promo-seleccion";

export const runtime = "nodejs";
export const revalidate = 1800;

type Ctx = { params: Promise<{ fecha: string }> };

/**
 * La historia del día: un plan, a pantalla completa.
 *
 * **Una sola diapositiva y no un resumen.** El formato de historia se mira de pie, con el
 * móvil en la mano y quizá esperando el bus: ahí caben una cosa y su nombre grande, no seis
 * títulos en minúscula. Un resumen en vertical obliga a ampliar para leer, y quien amplía una
 * historia ya está a un dedo de pasarla.
 *
 * **El mismo selector, la misma ventana y el mismo límite que el post.** No hay una lista
 * nueva: el primer evento de `seleccionarParaPromo` es el mismo que ocupa la primera
 * diapositiva del carrusel, y la ventana se resuelve con `ventanaDelDia` para que un sábado
 * la historia cubra el finde entero —igual que el carrusel— y los dos «N planes» coincidan.
 *
 * **`numero` y `pie` se calculan fuera del JSX y se pintan como interpolación simple.** Un
 * ternario dentro de un `<div>` puede devolver un número o una cadena, y Satori los cuenta
 * como dos hijos y tumba la respuesta con un 502 a mitad del stream. Está escrito y explicado
 * en la ruta de la portada, que falló en producción por eso durante semanas.
 */
export async function GET(request: Request, { params }: Ctx) {
  const { fecha } = await params;

  // `ventanaDelDia` lanza si la fecha no es `YYYY-MM-DD`, y una URL vieja no puede tumbar la
  // imagen: sin ventana se usa ese mismo día.
  let desde = fecha;
  let hasta = fecha;
  try {
    const ventana = ventanaDelDia(fecha);
    if (ventana) {
      desde = ventana.desde;
      hasta = ventana.hasta;
    }
  } catch {
    // La fecha del enlace no es una fecha. Se pinta lo que haya para ese día.
  }

  // La etiqueta de arriba, sin dejarla nunca en manos de una fecha rota: `formatDayLong`
  // de una cadena inválida devuelve «undefined, NaN de undefined», y eso en caja alta y a
  // 44 px es una imagen que nadie debería publicar.
  const etiqueta = !diaCivil(desde)
    ? ""
    : desde === hasta
      ? formatDayLong(desde)
      : ventanaCortaPromo(desde, hasta);

  const eventos = await getEvents({ from: desde, to: hasta, limit: 200 });
  const lista = seleccionarParaPromo(eventos, { desde, hasta, limite: MAX_DIAPOSITIVAS });
  const primero = lista[0];

  const numero = lista.length > 0 ? String(lista.length) : "—";
  const cuando = desde === hasta ? "del día" : "del finde";
  const pie =
    lista.length === 0 ? "sin planes" : lista.length === 1 ? `plan ${cuando}` : `planes ${cuando}`;

  const nombre = primero?.title ?? "";
  const lugar = primero?.location ?? "";

  const imagenPromo = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          background: PALETA_PROMO.tinta,
          color: PALETA_PROMO.papel,
          padding: 90,
          fontFamily: "sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <MarcaPromo tamano={150} />
          {etiqueta ? (
            <div style={{ display: "flex", fontSize: 44, letterSpacing: 8, color: PALETA_PROMO.dorado, marginTop: 30 }}>
              {etiqueta.toUpperCase()}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 90, lineHeight: 1.14 }}>
            {nombre || "Sin planes"}
          </div>
          {/*
           * El lugar va en su propio `<div>` y no pegado al título con un espacio. Con
           * `{nombre} {lugar}` el `<div>` tendría tres hijos —título, espacio y lugar— y sin
           * `display` Satori tumba la imagen. Es el mismo fallo que se resolvió en la ruta del
           * evento, que estuvo dando 502 desde octubre.
           */}
          {lugar ? (
            <div style={{ display: "flex", fontSize: 46, color: PALETA_PROMO.marco, marginTop: 40 }}>
              {lugar}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 150, lineHeight: 1, color: PALETA_PROMO.dorado }}>
            {numero}
          </div>
          <div style={{ display: "flex", fontSize: 52, color: PALETA_PROMO.marco, marginTop: 20 }}>
            {pie}
          </div>
          <div style={{ display: "flex", fontSize: 36, color: PALETA_PROMO.tintaTenue, marginTop: 56 }}>
            huescahoy.javierpalacio.es/agenda
          </div>
        </div>
      </div>
    ),
    TAMANO_HISTORIA
  );

  return paraInstagramJpeg(request, imagenPromo);
}

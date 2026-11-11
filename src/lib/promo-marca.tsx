import type { ReactElement } from "react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PALETA_PROMO } from "./promo";

/**
 * La marca del paquete de redes, en un solo sitio.
 *
 * **Es `public/logo.png` inlineado como data-URI, y no un `<img src="/logo.png">`.** Satori
 * —el motor que hay detrás de `ImageResponse`— no descarga ficheros externos: un `<img>`
 * apuntando a una ruta del sitio sale como un hueco, sin error y sin log. La única forma de
 * que la marca aparezca es que los bytes viajen dentro del propio HTML que se le pasa.
 *
 * **Se lee una sola vez y se cachea en el módulo.** El PNG pesa ~125 KB y hay una imagen por
 * cada diapositiva del carrusel: leerlo y codificarlo en base64 once veces por post es
 * trabajo repetido para el mismo resultado. En un proceso de servidor que dura horas, el
 * `readFileSync` de la primera petición deja el data-URI listo para todas las demás.
 */
let marcaCache: string | null = null;

function marcaDataUri(): string {
  if (!marcaCache) {
    const png = readFileSync(join(process.cwd(), "public", "logo.png"));
    marcaCache = `data:image/png;base64,${png.toString("base64")}`;
  }
  return marcaCache;
}

/**
 * El cuadrado de la marca, del tamaño que pida la tarjeta.
 *
 * **El redondeo imita el `rounded-xl` de la web.** Allí el logo va con `rounded-xl` sobre
 * 44 px; aquí, a 78 px, el mismo gesto es una esquina redondeada del 22 % del lado. No es un
 * número sagrado: es que un cuadrado perfecto con esquinas vivas se lee como un recorte
 * pegado y no como la marca de la cabecera.
 */
export function MarcaPromo({ tamano = 72 }: { tamano?: number }): ReactElement {
  return (
    <img
      src={marcaDataUri()}
      width={tamano}
      height={tamano}
      alt=""
      style={{ borderRadius: Math.round(tamano * 0.22), objectFit: "cover" }}
    />
  );
}

/**
 * El logotipo escrito, igual que en la cabecera de la web: `Huesca` + `Hoy` en verde.
 *
 * **Dos hijos y `display: flex`**, que en Satori no es opcional: un `<div>` con más de un
 * hijo y sin `display` explícito responde 502 sin cuerpo y sin log.
 *
 * **Y sin `text-transform`.** La cabecera no usa mayúsculas y el logotipo tampoco: en caja
 * alta, `HuescaHoy` se convierte en una palabra de nueve letras que no se lee como dos.
 */
export function WordmarkPromo({
  tamano = 42,
  color = PALETA_PROMO.tinta,
}: {
  tamano?: number;
  color?: string;
}): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        fontFamily: "sans-serif",
        fontSize: tamano,
        fontWeight: 900,
        letterSpacing: "-0.045em",
        lineHeight: 1,
        color,
      }}
    >
      <span>Huesca</span>
      <span style={{ color: PALETA_PROMO.acento }}>Hoy</span>
    </div>
  );
}

/**
 * Marca y logotipo en fila: la cabecera de todas las tarjetas del carrusel.
 *
 * **La misma en la portada y en las diapositivas de evento**, y por eso está aquí y no
 * copiada en las dos rutas. Un carrusel donde la primera imagen lleva la marca en una
 * esquina y las demás en otra se lee como imágenes de dos sitios distintos.
 */
export function CabeceraPromo({
  tamanoMarca = 78,
  tamanoTexto = 42,
  extra = null,
}: {
  tamanoMarca?: number;
  tamanoTexto?: number;
  extra?: ReactElement | null;
}): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <MarcaPromo tamano={tamanoMarca} />
        <WordmarkPromo tamano={tamanoTexto} />
      </div>
      {extra ? (
        <div style={{ display: "flex", marginLeft: "auto", alignItems: "center" }}>{extra}</div>
      ) : null}
    </div>
  );
}

import { site } from "./site";

/**
 * Lo que tienen en común las tarjetas del paquete de redes.
 *
 * **Por qué el tamaño y las URLs salen de aquí y no de cada ruta.** Las rutas del
 * paquete necesitan lo mismo, y si eso vive en tres sitios un día uno se queda a
 * 1080×1080 sin que nada se entere: en el móvil se ve bien y en el feed queda con dos
 * bandas negras.
 *
 * 1080×1350 es 4:5, que es lo que más pantalla ocupa en el feed de Instagram por debajo
 * del 10:4.
 */
export const TAMANO_PROMO = { width: 1080, height: 1350 } as const;

/**
 * El tamaño de una historia: 1080×1920, que es 9:16.
 *
 * **No es el de las historias de Instagram**, que ocupan pantalla completa y cambian
 * según el móvil. Es el formato de origen de un Reel o de un vídeo, y es el único que
 * genera `ImageResponse` con una proporción fija. Se sube como imagen y se recorta por
 * arriba y por abajo en cada pantalla.
 *
 * **Va en su propia constante y no como un segundo `TAMANO_*` en cada ruta.** El error
 * concreto que evita: cambiar la proporción de las tarjetas del feed y que las historias
 * sigan en 4:5, o al revés.
 */
export const TAMANO_HISTORIA = { width: 1080, height: 1920 } as const;

/**
 * Cuántos eventos entran en un post, y por qué es un solo número para todos.
 *
 * **Instagram admite veinte hijos en un carrusel**, pero diez es lo que cabe en el pulgar
 * sin que ninguna diapositiva sobre, y lo que hace que el «10 planes» del pie de foto sea
 * verdad y no una promesa a medias.
 *
 * **El número aparece en tres sitios y tiene que ser el mismo:** el pie de foto, el
 * carrusel (lo lee n8n) y la lista que se sirve. Ya pasó en gasteiz que el post llevaba
 * nueve diapositivas y la página a la que enlazaba pintaba ocho: el noveno evento salía
 * en la imagen y no estaba donde el enlace prometía.
 */
export const MAX_DIAPOSITIVAS = 10;

/**
 * Los colores del paquete de redes.
 *
 * **Salen de `src/app/globals.css`, y en un solo sitio por el mismo motivo que
 * `TAMANO_PROMO`: el día que la marca cambie de verde, este es el fichero que se toca.**
 * Los roles son los de gasteiz: `acento` es el color fuerte de las etiquetas (allí el
 * rojo, aquí el verde de marca) y `acentoSuave` el de las fechas (allí la mostaza).
 *
 * **`tintaTenue` y `filete` son derivados y no tokens de la hoja de estilos.** Los demás
 * existen tal cual en `globals.css` (`papel`/`marco`/`tinta`/`tintaSuave`/`acento`/
 * `dorado`); estos dos son tonos intermedios que solo usa el paquete de redes —el gris del
 * pie de la historia y el filete de 1 px— y que no tienen variable en la web. Se escriben
 * aquí porque `ImageResponse` no lee variables de CSS, pero conviene saber que no hay un
 * `--color-*` al que volver si algún día se quiere unificar.
 */
export const PALETA_PROMO = {
  /** El fondo de todas las tarjetas del carrusel. */
  papel: "#ffffff",
  /** El marco de las fotos: un paso más oscuro que el papel, para que la foto tenga borde. */
  marco: "#ecf3ef",
  tinta: "#12281b",
  tintaSuave: "#5d7266",
  tintaTenue: "#8aa196",
  /** El verde de marca. Etiquetas, precios y acentos fuertes. */
  acento: "#128341",
  /** El verde apagado de las fechas, para que no compita con el acento. */
  acentoSuave: "#5d7266",
  /**
   * El verde claro de la marca (`--color-gold` en `globals.css`).
   *
   * **Existe para la historia, que es la única tarjeta con fondo oscuro.** El resto del
   * paquete va sobre blanco, donde el acento es `#128341`; sobre el chocolate `#12281b` ese
   * verde no se lee, y una cifra que no se lee no informa. Este es el mismo verde de la
   * marca en su versión clara, que es la que aguanta sobre oscuro.
   */
  dorado: "#a7e8c4",
  filete: "#dbe6df",
} as const;

/**
 * Las etiquetas del pie de foto.
 *
 * **Cinco y no treinta.** Un muro de etiquetas no da alcance desde 2023: lo que mueve una
 * cuenta pequeña es la primera línea y que alguien guarde o comparta, no la lista. Así que
 * aquí van las cinco que describen la cuenta —ciudad, planes, agenda, ocio— y ninguna
 * genérica del tipo `#photooftheday`, que trae seguidores que no son de aquí.
 */
export const HASHTAGS_PROMO = [
  "#Huesca",
  "#HuescaHoy",
  "#PlanesHuesca",
  "#AgendaHuesca",
  "#OcioHuesca",
].join(" ");

/** La base pública del sitio. Es la de `metadataBase` en `app/layout.tsx`. */
export const ORIGEN_PROMO = site.url;

/** La URL de una tarjeta, tal como la necesita Instagram. */
export function urlDePromo(fecha: string, slug?: string): string {
  const base = `${ORIGEN_PROMO}/api/promo/${fecha}`;
  return slug ? `${base}/evento/${slug}` : `${base}/portada`;
}

/**
 * La URL de la historia del día, en vertical.
 *
 * **Vive en la hoja y no se escribe a mano en el correo.** Una URL escrita en dos ficheros
 * es una URL que un día apunta a un sitio y al otro a nada.
 */
export function urlHistoria(fecha: string): string {
  return `${ORIGEN_PROMO}/api/promo/${fecha}/historia`;
}

/**
 * El post de presentación: quiénes somos. Y no es un plan de hoy.
 *
 * **Va como ruta aparte y no como una diapositiva más.** Es otro post: este no caduca,
 * mientras que el carrusel de la agenda cambia cada mañana. Si fuera una diapositiva
 * ocuparía la última posición —justo donde quien publica espera el plan del sábado— y se
 * publicaría por error.
 */
export const URL_PRESENTACION = `${ORIGEN_PROMO}/api/promo/presentacion`;

/**
 * El pie del post de presentación.
 *
 * **Va escrito a mano, y no generado como `textoDelPie`.** Aquel sí sale de los datos
 * —cuántos planes, de qué categorías, para qué fechas—, porque eso cambia cada día. Este
 * no: es un texto fijo sobre la cuenta, y un texto fijo es justo lo que lo hace legible.
 */
export const TEXTO_PRESENTACION = [
  "Huesca tiene planes de sobra. El problema era encontrarlos.",
  "",
  "Huesca Hoy junta la agenda de toda la ciudad en un solo sitio y te dice qué merece la pena hoy.",
  "Gratis, sin registro y sin que te manden nada.",
  "",
  "Guárdalo, y mándaselo a quien siempre te dice «cuando quieras». 👇",
  "",
  HASHTAGS_PROMO,
].join("\n");

/** El enlace del post de presentación: siempre el mismo, y sin utm. */
export const ENLACE_PRESENTACION = ORIGEN_PROMO;

/**
 * La URL que hay que darle a `ImageResponse` para que pinte la imagen, o nada.
 *
 * **Sin lista blanca de hosts y sin proxy, a diferencia de gasteiz.** Allí había un
 * `/api/img` porque un WAF devolvía 403 al `fetch` de Node de `ImageResponse`, y una lista
 * de hosts porque el optimizador de `next/image` no acepta cualquiera. En Huesca Hoy no
 * existe ninguna de las dos cosas, así que la regla queda reducida a lo que de verdad
 * importa: que la URL sea pintable.
 *
 * **Por qué sale absoluta.** `ImageResponse` no tiene origen contra el que resolver una
 * ruta relativa: `<img src="/logo.png">` no la descarga. Por eso las rutas del propio
 * sitio se prefijan con `ORIGEN_PROMO`.
 *
 * Devuelve `null` y no una imagen de relleno porque el hueco no es decorativo: es un hueco
 * en un post que alguien va a leer.
 */
export function urlImagenPromo(url: string | undefined | null): string | null {
  if (!url) return null;
  const u = url.trim();
  if (!u) return null;
  // Protocol-relative (`//cdn…`) se resuelve a `https` y no se confunde con una ruta del
  // sitio: empieza por `/` igual que `/fotos/x.jpg`, pero el segundo carácter lo delata.
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${ORIGEN_PROMO}${u}`;
  if (/^https?:\/\//i.test(u)) return u;
  return null;
}

/**
 * Descarga la imagen del evento y la devuelve como data URI para incrustarla en la tarjeta.
 *
 * **Por qué no se pasa la URL remota directamente a Satori.** Si la fuente devuelve 404,
 * bloquea el fetch o falla la carga, la tarjeta puede renderizarse con el área de imagen en
 * blanco/rota. Al traer los bytes aquí (en runtime Node) y convertirlos a data URI, la
 * imagen queda embebida y solo se usa si realmente se pudo leer.
 *
 * Devuelve `null` si la URL no es utilizable o la imagen no se puede obtener.
 */
export async function imagenPromoEmbebida(
  url: string | undefined | null
): Promise<string | null> {
  const absoluta = urlImagenPromo(url);
  if (!absoluta) return null;

  try {
    const res = await fetch(absoluta, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; HuescaHoyPromo/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return null;

    const tipo = (res.headers.get("content-type") || "").toLowerCase();
    if (tipo && !tipo.startsWith("image/")) return null;

    const buf = Buffer.from(await res.arrayBuffer());
    // Rechaza respuestas vacías o sospechosamente pequeñas (píxeles/errores disfrazados).
    if (buf.length < 1024) return null;

    const mime = tipo.split(";")[0].trim() || "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** La ventana que toca publicar un día dado, o `null` si ese día no se publica. */
export type VentanaPromo = {
  desde: string;
  hasta: string;
  etiqueta: "HOY" | "ESTE FINDE";
};

/**
 * Qué días se publica, y qué ventana lleva cada uno.
 *
 * | Día | Publica |
 * |---|---|
 * | domingo a viernes | ese mismo día |
 * | sábado | ese sábado y el domingo |
 *
 * **Siete días de siete, igual que gasteiz.** Los tres días originales —jueves, viernes y
 * sábado— eran una decisión editorial para no cansar; medido, los catorce días seguidos
 * tenían planes de sobra, así que el veto no respondía a que faltara contenido. La agenda
 * de Huesca cambia cada día y el enlace lleva la `utm` de esa fecha, así que el miércoles
 * enlaza al miércoles.
 *
 * **La tabla está en un `Record` y no en un `if` para que sea un dato y no una decisión
 * repartida por el código.** Cambiar la cadencia es cambiar esta constante.
 */
const VENTANAS_POR_DIA: Record<number, (hoy: string) => VentanaPromo | null> = {
  // `getDay()` es 0 el domingo. El mediodía evita el borde del cambio de hora: con
  // medianoche, un día que cambia de hora local se desplaza de sábado a viernes o al revés.
  0: (hoy) => ({ desde: hoy, hasta: hoy, etiqueta: "HOY" }),
  1: (hoy) => ({ desde: hoy, hasta: hoy, etiqueta: "HOY" }),
  2: (hoy) => ({ desde: hoy, hasta: hoy, etiqueta: "HOY" }),
  3: (hoy) => ({ desde: hoy, hasta: hoy, etiqueta: "HOY" }),
  4: (hoy) => ({ desde: hoy, hasta: hoy, etiqueta: "HOY" }),
  5: (hoy) => ({ desde: hoy, hasta: hoy, etiqueta: "HOY" }),
  6: (hoy) => ({ desde: hoy, hasta: sumarDias(hoy, 1), etiqueta: "ESTE FINDE" }),
};

/**
 * La ventana de un día, o `null` si ese día no se publica.
 *
 * **La tabla decide y esta función solo la consulta.** Un día sin entrada devuelve `null`,
 * que es una respuesta correcta y silenciosa.
 *
 * **Una fecha rota lanza, y no devuelve `null`.** `null` significa «hoy no se publica»; una
 * fecha inválida es un error, porque si no el cron se creería que hoy no toca y saldría con
 * 0 sin mandar nada, siete días seguidos sin que nadie lo advierta.
 */
export function ventanaDelDia(hoy: string): VentanaPromo | null {
  const dia = new Date(`${hoy}T12:00:00`);
  if (isNaN(dia.getTime())) {
    throw new Error(`ventanaDelDia necesita una fecha YYYY-MM-DD, y recibió "${hoy}"`);
  }

  const construir = VENTANAS_POR_DIA[dia.getDay()];
  return construir ? construir(hoy) : null;
}

/** La forma que consume la publicación. Cerrada: un campo que sobra lo lee sin querer. */
export type PaquetePromo = {
  portada: string;
  imagenes: string[];
  /**
   * El título de cada diapositiva, en el mismo orden que `imagenes`.
   *
   * **Va en el paquete y no se reconstruye al consumirlo.** Al viajar juntos, la imagen y
   * su nombre son la misma verdad, porque los ha puesto el mismo sitio en el mismo momento.
   * El slug es un nombre de fichero, no un título.
   */
  titulos: string[];
  /** La imagen vertical (9:16) para publicar como historia del día. */
  historia: string;
  /** El enlace base de la ventana, sin `utm`. */
  pie: string;
  /** El pie de foto completo. */
  texto: string;
  /** El enlace con `utm`, el que va en la bio. */
  enlace: string;
};

/**
 * El enlace de la ventana, sin `utm`.
 *
 * **Se elige entre los dos enlaces que ya usa la home** —`/agenda?desde=hoy` y
 * `/agenda?desde=finde`— en vez de inventar un `?desde=&hasta=` que la página de la agenda
 * no sabe leer. El flujo corre el mismo día, así que «finde» calcula la misma ventana que
 * esta función.
 */
export function enlaceDeVentana(desde: string, hasta: string): string {
  const rango = desde === hasta ? "hoy" : "finde";
  return `${ORIGEN_PROMO}/agenda?desde=${rango}`;
}

/**
 * El paquete del día o del finde.
 *
 * **Recibe la lista ya seleccionada y no los eventos**, y el motivo es que quien llama es
 * quien ha llamado al selector. Dos llamadas al selector son dos reglas que divergen el día
 * que se toque una.
 *
 * **Aquí no hay ninguna llamada a la Graph API, y no la va a haber.** Este fichero prepara
 * el paquete y nada más: el token no vive en el repositorio y publicar es una decisión
 * editorial de una persona. La frontera queda así: el repositorio sirve el paquete y nunca
 * publica; n8n publica y nunca decide.
 */
export function paqueteDePromo(
  lista: Array<{ slug: string; title: string; location: string | null; category?: string | null }>,
  { desde, hasta }: { desde: string; hasta: string }
): PaquetePromo {
  const ventana = enlaceDeVentana(desde, hasta);
  return {
    portada: urlDePromo(desde),
    imagenes: lista.map((e) => urlDePromo(desde, e.slug)),
    titulos: lista.map((e) => normalizarTituloPromo(e.title)),
    historia: urlHistoria(desde),
    pie: ventana,
    texto: textoDelPie(lista, desde, hasta),
    // El `utm_content` lleva la fecha y no un texto fijo, que es lo que permite saber
    // después qué post trajo visitas.
    enlace: `${ventana}&utm_source=ig&utm_medium=social&utm_content=huescahoy-${desde}`,
  };
}

/** Suma días a una fecha local y la vuelve a escribir como `YYYY-MM-DD`. */
function sumarDias(ymd: string, dias: number): string {
  const d = new Date(`${ymd}T12:00:00`);
  d.setDate(d.getDate() + dias);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * El pie de foto.
 *
 * **La forma copia la de gasteiz, y no por imitación sino porque cada línea hace un
 * trabajo.**
 *
 * 1. **La promesa, con número y con fechas.** «Este miércoles 11 de noviembre hay 6 planes
 *    en Huesca.» Es lo único que se lee en el feed antes del «ver más».
 * 2. **Qué hay dentro.** «Día, hora, sitio y precio en cada uno.» Es la razón para deslizar.
 * 3. **El abanico de categorías**, sacado de los datos y no de una plantilla.
 * 4. **La pregunta.** «¿Cuál te llevas?» es lo que se comparte.
 * 5. **Los hashtags.** Cinco, los de `HASHTAGS_PROMO`.
 */
export function textoDelPie(
  lista: Array<{ title: string; location: string | null; category?: string | null }>,
  desde: string,
  hasta: string
): string {
  if (lista.length === 0) {
    return [
      `${ventanaEnPalabras(desde, hasta)} no hay nada que recomendarte.`,
      "",
      "Pero el resto de la agenda sigue en pie. Está aquí abajo.",
    ].join("\n");
  }

  const cuenta = lista.length === 1 ? "hay 1 plan" : `hay ${lista.length} planes`;
  const abanico = abanicoDeCategorias(lista);

  return [
    `${ventanaEnPalabras(desde, hasta)} ${cuenta} en Huesca.`,
    "Día, hora, sitio y precio en cada uno: solo hay que elegir.",
    ...(abanico ? ["", abanico] : []),
    "",
    "¿Cuál te llevas? 👇",
    "",
    "Los demás, por día y por hora, en el enlace de la bio.",
    "",
    HASHTAGS_PROMO,
  ].join("\n");
}

/** Los días y los meses, en minúscula y enteros: el pie es una frase, no una etiqueta. */
const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

const MESES_LARGOS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const DIAS_CORTOS = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

const MESES_CORTOS = [
  "ENE",
  "FEB",
  "MAR",
  "ABR",
  "MAY",
  "JUN",
  "JUL",
  "AGO",
  "SEP",
  "OCT",
  "NOV",
  "DIC",
];

/**
 * Una fecha como día civil, a mediodía.
 *
 * **Se queda con los diez primeros caracteres**, así que acepta tanto `YYYY-MM-DD` (lo que
 * guarda Huesca Hoy en `startDate`) como un instante ISO completo. Se reinterpreta a
 * mediodía porque a las 12:00 no hay frontera de huso cerca: una fecha sin hora la parsea
 * el motor como UTC y en `Europe/Madrid` eso es el día anterior.
 */
export function diaCivil(iso: string): Date | null {
  const ymd = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;

  const d = new Date(`${ymd}T12:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

/** `miércoles 11 de noviembre` a partir de `2026-11-11`. */
function diaEnPalabras(fecha: string): string {
  const d = diaCivil(fecha);
  if (!d) return fecha;
  return `${DIAS_SEMANA[d.getDay()]} ${d.getDate()} de ${MESES_LARGOS[d.getMonth()]}`;
}

/**
 * `MIÉ 11 NOV`: la fecha de las imágenes, en caja alta y corta.
 *
 * **Va aquí y no en la ruta**: la tarjeta de evento y la portada hacen la misma pregunta
 * —«¿qué día es esto?»— y con una copia en cada sitio el día que una aprenda a leer un
 * instante la otra seguiría escupiendo la cadena ISO.
 */
export function fechaCortaPromo(fecha: string): string {
  const d = diaCivil(fecha);
  if (!d) return fecha;
  return `${DIAS_CORTOS[d.getDay()]} ${d.getDate()} ${MESES_CORTOS[d.getMonth()]}`;
}

/**
 * La ventana en la esquina de la portada: `MIÉ 11 NOV`, `14 — 15 NOV`, `31 OCT — 1 NOV`.
 *
 * **No dice «HOY».** Lo decía, y es una palabra que la imagen no puede saber: la portada se
 * pide por URL con una fecha, y una URL guardada de la semana pasada habría seguido
 * afirmando que es hoy.
 *
 * El mes se escribe **una vez** cuando la ventana no cruza de mes, que es lo que hace que
 * `14 — 15 NOV` se lea de un vistazo y `14 NOV — 15 NOV` no.
 */
export function ventanaCortaPromo(desde: string, hasta: string): string {
  const d1 = diaCivil(desde);
  if (!d1) return "";

  if (desde === hasta) return fechaCortaPromo(desde);

  const d2 = diaCivil(hasta);
  if (!d2) return "";

  const mismoMes = d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
  if (mismoMes) return `${d1.getDate()} — ${d2.getDate()} ${MESES_CORTOS[d2.getMonth()]}`;

  return `${d1.getDate()} ${MESES_CORTOS[d1.getMonth()]} — ${d2.getDate()} ${MESES_CORTOS[d2.getMonth()]}`;
}

/**
 * La ventana, al principio de la frase.
 *
 * Devuelve «Este miércoles 11 de noviembre» o «Del sábado 14 al 15 de noviembre»: las dos
 * empiezan por mayúscula porque van al principio de la frase, y el mes se escribe una sola
 * vez cuando es el mismo.
 */
function ventanaEnPalabras(desde: string, hasta: string): string {
  if (desde === hasta) return `Este ${diaEnPalabras(desde)}`;

  const d1 = diaCivil(desde);
  const d2 = diaCivil(hasta);
  if (!d1 || !d2) return `Del ${desde} al ${hasta}`;

  const mismoMes = d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

  if (mismoMes) {
    return `Del ${DIAS_SEMANA[d1.getDay()]} ${d1.getDate()} al ${d2.getDate()} de ${MESES_LARGOS[d2.getMonth()]}`;
  }
  return `Del ${diaEnPalabras(desde)} al ${diaEnPalabras(hasta)}`;
}

/**
 * De qué va la semana, en una línea, sacado de las categorías de verdad.
 *
 * **Sale de los datos y no de una lista de categorías escrita aquí.** Si un día el post es
 * todo teatro, el pie dice «Todo de teatro»; si hay cinco cosas distintas, dice de dónde a
 * dónde va. Una plantilla mentiría el día que el carrusel no las traiga.
 *
 * Devuelve `null` cuando no hay ninguna categoría y entonces el pie simplemente no lleva la
 * línea. Un hueco se lee mejor que «De undefined a undefined».
 */
function abanicoDeCategorias(lista: Array<{ category?: string | null }>): string | null {
  const vistas: string[] = [];
  for (const evento of lista) {
    const categoria = evento.category?.trim().toLowerCase();
    if (categoria && !vistas.includes(categoria)) vistas.push(categoria);
  }

  if (vistas.length === 0) return null;
  if (vistas.length === 1) return `Todo de ${vistas[0]}.`;
  if (vistas.length === 2) return `De ${vistas[0]} a ${vistas[1]}.`;

  const primera = vistas[0];
  const ultima = vistas[vistas.length - 1];
  const intermedias = vistas.slice(1, -1);

  if (intermedias.length === 1) {
    return `De ${primera} a ${ultima}, pasando por ${intermedias[0]}.`;
  }

  const cola = intermedias[intermedias.length - 1];
  return `De ${primera} a ${ultima}, pasando por ${intermedias.slice(0, -1).join(", ")} y ${cola}.`;
}

/**
 * El título de una diapositiva, limpio de lo que no es el título.
 *
 * **Corrige erratas conocidas y quita fechas y años pegados al final** —«PAULA MATTHEUS (23
 * de octubre, Huesca)» → «PAULA MATTHEUS»—, porque un título municipal llega con el
 * paréntesis del scrap y bajo la foto ocupa una línea entera para decir dos veces el día.
 */
export function normalizarTituloPromo(titulo: string): string {
  if (!titulo) return titulo;

  let t = titulo;

  t = t.replace(/\s*\(\s*\d{1,2}\s+de\s+[^)]+\)\s*$/i, "").trim();
  t = t.replace(/\s*\[\s*\d{1,2}\s+de\s+[^\]]+\]\s*$/i, "").trim();
  t = t.replace(/\s*\(\s*20\d{2}\s*\)\s*$/i, "").trim();
  t = t.replace(/\s*\[\s*20\d{2}\s*\]\s*$/i, "").trim();
  t = t.replace(/\s{2,}/g, " ").trim();

  return t;
}

/**
 * Una hora como `HH:MM`, o `null` si no se puede leer.
 *
 * Es la versión de Huesca Hoy de `shortTime` de gasteiz: `startTime` llega como `HH:MM` de
 * la base de datos, pero algunos scrapers dejan `20`, `20h30` o `20:30:00`.
 */
export function shortTimePromo(hora: string | null | undefined): string | null {
  if (!hora) return null;
  const t = hora.trim();
  const m = t.match(/^(\d{1,2})[:.h](\d{2})/i);
  if (m) return `${m[1]}:${m[2]}`;
  if (/^\d{1,2}$/.test(t)) return `${t}:00`;
  return null;
}

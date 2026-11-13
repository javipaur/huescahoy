import type { EventItem } from "./types";

/**
 * Qué eventos entran en el paquete de un día, y en qué orden.
 *
 * **Esto no es `recomendados`.** En gasteiz la lista salía de una puntuación —fuentes,
 * destacados, cercanía— y aquí no hay esa señal: Huesca Hoy no guarda número de fuentes
 * ni un peso por categoría. Inventar una puntuación con lo que hay sería un orden que
 * nadie puede explicar. Así que el orden es el que cualquiera puede comprobar mirando la
 * agenda: **primero lo que empieza en la ventana, y después lo que sigue en cartel.**
 *
 * **Lo que sí se copia de gasteiz es el colapso.** Un festival que dura el sábado y el
 * domingo ocupaba dos diapositivas con la misma foto y casi el mismo título, y en un
 * carrusel de diez eso es un quinto del post gastado en decir lo mismo. Aquí se funde en
 * una sola, la del primer día.
 *
 * **Sin llamada a ningún modelo.** La selección es determinista a propósito: el mismo día
 * da el mismo paquete, se puede probar con un test y no hay nada que se pueda caer a las
 * 08:45 de la mañana.
 */

/**
 * Cuántos caracteres tiene que tener un título para que identifique un evento.
 *
 * **El umbral existe porque colapsar de más es peor que no colapsar.** Dos eventos
 * titulados «Cine» en dos días no son el mismo evento: son dos sesiones, y fundirlas
 * borraría una de las dos de la imagen. Un título largo —«Festival Internacional de Cine
 * de Huesca»— sí es la misma cosa repetida. Veinte caracteres separa los dos casos sin
 * que haya que mantener una lista de excepciones.
 */
const MINIMO_PARA_COLAPSAR = 20;

/**
 * La clave con la que se decide si dos títulos son «el mismo evento».
 *
 * Sin tildes, sin mayúsculas, sin puntuación y con los espacios colapsados, porque la
 * misma actividad llega escrita de dos maneras según el scraper: «CONCIERTO DE MÚSICA
 * ANTIGUA» y «Concierto de musica antigua» son el mismo concierto.
 */
function claveDeTitulo(titulo: string): string | null {
  const limpio = titulo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  return limpio.length >= MINIMO_PARA_COLAPSAR ? limpio : null;
}

/** Una fecha `YYYY-MM-DD` de verdad. */
function esFecha(ymd: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(ymd) && !isNaN(new Date(`${ymd}T12:00:00`).getTime());
}

/**
 * Funde los eventos que son el mismo plan en días distintos.
 *
 * **Se queda con el de fecha más temprana, y compara fechas, no posiciones.** Si la lista
 * llegara sin ordenar, quedarse con «el primero que aparece» elegiría un día u otro según
 * cómo viniera la entrada. Comparando `startDate` el resultado es el mismo siempre.
 *
 * **Es exportada y no privada porque se prueba sola.** El colapso es la parte con más
 * reglas —el umbral, las tildes, la fecha ganadora— y probarlo a través del selector
 * mezclaría sus fallos con los del filtro y el orden.
 */
export function colapsarDiasConsecutivos(eventos: EventItem[]): EventItem[] {
  const porClave = new Map<string, EventItem>();

  for (const evento of eventos) {
    const clave = claveDeTitulo(evento.title);
    if (clave === null) {
      // Un título corto no colapsa: entra siempre, con una clave que no puede chocar.
      porClave.set(`\u0000${evento.slug}`, evento);
      continue;
    }

    const previo = porClave.get(clave);
    if (!previo || evento.startDate < previo.startDate) {
      porClave.set(clave, evento);
    }
  }

  return [...porClave.values()];
}

/**
 * La lista que va al carrusel de un día: en ventana, con foto, sin repetidos y con tope.
 *
 * El orden de los pasos importa y no es casual:
 *
 * 1. **Filtra por solape de fechas, no por fecha de inicio.** Entra lo que **toca** la
 *    ventana: lo que empieza dentro (inclusive los dos extremos) y lo que empezó antes y
 *    sigue en cartel —una exposición que abrió en agosto es un plan de hoy—. Un evento de
 *    un solo día sin `endDate` que ya pasó no entra.
 * 2. **Quita lo que no tiene foto.** Sin imagen no hay diapositiva que mirar.
 * 3. **Ordena en dos grupos: primero lo que empieza en la ventana, después lo que sigue en
 *    cartel.** Dentro del primero, por fecha, hora y título; dentro del segundo, por lo que
 *    acaba antes. Así una exposición de tres meses no empuja fuera del carrusel a los
 *    planes que justo salen hoy. El desempate por título no es decorativo: sin él, dos
 *    eventos a la misma hora saldrían en el orden en que los devolviera la base de datos,
 *    que no está prometido en ninguna parte.
 * 4. **Colapsa.** Se hace después de ordenar para que «el de fecha más temprana» sea
 *    también el que va antes en la lista.
 * 5. **Corta al tope al final.** Cortar antes del colapso dejaría fuera un plan que, tras
 *    fundirse con su gemelo, sí cabía.
 *
 * **Una fecha rota devuelve `[]` y no lanza.** Al contrario que `ventanaDelDia`, aquí una
 * ventana inválida no puede significar «hoy no se publica»: el selector solo selecciona, y
 * quien decide si hay post es quien mira si la lista está vacía.
 */
export function seleccionarParaPromo(
  eventos: EventItem[],
  { desde, hasta, limite }: { desde: string; hasta: string; limite: number }
): EventItem[] {
  if (!esFecha(desde) || !esFecha(hasta)) return [];

  /** Empieza dentro de la ventana: es un plan con fecha propia en estos días. */
  const empiezaEnLaVentana = (evento: EventItem): boolean =>
    evento.startDate >= desde && evento.startDate <= hasta;

  /** Empezó antes y sigue en cartel: una exposición abierta es un plan de hoy. */
  const sigueEnCartel = (evento: EventItem): boolean =>
    evento.startDate < desde && evento.endDate !== null && evento.endDate >= desde;

  const enVentana = eventos
    .filter((evento) => {
      if (!evento.image) return false;
      return empiezaEnLaVentana(evento) || sigueEnCartel(evento);
    })
    .sort((a, b) => {
      const aEmpieza = empiezaEnLaVentana(a);
      const bEmpieza = empiezaEnLaVentana(b);

      // Primero lo que empieza en la ventana; después lo que sigue en cartel. Sin este
      // corte, una exposición de tres meses se colaría por delante de los planes de hoy.
      if (aEmpieza !== bEmpieza) return aEmpieza ? -1 : 1;

      if (aEmpieza) {
        if (a.startDate !== b.startDate) return a.startDate < b.startDate ? -1 : 1;

        // Sin hora va al final del día: `99:99` es más tarde que cualquier hora real y evita
        // un `null` que compare distinto consigo mismo.
        const ta = a.startTime ?? "99:99";
        const tb = b.startTime ?? "99:99";
        if (ta !== tb) return ta < tb ? -1 : 1;

        return a.title.localeCompare(b.title, "es");
      }

      // Los que siguen en cartel: primero el que acaba antes, para que lo que está a punto
      // de terminar no se quede fuera del carrusel detrás de una muestra de tres meses.
      const ea = a.endDate ?? "";
      const eb = b.endDate ?? "";
      if (ea !== eb) return ea < eb ? -1 : 1;

      return a.title.localeCompare(b.title, "es");
    });

  return colapsarDiasConsecutivos(enVentana).slice(0, limite);
}

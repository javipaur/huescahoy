import { NextResponse } from "next/server";
import { getCategoriesAdmin, getEvents, todayStr } from "@/lib/db";
import { MAX_DIAPOSITIVAS, paqueteDePromo, ventanaDelDia } from "@/lib/promo";
import { seleccionarParaPromo } from "@/lib/promo-seleccion";

export const runtime = "nodejs";
export const revalidate = 1800;

/**
 * El paquete del día. No lo construye: lo llama.
 *
 * **El armado vive en `lib/promo.ts` y la selección en `lib/promo-seleccion.ts`.** Esta
 * ruta es un envoltorio: resuelve la ventana, pide los datos y devuelve lo que le dan.
 * Duplicar aquí una regla del paquete sería una segunda copia que diverge el día que se
 * toque la primera, y las dos seguirían funcionando: ese es el fallo caro, el que nadie ve.
 *
 * **La fecha va en la query y no en el path**, porque quien copia la URL de aquí escribe
 * la que le sale: meter `fecha` en el path obligaría a construirla a mano, que es donde
 * aparecen los typos que nadie ve hasta que el post ya está publicado.
 *
 * **No hay ninguna llamada a la Graph API aquí ni en ninguna parte de este proyecto.**
 * La frontera es: el repositorio sirve el paquete y nunca publica; n8n publica y nunca
 * decide. El gate de «mínimo tres planes» vive en n8n, no aquí: esta ruta devuelve el
 * paquete aunque venga vacío, porque decidir que no hay post es de quien publica.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const { desde, hasta } = resolverVentana(q.get("fecha"));

  const [eventos, categorias] = await Promise.all([
    getEvents({ from: desde, to: hasta, limit: 200 }),
    getCategoriesAdmin(),
  ]);

  const nombrePorId = new Map(categorias.map((categoria) => [categoria.id, categoria.name]));

  const lista = seleccionarParaPromo(eventos, {
    desde,
    hasta,
    limite: MAX_DIAPOSITIVAS,
  }).map((evento) => ({
    slug: evento.slug,
    title: evento.title,
    location: evento.location,
    // La categoría entra como nombre, no como id, porque es lo que lee el pie de foto.
    category: evento.categoryId == null ? null : nombrePorId.get(evento.categoryId) ?? null,
  }));

  return NextResponse.json(paqueteDePromo(lista, { desde, hasta }));
}

/**
 * La ventana que toca, a partir de la fecha pedida.
 *
 * **Una fecha rota no puede tumbar la ruta**: cae a hoy. `ventanaDelDia` lanza a propósito
 * con una fecha mal formada —para que el cron no se crea que hoy no se publica—, pero aquí
 * una URL vieja o un typo no son motivo para devolver un 500: se sirve el día de hoy, que
 * es lo que quiere quien llama sin saber qué fecha es.
 */
function resolverVentana(fecha: string | null): { desde: string; hasta: string } {
  const candidatas = [fecha, todayStr()];

  for (const candidata of candidatas) {
    if (!candidata) continue;
    try {
      const ventana = ventanaDelDia(candidata);
      return ventana
        ? { desde: ventana.desde, hasta: ventana.hasta }
        : { desde: candidata, hasta: candidata };
    } catch {
      // Fecha mal formada: se prueba con la siguiente candidata.
    }
  }

  const hoy = todayStr();
  return { desde: hoy, hasta: hoy };
}

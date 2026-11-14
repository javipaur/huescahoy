import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Landmark, MapPin, UtensilsCrossed } from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EventCard } from "@/components/event-card";
import { RestaurantCard } from "@/components/restaurant-card";
import { getCategoriesAdmin, getEvents, getRestaurants, todayStr } from "@/lib/db";

export const dynamic = "force-dynamic";

type PlaceInfo = {
  name: string;
  intro: string;
  query: string;
  highlights: { title: string; text: string }[];
  tips: string[];
};

const PLACES: Record<string, PlaceInfo> = {
  huesca: {
    name: "Huesca",
    intro:
      "Capital del Alto Aragón, con un casco histórico que conserva huellas romanas y medievales. Aquí reunimos información práctica, eventos y restaurantes relacionados con la ciudad para planear tu visita.",
    query: "Huesca",
    highlights: [
      { title: "Catedral de Santa María", text: "Templo gótico iniciado en el siglo XIII sobre el antiguo foro romano, con una portada monumental y un valioso retablo mayor." },
      { title: "San Pedro el Viejo", text: "Uno de los conjuntos románicos más antiguos de Aragón (s. XII), con claustro y panteón de los reyes Alfonso I y Ramiro II." },
      { title: "Museo de Huesca", text: "En el antiguo Palacio Real, reúne piezas arqueológicas y pintura, y es conocido por la Sala de la Campana y el patrimonio oscense." },
      { title: "Parque Miguel Servet", text: "El gran pulmón verde de la ciudad, con paseos arbolados, esculturas y zonas de ocio muy cerca del centro." },
      { title: "CDAN y casco histórico", text: "Arte contemporáneo en el Centro de Arte y Naturaleza y paseos por el Coso, la plaza López Allué y las Cuatro Esquinas." },
      { title: "Cerro de San Jorge", text: "Mirador y zona de muralla desde la que se obtienen buenas vistas de la ciudad y del entorno de la Hoya." },
    ],
    tips: [
      "El casco histórico se recorre bien a pie: une Catedral, San Pedro el Viejo y el Coso en un mismo paseo.",
      "Consulta la agenda para exposiciones en el CDAN, teatro y actividades familiares, que cambian cada semana.",
      "Para tapear, las zonas del Coso Bajo, Porches de Galicia y el entorno de la plaza de Navarra concentran muchos bares.",
    ],
  },
  barbastro: {
    name: "Barbastro",
    intro:
      "Capital del Somontano y puerta a la D.O. Somontano, combina patrimonio, vida cultural y enoturismo. Reunimos datos útiles, eventos y restaurantes vinculados a Barbastro.",
    query: "Barbastro",
    highlights: [
      { title: "Catedral de Santa María de la Asunción", text: "Imponente templo gótico-renacentista del siglo XVI, uno de los grandes referentes monumentales de la ciudad." },
      { title: "Centro histórico y plaza del Mercado", text: "Calles y plazas con ambiente comercial y hostelero, ideales para recorrer la ciudad y descubrir su patrimonio." },
      { title: "Enoturismo en el Somontano", text: "Barbastro es base para visitar bodegas de la D.O. Somontano, con experiencias de cata y rutas del vino." },
      { title: "Santuario de El Pueyo", text: "Mirador natural junto a la ciudad con vistas al Somontano y al paisaje de viñedos y sierras cercanas." },
      { title: "Fiestas y cultura local", text: "La ciudad mantiene una programación cultural activa y celebraciones tradicionales que animan el calendario." },
      { title: "Gastronomía del Somontano", text: "Producto local, carnes, verduras de la huerta y vinos de la denominación marcan la oferta gastronómica." },
    ],
    tips: [
      "Si te interesa el vino, combina la visita con alguna bodega de la Ruta del Vino Somontano y reserva con antelación.",
      "El entorno es buen punto de partida hacia Alquézar, la Sierra de Guara y pueblos del Somontano.",
      "Revisa la agenda para mercados, ferias y actividades ligadas al vino y la cultura local.",
    ],
  },
  jaca: {
    name: "Jaca",
    intro:
      "Ciudad histórica del Pirineo aragonés y punto clave del Camino de Santiago por la ruta aragonesa. Aquí encontrarás información, eventos y restaurantes relacionados con Jaca.",
    query: "Jaca",
    highlights: [
      { title: "Ciudadela de Jaca", text: "Fortaleza renacentista del siglo XVI con planta en estrella, uno de los conjuntos militares mejor conservados de España." },
      { title: "Catedral de San Pedro", text: "Considerada una de las catedrales románicas más antiguas de la península, referente del románico jaqués." },
      { title: "Casco histórico", text: "Calles peatonales, plazas y ambiente animado con comercios, bares y espacios culturales durante todo el año." },
      { title: "Camino de Santiago", text: "Jaca es etapa fundamental del Camino Aragonés, con servicios y patrimonio ligados a la ruta jacobea." },
      { title: "Puerta al Pirineo", text: "Excelente base para excursiones a Canfranc, valles pirenaicos y estaciones de montaña según la temporada." },
      { title: "Museos y programación", text: "Espacios como el Museo Diocesano y una agenda cultural y festiva con citas destacadas en el calendario." },
    ],
    tips: [
      "En temporada de nieve y en verano, la demanda sube: conviene consultar con tiempo la oferta cultural y de ocio.",
      "La Ciudadela y la Catedral se pueden visitar en un recorrido a pie por el centro histórico.",
      "Aprovecha la cercanía a Canfranc y al valle del Aragón para completar la escapada.",
    ],
  },
  ainsa: {
    name: "Aínsa",
    intro:
      "Villa medieval en la comarca del Sobrarbe, considerada uno de los pueblos más bonitos de España y puerta de entrada al Parque Nacional de Ordesa y Monte Perdido.",
    query: "Aínsa",
    highlights: [
      { title: "Plaza Mayor porticada", text: "Amplio espacio medieval empedrado y rodeado de soportales, corazón monumental y social de la villa." },
      { title: "Castillo y murallas", text: "Recinto fortificado con torres, muralla y espacios museísticos que recorren la historia del Sobrarbe." },
      { title: "Iglesia de Santa María", text: "Templo románico con torre que ofrece vistas sobre el casco histórico y el entorno pirenaico." },
      { title: "Casco histórico medieval", text: "Calles de piedra, casas tradicionales y miradores que conservan el trazado y el carácter de la villa antigua." },
      { title: "Puerta a Ordesa y el Sobrarbe", text: "Ubicación estratégica para rutas por Ordesa, el cañón de Añisclo, Boltaña y otros paisajes del Pirineo." },
      { title: "Naturaleza y actividades", text: "Entorno ideal para senderismo, barranquismo y turismo activo, además de una oferta cultural ligada al territorio." },
    ],
    tips: [
      "Recorre la villa a pie y reserva tiempo para subir a la torre y pasear por la muralla con calma.",
      "Es una base muy práctica para visitar Ordesa y Monte Perdido; en temporada alta planifica desplazamientos y parkings.",
      "Combina la visita cultural con rutas y actividades de naturaleza en la comarca del Sobrarbe.",
    ],
  },
  alquezar: {
    name: "Alquézar",
    intro:
      "Villa medieval del Somontano asomada al cañón del río Vero, dentro del Parque Cultural del río Vero. Un conjunto histórico de piedra famoso por sus calles, pasadizos y entorno natural.",
    query: "Alquézar",
    highlights: [
      { title: "Colegiata de Santa María la Mayor", text: "Conjunto monumental que corona la villa, con claustro y elementos históricos que reflejan su pasado defensivo y religioso." },
      { title: "Casco medieval y pasadizos", text: "Calles empedradas, arcos y callizos entre viviendas de piedra que forman uno de los conjuntos urbanos más pintorescos de Huesca." },
      { title: "Pasarelas del río Vero", text: "Ruta señalizada con pasarelas y miradores sobre el cañón, una de las excursiones más populares para disfrutar del paisaje." },
      { title: "Parque Cultural del río Vero", text: "Entorno de gran valor natural y arqueológico, con barrancos, abrigos con arte rupestre y múltiples posibilidades de senderismo." },
      { title: "Miradores al cañón", text: "Vistas espectaculares desde distintos puntos de la villa hacia las hoces y paredes del río Vero." },
      { title: "Gastronomía y enoturismo cercano", text: "Buena base para combinar la visita con la oferta del Somontano, bodegas y restaurantes de producto local." },
    ],
    tips: [
      "Lleva calzado cómodo: el casco tiene cuestas y empedrado, y las pasarelas incluyen escaleras y tramos expuestos.",
      "En fines de semana y puentes puede haber mucha afluencia; conviene llegar con tiempo para aparcar y recorrer con calma.",
      "Si haces la ruta de las pasarelas, consulta el estado del recorrido y evita las horas de más calor en verano.",
    ],
  },
  loarre: {
    name: "Loarre",
    intro:
      "Municipio de la Hoya de Huesca conocido por su impresionante castillo románico, una de las fortalezas mejor conservadas de Europa y un mirador privilegiado sobre la llanura.",
    query: "Loarre",
    highlights: [
      { title: "Castillo de Loarre", text: "Fortaleza románica del siglo XI situada en la sierra, con murallas, torres, iglesia de San Pedro y estancias visitables." },
      { title: "Vistas a la Hoya de Huesca", text: "Desde el entorno del castillo se obtienen panorámicas amplias de la Hoya y, en días claros, del Pirineo." },
      { title: "Arquitectura románica", text: "El conjunto conserva elementos militares y religiosos de gran valor, ejemplo destacado del románico aragonés." },
      { title: "Entorno de la sierra de Loarre", text: "Paisaje de roquedos y campos que invita a paseos y rutas cortas por los alrededores del conjunto monumental." },
      { title: "Pueblo de Loarre", text: "Núcleo tranquilo con servicios básicos, buena base para acercarse al castillo y explorar la comarca." },
      { title: "Escenario cultural", text: "El castillo ha sido escenario de actividades culturales y rodajes, reforzando su interés patrimonial y turístico." },
    ],
    tips: [
      "Comprueba horarios de visita del castillo y reserva si es necesario en temporada alta o festivos.",
      "El acceso al conjunto implica caminar por zonas en pendiente; lleva calzado adecuado y agua.",
      "Combina la visita con Huesca capital o con rutas por la Hoya para completar el día.",
    ],
  },
  benasque: {
    name: "Benasque",
    intro:
      "Villa pirenaica del valle de Benasque, rodeada de algunas de las cumbres más altas del Pirineo. Punto de partida para rutas de montaña, naturaleza y turismo activo.",
    query: "Benasque",
    highlights: [
      { title: "Valle de Benasque", text: "Uno de los valles más emblemáticos del Pirineo aragonés, con paisajes de alta montaña, ríos y pueblos con encanto." },
      { title: "Entorno Posets-Maladeta y Aneto", text: "Cercanía al Parque Natural Posets-Maladeta y al macizo del Aneto, referencia para senderismo y alpinismo." },
      { title: "Casco urbano de Benasque", text: "Calles con arquitectura tradicional de montaña, palacetes y ambiente animado durante todo el año." },
      { title: "Rutas y naturaleza", text: "Amplia oferta de excursiones, desde paseos familiares a rutas de alta montaña, según temporada y experiencia." },
      { title: "Cerler y actividades de temporada", text: "Proximidad a la estación de Cerler y a propuestas de invierno y verano en el valle." },
      { title: "Patrimonio y cultura local", text: "Tradiciones, gastronomía de montaña y programación cultural y festiva vinculada al valle." },
    ],
    tips: [
      "En invierno y en puentes la zona es muy demandada; planifica alojamiento y desplazamientos con antelación.",
      "Consulta el estado de rutas y la meteorología antes de salir a montaña, especialmente en alta cota.",
      "Aprovecha Benasque como base para conocer otros pueblos del valle y los accesos a espacios naturales.",
    ],
  },
  torla: {
    name: "Torla-Ordesa",
    intro:
      "Puerta de entrada al Parque Nacional de Ordesa y Monte Perdido, con un casco de piedra de gran encanto y un entorno de montaña espectacular en el valle de Ordesa.",
    query: "Torla",
    highlights: [
      { title: "Acceso a Ordesa y Monte Perdido", text: "Punto habitual para iniciar la visita al Parque Nacional, con rutas emblemáticas como la pradera de Ordesa y la cola de caballo." },
      { title: "Casco histórico de Torla", text: "Calles empedradas, casas tradicionales y la iglesia de San Salvador conforman un núcleo de montaña muy pintoresco." },
      { title: "Valle de Ordesa", text: "Paisajes de paredes calizas, bosques y cascadas que hacen del valle uno de los espacios naturales más conocidos de los Pirineos." },
      { title: "Puente de los Navarros y entorno", text: "Rincones junto al río Ara y miradores cercanos que ofrecen vistas al valle y a las montañas." },
      { title: "Rutas de senderismo", text: "Opciones para distintos niveles: paseos por el valle, recorridos a miradores y rutas de alta montaña en temporada." },
      { title: "Turismo activo y naturaleza", text: "Zona ideal para senderismo, observación de fauna y actividades al aire libre, con servicios orientados al visitante." },
    ],
    tips: [
      "En temporada alta el acceso en vehículo privado a la pradera de Ordesa puede estar regulado; infórmate de los buses lanzadera.",
      "Reserva alojamiento con antelación en puentes y verano, y consulta la previsión meteorológica antes de hacer rutas.",
      "Lleva calzado adecuado y respeta la normativa del Parque Nacional para conservar el entorno.",
    ],
  },
  anso: {
    name: "Ansó",
    intro:
      "Villa pirenaica del valle de Ansó, conocida por su arquitectura tradicional, su traje típico y un entorno natural y cultural muy bien conservado en la Jacetania.",
    query: "Ansó",
    highlights: [
      { title: "Casco histórico tradicional", text: "Calles y casas de piedra y tejados característicos que conservan la esencia de la arquitectura popular ansotana." },
      { title: "Iglesia de San Pedro", text: "Templo de referencia en la villa, vinculado a la historia y la vida cultural de la localidad." },
      { title: "Museo del Traje Ansotano", text: "Espacio dedicado al traje tradicional de Ansó, una de las indumentarias más reconocibles del Pirineo aragonés." },
      { title: "Valle de Ansó", text: "Entorno de alta montaña, selvas y pastos con rutas y paisajes que se extienden hacia los límites con Navarra y Francia." },
      { title: "Cultura y tradiciones", text: "Fiestas, folclore y oficios tradicionales que mantienen viva la identidad del valle." },
      { title: "Naturaleza y senderismo", text: "Punto de partida para excursiones por el valle, rutas de montaña y descubrimiento de espacios naturales cercanos." },
    ],
    tips: [
      "Aprovecha para pasear sin prisa por el casco y conocer el patrimonio etnográfico y cultural del valle.",
      "Si vas a hacer rutas, consulta distancias y desniveles: el entorno es montañoso y el clima puede cambiar rápido.",
      "Combina la visita con otros pueblos del Pirineo occidental como Hecho o con la zona de Jaca.",
    ],
  },
  graus: {
    name: "Graus",
    intro:
      "Villa de la Ribagorza a orillas del Ésera, conocida por su plaza porticada, su patrimonio histórico y su gastronomía, con la longaniza como producto emblemático.",
    query: "Graus",
    highlights: [
      { title: "Plaza Mayor porticada", text: "Centro neurálgico de la villa, rodeado de soportales y edificios históricos donde se concentra buena parte de la vida local." },
      { title: "Casco histórico", text: "Conjunto de calles, casas señoriales y espacios como la Casa Heredia que reflejan el pasado comercial y patrimonial de Graus." },
      { title: "Basílica de la Virgen de la Peña", text: "Santuario cercano a la villa, muy ligado a la devoción local y a las tradiciones de la Ribagorza." },
      { title: "Gastronomía ribagorzana", text: "Famosa por la longaniza de Graus y por una oferta culinaria basada en producto de la zona." },
      { title: "Puerta a la Ribagorza", text: "Buen punto de partida para explorar pueblos, valles y espacios naturales del Pirineo y prepirineo oscense." },
      { title: "Mercados y ambiente local", text: "Tradición comercial y ferias que aportan dinamismo, con especial ambiente en días de mercado y celebraciones." },
    ],
    tips: [
      "Recorre la plaza y el casco histórico a pie para descubrir sus rincones y la arquitectura tradicional.",
      "Si te interesa la gastronomía local, prueba la longaniza y productos de la Ribagorza en bares y tiendas.",
      "Graus es una base práctica para visitar Roda de Isábena, Benasque o el valle de Benasque.",
    ],
  },
  boltana: {
    name: "Boltaña",
    intro:
      "Localidad del Sobrarbe situada junto al valle del Ara, con un casco histórico de origen medieval y vistas privilegiadas hacia el Pirineo y las sierras cercanas.",
    query: "Boltaña",
    highlights: [
      { title: "Casco histórico y castillo", text: "Restos del castillo y calles del núcleo antiguo que conservan el trazado y el carácter histórico de la villa." },
      { title: "Iglesia de San Pedro", text: "Templo de referencia en Boltaña, integrado en el conjunto patrimonial del casco urbano." },
      { title: "Vistas al valle del Ara", text: "Miradores y entornos desde los que se contemplan el valle, Aínsa y el paisaje del Sobrarbe." },
      { title: "Cercanía a Aínsa y Ordesa", text: "Ubicación estratégica para combinar la visita con Aínsa, el Parque Nacional de Ordesa y Monte Perdido y rutas del Sobrarbe." },
      { title: "Entorno natural", text: "Acceso a caminos, senderos y espacios naturales de la comarca, adecuados para paseos y actividades al aire libre." },
      { title: "Cultura y servicios", text: "Oferta de servicios para visitantes y una vida cultural y festiva ligada a la tradición sobrarbense." },
    ],
    tips: [
      "Combina la visita con Aínsa, que está muy cerca, para completar una ruta por el Sobrarbe en el mismo día.",
      "Si planeas ir a Ordesa, ten en cuenta las regulaciones de acceso y la afluencia en temporada alta.",
      "Pasea por el casco alto para disfrutar de las vistas y del ambiente tranquilo del pueblo.",
    ],
  },
};

type Props = { params: Promise<{ lugar: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lugar } = await params;
  const place = PLACES[lugar];
  if (!place) return { title: "Lugar" };
  return {
    title: `Qué hacer en ${place.name}`,
    description: `Qué ver, eventos y dónde comer en ${place.name}. Información, datos y agenda actualizada en Huesca Hoy.`,
    alternates: { canonical: `/donde/${lugar}` },
  };
}

export default async function DondeLugarPage({ params }: Props) {
  const { lugar } = await params;
  const place = PLACES[lugar];
  if (!place) notFound();

  const today = todayStr();
  const [events, restaurants, categories] = await Promise.all([
    getEvents({ q: place.query, from: today, limit: 24 }),
    getRestaurants({ q: place.query, limit: 24 }),
    getCategoriesAdmin(),
  ]);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: place.name },
        ]}
      />

      <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
        <MapPin className="h-3.5 w-3.5" />
        {place.name}
      </span>
      <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-choco dark:text-ink sm:text-4xl">
        Qué hacer en {place.name}
      </h1>
      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-choco-muted">{place.intro}</p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <CalendarDays className="h-4 w-4 text-brand" /> {events.length} eventos encontrados
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <UtensilsCrossed className="h-4 w-4 text-brand" /> {restaurants.length} restaurantes encontrados
        </span>
        <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
          <Landmark className="h-4 w-4 text-brand" /> {place.highlights.length} puntos destacados
        </span>
        <Link
          href={`/buscar?q=${encodeURIComponent(place.query)}`}
          className="inline-flex items-center gap-2 rounded-full border border-sand px-3 py-1.5 font-medium text-brand-dark transition hover:border-brand/40"
        >
          Ver más resultados <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Imprescindibles y datos útiles</h2>
        <p className="mt-1 max-w-2xl text-choco-muted">
          Información destacada de {place.name} para orientarte antes de consultar la agenda y las recomendaciones.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {place.highlights.map((h) => (
            <div key={h.title} className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
              <h3 className="font-display text-lg font-bold text-choco dark:text-ink">{h.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-choco-muted">{h.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-sand bg-sand/40 p-5">
          <h3 className="font-display text-base font-bold text-choco dark:text-ink">Consejos para la visita</h3>
          <ul className="mt-3 space-y-2 text-sm text-choco-muted">
            {place.tips.map((tip) => (
              <li key={tip} className="flex gap-2"><span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden />{tip}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Eventos en {place.name}</h2>
          <Link href={`/agenda`} className="text-sm font-semibold text-brand hover:text-brand-dark">Ver agenda</Link>
        </div>
        {events.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                category={event.categoryId ? categoryMap.get(event.categoryId) ?? null : null}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-sand bg-sand/40 p-8 text-choco-muted">
            Ahora mismo no hay eventos próximos etiquetados para {place.name}. Puedes explorar la{" "}
            <Link href="/agenda" className="font-semibold text-brand hover:underline">agenda completa</Link> o buscar más en{" "}
            <Link href={`/buscar?q=${encodeURIComponent(place.query)}`} className="font-semibold text-brand hover:underline">el buscador</Link>.
          </p>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Dónde comer en {place.name}</h2>
          <Link href="/restaurantes" className="text-sm font-semibold text-brand hover:text-brand-dark">Ver restaurantes</Link>
        </div>
        {restaurants.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-sand bg-sand/40 p-8 text-choco-muted">
            No encontramos restaurantes etiquetados para {place.name} en este momento. Prueba en{" "}
            <Link href={`/buscar?q=${encodeURIComponent(place.query)}`} className="font-semibold text-brand hover:underline">el buscador</Link> o en la{" "}
            <Link href="/restaurantes" className="font-semibold text-brand hover:underline">guía de restaurantes</Link>.
          </p>
        )}
      </section>
    </div>
  );
}

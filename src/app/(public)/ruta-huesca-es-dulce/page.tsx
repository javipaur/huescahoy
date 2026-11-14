import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CakeSlice,
  CalendarDays,
  Coffee,
  ExternalLink,
  MapPin,
  Route as RouteIcon,
  Sparkles,
  Store,
} from "lucide-react";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ruta Huesca es dulce: pastelerías, reposterías y cafés en Huesca, Zaragoza y Jaca",
  description:
    "Ruta Huesca es dulce: un recorrido por las pastelerías, reposterías y cafeterías más famosas de Huesca, Zaragoza y Jaca. Inspirada en el evento Huesca es Dulce para dar a conocer el lado más dulce de Aragón.",
  alternates: { canonical: "/ruta-huesca-es-dulce" },
  keywords: [
    "Ruta Huesca es dulce",
    "Huesca es dulce ruta",
    "pastelerías Huesca",
    "pastelerías Zaragoza",
    "pastelerías Jaca",
    "cafés Huesca",
    "repostería Aragón",
    "dulces Huesca",
  ],
  openGraph: {
    type: "website",
    locale: site.locale,
    title: "Ruta Huesca es dulce | Pastelerías y cafés en Huesca, Zaragoza y Jaca",
    description:
      "Tres rutas dulces por Huesca, Zaragoza y Jaca con las pastelerías, reposterías y cafeterías más famosas. Inspirada en el evento Huesca es Dulce.",
    url: `${site.url}/ruta-huesca-es-dulce`,
    images: [{ url: "/opengraph-image" }],
  },
};

type Stop = {
  name: string;
  place: string;
  type: string;
  tip: string;
  note?: string;
  href?: string;
  external?: boolean;
};

type SweetRoute = {
  id: string;
  title: string;
  subtitle: string;
  intro: string;
  stops: Stop[];
};

const ROUTES: SweetRoute[] = [
  {
    id: "huesca",
    title: "Ruta Huesca es dulce: Huesca",
    subtitle: "La capital, origen del evento",
    intro:
      "Un paseo por el centro de Huesca para descubrir obradores y cafeterías emblemáticas donde la repostería tradicional y la creatividad conviven. Es la ruta que mejor conecta con el espíritu del evento y con los dulces más reconocidos de la ciudad.",
    stops: [
      {
        name: "Granja Anita",
        place: "Plaza Navarra, Huesca",
        type: "Cafetería",
        tip: "Ideal para empezar con un desayuno o merienda clásico en pleno centro, con ambiente de cafetería de toda la vida.",
        note: "Parada de café y dulce para comenzar el recorrido por el centro.",
        href: "https://huesca.city/negocios/granja-anita",
        external: true,
      },
      {
        name: "Pastelería Ascaso",
        place: "Coso Alto, Huesca",
        type: "Pastelería",
        tip: "Imprescindible probar su Pastel Ruso, icono de la casa y uno de los dulces más conocidos de Huesca.",
        note: "Referencia histórica de la repostería oscense, con tradición familiar y especialidades clásicas.",
        href: "https://huesca.city/negocios/ascaso",
        external: true,
      },
      {
        name: "Panadería Olbis",
        place: "C/ Fuente del Ángel, 3, Huesca",
        type: "Panadería y repostería artesanal",
        tip: "No te pierdas su empanadico de calabaza, un clásico de la repostería oscense, junto a otras piezas de horno y dulces tradicionales.",
        note: "Panadería muy conocida en Huesca por su elaboración artesanal y sus dulces de temporada (especialmente en fechas señaladas).",
        href: "https://www.facebook.com/panaderiaolbis/",
        external: true,
      },
      {
        name: "LAPACA · Raúl Bernal",
        place: "Calle Alcalde Emilio Miravé, Huesca",
        type: "Pastelería de autor",
        tip: "No te pierdas el Pan de San Lorenzo y sus creaciones de autor, una visita clave para los más golosos.",
        note: "Propuesta de alta pastelería y chocolatería con gran proyección y premios.",
        href: "https://huesca.city/negocios/lapaca",
        external: true,
      },
      {
        name: "Pastelería Tolosana",
        place: "Paseo de las Autonomías, Huesca",
        type: "Pastelería",
        tip: "Parada perfecta para llevar un detalle dulce o disfrutar de pasteles y repostería de vitrina muy popular en la ciudad.",
        note: "Uno de los nombres más reconocidos del dulce en Huesca.",
        href: "https://huesca.city/negocios/tolosana",
        external: true,
      },
      {
        name: "Elarte",
        place: "Calle Caspe, Huesca",
        type: "Heladería artesanal",
        tip: "Un alto refrescante con helado artesanal, que también forma parte de la cultura dulce local.",
        note: "Heladería conocida en Huesca, con elaboraciones artesanales.",
        href: "https://huesca.city/negocios/elarte",
        external: true,
      },
      {
        name: "Miel - El Colmenar de Ángel",
        place: "C/ Agustín Viñuales Pardo, 1, Huesca",
        type: "Tienda de miel y productos de la colmena",
        tip: "Llévate miel artesana de la Sierra de Gratal y alrededores: un detalle dulce y local perfecto para completar la ruta.",
        note: "Comercio local especializado en miel y productos de la colmena, muy bien valorado por sus clientes (5/5 en reseñas de su ficha local).",
        href: "https://huesca.city/negocios/miel-el-colmenar-de-angel",
        external: true,
      },
      {
        name: "Pastelería Loa",
        place: "Polígono Sepes, C/ Ganadería 44 (Huesca)",
        type: "Pastelería creativa",
        tip: "Descubre sus pastas de té, chocolates, tartas y creaciones de temporada: una parada ideal para llevarte un dulce diferente y muy oscense (mejor en coche).",
        note: "Obrador y pastelería de Huesca reconocida por su creatividad y su vínculo con el talento repostero local (participa en iniciativas como Huesca es Dulce).",
        href: "https://www.pastelerialoa.com/",
        external: true,
      },
      {
        name: "Panadería Ferrando",
        place: "C/ Arrabal, 20, Siétamo (a 15 km de Huesca)",
        type: "Panadería artesanal · empanadicos",
        tip: "Cierra con una excursión cercana para probar su famoso empanadico de calabaza, uno de los dulces tradicionales más típicos de la Hoya de Huesca (disponible todo el año).",
        note: "Parada muy recomendable para completar la ruta con un dulce tradicional oscense; obrador con horno de leña y larga tradición.",
        href: "https://panaderiaferrandosietamo.com/",
        external: true,
      },
    ],
  },
  {
    id: "zaragoza",
    title: "Ruta Huesca es dulce: Zaragoza",
    subtitle: "Grandes clásicos de la capital aragonesa",
    intro:
      "Zaragoza reúne algunas de las confiterías y pastelerías más célebres de Aragón. Esta ruta propone un recorrido por nombres históricos y muy reconocidos, perfecto para descubrir bombones, frutas de Aragón y dulces tradicionales.",
    stops: [
      {
        name: "Pastelería Fantoba",
        place: "Calle Don Jaime I, Zaragoza",
        type: "Pastelería histórica",
        tip: "Prueba las frutas de Aragón, los adoquines del Pilar o el guirlache: especialidades que forman parte de la memoria dulce zaragozana.",
        note: "Fundada en 1856, es una de las pastelerías más antiguas y emblemáticas de Zaragoza.",
      },
      {
        name: "Pastelería La Almolda",
        place: "Zaragoza",
        type: "Pastelería",
        tip: "Una parada clásica para hojaldres, pasteles y dulces de vitrina muy apreciados en la ciudad.",
        note: "Nombre habitual entre las pastelerías más conocidas de Zaragoza.",
      },
      {
        name: "Bombonería Oro",
        place: "Zaragoza",
        type: "Bombonería / confitería",
        tip: "Ideal para los amantes del chocolate y los bombones artesanos, un buen lugar para llevar un regalo dulce.",
        note: "Referente local en bombonería y especialidades de confitería.",
      },
      {
        name: "Pastelería Capricho",
        place: "Zaragoza",
        type: "Pastelería",
        tip: "Completa la ruta con tartas y repostería creativa, muy valorada por quienes buscan un bocado diferente.",
        note: "Parada reconocida en el circuito dulce zaragozano.",
      },
    ],
  },
  {
    id: "jaca",
    title: "Ruta Huesca es dulce: Jaca",
    subtitle: "Tradición repostera en el Pirineo",
    intro:
      "Jaca conserva una fuerte tradición confitera ligada a sus fiestas y a su historia. Esta ruta reúne paradas muy conocidas de la ciudad para saborear dulces típicos y repostería jacetana en pleno Pirineo.",
    stops: [
      {
        name: "Confitería Echeto",
        place: "Plaza de la Catedral, Jaca",
        type: "Confitería histórica",
        tip: "No te vayas sin probar las coronitas de Santa Orosia, los lazos o los míticos caramelos/besitos de la casa.",
        note: "Confitería emblemática fundada en 1890, parada obligada del dulce en Jaca.",
      },
      {
        name: "Pastelería La Suiza",
        place: "Calle Mayor, Jaca",
        type: "Pastelería",
        tip: "Una visita perfecta para tartas, pasteles y dulces de siempre en una de las direcciones clásicas de la ciudad.",
        note: "Pastelería tradicional muy conocida entre vecinos y visitantes.",
      },
      {
        name: "Vincelle Pastelería",
        place: "Jaca",
        type: "Pastelería",
        tip: "Descubre una propuesta más actual con piezas de vitrina y elaboraciones que renuevan la tradición repostera jacetana.",
        note: "Nueva generación de pastelería en Jaca con gran acogida.",
      },
      {
        name: "Pastelería La Imperial",
        place: "Calle Mayor, Jaca",
        type: "Pastelería / confitería",
        tip: "Buen cierre para tomar algo dulce y completar el recorrido por el centro histórico.",
        note: "Otra parada reconocida dentro del circuito dulce de Jaca.",
      },
    ],
  },
];

export default function RutaHuescaEsDulcePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Ruta Huesca es dulce" },
        ]}
      />

      <header className="mb-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
          <CakeSlice className="h-3.5 w-3.5" />
          Ruta gastronómica
        </span>
        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-choco dark:text-ink sm:text-4xl">
          Ruta Huesca es dulce
        </h1>
        <p className="mt-3 max-w-3xl text-lg leading-relaxed text-choco-muted">
          Tres rutas para saborear lo mejor de la pastelería, la repostería y los cafés en <strong>Huesca</strong>, <strong>Zaragoza</strong> y <strong>Jaca</strong>.
          Una propuesta de Huesca Hoy para dar a conocer el lado más dulce de Aragón a través de sus paradas más famosas y queridas.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <RouteIcon className="h-4 w-4 text-brand" /> 3 rutas por zonas
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <Store className="h-4 w-4 text-brand" /> {ROUTES.reduce((acc, r) => acc + r.stops.length, 0)} paradas recomendadas
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1.5 font-medium text-choco dark:text-ink">
            <Coffee className="h-4 w-4 text-brand" /> Pastelerías, reposterías y cafés
          </span>
        </div>
      </header>

      <section className="mb-12 rounded-3xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <div className="mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand-dark">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-choco dark:text-ink sm:text-2xl">Inspirada en el evento «Huesca es Dulce»</h2>
            <p className="mt-2 leading-relaxed text-choco-muted">
              Existe el evento/feria <strong>Huesca es Dulce</strong>, una cita que pone en valor la pastelería y la cultura dulce en la ciudad de Huesca.
              Pensando en esa celebración y en todo lo que representa, desde Huesca Hoy hemos creado esta ruta para darla a conocer y para que puedas
              disfrutar del dulce más allá del evento: descubriendo las pastelerías, reposterías y cafés más famosos de Huesca y ampliando el recorrido
              a otras paradas imprescindibles en Zaragoza y Jaca.
            </p>
            <p className="mt-3 text-sm text-choco-muted">
              Consulta información, programa y fechas actualizadas del evento en su web oficial: {" "}
              <a href="https://huescaesdulce.es/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline">
                huescaesdulce.es <ExternalLink className="h-3.5 w-3.5" />
              </a>.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-display text-2xl font-bold tracking-tight text-choco dark:text-ink">Elige tu ruta</h2>
        <p className="mt-1 text-choco-muted">Tres recorridos por zonas, con paradas seleccionadas entre las más famosas y representativas.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {ROUTES.map((r) => (
            <a key={r.id} href={`#${r.id}`} className="inline-flex items-center gap-2 rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-4 py-2 text-sm font-semibold text-choco dark:text-ink transition hover:border-brand/40 hover:bg-brand/5">
              <MapPin className="h-4 w-4 text-brand" /> {r.title.replace("Ruta Huesca es dulce: ", "")}
            </a>
          ))}
        </div>
      </section>

      <div className="space-y-12">
        {ROUTES.map((route, idx) => (
          <section key={route.id} id={route.id} className="scroll-mt-24">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-dark">Ruta {idx + 1} · {route.subtitle}</p>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-choco dark:text-ink sm:text-3xl">{route.title}</h2>
              <p className="mt-2 max-w-3xl leading-relaxed text-choco-muted">{route.intro}</p>
            </div>
            <ol className="grid gap-4 md:grid-cols-2">
              {route.stops.map((stop, i) => (
                <li key={stop.name} className="relative rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">{i + 1}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-choco dark:text-ink">{stop.name}</h3>
                        <span className="rounded-full bg-sand px-2.5 py-0.5 text-xs font-semibold text-choco-muted">{stop.type}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-choco-muted">
                        <MapPin className="h-4 w-4 text-brand" /> {stop.place}
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-choco dark:text-ink"><strong>Qué pedir:</strong> {stop.tip}</p>
                      {stop.note ? <p className="mt-2 text-sm text-choco-muted">{stop.note}</p> : null}
                      {stop.href ? (
                        <a
                          href={stop.href}
                          target={stop.external ? "_blank" : undefined}
                          rel={stop.external ? "noopener noreferrer" : undefined}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark hover:underline"
                        >
                          Ver más información <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-sand bg-sand/40 p-5">
          <h2 className="font-display text-lg font-bold text-choco dark:text-ink">Consejos para hacer la ruta</h2>
          <ul className="mt-3 space-y-2 text-sm leading-relaxed text-choco-muted">
            <li>• Comprueba horarios y días de cierre antes de ir; pueden variar por temporada o festivos.</li>
            <li>• Si viajas en fin de semana o en fechas del evento, algunas paradas pueden tener más afluencia.</li>
            <li>• Pregunta por las especialidades de la casa: muchas tienen dulces típicos o creaciones propias.</li>
            <li>• Puedes hacer la ruta a tu ritmo y combinarla con un paseo por el centro de cada ciudad.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-sand bg-sand/40 p-5">
          <h2 className="font-display text-lg font-bold text-choco dark:text-ink">Sigue descubriendo</h2>
          <p className="mt-2 text-sm leading-relaxed text-choco-muted">
            Encuentra más sitios donde comer, comercios locales y planes por la provincia en Huesca Hoy.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/restaurantes" className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline">
              Dónde comer <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/comercios" className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline">
              Comercios locales <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/agenda" className="inline-flex items-center gap-1 font-semibold text-brand-dark hover:underline">
              <CalendarDays className="h-4 w-4" /> Agenda
            </Link>
          </div>
        </div>
      </section>

      <p className="mt-10 text-xs text-choco-muted">
        Selección orientativa de pastelerías, reposterías y cafés conocidos en cada zona, elaborada con fines divulgativos para promover «Ruta Huesca es dulce».
        La oferta, disponibilidad y reconocimientos pueden cambiar; verifica la información actual de cada establecimiento.
      </p>
    </div>
  );
}

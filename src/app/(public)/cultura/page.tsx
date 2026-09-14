import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Clapperboard,
  Compass,
  Landmark,
  Music,
  Palette,
  Theater,
  Users,
} from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { getCategoriesAdmin } from "@/lib/db";
import { getIcon } from "@/lib/icons";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cultura en Huesca: guía de la agenda cultural y de ocio",
  description:
    "Guía de la cultura en Huesca: teatro, conciertos, exposiciones, festivales y patrimonio. Descubre dónde ver, escuchar y hacer algo cada día con la agenda cultural de Huesca.",
  alternates: {
    canonical: "/cultura",
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    title: "Cultura en Huesca: guía de la agenda cultural y de ocio",
    description:
      "Teatro, conciertos, exposiciones y festivales en Huesca: la guía para no perderte nada de la vida cultural de la ciudad y su provincia.",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cultura en Huesca: guía de la agenda cultural y de ocio",
    description:
      "Teatro, conciertos, exposiciones y festivales en Huesca y su provincia, cada día en la agenda.",
  },
};

const FAQ = [
  {
    question: "¿Qué hacer culturalmente en Huesca?",
    answer:
      "Huesca tiene agenda cultural todos los días: teatro en el Olimpia y el Palacio de Congresos, conciertos en directo, exposiciones en el CDAN y el Espacio 042, cine y actividades infantiles. Entra en la agenda para ver lo de hoy.",
  },
  {
    question: "¿Cuándo son las fiestas de San Lorenzo en Huesca?",
    answer:
      "Las Fiestas de San Lorenzo se celebran cada año del 9 al 15 de agosto, con conciertos, actividades infantiles, vaquillas y la cultura más callejera de la ciudad.",
  },
  {
    question: "¿Hay exposiciones de arte en Huesca?",
    answer:
      "Sí. El CDAN (Centro de Arte y Naturaleza) y el Espacio 042 programan exposiciones de arte contemporáneo, y el Museo de Huesca reúne arqueología y arte de la provincia.",
  },
  {
    question: "¿Cómo entro en la agenda cultural de Huesca?",
    answer:
      "Huesca Hoy se actualiza cada día con los eventos de la ciudad y la provincia. Filtra por categoría, fecha o zona, o busca tu plan directamente en el buscador.",
  },
];

const VENUES = [
  {
    Icon: Theater,
    title: "Artes escénicas",
    text: "El Teatro Olimpia y el Palacio de Congresos concentran la cartelera de teatro, danza, música y espectáculos familiares de Huesca. Los estrenos locales se cuelan en la programación de casi todas las temporadas.",
  },
  {
    Icon: Palette,
    title: "Arte y exposiciones",
    text: "El CDAN (Centro de Arte y Naturaleza, obra de Rafael Moneo) y el Espacio 042 son las dos referencias del arte contemporáneo de la ciudad. El Museo de Huesca completa el plan con arqueología y pintura de la provincia.",
  },
  {
    Icon: Clapperboard,
    title: "Cine y audiovisual",
    text: "Además de la cartelera de las salas, Huesca es sede del Festival Internacional de Cine, una de las citas del calendario cultural que reúne cada junio a creadores y público de medio mundo.",
  },
  {
    Icon: Landmark,
    title: "Patrimonio e historia",
    text: "La catedral gótica, el románico de San Pedro el Viejo y el casco histórico son el escenario de la Huesca de siempre: visitas guiadas, conciertos entre piedras y las fiestas de San Lorenzo en agosto.",
  },
  {
    Icon: Music,
    title: "Música en directo",
    text: "Conciertos de todos los palos: pop, rock, folk, jazz y bandas locales que tocan en salas, bares con escenario y espacios municipales durante todo el año.",
  },
  {
    Icon: Users,
    title: "Para ir en familia",
    text: "Teatro infantil, talleres, cuentacuentos y actividades para los peques. La categoría de planes en familia de la agenda reúne todo lo que se puede hacer con niños en Huesca.",
  },
];

export default async function CulturaLandingPage() {
  const categories = await getCategoriesAdmin();

  const dateModified = new Date().toISOString();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cultura",
        item: `${site.url}/cultura`,
      },
    ],
  };

  const webpageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Cultura en Huesca: guía de la agenda cultural y de ocio",
    description:
      "Guía de la cultura en Huesca: teatro, conciertos, exposiciones, festivales y patrimonio.",
    url: `${site.url}/cultura`,
    inLanguage: "es",
    dateModified,
    isPartOf: { "@id": `${site.url}` },
    breadcrumb: { "@id": `${site.url}/cultura#breadcrumb` },
    about: {
      "@type": "City",
      name: site.city,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbJsonLd} />
      <JsonLd data={webpageJsonLd} />
      <JsonLd data={faqJsonLd} />

      <nav aria-label="Migas de pan" className="mb-6 text-sm text-choco-muted">
        <Link href="/" className="transition hover:text-brand">
          Inicio
        </Link>
        <span aria-hidden className="mx-2">
          /
        </span>
        <span className="font-medium text-choco dark:text-ink">Cultura</span>
      </nav>

      <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand-dark">
        <Compass className="h-3.5 w-3.5" />
        Guía de cultura · {site.city}
      </span>

      <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-balance sm:text-4xl">
        Cultura en {site.city}: qué ver, escuchar y hacer hoy
      </h1>

      <p className="mt-4 text-lg leading-relaxed text-choco-muted">
        {site.city} no es solo una ciudad de paso: tiene calendario cultural
        propio. Teatro, conciertos, exposiciones, cine y fiestas que se
        reparten por la ciudad y los pueblos de la provincia. Esta guía te
        explica dónde ocurre la cultura y cómo seguir la{" "}
        <Link href="/agenda" className="font-semibold text-brand hover:underline">
          agenda cultural de Huesca
        </Link>{" "}
        para no perderte nada.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/agenda"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-brand px-6 font-semibold text-white shadow-sm shadow-brand/30 transition hover:bg-brand-dark"
        >
          Ver la agenda de hoy <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href="/agenda?desde=finde"
          className="inline-flex h-12 items-center gap-2 rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-6 font-semibold text-choco dark:text-ink transition hover:border-brand/40 hover:text-brand"
        >
          <CalendarDays className="h-4 w-4" />
          Este fin de semana
        </Link>
      </div>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          La cultura de {site.city}, en un solo calendario
        </h2>
        <p className="mt-3 leading-relaxed text-choco-muted">
          La agenda reúne cada día lo que pasa en la ciudad y la provincia:
          conciertos, teatro, exposiciones, cine, deporte y planes en familia.
          Todo con fecha, hora, lugar y precio, y con enlace directo para ir
          directamente al plan.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = getIcon(category.icon);
            return (
              <Link
                key={category.id}
                href={`/agenda/${category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 px-3.5 py-2 text-sm font-medium text-choco dark:text-ink transition hover:border-brand/40 hover:text-brand-dark"
              >
                {Icon && (
                  <Icon className="h-4 w-4" style={{ color: category.color }} />
                )}
                {category.name} en Huesca
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Dónde ocurre la cultura en {site.city}
        </h2>
        <p className="mt-3 leading-relaxed text-choco-muted">
          Repasamos los grandes escenarios de la vida cultural de la ciudad.
          Buenas pistas para saber qué buscar en la agenda según tu plan.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {VENUES.map((item) => {
            const Icon = item.Icon;
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-sand bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 shadow-sm"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand-dark">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-display text-lg font-bold">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-choco-muted">
                  {item.text}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Las grandes citas del año
        </h2>
        <ul className="mt-4 space-y-4">
          <li className="rounded-2xl border border-sand bg-sand/40 p-5">
            <p className="font-semibold">
              Fiestas de San Lorenzo · 9 al 15 de agosto
            </p>
            <p className="mt-1 text-sm leading-relaxed text-choco-muted">
              La semana grande de la ciudad: conciertos, vaquillas, danza,
              actividades infantiles y la plaza llena a todas horas. La cita
              cultural más multitudinaria del año.
            </p>
          </li>
          <li className="rounded-2xl border border-sand bg-sand/40 p-5">
            <p className="font-semibold">Festival Internacional de Cine · junio</p>
            <p className="mt-1 text-sm leading-relaxed text-choco-muted">
              Una de las citas de referencia del cine iberoamericano: cortos,
              documentales y sesiones especiales con invitados de todo el mundo.
            </p>
          </li>
          <li className="rounded-2xl border border-sand bg-sand/40 p-5">
            <p className="font-semibold">Periferias · otoño</p>
            <p className="mt-1 text-sm leading-relaxed text-choco-muted">
              Música y creación contemporánea que toman calles y salas de la
              ciudad con propuestas de vanguardia.
            </p>
          </li>
          <li className="rounded-2xl border border-sand bg-sand/40 p-5">
            <p className="font-semibold">Semana Santa</p>
            <p className="mt-1 text-sm leading-relaxed text-choco-muted">
              Procesiones, conciertos y tradición en el casco histórico. Uno de
              los momentos del año con más movimiento cultural en la ciudad.
            </p>
          </li>
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Cultura también en la provincia
        </h2>
        <p className="mt-3 leading-relaxed text-choco-muted">
          La agenda no se queda en la ciudad. Castillos, centros de
          interpretación, festivales rurales y fiestas mayores llenan la
          provincia todo el año: Loarre, Alquézar, Aínsa, Barbastro, el
          Somontano o el Pirineo. Usa el filtro de zona de la{" "}
          <Link
            href="/agenda?zona=provincia"
            className="font-semibold text-brand hover:underline"
          >
            agenda por provincia
          </Link>{" "}
          para ver los planes de los pueblos.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Preguntas frecuentes sobre la cultura en {site.city}
        </h2>
        <div className="mt-5 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-sand bg-cream/50 px-5 py-4 transition hover:border-brand/30"
            >
              <summary className="cursor-pointer list-none font-semibold text-choco dark:text-ink">
                {item.question}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-choco-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <aside className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark to-choco dark:to-ink p-7 text-white sm:p-10">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Un día cualquiera en {site.city}, siempre hay algo
        </h2>
        <p className="mt-3 max-w-xl leading-relaxed text-white/85">
          La agenda cultural de {site.city} se actualiza cada día, entre todos
          y sin anuncios. Busca tu plan de hoy, guarda tus favoritos y recibe
          aviso cuando se acerque.
        </p>
        <Link
          href="/agenda"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-choco dark:text-ink transition hover:bg-cream"
        >
          Abrir la agenda <ArrowRight className="h-5 w-5" />
        </Link>
      </aside>
    </article>
  );
}
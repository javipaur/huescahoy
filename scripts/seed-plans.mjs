import pg from "pg";

const { Pool } = pg;

const SITE_TIME_ZONE = "Europe/Madrid";

function todayStamp() {
  return new Date().toLocaleString("en-US", { timeZone: SITE_TIME_ZONE });
}

function slugify(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const PLANS = [
  {
    title: "Planes gratis en Huesca",
    summary:
      "Exposiciones, parques, patrimonio y paseos que no cuestan nada: un montón de planes en Huesca sin gastar un euro.",
    sort_order: 3,
    body: `Huesca se puede disfrutar con el bolsillo intacto más de lo que parece. Estas son las ideas que repetimos sin pagar entrada.

El parque Miguel Servet es el plan base: pasear, leer o simplemente sentarse en una de sus terrazas. Es el pulmón verde del centro y funciona a cualquier hora.

Las exposiciones: muchos espacios municipales y museos de la ciudad tienen entrada gratuita o precios simbólicos. Consulta la categoría de exposiciones de la agenda: suele haber montajes nuevos cada pocas semanas.

El patrimonio se visita a pie: la catedral desde la plaza, el románico de San Pedro el Viejo y el cerro de San Jorge, con sus escaleras y las vistas del casco, forman un circuito que te lleva una mañana entera.

En agosto, las Fiestas de San Lorenzo llenan calles y plazas con conciertos gratuitos y actividades para todas las edades. Y durante todo el año, ferias y mercados se acercan a la ciudad con frecuencia.

Tip: abre la agenda, filtra por la fecha que te apetezca y busca los planes que no indican precio: gratis, para empezar.`,
  },
  {
    title: "Un día por la Huesca monumental",
    summary:
      "Un recorrido a pie por las plazas, iglesias y miradores del casco histórico de Huesca.",
    sort_order: 4,
    body: `Empieza en la plaza de la Catedral: la seo gótica y su retablo mayor son la mejor carta de presentación de la ciudad. Después, sigue por la calle del Parque hasta el Museo de Huesca, en el edificio de la antigua Universidad Sertoriana; su colección arqueológica y medieval se recorre en poco más de una hora.

A continuación, cruza hacia el Coso Bajo. Es la hora de detenerse: terrazas, tapas y el bullicio del mediodía en el corazón de la ciudad.

Por la tarde, visita la iglesia de San Pedro el Viejo, uno de los conjuntos románicos más valiosos de Aragón, y su claustro. Está a un paso del centro y transporta a otra época.

Después sube al cerro de San Jorge. Las escaleras desde la catedral llevan al mirador desde el que se ve la ciudad entera, con los Pirineos en el horizonte los días despejados.

Cierra el día donde lo has empezado: la plaza de la Catedral cambia de luz al atardecer y tiene buena oferta para un café o una cena tranquila.`,
  },
  {
    title: "Escapadas de un día por la provincia de Huesca",
    summary:
      "Cerca de la ciudad tienes Loarre, Alquézar y el Pirineo: tres excursiones que se hacen en un día desde la capital.",
    sort_order: 5,
    body: `La provincia de Huesca es enorme y está llena de rincones que se pueden visitar en una jornada desde la capital.

Loarre: a poco más de media hora en coche, el castillo de Loarre es el gran románico de Aragón, asomado a la llanura. La visita merece la pena, sobre todo con la explicación guiada. Se ve desde media provincia.

Alquézar: la Colegiata, pegada al cañón del Vero, es de los pueblos con más encanto del Somontano. Pasarelas junto al río, calles empinadas y terrazas para comer con vistas. En verano madruga, porque se llena.

El Pirineo: en poco más de una hora por autovía alcanzas Jaca, Aínsa o la entrada de los grandes valles pirenaicos. Perfecto para un sábado con botas y ganas de naturaleza.

Tip: usa el filtro de provincia de la agenda para ver qué fiestas y conciertos hay en estos pueblos el mismo fin de semana que vayas.`,
  },
  {
    title: "Rutas de senderismo desde el centro de Huesca",
    summary:
      "Recorridos a pie cerca de la ciudad: el Camino de Santiago, el soto del río y los cerros, sin necesidad de coger el coche.",
    sort_order: 6,
    body: `No hace falta irse al Pirineo para caminar: desde el centro de Huesca salen rutas y paseos perfectos para una mañana.

El Camino de Santiago, en su ramal interior, cruza la ciudad y sigue hacia el este por caminos y sotos del río, con sombra y sin dificultad.

El paseo por las riberas del río conecta el centro con zonas verdes tranquilas, ideal para ir con niños o en bicicleta.

Los cerros: San Jorge, saliendo del casco, y rincones como el entorno de la ermita de San Lorenzo dan subidas suaves con recompensa de vistas.

Para algo más de recorrido, la provincia está llena de senderos señalizados: en la sección de rutas del buscador tienes cientos de propuestas con distancia, tipo y dificultad para elegir la tuya.`,
  },
  {
    title: "Un fin de semana en Huesca con niños",
    summary:
      "Museo con talleres, parques, teatro infantil y primeros paseos por la naturaleza: planes pensados para ir con los peques.",
    sort_order: 7,
    body: `El fin de semana en familia en Huesca se organiza solo con un poco de agenda.

El parque Miguel Servet es la base: amplio, arbolado y con zona de juegos. Una mañana ahí se pasa volando y hay terraza al borde del paseo.

El Museo de Huesca organiza talleres para niños algunos sábados; consulta la agenda para enterarte de las próximas fechas, porque se llenan rápido.

Las tardes: el teatro infantil y los espectáculos del Palacio de Congresos y el Teatro Olimpia suelen tener funciones pensadas para las edades más pequeñas. Mira la categoría de infantil en la agenda de HuescaHoy.

Y si el día acompaña, la provincia responde: las pasarelas del Vero en Alquézar y los paseos suaves por los sotos de la ciudad para que los peques gasten energía antes de volver a casa.`,
  },
  {
    title: "Tapas y vermú: un paseo por el Coso",
    summary:
      "La rutina de Huesca los fines de semana: vermú, tapas y terrazas alrededor del Coso Bajo.",
    sort_order: 8,
    body: `El vermú es cultura en Huesca. Se hace despacio y cerca de casa.

La zona clásica es el Coso Bajo: bares de toda la vida y terrazas que llenan las aceras los fines de semana. Aquí se pide la tapa con la bebida y se va de bar en bar, a su ritmo.

A mediodía, casi todos los bares del centro tienen menú del día a buen precio: perfecto para comer sin complicaciones después del paseo.

Después del vermú, la tarde invita a caminar: el parque Miguel Servet queda al lado, o las calles del casco histórico si quieres seguir viendo cosas.

Tip: sábados y domingos por la mañana, la zona del Coso se llena; ve pronto si quieres elegir buena terraza.`,
  },
];

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

async function run() {
  const client = await pool.connect();
  let inserted = 0;
  let skipped = 0;
  try {
    for (const plan of PLANS) {
      const slug = slugify(plan.title);
      const res = await client.query("SELECT id FROM planes WHERE slug = $1", [slug]);
      if (res.rowCount > 0) {
        skipped += 1;
        continue;
      }
      await client.query(
        `INSERT INTO planes (slug, title, summary, body, image, published, sort_order, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NULL, 1, $5, $6, $6)`,
        [slug, plan.title, plan.summary, plan.body, plan.sort_order, todayStamp()]
      );
      inserted += 1;
      console.log(`+ ${plan.title}`);
    }
    console.log(`\nGuías: ${inserted} insertadas, ${skipped} ya existían (sin tocar).`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error("Error al sembrar guías:", err.message);
  process.exit(1);
});
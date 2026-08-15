const KEYWORDS: Array<[RegExp, string]> = [
  [/concierto|conciertos|recital|banda|musica|orquesta|cantautor|gospel|jazz|flamenco|folk\b/i, "conciertos"],
  [/teatro|comedia|titeres|payas|magia|circo|musical/i, "teatro"],
  [/exposicion|exposiciones|muestra|inauguracion|pintura|fotografia|escultura|fotografica/i, "exposiciones"],
  [/carrera|trail|marcha|btt|ciclismo|ciclotur|senderismo|deporte|deportiva|triatlon|gimnasia|motos/i, "deporte"],
  [/infantil|ninos|ninas|cuentacuentos/i, "infantil"],
  [/cine|pelicula|cortometraje|documental/i, "cine"],
  [/feria|ferias|mercado|mercadillo/i, "ferias"],
  [/fiesta|fiestas|verbena|romeria|patronales|chupinazo/i, "fiestas"],
];

export function inferCategory(title: string): string | null {
  for (const [re, cat] of KEYWORDS) {
    if (re.test(title)) return cat;
  }
  return "cultura";
}

const SOURCE_LABELS: Record<string, string> = {
  fiestas: "fiestas",
  fiesta: "fiestas",
  cultura: "cultura",
  medioambiente: "cultura",
  astroturismo: "cultura",
  enoturismo: "cultura",
  naturaleza: "cultura",
  deporte: "deporte",
  deportes: "deporte",
  infantil: "infantil",
  cine: "cine",
  teatro: "teatro",
  conciertos: "conciertos",
  concierto: "conciertos",
  musica: "conciertos",
  exposiciones: "exposiciones",
  exposicion: "exposiciones",
  ferias: "ferias",
};

import { normalizeCategory } from "./util";

export function mapLabelCategory(label: string | null | undefined): string | null {
  const norm = normalizeCategory(label);
  if (!norm) return null;
  if (SOURCE_LABELS[norm]) return SOURCE_LABELS[norm];
  return null;
}

const AINSA_CATS: Record<string, string> = {
  fiestas: "fiestas",
  conciertos: "conciertos",
  cultura: "cultura",
  deportes: "deporte",
  educacion: "cultura",
  ferias: "ferias",
  exposiciones: "exposiciones",
  cine: "cine",
  teatro: "teatro",
  infantil: "infantil",
};

export function mapAinsaCategory(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return AINSA_CATS[slug] ?? null;
}

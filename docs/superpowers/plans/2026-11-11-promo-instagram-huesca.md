# Promo de Instagram para Huesca Hoy: el paquete diario

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que cada día haya un paquete listo para publicar en Instagram —las imágenes servidas por el sitio y el texto escrito— sin que el repositorio publique nada ni toque una credencial.

**Architecture:** El repositorio sirve el paquete y nunca publica; n8n publica y nunca decide. Dentro del repositorio son cinco rutas: cuatro devuelven una imagen con `ImageResponse` de `next/og` y una devuelve el JSON del paquete (URLs de las imágenes, pie de foto y enlace). Las URLs tienen que ser públicas porque la Graph API de Meta las descarga, y lo público es el sitio ya desplegado en `https://huescahoy.javierpalacio.es/`.

**Tech Stack:** Next.js 16 (App Router, Route Handlers), `next/og` (`ImageResponse`), TypeScript estricto, `sharp` (para el JPEG que exige Meta), Vitest.

**Origen del diseño:** réplica de `gasteiz-agenda` (`lib/promo.ts`, `lib/promo-marca.tsx`, `lib/promo-image.ts`, `lib/recomendados.ts` y `app/api/promo/**`). Las copias de los 12 ficheros fuente están en `C:\Users\javie\AppData\Local\Temp\opencode\promo-src\`. Cuando este plan y el fuente discrepen, manda este plan: las diferencias están en la tabla de portado.

**Las tres piezas.**

| Pieza | Qué es | Dónde vive | Estado |
|---|---|---|---|
| **A** | El paquete que sirve el repositorio (esta rama) | `huescahoy` → `feat/promo-instagram` | Se implementa aquí |
| **B** | El flujo de n8n que lee el paquete y publica | n8n del VPS del usuario | Se monta por navegador, con las credenciales del usuario |
| **C** | La app de Meta, la Página enlazada y el token | Meta for Developers | El usuario da acceso; se verifica con Graph API Explorer |

Este plan cubre la **pieza A** de principio a fin. La **B** y la **C** se describen al final (`## Pieza B` y `## Pieza C`) porque dependen de credenciales que no viven en el repositorio.

## Decisiones cerradas con el usuario

| Pregunta | Decisión |
|---|---|
| ¿Gatear `/api/promo` con un secreto? | **No.** La ruta JSON es pública. No hay `PROMO_SECRET`. |
| ¿Dónde vive el gate de «mínimo 3 planes»? | **En n8n**, en el nodo `Validar el paquete`. La API devuelve el paquete igual; el repo nunca decide publicar. |
| ¿Cómo se crea el flujo de n8n? | **Por navegador**, con el usuario y la contraseña que da el usuario. |
| Cadencia | **Réplica de gasteiz**: los 7 días publican. dom–vie, la ventana es ese día (`HOY`); sábado, sábado+domingo (`ESTE FINDE`). |
| Hora | **08:45 Europe/Madrid**, cron `45 8 * * *`. |
| Cuenta de Instagram | `@huesca.hoy` (`https://www.instagram.com/huesca.hoy/`). |
| Origen público | `https://huescahoy.javierpalacio.es`. |

## Tabla de portado (gasteiz → huescahoy)

Lo que cambia al copiar cada fichero. Lo que no está en esta tabla se copia tal cual, comentarios incluidos.

| Concepto | En gasteiz | En huescahoy |
|---|---|---|
| Lista de eventos | `getAgendaEventos()` | `getEvents({ from, to, limit })` |
| Un evento por slug | `getEventoBySlug(slug)` → `{ evento, related } \| null` | `getEventBySlug(slug)` → `EventItem \| null` |
| Fecha del evento | `evento.date` (instante ISO) | `evento.startDate` (`YYYY-MM-DD`) |
| Hora del evento | `evento.time` | `evento.startTime` |
| Categoría | `evento.category` (string) | `evento.categoryId` (number) → nombre con `getCategoriesAdmin()` |
| Día de hoy | `localDateStr(new Date())` | `todayStr()` (ya usa `Europe/Madrid`) |
| Selección | `recomendados(...)` (puntuada) | `seleccionarParaPromo(...)` (determinista, nueva) |
| Hora corta | `shortTime` de `lib/utils` | `shortTimePromo` nueva en `lib/promo.ts` |
| Filtro de hosts | `radioImagenPromo` + `IMAGE_HOSTS` | `urlImagenPromo` sin lista blanca (no hay `image-hosts`) |
| Proxy de imagen | `debeUsarProxy` + `/api/img` | No existe: se quita el proxy |
| Enlace del pie | `/hoy?desde=&hasta=` | `/agenda?desde=hoy` o `/agenda?desde=finde` |
| Marca | SVG en línea (`MarcaPromo`) | `public/logo.png` inlineado como data-URI |
| Logotipo | `Gasteiz` + `Click` | `Huesca` + `Hoy` |
| Paleta | crema / rojo / mostaza | blanco / verde `#128341` / verde apagado `#5d7266` |
| Hashtags | `#VitoriaGasteiz` … | `#Huesca` … |
| Presentación | «TODO VITORIA-GASTEIZ…» | «TODO HUESCA…» |
| `MAX_DIAPOSITIVAS` | 10 | 10 |

## Restricciones globales

- **La frontera no se toca.** En ningún fichero de esta pieza hay una llamada a `graph.facebook.com` ni un token. Publicar es de n8n.
- **Satori no descarga ficheros externos y no acepta un `<div>` con más de un hijo sin `display`.** Todo lo que se interpola se calcula **fuera** del JSX y se pinta como una sola cadena. Un ternario que pueda devolver `number | string` rompe la imagen con un 502 sin cuerpo.
- **Nada se importa desde `@/lib/db` en un componente de cliente.** `promo-marca.tsx` no importa `db`.
- **El formato de las imágenes es PNG por defecto y JPEG solo con `?format=jpeg`.** Meta exige JPEG; la web y el correo siguen con PNG.
- **`MAX_DIAPOSITIVAS` aparece en tres sitios y tiene que ser el mismo:** el pie de foto, el carrusel (lo lee n8n) y la lista que se sirve.
- **La paleta sale de `src/app/globals.css`.** Si allí cambia un color, cambia en `PALETA_PROMO`.
- **Rama de trabajo:** `feat/promo-instagram`. El WIP del usuario en `main` (15 modificados + 3 sin seguimiento) **no se toca** y no se commitea.

## Review Focus (para la revisión final de la rama)

- ¿Alguna ruta interpola dentro del JSX algo que pueda ser `number | string`?
- ¿Algún `<div>` de `ImageResponse` con más de un hijo sin `display: flex`?
- ¿`MAX_DIAPOSITIVAS` coincide en `lib/promo.ts`, el pie y lo que se sirve?
- ¿La selección es determinista (mismo día → mismo paquete) y respeta la ventana inclusive?
- ¿`/api/promo` no filtra ni decide publicar (solo sirve)?
- ¿Ningún fichero nuevo importa una credencial de Meta?
- ¿Los tests cubren: ventana por día de la semana, colapso de días, tope, forma del paquete?

## Tareas

- [ ] **Task 1** — `src/lib/promo.ts`: paleta, tamaños, ventanas, fechas y textos.
- [ ] **Task 2** — `src/lib/promo-seleccion.ts`: selección determinista.
- [ ] **Task 3** — `src/lib/promo-marca.tsx` y `src/lib/promo-image.ts`: marca y JPEG.
- [ ] **Task 4** — `src/app/api/promo/route.ts`: el JSON del paquete.
- [ ] **Task 5** — `src/app/api/promo/[fecha]/portada/route.tsx`: la portada del carrusel.
- [ ] **Task 6** — `src/app/api/promo/[fecha]/evento/[slug]/route.tsx`: las diapositivas.
- [ ] **Task 7** — `src/app/api/promo/[fecha]/historia/route.tsx`: la historia.
- [ ] **Task 8** — `src/app/api/promo/presentacion/route.tsx`: el post de presentación.
- [ ] **Task 9** — `npm test`, `npm run lint`, `npm run build` en verde y revisión de rama.

---

## Task 1 — `src/lib/promo.ts`: paleta, tamaños, ventanas, fechas y textos

**Files:**
- Create: `src/lib/promo.ts`
- Test: `tests/promo.test.ts`

**Interfaces (lo que exporta y consume el resto de la pieza):**

```ts
export const TAMANO_PROMO = { width: 1080, height: 1350 } as const;
export const TAMANO_HISTORIA = { width: 1080, height: 1920 } as const;
export const MAX_DIAPOSITIVAS = 10;
export const PALETA_PROMO: { papel: string; marco: string; tinta: string;
  tintaSuave: string; tintaTenue: string; acento: string; acentoSuave: string; filete: string };
export const HASHTAGS_PROMO: string;
export const ORIGEN_PROMO: string;                       // site.url
export const URL_PRESENTACION: string;
export const TEXTO_PRESENTACION: string;
export const ENLACE_PRESENTACION: string;

export type VentanaPromo = { desde: string; hasta: string; etiqueta: "HOY" | "ESTE FINDE" };
export function ventanaDelDia(hoy: string): VentanaPromo | null;   // lanza si `hoy` no es fecha
export function urlDePromo(fecha: string, slug?: string): string;
export function urlHistoria(fecha: string): string;
export function urlImagenPromo(url: string | null | undefined): string | null;
export function enlaceDeVentana(desde: string, hasta: string): string; // /agenda?desde=…
export function diaCivil(iso: string): Date | null;
export function fechaCortaPromo(fecha: string): string;            // "VIE 23 OCT"
export function ventanaCortaPromo(desde: string, hasta: string): string; // "23 — 25 OCT"
export function normalizarTituloPromo(titulo: string): string;
export function shortTimePromo(hora: string | null | undefined): string | null;

export type PaquetePromo = {
  portada: string; imagenes: string[]; titulos: string[]; pie: string; texto: string; enlace: string;
};
export function paqueteDePromo(
  lista: Array<{ slug: string; title: string; location: string | null; category?: string | null }>,
  { desde, hasta }: { desde: string; hasta: string }
): PaquetePromo;
```

**Decisiones concretas de este fichero:**

- **`ORIGEN_PROMO = site.url`** (import de `@/lib/site`), no una constante literal. Así el paquete apunta siempre al dominio real, también en local si `NEXT_PUBLIC_SITE_URL` está puesta.
- **`PALETA_PROMO`** = los colores de `globals.css`: `papel #ffffff`, `marco #ecf3ef`, `tinta #12281b`, `tintaSuave #5d7266`, `tintaTenue #8aa196`, `acento #128341` (verde de marca, el rol del `rojo` de gasteiz), `acentoSuave #5d7266` (el rol del `mostaza`), `filete #dbe6df`.
- **`HASHTAGS_PROMO`** = `"#Huesca #HuescaHoy #PlanesHuesca #AgendaHuesca #OcioHuesca"`.
- **`VENTANAS_POR_DIA`** = el mismo `Record<number, …>` que gasteiz: `0..5` → `{ desde: hoy, hasta: hoy, etiqueta: "HOY" }`; `6` → `{ desde: hoy, hasta: sumarDias(hoy,1), etiqueta: "ESTE FINDE" }`.
- **`ventanaDelDia`** lanza con una fecha mal formada (un `null` silencioso haría que el cron saliera con 0 siete días seguidos sin avisar).
- **`urlImagenPromo`** simplificada, sin lista blanca ni proxy: vacío → `null`; empieza por `/` → `ORIGEN_PROMO + url`; `http(s)://` → tal cual; cualquier otra cosa → `null`.
- **`enlaceDeVentana`** devuelve `${ORIGEN_PROMO}/agenda?desde=hoy` cuando `desde === hasta` y `${ORIGEN_PROMO}/agenda?desde=finde` cuando no. Son los dos enlaces que ya usa la home (`QuickGlanceCard`), y ambos pintan la ventana correcta porque el flujo corre el mismo día.
- **`paqueteDePromo`** = la `ventana` es `enlaceDeVentana(desde, hasta)`; `pie: ventana`; `texto: textoDelPie(...)`; `enlace: ventana + &utm_source=ig&utm_medium=social&utm_content=huescahoy-${desde}`. **Sin campo `casting`** (no hay LLM en esta réplica).
- **`textoDelPie`** = la misma forma de cinco bloques que gasteiz, con «en Huesca» y el abanico de categorías desde los datos. La lista que recibe lleva `category` (nombre) opcional; el abanico devuelve `null` si no hay ninguna.

**Steps:**

- [ ] **1.1 RED** — Escribir `tests/promo.test.ts` con estos casos:
  - `ventanaDelDia("2026-11-11")` (miércoles) → `{ desde: "2026-11-11", hasta: "2026-11-11", etiqueta: "HOY" }`.
  - `ventanaDelDia("2026-11-14")` (sábado) → `{ desde: "2026-11-14", hasta: "2026-11-15", etiqueta: "ESTE FINDE" }`.
  - `ventanaDelDia("no-es-fecha")` lanza.
  - `fechaCortaPromo("2026-11-11")` === `"MIÉ 11 NOV"`; `ventanaCortaPromo("2026-11-14","2026-11-15")` === `"14 — 15 NOV"`; `ventanaCortaPromo("2026-11-11","2026-11-11")` === `"MIÉ 11 NOV"`.
  - `normalizarTituloPromo("PAULA MATTHEUS (23 de octubre, Huesca)")` === `"PAULA MATTHEUS"`.
  - `urlImagenPromo(null)` === `null`; `urlImagenPromo("/foto.jpg")` === `${ORIGEN_PROMO}/foto.jpg`; `urlImagenPromo("https://x.es/a.jpg")` === tal cual; `urlImagenPromo("javascript:alert(1)")` === `null`.
  - `shortTimePromo("20:30")` === `"20:30"`; `shortTimePromo("20")` === `"20:00"`; `shortTimePromo(null)` === `null`.
  - `paqueteDePromo([...])`: `imagenes.length === titulos.length`; `portada` acaba en `/portada`; `enlace` contiene `utm_content=huescahoy-2026-11-11`; el `texto` contiene «hay 2 planes» y «en Huesca».
- [ ] **1.2** — Ejecutar `npx vitest run tests/promo.test.ts` y ver el rojo.
- [ ] **1.3 GREEN** — Escribir `src/lib/promo.ts` con las firmas y decisiones de arriba, copiando los comentarios de gasteiz que sigan siendo verdad y ajustando los que cambian (nombres de campo, ciudad, enlace).
- [ ] **1.4** — `npx vitest run tests/promo.test.ts` en verde.

---

## Task 2 — `src/lib/promo-seleccion.ts`: selección determinista

**Files:**
- Create: `src/lib/promo-seleccion.ts`
- Test: `tests/promo-seleccion.test.ts`

**Interfaces:**

```ts
export function seleccionarParaPromo(
  eventos: EventItem[],
  { desde, hasta, limite }: { desde: string; hasta: string; limite: number }
): EventItem[];
export function colapsarDiasConsecutivos(eventos: EventItem[]): EventItem[];
```

**Regla (determinista, sin puntuación ni LLM):**

1. **Ventana, inclusive:** se queda con los eventos cuyo `startDate` está entre `desde` y `hasta` (`desde <= startDate <= hasta`, comparación de cadenas `YYYY-MM-DD`). Una fecha rota en `desde`/`hasta` devuelve `[]`.
2. **Con imagen:** sin `image` no hay diapositiva que mirar. Mismo filtro que gasteiz.
3. **Orden:** `startDate` asc, luego `startTime` asc (los `null` al final, como `"99:99"`), luego `title` con `localeCompare(..., "es")`.
4. **Colapsa días consecutivos por título normalizado.** Clave: el título en minúsculas, sin tildes, sin puntuación, espacios colapsados; **solo si tiene ≥ 20 caracteres** (un título corto no identifica un evento y fundir dos «Cine» sería un dato falso). Al fundir se conserva el de **fecha más temprana** (se compara `startDate`, no la posición), y el resto desaparece.
5. **Tope al final:** `slice(0, limite)` sobre la lista ya colapsada.

**Steps:**

- [ ] **2.1 RED** — `tests/promo-seleccion.test.ts`:
  - Fuera de ventana: un evento con `startDate` anterior a `desde` y otro posterior a `hasta` no salen.
  - Sin imagen: un evento con `image: null` no sale.
  - Orden: dos eventos del mismo día salen por hora; uno sin hora va al final.
  - Colapso: el mismo título normalizado el sábado y el domingo sale **una vez**, con el `startDate` del sábado.
  - No colapsa títulos cortos: dos eventos titulados `"Cine"` en dos días salen los dos.
  - Tope: 12 eventos en ventana con `limite: 10` devuelven 10.
  - Determinismo: dos llamadas con la misma entrada devuelven el mismo orden.
  - Fecha rota (`desde: "x"`) → `[]`.
- [ ] **2.2** — Rojo con `npx vitest run tests/promo-seleccion.test.ts`.
- [ ] **2.3 GREEN** — Escribir `src/lib/promo-seleccion.ts` (con el helper `claveDeTitulo` privado).
- [ ] **2.4** — Verde.

---

## Task 3 — `src/lib/promo-marca.tsx` y `src/lib/promo-image.ts`

**Files:**
- Create: `src/lib/promo-marca.tsx`
- Create: `src/lib/promo-image.ts`
- Test: `tests/promo-marca.test.tsx`

**Interfaces:**

```tsx
// promo-marca.tsx
export function MarcaPromo({ tamano }: { tamano?: number }): ReactElement;
export function WordmarkPromo({ tamano, color }: { tamano?: number; color?: string }): ReactElement;
export function CabeceraPromo({ tamanoMarca, tamanoTexto, extra }:
  { tamanoMarca?: number; tamanoTexto?: number; extra?: ReactElement | null }): ReactElement;

// promo-image.ts
export async function paraInstagramJpeg(request: Request, image: Response): Promise<Response>;
```

**Decisiones:**

- **La marca es `public/logo.png` inlineada como data-URI.** Satori no descarga ficheros externos, y no hay versión SVG de la marca en `public/`. Se lee **una vez** y se cachea en el módulo:
  ```ts
  import { readFileSync } from "node:fs";
  import { join } from "node:path";
  let cache: string | null = null;
  function marcaDataUri(): string {
    if (!cache) {
      const png = readFileSync(join(process.cwd(), "public", "logo.png"));
      cache = `data:image/png;base64,${png.toString("base64")}`;
    }
    return cache;
  }
  ```
  `MarcaPromo` pinta `<img src={marcaDataUri()} width={tamano} height={tamano} style={{ borderRadius: Math.round(tamano * 0.22) }} alt="" />`. El `borderRadius` imita el `rounded-xl` del `Logo` de la web.
- **`WordmarkPromo`** = `<div style={{ display: "flex", … }}><span>Huesca</span><span style={{ color: PALETA_PROMO.acento }}>Hoy</span></div>`. Dos hijos y `display: flex` **no es opcional** en Satori.
- **`CabeceraPromo`** = marca + logotipo a la izquierda, `extra` a la derecha con `marginLeft: "auto"`. Igual que gasteiz.
- **`paraInstagramJpeg`** = copia literal de gasteiz (JPEG con `?format=jpeg`, calidad 90, borra `Content-Length`).

**Steps:**

- [ ] **3.1 RED** — `tests/promo-marca.test.tsx`: `MarcaPromo()` renderiza un `<img>` cuyo `src` empieza por `data:image/png;base64,` y sin `display` problemático; `WordmarkPromo()` renderiza un `<div>` con dos hijos. (Con `react-dom/server` y `renderToStaticMarkup`.)
- [ ] **3.2** — Rojo.
- [ ] **3.3 GREEN** — Escribir los dos ficheros.
- [ ] **3.4** — Verde.

---

## Task 4 — `src/app/api/promo/route.ts`: el JSON del paquete

**Files:**
- Create: `src/app/api/promo/route.ts`
- Test: `tests/promo-api.test.ts`

**Interfaces:**

```ts
export const runtime = "nodejs";
export const revalidate = 1800;
export async function GET(request: Request): Promise<Response>;
```

**Decisiones:**

- **La ruta no construye el paquete: lo llama.** `paqueteDePromo(lista, { desde, hasta })`, con `lista` ya seleccionada por `seleccionarParaPromo`.
- **La fecha sale de `?fecha=` y, si falta, de `todayStr()`.** Con `?fecha=YYYY-MM-DD` se resuelve la ventana con `ventanaDelDia(fecha)` (sábado → finde). Una `fecha` mal formada cae a `todayStr()`.
- **Los datos:** `getEvents({ from: desde, to: hasta, limit: 200 })` y `getCategoriesAdmin()` para mapear `categoryId → name`. La lista que entra en `paqueteDePromo` lleva `category` = nombre de la categoría (o `null`).
- **No filtra por mínimo de planes.** Devuelve el paquete siempre; el gate de 3 vive en n8n. Sin secreto.
- **El cuerpo es exactamente `PaquetePromo`** (forma cerrada). Nada de campos extra.

**Steps:**

- [ ] **4.1 RED** — `tests/promo-api.test.ts` con `getEvents`/`getCategoriesAdmin` mockeados (`vi.mock("@/lib/db")`): la respuesta tiene las claves `portada, imagenes, titulos, pie, texto, enlace`; `imagenes.length === titulos.length`; con 4 eventos en ventana devuelve 4; el `enlace` lleva `utm_content=huescahoy-<desde>`.
- [ ] **4.2** — Rojo.
- [ ] **4.3 GREEN** — Escribir la ruta.
- [ ] **4.4** — Verde.

---

## Task 5 — `src/app/api/promo/[fecha]/portada/route.tsx`: la portada del carrusel

**Files:**
- Create: `src/app/api/promo/[fecha]/portada/route.tsx`

**Interfaces:**

```tsx
export const runtime = "nodejs";
export const revalidate = 1800;
type Ctx = { params: Promise<{ fecha: string }> };
export async function GET(request: Request, { params }: Ctx): Promise<Response>;
```

**Decisiones (copia de gasteiz adaptada):**

- Resuelve la ventana con `ventanaDelDia(fecha)` dentro de un `try`; si la fecha es mala, pinta ese mismo día (una URL vieja no puede tumbar la imagen).
- `getEvents({ from: desde, to: hasta, limit: 200 })` → `seleccionarParaPromo(eventos, { desde, hasta, limite: MAX_DIAPOSITIVAS })`.
- La foto principal va con `objectFit: "cover"` (en la portada el título se reescribe debajo).
- El número va arriba a la derecha como promesa (`"N PLANES"` o `"LA AGENDA"`); el título del primer plan, grande; sitio debajo.
- El badge rojo «EL MÁS RECOMENDADO» de gasteiz **pasa a `"DESTACADO"`**, porque aquí el orden es cronológico y no hay puntuación que justifique «el más recomendado».
- El pie de la tarjeta dice `Huesca` y `huescahoy.javierpalacio.es`.
- `recortar()` se copia literal (corta por el último espacio antes del límite).
- Todo lo interpolado se calcula fuera del JSX (`cuenta`, `promesa`, `cuando`, `titulo`, `sitio`) y se pinta como cadena.

**Steps:**

- [ ] **5.1** — Escribir la ruta.
- [ ] **5.2** — Comprobar en `npm run build` que compila sin el error de Satori (un `<div>` con varios hijos sin `display` falla en build/ejecución).
- [ ] **5.3** — Prueba manual con el servidor en marcha: `GET /api/promo/2026-11-14/portada` devuelve `image/png` y abre; `?format=jpeg` devuelve `image/jpeg`.

---

## Task 6 — `src/app/api/promo/[fecha]/evento/[slug]/route.tsx`: las diapositivas

**Files:**
- Create: `src/app/api/promo/[fecha]/evento/[slug]/route.tsx`

**Interfaces:**

```tsx
type Ctx = { params: Promise<{ fecha: string; slug: string }> };
export async function GET(request: Request, { params }: Ctx): Promise<Response>;
```

**Decisiones:**

- `getEventBySlug(slug)` → `EventItem | null`. Si no existe, **404** (no una tarjeta vacía: un enlace ya publicado tiene que romperse de forma visible).
- Foto con `objectFit: "contain"` (en una diapositiva el cartel **es** el contenido; recortarlo corta el nombre del grupo).
- `cuando` = `fechaCortaPromo(evento.startDate)` + ` · ` + `shortTimePromo(evento.startTime)` si hay hora.
- El puesto (`"Nº 3"`) se **recalcula** con `seleccionarParaPromo` sobre la misma ventana; si el evento ya no está, no se pinta número.
- La categoría del pie sale del nombre: se resuelve `categoryId` con `getCategoriesAdmin()`; si no hay, cadena vacía.
- El pie dice `Huesca` y `huescahoy.javierpalacio.es`.

**Steps:**

- [ ] **6.1** — Escribir la ruta.
- [ ] **6.2** — Prueba manual: `GET /api/promo/2026-11-14/evento/<slug-real>` devuelve PNG; un slug inventado devuelve 404.

---

## Task 7 — `src/app/api/promo/[fecha]/historia/route.tsx`: la historia

**Files:**
- Create: `src/app/api/promo/[fecha]/historia/route.tsx`

**Decisiones:**

- Tamaño `TAMANO_HISTORIA` (1080×1920).
- Un solo plan: el primero de `seleccionarParaPromo(eventos, { desde: fecha, hasta: fecha, limite: MAX_DIAPOSITIVAS })`.
- Fondo `PALETA_PROMO.tinta` (choco) y acentos en `PALETA_PROMO.acento`/`acentoSuave` (los roles de `#141210` y `#E0A34E` de gasteiz).
- La marca (`MarcaPromo`) va **inline**, no dibujada: mismo criterio que el resto.
- `numero` y `pie` se calculan fuera del JSX. El lugar va en su propio `<div>` (no pegado al título con un espacio, que daría tres hijos y tumbaría Satori).
- El pie de la historia dice `huescahoy.javierpalacio.es/agenda`.

**Steps:**

- [ ] **7.1** — Escribir la ruta.
- [ ] **7.2** — Prueba manual: `GET /api/promo/2026-11-14/historia` devuelve un PNG vertical.

---

## Task 8 — `src/app/api/promo/presentacion/route.tsx`: el post de presentación

**Files:**
- Create: `src/app/api/promo/presentacion/route.tsx`

**Decisiones:**

- Tamaño `TAMANO_PROMO`, `revalidate = 86400` (no cambia de un día a otro).
- Marca `MarcaPromo` (logo PNG) + wordmark `HUESCA` + `HOY` en `acento`.
- Titular en dos líneas hechas a mano (dos `<span>` en un `flex column`), no un salto automático: «TODO HUESCA, / EN UN SOLO SITIO».
- Cuatro renglones: `Qué hay`, `Sin buscar`, `Cada día`, `Gratis` (adaptando el detalle a Huesca).
- El pie usa `ORIGEN_PROMO.replace("https://", "")`.
- El texto y el enlace de este post viven en `lib/promo.ts` (`TEXTO_PRESENTACION`, `ENLACE_PRESENTACION`, `URL_PRESENTACION`); n8n los lee del paquete de presentación si se decide publicarlo. **En esta réplica el carrusel diario no incluye la presentación** (n8n no la publica); la ruta se sirve igual para tenerla lista.

**Steps:**

- [ ] **8.1** — Escribir la ruta.
- [ ] **8.2** — Prueba manual: `GET /api/promo/presentacion` devuelve PNG.

---

## Task 9 — Verde, lint, build y revisión de rama

- [ ] **9.1** — `npm test` en verde.
- [ ] **9.2** — `npm run lint` sin errores nuevos.
- [ ] **9.3** — `npm run build` en verde.
- [ ] **9.4** — Revisión de la rama contra el **Review Focus** de arriba, en un subagente, con el diff completo.
- [ ] **9.5** — Commit en `feat/promo-instagram` **solo** de los ficheros nuevos (`src/lib/promo*`, `src/app/api/promo/**`, `tests/promo*`). El WIP del usuario se queda sin commitear.

---

## Pieza B — el flujo de n8n (se ejecuta aparte, por navegador)

**Réplica del flujo `Promo diaria · publicar carrusel (v2)`** (`C:\Users\javie\Downloads\Promo diaria · publicar carrusel (v2).json`), apuntando a Huesca Hoy. Nodos, en orden:

1. `Cron 08:45 Madrid` (cron `45 8 * * *`, timezone `Europe/Madrid`) / `Ejecutar a mano`.
2. `Modo: simulacro` (rama manual = simulacro).
3. `Leer el cupo` — GET `https://graph.facebook.com/v23.0/<IG_USER_ID>/content_publishing_limit?fields=quota_usage,config`, `onError: continueRegularOutput`.
4. `Paquete de promo` — GET `https://huescahoy.javierpalacio.es/api/promo`.
5. `Validar el paquete` — **aquí vive el gate**: exige `portada, imagenes, titulos, texto, enlace`; `titulos.length === imagenes.length`; **`imagenes.length >= 3`**; topes Meta (20 hijos, 2200 caracteres de pie, 30 `#`, 20 `@`); el pie que promete «N planes» cuadra con `imagenes.length`; `urls = [portada, ...imagenes].slice(0,20)` https y únicas. Si no pasa, **detiene la publicación**.
6. `Medios recientes` — GET `.../<IG_USER_ID>/media?fields=id,caption,timestamp,permalink&limit=25`.
7. `¿Ya publicado?` — clave = **el día del pie** (normaliza `\b\d+\s+planes?\b` → `N planes`); un item por imagen.
8. `IF ¿Publicado?` → `Fin · ya estaba` / `IF ¿Simulación?` → `Fin · simulacro` / `Crear hijos`.
9. `Crear hijos` — POST `.../<IG_USER_ID>/media` con `image_url` + `is_carousel_item=true`, en lotes de 2 con 1500 ms.
10. `Repartir hijos` → `Esperar hijos` (60 s) → `Estado hijos` → `¿Listos?` → `IF todos listos` → `Crear carrusel` (POST `.../media`, `media_type=CAROUSEL`, `children`, `caption`) / loop.
11. `Esperar carrusel` (60 s) → `Estado carrusel` → `¿Carrusel listo?` → `IF carrusel listo` → `Publicar` (POST `.../media_publish`, `creation_id`; sin reintento) → `Enlace del post` → `Resumen`.

**Diferencias con gasteiz:** el `IG_USER_ID` es el de `@huesca.hoy`; la URL del paquete es `https://huescahoy.javierpalacio.es/api/promo` (sin secreto); la credencial `httpHeaderAuth` es propia de Huesca Hoy (token distinto, mismo tipo Bearer). Todo lo demás (Graph API v23.0, batching, esperas, idempotencia por día) es igual.

**Bloqueante:** hace falta el **login de n8n** (usuario y contraseña) y el **IG user id** de `@huesca.hoy`.

---

## Pieza C — Meta: app, Página enlazada y token (se ejecuta aparte)

1. Confirmar que `@huesca.hoy` es cuenta **Business o Creator** y está **enlazada a una Página de Facebook**.
2. Con Graph API Explorer: `me/accounts?fields=name,id,instagram_business_account` → sacar el **IG user id**.
3. Token de larga duración (System User token recomendado) con permisos `instagram_content_publish`, `instagram_basic`, `pages_show_list`, `pages_read_engagement`, `business_management`.
4. Probar el cupo: `GET .../<IG_USER_ID>/content_publishing_limit`.

**Bloqueante:** el usuario dijo «compruébalo tú», así que esto se verifica en cuanto dé acceso a la app/Página.

---

## Ledger

El progreso se lleva en `.superpowers/sdd/2026-11-11-promo-instagram-huesca/progress.md`.



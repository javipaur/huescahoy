# Ledger — Promo de Instagram para Huesca Hoy (pieza A)

Plan: `docs/superpowers/plans/2026-11-11-promo-instagram-huesca.md`
Rama: `feat/promo-instagram`

| Tarea | Estado | Notas |
|---|---|---|
| Task 1 — `src/lib/promo.ts` | hecho | 21/21 verde |
| Task 2 — `src/lib/promo-seleccion.ts` | hecho | 10/10 verde |
| Task 3 — `src/lib/promo-marca.tsx` + `src/lib/promo-image.ts` | hecho | 5/5 verde |
| Task 4 — `api/promo/route.ts` (JSON) | hecho | 6/6 verde |
| Task 5 — portada | hecho | `api/promo/[fecha]/portada/route.tsx` |
| Task 6 — evento | hecho | `api/promo/[fecha]/evento/[slug]/route.tsx` |
| Task 7 — historia | hecho | `api/promo/[fecha]/historia/route.tsx` |
| Task 8 — presentación | hecho | `api/promo/presentacion/route.tsx` |
| Task 9 — test/lint/build + revisión | hecho | 215/215 verde; lint 0 errores; build OK con las 5 rutas; revisión de rama hecha (4 menores corregidos: jpeg en historia/presentación, ventana del finde en la historia, protocol-relative en `urlImagenPromo`, comentario de paleta) |

## Pieza B — el flujo de n8n

| Paso | Estado | Notas |
|---|---|---|
| B.1 — JSON importable de Huesca | hecho | `docs/n8n/promo-instagram-huesca.json` (commit `ae9745e`); copia en `Descargas` para importar |
| B.2 — Importar en n8n | pendiente | bloqueado por login |
| B.3 — Simulacro con la rama manual | pendiente | |
| B.4 — Activarlo | pendiente | |

Qué se sustituyó en el JSON de referencia:

- IG user id: el de referencia (`17841425701858278`) se sustituyó por el marcador `__IG_USER_ID_HUESCA_HOY__` y, una vez enlazada la cuenta a la Página, por el id real **`17841435800805548`** (5 nodos: `Leer el cupo`, `Medios recientes`, `Crear hijos`, `Crear carrusel`, `Publicar`). Ya no queda ningún marcador en el JSON.
- Credencial: id `ZgkkVSwAqZxK9KuO` → `HUESCA_HOY_BEARER`; nombre → `Instagram · Huesca Hoy (Bearer)`. **El id se cambia a propósito**: si se dejara el de Gasteiz, el flujo importado publicaría en `@gasteizclick` sin avisar.
- Origen: `https://gasteizclick.javierpalacio.es/api/promo` → `https://huescahoy.javierpalacio.es/api/promo`.
- Textos `gasteiz`/`Gasteiz`/`Vitoria-Gasteiz` → `huesca`/`Huesca`.
- Añadido el **gate de mínimo 3 planes** en `Validar el paquete` (`p.imagenes.length < 3` → para el flujo).
- Fuera `id`, `versionId`, `meta`, `pinData`, `nodeGroups` y `tags` de la instancia de origen; `active: false`.
- Sin cambios: cron `45 8 * * *`, `timezone: Europe/Madrid`, Graph API v23.0, batching 2/1500 ms, esperas de 60 s, idempotencia por día, `executionOrder: v1`.

## Hallazgos al verificar contra producción (12 nov 2026)

- **El despliegue ya está hecho**: `/api/promo` pasó de 404 a 200 tras el push a `main` (`bbed07f`).
- **El gate de 3 planes bloquea el 100 % de los días.** Medidos 12 días seguidos con la API real: 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0 planes. Ninguno llega a 3. El flujo tal cual está **no publicaría nunca**.
- **Gasteiz, en cambio, trae 10 planes hoy** (tope de `MAX_DIAPOSITIVAS`). De ahí que su gate (`urls.length >= 2`, o sea ≥1 evento) nunca se note.
- **Por qué la agenda de Huesca sale vacía**: las exposiciones de larga duración (`Exposición Goya…`, `Rutas Territorio Mudéjar`, `Bus del Vino…`) **sí tienen imagen** —aparecen al pedir `?fecha=2026-08-15`, su `startDate`— pero **no tienen `endDate`**, así que `getEvents` las excluye en cuanto pasa su día de inicio (`end_date IS NULL AND start_date >= from`). Es un problema de **datos de origen** (los scrapers no rellenan `endDate`), no del código de promo.

## Pieza C — la app de Meta (hecha)

| Elemento | Valor |
|---|---|
| App | `Huesca Hoy n8n` — id `1624221448687305` (caso de uso `INSTAGRAM_BUSINESS`, sin porfolio) |
| Permisos concedidos | `instagram_content_publish`, `instagram_basic`, `pages_show_list`, `pages_read_engagement`, `business_management` |
| Página de Facebook | `Huesca Hoy` — id `1508926342294117` |
| Cuenta de Instagram | `@huesca.hoy` — IG user id **`17841435800805548`** (enlazada a la Página) |
| Token de Página | de **larga duración** (`expires_at: 0`, tipo `PAGE`), obtenido por `fb_exchange_token` + `me/accounts` |
| Cupo verificado | `content_publishing_limit` → **0 / 100 en 24 h** (HTTP 200) |

**Cómo se obtuvo el token permanente** (repetible): token corto del Graph API Explorer → `GET /oauth/access_token?grant_type=fb_exchange_token&client_id=<APP_ID>&client_secret=<APP_SECRET>&fb_exchange_token=<corto>` (60 días) → `GET /<PAGE_ID>?fields=access_token` con ese token largo → token de Página que **no caduca**.

## Bloqueantes de las piezas B y C

- [ ] Login de n8n (usuario y contraseña) — único bloqueante para importar y probar el flujo.
- [x] IG user id de `@huesca.hoy` + token con `instagram_content_publish` (id `17841435800805548`; token de Página permanente).
- [x] **Desplegar la pieza A**: `https://huescahoy.javierpalacio.es/api/promo` responde **200** (verificado tras el push `bbed07f`).
- [ ] (Opcional) Servidor MCP de Instagram: configurar `INSTAGRAM_ACCESS_TOKEN` / `INSTAGRAM_ACCOUNT_ID=17841435800805548`.

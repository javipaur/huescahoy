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

- IG user id `17841425701858278` → marcador `__IG_USER_ID_HUESCA_HOY__` (5 nodos: `Leer el cupo`, `Medios recientes`, `Crear hijos`, `Crear carrusel`, `Publicar`).
- Credencial: id `ZgkkVSwAqZxK9KuO` → `HUESCA_HOY_BEARER`; nombre → `Instagram · Huesca Hoy (Bearer)`. **El id se cambia a propósito**: si se dejara el de Gasteiz, el flujo importado publicaría en `@gasteizclick` sin avisar.
- Origen: `https://gasteizclick.javierpalacio.es/api/promo` → `https://huescahoy.javierpalacio.es/api/promo`.
- Textos `gasteiz`/`Gasteiz`/`Vitoria-Gasteiz` → `huesca`/`Huesca`.
- Añadido el **gate de mínimo 3 planes** en `Validar el paquete` (`p.imagenes.length < 3` → para el flujo).
- Fuera `id`, `versionId`, `meta`, `pinData`, `nodeGroups` y `tags` de la instancia de origen; `active: false`.
- Sin cambios: cron `45 8 * * *`, `timezone: Europe/Madrid`, Graph API v23.0, batching 2/1500 ms, esperas de 60 s, idempotencia por día, `executionOrder: v1`.

## Bloqueantes de las piezas B y C

- [ ] Login de n8n (usuario y contraseña).
- [ ] IG user id de `@huesca.hoy` + token con `instagram_content_publish`.
- [ ] **Desplegar la pieza A**: `https://huescahoy.javierpalacio.es/api/promo` responde **404** hoy (verificado). Sin eso, el flujo no tiene paquete que leer.
- [ ] El servidor MCP de Instagram está configurado pero **sin credenciales** (`INSTAGRAM_ACCESS_TOKEN` / `INSTAGRAM_ACCOUNT_ID`), así que no puedo verificar el enlace IG↔Página yo solo.

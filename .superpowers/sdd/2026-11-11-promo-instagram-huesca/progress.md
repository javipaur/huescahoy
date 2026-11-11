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

## Bloqueantes de las piezas B y C

- [ ] Login de n8n (usuario y contraseña).
- [ ] IG user id de `@huesca.hoy` + token con `instagram_content_publish`.

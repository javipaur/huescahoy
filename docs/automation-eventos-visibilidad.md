# Automatización de eventos y visibilidad (Huesca Hoy)

Objetivo: tener más datos/eventos en la web y más visibilidad (promo diaria) de forma automatizada y sostenible.

## 1) Ingesta de eventos a la web (scraping)

### Cómo funciona
- **Fuentes**: se gestionan en el admin (`/admin/sources`) y se siembran por defecto en `src/lib/db.ts` (`DEFAULT_SOURCES`, `seedDefaultSources`).
- **Ejecución**: `GET/POST /api/cron/scrape` ejecuta todas las fuentes habilitadas (`runAllSources`) e ingesta eventos en la BD → aparecen en la web.
- **Autorización**: requiere `CRON_SECRET` (`Authorization: Bearer <CRON_SECRET>` o `?secret=`). Ver `.env.example`.

### Configuración mínima en producción
1. Configurar `DATABASE_URL` y `CRON_SECRET`.
2. Programar un cron externo (Dokploy/cron-job.org/UptimeRobot/etc.) para llamar periódicamente a:
   - `POST https://<tu-dominio>/api/cron/scrape` (recomendado cada pocas horas o diario según necesidad).
   - (Opcional) `POST https://<tu-dominio>/api/cron/digest` para resumen diario.
3. Verificar en admin que las fuentes están habilitadas y revisar `last_run`/errores en “Fuentes”.

### Instagram (highlights) — agenda de @likehuesca y otras
El proyecto soporta fuentes `kind: instagram` (stories destacadas/highlights) con OCR para extraer eventos (`src/lib/scraper/instagram.ts`).

- **Requisitos de entorno** (misma sesión de Instagram):
  - `IG_SESSIONID`
  - Recomendado: `IG_DS_USER_ID`, `IG_USER_ID`
  - Opcional: `IG_MAX_ITEMS` (por defecto 20)
- **Fuentes por defecto relacionadas con agenda de @likehuesca** (sembradas por URL, sin duplicados):
  - `https://www.instagram.com/stories/highlights/18353343727241524/` — “Agenda Huesca (Instagram · NOV)”
  - `https://www.instagram.com/stories/highlights/18174857845408415/` — “Agenda Huesca (Instagram · 2026)”
- **Añadir más highlights**: en admin, crear fuente “Instagram · stories destacadas (highlight)” con la URL del highlight de agenda. Si publican nuevos highlights mensuales, añadir/actualizar la URL.

**Limitaciones**: depende de sesión válida (puede caducar), calidad/OCR del contenido de las stories y que incluyan fecha/título legibles. Solo lee highlights (no posts/reels del feed). La ingesta de posts del perfil requeriría una integración adicional (p. ej. scraper externo con `APIFY_TOKEN`).

### Otras fuentes
El proyecto incluye scrapers/fuentes para Ayto, Diputación/DPH, Huesca Turismo, Somontano, Monegros, Ruta del Vino, Open Data, etc. Para más cobertura: habilitar/corregir fuentes existentes y añadir nuevas agendas locales/comarcales/espacios culturales.

## 2) Competencia: web de @likehuesca
- Web: https://www.likehuesca.com/
- Estado observado: agenda con 0 eventos (“descansando”) y RSS/blog sin contenido de eventos en el momento de la revisión. No es una fuente directa fiable para raspar eventos ahora mismo.
- Recomendación: monitorizar; si empiezan a publicar agenda/eventos estructurados, valorar crear un scraper específico. Mientras tanto, sus highlights de Instagram son la fuente útil de agenda.

## 3) Visibilidad (Instagram de Huesca Hoy)

### Promo diaria (n8n)
- Workflow canónico: `docs/n8n/promo-instagram-huesca.json` (trigger programado 08:45 Europe/Madrid + trigger manual en simulacro + trigger Webhook para lanzarlo desde un cron externo).
- Paquete servido por la web: `GET /api/promo?fecha=YYYY-MM-DD` (incluye `modo`, `portada`, `imagenes`, `titulos`, `historia`, `texto`, `enlace`).
- Endpoints de imagen: portada, evento, presentación e historia (`/api/promo/[fecha]/...`). **Pedirlas con `?format=jpeg`**: Meta solo acepta JPEG y el paquete ya trae las URLs con ese parámetro.
- Requiere credencial/token válido de Instagram Graph API en n8n y que la web esté desplegada con los cambios de promo.

#### Gate de tres caminos (`modo`)
La regla vive en `src/lib/promo.ts` (`modoDelDia`, `UMBRAL_CARRUSEL = 3`) y viaja en el paquete; n8n solo obedece, no vuelve a contar:

| Planes del día | `modo` | Qué se publica |
| --- | --- | --- |
| 0 | `nada` | Nada. El flujo termina en verde (`Fin · sin planes`), no en rojo: una agenda vacía es normal. |
| 1–2 | `historia` | Solo una historia 9:16 (`media_type=STORIES`). El carrusel saldría pobre. |
| 3+ | `carrusel` | Carrusel con portada + un slide por plan. |

La historia no aparece en `/media` (caduca a las 24 h), así que su idempotencia se guarda en
`$getWorkflowStaticData('global').ultimaHistoria` **después** de publicar: si la publicación
falla, el reintento vuelve a intentarlo. El carrusel sigue usando el pie de foto como clave.

#### Avisos de error
El workflow activo tiene `settings.errorWorkflow` apuntando a `Avisos · Huesca Hoy`, que clasifica
el fallo de Meta (token, credencial, permisos, cupo, contenedor) y manda un correo con la acción
concreta. Hoy mismo ese aviso es lo que destapa un token mal guardado.

Ojo con dos errores que se parecen y no lo son:

| Respuesta de Meta | Qué pasa | Arreglo |
| --- | --- | --- |
| `400 / code 2500` «An active access token must be used» | No llega cabecera: valor vacío, nombre de cabecera distinto o token guardado sin `Bearer `. | Corregir la credencial. |
| `401 / code 190` «Malformed access token» / «Session has expired» | Sí llega un token, pero no vale. | Renovar el token en Meta. |

En `/media` el primer caso aparece como `403 / (#200) Provide valid app ID`.

El flujo de avisos está versionado en `docs/n8n/avisos-errores-huesca.json` con marcadores
(`HUESCA_HOY_SMTP`, `HUESCA_HOY_AVISOS_EMAIL`) para poder importarlo sin filtrar el correo personal.

#### Ejecución diaria fiable (recomendado)
1. **En n8n**: importar/actualizar el workflow desde `docs/n8n/promo-instagram-huesca.json`, comprobar que solo hay **un** workflow activo para esta promo, revisar credencial `Instagram · Huesca Hoy (Bearer)`/permisos y **activar** el workflow.
2. **Trigger interno**: el nodo `Cron 08:45 Madrid` (`45 8 * * *`, timezone del workflow `Europe/Madrid`) debe quedar activo. Si la instancia de n8n duerme o el schedule es inestable, usar además el disparo externo.
3. **Disparo externo (backup/alternativa)**: programar una llamada diaria autenticada a `POST https://<tu-dominio>/api/cron/promo` con `Authorization: Bearer <CRON_SECRET>` (mismo sistema de cron que `/api/cron/scrape` y `/api/cron/digest`). Requiere en la app: `N8N_PROMO_WEBHOOK_URL` y `N8N_PROMO_WEBHOOK_SECRET`. Ese secreto no viaja en el JSON del repo: el nodo `Webhook (cron externo)` está en modo `headerAuth` con la credencial `Huesca Hoy · cron externo`, y sin la cabecera `x-webhook-secret` correcta n8n responde **403**.
4. **Verificación**: revisar ejecuciones en n8n (éxito, `Fin · ya estaba`, `Fin · historia ya estaba`, `Fin · sin planes`, errores de cupo/permisos/paquete) y que el post aparece en `@huesca.hoy`. La idempotencia del flujo evita publicar dos veces el mismo día.

#### Si hoy no se ejecutó (checklist)
- Workflow **activo** en la instancia correcta (y duplicados antiguos desactivados).
- Instancia de n8n operativa a la hora programada y timezone `Europe/Madrid`.
- Ejecución fallida por: token/permisos Graph API, `GET /api/promo` inaccesible o con 0 planes, cupo agotado, o contenedores en error.
- **Token caducado**: Meta responde `401 / code 190` («Authentication Error») o `400 / code 2500` («An active access token must be used») en cualquier nodo. Se arregla renovando el token de `@huesca.hoy` en la credencial `Instagram · Huesca Hoy (Bearer)`; el workflow de avisos lo dice por correo.
- Si el nodo `Ejecutar a mano` pasó por `Modo: simulacro`, no publica (comportamiento esperado: la vista previa de carrusel e historia se ve, pero el flujo se para antes de crear contenedores). Para publicar de verdad a mano, poner `false` en ese nodo.
- Configurar el cron externo a `/api/cron/promo` como respaldo para evitar depender solo del scheduler interno de n8n.

### Historia (story)
El workflow ya la publica solo cuando el día tiene 1–2 planes (`modo: historia`): crea el contenedor
con `media_type=STORIES` e `image_url` del endpoint de historia, espera a que Meta lo marque
`FINISHED`, lo publica y apunta el día en los datos estáticos del flujo. No lleva pie de foto.

### Buenas prácticas
- Evitar duplicados (idempotencia por día/pie como en el workflow).
- Revisar que las imágenes de promo se generan con foto válida (cambios en `src/lib/promo*` y rutas de imagen); desplegar para que apliquen en producción.
- Mantener contenido constante y útil (agenda del día/finde, destacados) para crecer audiencia propia.

## 4) Notas
- No es viable/adecuado extraer o importar listas de seguidores de otras cuentas. La ventaja sostenible es más datos, mejor calidad y distribución propia.
- Tras cambios en código, desplegar y verificar: cron de scraping, fuentes Instagram (si hay `IG_SESSIONID`), ejecución/publicación de n8n y (si aplica) el cron externo a `/api/cron/promo`.

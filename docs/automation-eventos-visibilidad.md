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
- Workflow canónico: `docs/n8n/promo-instagram-huesca.json` (carrusel diario; trigger programado 08:45 Europe/Madrid + trigger manual en simulacro + trigger Webhook para lanzarlo desde un cron externo).
- Paquete servido por la web: `GET /api/promo?fecha=YYYY-MM-DD` (incluye `portada`, `imagenes`, `titulos`, `historia`, `texto`, `enlace`).
- Endpoints de imagen: portada, evento, presentación e historia (`/api/promo/[fecha]/...`).
- Requiere credencial/token válido de Instagram Graph API en n8n y que la web esté desplegada con los cambios de promo.

#### Ejecución diaria fiable (recomendado)
1. **En n8n**: importar/actualizar el workflow desde `docs/n8n/promo-instagram-huesca.json`, comprobar que solo hay **un** workflow activo para esta promo, revisar credencial `Instagram · Huesca Hoy (Bearer)`/permisos y **activar** el workflow.
2. **Trigger interno**: el nodo `Cron 08:45 Madrid` (`45 8 * * *`, timezone del workflow `Europe/Madrid`) debe quedar activo. Si la instancia de n8n duerme o el schedule es inestable, usar además el disparo externo.
3. **Disparo externo (backup/alternativa)**: exponer el nodo **Webhook** de producción del workflow y programar una llamada diaria autenticada a `POST https://<tu-dominio>/api/cron/promo` con `Authorization: Bearer <CRON_SECRET>` (mismo sistema de cron que `/api/cron/scrape` y `/api/cron/digest`). Requiere en la app: `N8N_PROMO_WEBHOOK_URL` (y opcional `N8N_PROMO_WEBHOOK_SECRET`).
4. **Verificación**: revisar ejecuciones en n8n (éxito, `Fin · ya estaba`, errores de cupo/permisos/paquete) y que el post aparece en `@huesca.hoy`. La idempotencia del flujo evita publicar dos veces el mismo día.

#### Si hoy no se ejecutó (checklist)
- Workflow **activo** en la instancia correcta (y duplicados antiguos desactivados).
- Instancia de n8n operativa a la hora programada y timezone `Europe/Madrid`.
- Ejecución fallida por: token/permisos Graph API (p. ej. 403 en lectura de medios), `GET /api/promo` inaccesible o con < 3 planes válidos, cupo agotado, o contenedores en error.
- Si el nodo `Ejecutar a mano` pasó por `Modo: simulacro`, no publica (comportamiento esperado). Para recuperar un día manualmente, usar el flujo de publicación real según el nodo/comentario del workflow.
- Configurar el cron externo a `/api/cron/promo` como respaldo para evitar depender solo del scheduler interno de n8n.

### Historia (story)
- URL de imagen de historia disponible en el paquete (`historia`, 9:16). Para publicar stories automáticamente desde n8n hace falta añadir un paso de `media_type=STORIES` (crear contenedor con `image_url` de historia + publicar) en la instancia/workflow, usando el mismo token/cuenta.

### Buenas prácticas
- Evitar duplicados (idempotencia por día/pie como en el workflow).
- Revisar que las imágenes de promo se generan con foto válida (cambios en `src/lib/promo*` y rutas de imagen); desplegar para que apliquen en producción.
- Mantener contenido constante y útil (agenda del día/finde, destacados) para crecer audiencia propia.

## 4) Notas
- No es viable/adecuado extraer o importar listas de seguidores de otras cuentas. La ventaja sostenible es más datos, mejor calidad y distribución propia.
- Tras cambios en código, desplegar y verificar: cron de scraping, fuentes Instagram (si hay `IG_SESSIONID`), ejecución/publicación de n8n y (si aplica) el cron externo a `/api/cron/promo`.

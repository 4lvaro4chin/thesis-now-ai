# Analytics Setup — ThesisNow

## Configuración de PostHog

Ya está integrado PostHog en el proyecto. Solo necesitas:

### 1. Crear cuenta en PostHog (gratis)

- Ve a https://app.posthog.com
- Crea una cuenta con tu email
- Obtén tu **API Key** (aparece en Settings → Personal API keys)

### 2. Configurar variable de entorno

En `frontend/.env.local`, agrega:

```
NEXT_PUBLIC_POSTHOG_KEY=tu_api_key_aqui
```

**Nota:** `NEXT_PUBLIC_` es importante — PostHog necesita que sea público.

### 3. Instalar dependencias

```bash
cd frontend
npm install
```

### 4. Listo

La siguiente vez que corras el dev server, PostHog comenzará a capturar eventos automáticamente.

---

## Eventos ya instrumentados

| Evento | Cuándo se dispara | Datos capturados |
|--------|------------------|------------------|
| `search_page_viewed` | Usuario entra a `/search` | step |
| `search_initiated` | Usuario hace clic en "Buscar" | title, databases, query_length, filters |
| `search_completed` | Resultados llegan a `/results` | results_count, sources |
| `article_saved` | Usuario guarda un artículo | doi, source, rating |
| `article_removed` | Usuario elimina un artículo guardado | doi, source |
| `user_login` | Login exitoso | method ('email') |
| `user_signup` | Signup exitoso | method ('email') |
| `$pageview` | Se navega a cualquier página | $current_url |

---

## Dónde ver los datos

1. Ve a PostHog → Events
2. Filtra por nombre del evento
3. Haz clic en un evento para ver los detalles de cada sesión

### Funnel de conversión

Para ver cómo los usuarios avanzan por el flujo:

1. PostHog → Insights
2. New insight → Funnel
3. Agregá estos eventos en orden:
   - `landing_viewed`
   - `search_initiated`
   - `search_completed`
   - `pricing_viewed` (próximamente)
   - `payment_completed` (próximamente)

---

## Próximos pasos

- [ ] Agregar tracking a `/pricing`
- [ ] Agregar tracking a descarga de reporte
- [ ] Agregar tracking a clics de enlaces externos
- [ ] Crear dashboard con métricas clave (conversion rate, avg search time)
- [ ] Configurar alertas si conversion cae <5%

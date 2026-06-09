# Guía Completa de Habilidades (Skills) de Claude Code

Resumen de todas las habilidades disponibles, cómo utilizarlas y cuándo utilizarlas.

---

## 🎯 Flujo de Trabajo y Desarrollo

### 1. **run**
- **Para qué:** Ejecutar y probar la aplicación localmente
- **Cuándo:** Cuando necesitas ver un cambio funcionando en vivo, capturar pantallazos o confirmar que una característica funciona realmente
- **Cómo:** `/run` (busca automáticamente cómo iniciar tu proyecto)
- **Ejemplo:** Después de hacer cambios en componentes, ejecuta para ver el resultado

### 2. **verify**
- **Para qué:** Verificar que un cambio de código hace lo que se supone debe hacer
- **Cuándo:** Después de hacer cambios, antes de hacer push, para validar que una característica funciona correctamente
- **Cómo:** `/verify` (ejecuta la app y observa el comportamiento)
- **Ejemplo:** Verifica que un bug fix realmente resuelve el problema

### 3. **init**
- **Para qué:** Inicializar un archivo CLAUDE.md con documentación del código base
- **Cuándo:** Al comenzar un nuevo proyecto o cuando necesitas establecer directrices
- **Cómo:** `/init`
- **Ejemplo:** Primera vez que configuras instrucciones de proyecto

---

## 🔍 Revisión de Código

### 4. **code-review**
- **Para qué:** Revisión integral de código (TypeScript, JavaScript, Python, Swift, Kotlin, Go)
- **Cuándo:** Cuando quieres análisis profundo de cambios, encontrar bugs, garantizar calidad
- **Cómo:** `/code-review [--low|--medium|--high|--ultra] [--comment] [--fix]`
- **Niveles de esfuerzo:**
  - `--low`: Hallazgos confiables, menos cantidad
  - `--medium`: Balance entre cobertura y confianza
  - `--high`: Cobertura amplia, algunos hallazgos inciertos
  - `--ultra`: Revisión profunda multi-agente en la nube (billed)
- **Banderas:**
  - `--comment`: Comenta hallazgos en el PR de GitHub
  - `--fix`: Aplica correcciones automáticamente al código
- **Ejemplo:** `/code-review --high --fix` para encontrar y corregir problemas

### 5. **simplify**
- **Para qué:** Revisar código para reutilización, simplificación y eficiencia
- **Cuándo:** Cuando quieres limpiar el código sin buscar bugs
- **Cómo:** `/simplify`
- **Ejemplo:** Después de implementar una característica, simplifica el código resultante

### 6. **security-review**
- **Para qué:** Revisar cambios pendientes por vulnerabilidades de seguridad
- **Cuándo:** Antes de hacer deploy o cuando trabajas con datos sensibles
- **Cómo:** `/security-review`
- **Ejemplo:** Antes de pushear cambios que tocan autenticación o manejo de datos

### 7. **review**
- **Para qué:** Revisar un pull request en GitHub
- **Cuándo:** Cuando necesitas feedback detallado sobre un PR
- **Cómo:** `/review` o `/review <PR#>`
- **Ejemplo:** Revisar un PR antes de mergearlo

---

## 🎨 Diseño y Frontend

### 8. **frontend-design**
- **Para qué:** Crear interfaces web de alta calidad, componentes y layouts
- **Cuándo:** Para construir páginas web, dashboards, componentes React, sitios de landing, cualquier UI
- **Cómo:** `/frontend-design`
- **Características:**
  - Genera código CSS/HTML/React profesional
  - Evita estética genérica de IA
  - Produce diseños distintivos y listos para producción
- **Ejemplo:** "Crea un dashboard para mostrar métricas de usuarios"

---

## 📄 Herramientas Especializadas

### 9. **pdf**
- **Para qué:** Manipular archivos PDF (leer, extraer, combinar, dividir, rellenar, encriptar, OCR)
- **Cuándo:** Cuando trabajas con PDFs en cualquier forma
- **Cómo:** `/pdf` (antes de hacer operaciones con archivos .pdf)
- **Operaciones soportadas:**
  - Leer/extraer texto y tablas
  - Combinar o dividir PDFs
  - Rellenar formularios
  - Encriptar/desencriptar
  - Extraer imágenes
  - OCR en PDFs escaneados
- **Ejemplo:** "Extrae las tablas de este PDF y conviértelas a JSON"

### 10. **webapp-testing**
- **Para qué:** Probar aplicaciones web locales usando Playwright
- **Cuándo:** Para verificar funcionalidad frontend, debuggear comportamiento de UI, capturar pantallazos
- **Cómo:** `/webapp-testing`
- **Capacidades:**
  - Interacción con elementos
  - Verificación de funcionalidad
  - Captura de screenshots
  - Visualización de logs del navegador
- **Ejemplo:** Verifica que un formulario se envía correctamente

---

## 📊 Investigación y Análisis

### 11. **deep-research**
- **Para qué:** Investigación profunda con múltiples fuentes, verificación adversarial y síntesis citada
- **Cuándo:** Cuando necesitas un reporte detallado, multi-fuente y fact-checked sobre un tema
- **Cómo:** `/deep-research`
- **Proceso:**
  1. Haz preguntas de clarificación si es necesario
  2. Realiza búsquedas paralelas
  3. Verifica adversarialmente las afirmaciones
  4. Sintetiza un reporte citado
- **Ejemplo:** "Investiga las mejores prácticas para autenticación OAuth 2.0 en 2026"

---

## ⚙️ Configuración

### 12. **update-config**
- **Para qué:** Configurar Claude Code, permisos, variables de entorno, hooks, settings.json
- **Cuándo:** Para cambiar configuración del harness, automatizaciones, permisos
- **Cómo:** `/update-config`
- **Casos de uso:**
  - Permitir comandos nuevos (ej: `npm`, `docker`)
  - Agregar/mover permisos
  - Establecer variables de entorno
  - Configurar hooks para automatización
  - Troubleshooting de configuración
- **Nota:** Automatizaciones requieren hooks configurados en settings.json
- **Ejemplo:** "Permite ejecutar comandos npm en global settings"

### 13. **keybindings-help**
- **Para qué:** Personalizar atajos de teclado
- **Cuándo:** Cuando quieres rebindear teclas, crear combinaciones nuevas, modificar keybindings
- **Cómo:** `/keybindings-help`
- **Operaciones:**
  - Rebindear keys existentes
  - Crear chord bindings (combinaciones)
  - Cambiar tecla de submit
  - Personalizar keybindings.json
- **Ejemplo:** "Rebindea Ctrl+S para enviar mensajes"

### 14. **fewer-permission-prompts**
- **Para qué:** Reducir prompts de permisos creando un allowlist de comandos frecuentes
- **Cuándo:** Cuando estás cansado de aprobar los mismos comandos Bash/MCP repetidamente
- **Cómo:** `/fewer-permission-prompts`
- **Resultado:** Escanea transcripts y crea un allowlist prioritizado en .claude/settings.json
- **Ejemplo:** Después de hacer `/npm` 10 veces, automatiza el permiso

---

## 🔄 Automatización

### 15. **loop**
- **Para qué:** Ejecutar un comando o prompt en intervalos recurrentes
- **Cuándo:** Para tareas repetidas (revisar deploys, monitorear PRs, polling)
- **Cómo:** `/loop <intervalo> <comando>` o `/loop <comando>` (self-paced)
- **Intervalos válidos:** Cualquier duración (ej: `5m`, `30s`, `1h`)
- **Ejemplos:**
  - `/loop 5m /code-review` — revisar código cada 5 minutos
  - `/loop 30s /babysit-prs` — monitorear PRs cada 30 segundos
  - `/loop /check-deploy` — self-paced, deja que el modelo decida intervalos

### 16. **schedule**
- **Para qué:** Crear agentes programados que se ejecuten en horarios (cron)
- **Cuándo:** Para tareas automatizadas recurrentes o ejecuciones únicas en horario específico
- **Cómo:** `/schedule`
- **Casos de uso:**
  - Tareas cronograma en la nube
  - Ejecución única en horario específico
  - Automatización de rutinas
  - Recordatorios ("remind me to check X mañana")
- **Ejemplo:** "Ejecuta /check-db-backups cada día a las 2 AM"

---

## 💬 Interacción

### 17. **grill-me**
- **Para qué:** Cuestionamiento intenso hasta alcanzar comprensión compartida
- **Cuándo:** Cuando quieres stress-test de un plan o diseño, explorar decisiones a fondo
- **Cómo:** `/grill-me`
- **Función:** Entrevista relentlessly sobre un plan hasta resolver cada rama del árbol de decisión
- **Ejemplo:** "Grill me sobre mi arquitectura de microservicios"

### 18. **caveman**
- **Para qué:** Modo ultra-comprimido de comunicación (reduce tokens ~75%)
- **Cuándo:** Cuando necesitas ahorrar tokens, comunicación muy breve
- **Cómo:** `/caveman` o mencionando "caveman mode"
- **Características:**
  - Elimina filler, artículos, amabilidades
  - Mantiene precisión técnica completa
  - Reduce uso de tokens significativamente
- **Ejemplo:** "Usa caveman mode para explicar rápidamente este código"

---

## 📚 Referencias

### 19. **claude-api**
- **Para qué:** Referencia de Claude API, modelos, pricing, parámetros, streaming, token counting
- **Cuándo:** Cuando trabajas con la API de Anthropic, necesitas info de modelos o pricing
- **Cómo:** Se invoca automáticamente si mencionas Claude/Anthropic en contexto de API
- **Información disponible:**
  - Model IDs y capacidades
  - Precios y limites
  - Parámetros de API
  - Streaming, tool use, MCP
  - Agents, caching, token counting
- **Nota:** Lee ANTES de abrir archivos de código API; no asumas valores

---

## 📋 Resumen Rápido por Caso de Uso

| Necesidad | Skill | Comando |
|-----------|-------|---------|
| Ver app funcionando | `run` | `/run` |
| Verificar cambio funciona | `verify` | `/verify` |
| Revisar código por bugs | `code-review` | `/code-review --high --fix` |
| Limpiar/simplificar código | `simplify` | `/simplify` |
| Revisar seguridad | `security-review` | `/security-review` |
| Revisar PR en GitHub | `review` | `/review` o `/review <PR#>` |
| Crear UI/frontend | `frontend-design` | `/frontend-design` |
| Trabajar con PDFs | `pdf` | `/pdf` |
| Probar app web | `webapp-testing` | `/webapp-testing` |
| Investigación profunda | `deep-research` | `/deep-research` |
| Automatizar tareas | `loop` o `schedule` | `/loop 5m /comando` |
| Cambiar configuración | `update-config` | `/update-config` |
| Personalizar teclas | `keybindings-help` | `/keybindings-help` |
| Ahorrar tokens | `caveman` | `/caveman` |
| Explorar decisiones | `grill-me` | `/grill-me` |
| Menos prompts permisos | `fewer-permission-prompts` | `/fewer-permission-prompts` |
| Info API Claude | `claude-api` | Auto-invocado |

---

## 🚀 Flujo Típico de Desarrollo

1. **Planificación:** `/grill-me` — stress-test el plan
2. **Implementación:** `code-review --high --fix` — revisar mientras codificas
3. **Testing:** `/run` → `/verify` — ejecuta y verifica cambios
4. **UI:** `/frontend-design` si necesitas componentes nuevos
5. **Seguridad:** `/security-review` antes de push
6. **Cleanup:** `/simplify` para limpiar el código
7. **PR:** `/review <PR#>` cuando esté listo para merge
8. **Automatización:** `/loop` o `/schedule` para tareas recurrentes

---

## 💡 Consejos Clave

- **Combinables:** Usa skills en secuencia. Ej: `code-review --fix` → `simplify` → `verify`
- **Banderas:** `--fix` en code-review ahorra pasos manuales
- **Contexto:** Algunas skills (como `run`) buscan automáticamente cómo iniciar tu proyecto
- **Tokens:** Usa `/caveman` si necesitas ahorrar en conversaciones largas
- **Permisos:** `/fewer-permission-prompts` evita fatiga de aprobaciones repetidas
- **Automatización:** `/loop` es mejor que polling manual; `/schedule` es mejor que recordatorios manuales

---

**Última actualización:** 2026-06-09

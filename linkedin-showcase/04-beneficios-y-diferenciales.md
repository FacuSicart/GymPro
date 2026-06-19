# Beneficios y Diferenciales

## El problema que resuelve

Los entrenadores personales gestionan alumnos con herramientas que no fueron diseñadas para eso:

| Herramienta actual | Problema |
|---|---|
| WhatsApp | Conversaciones mezcladas, historial que desaparece, no hay estructura |
| Excel manual | Rutinas que no se actualizan, sin feedback, sin historial |
| PDFs | Estáticos, no capturan lo que realmente pasó |
| Memoria | No escala, se pierde con el tiempo |

**Resultado:** pérdida de información, rutinas poco personalizadas, mucho tiempo administrativo y cero trazabilidad.

---

## La propuesta de valor

**El verdadero valor del producto no es generar rutinas.**

El verdadero valor es construir un **historial deportivo inteligente del alumno** para que el entrenador tome mejores decisiones futuras.

> "La IA propone, el entrenador decide."

---

## Diferenciales del producto

### 1. El historial como activo central

La mayoría de las apps de fitness guardan rutinas. Esta plataforma guarda el historial completo de cada alumno: restricciones, lesiones, feedback por sesión, molestias reportadas, rutinas entregadas y el estado en cada momento.

Ese historial es la diferencia entre un entrenador que "recuerda" y uno que tiene contexto real para tomar decisiones.

### 2. Snapshot de rutinas publicadas

Al publicar una rutina, el sistema guarda una copia inmutable de todos los ejercicios tal como estaban en ese momento. Si después se edita o desactiva un ejercicio del catálogo, las rutinas históricas no cambian.

Eso es trazabilidad real. Un entrenador puede ver exactamente qué le prescribió a su alumno hace 6 meses.

### 3. IA como asistente, no como autoridad

La IA no aprueba rutinas, no las modifica automáticamente y no toma decisiones. Solo genera borradores y sugerencias. El entrenador revisa, edita y aprueba. Siempre.

Esta filosofía es una decisión de producto deliberada: el entrenador es el profesional. La IA es su asistente.

### 4. Sin app para el alumno en Fase 1

El alumno no necesita instalar nada ni registrarse. Recibe un link, lo abre desde el celular y ve su rutina mobile-first. Puede registrar su entrenamiento y enviar feedback sin salir del navegador.

Eso elimina la fricción de adopción: el entrenador puede seguir compartiendo por WhatsApp, pero ahora el contenido tiene estructura y el feedback queda en el sistema.

### 5. Catálogo de ejercicios curado y cerrado

La IA de rutinas solo puede seleccionar ejercicios aprobados y activos del catálogo. Nunca inventa ejercicios ni consulta internet en tiempo real. El administrador controla qué ejercicios existen.

Eso da control y predecibilidad al entrenador: lo que la IA puede proponer está acotado a lo que él aprobó.

### 6. Detección automática de molestias recurrentes

El sistema analiza el historial de feedback del alumno buscando patrones: si reporta molestia en la rodilla en 3 o más sesiones dentro de 30 días, el sistema genera una alerta para el entrenador.

Sin IA, sin diagnóstico médico. Solo detección de patrones estructurada. El entrenador decide qué hacer.

### 7. Plantillas asignables a múltiples alumnos

Un entrenador puede crear una plantilla de rutina una vez y asignarla a 20 alumnos en un click. Cada asignación genera una copia independiente que el entrenador puede personalizar por alumno.

Ahorro de tiempo real para trainers con grupos o carteras grandes.

### 8. Modelo de permisos claro desde el arranque

- **ADMIN:** aprueba trainers, gestiona el catálogo, ve todo el tenant
- **TRAINER:** gestiona sus alumnos, sus rutinas, sus plantillas
- El alumno accede solo a su propia rutina por token

No hay ambigüedad sobre quién puede hacer qué.

---

## vs Alternativas en el mercado

| Aspecto | Spreadsheets / WhatsApp | Apps genéricas de fitness | Esta plataforma |
|---|---|---|---|
| Historial estructurado | No | Parcial | Sí, tipificado |
| Feedback capturado | No | Parcial | Sí, por sesión y día |
| IA para rutinas | No | Algunos | Sí, con control humano |
| Snapshot de rutinas | No | No | Sí |
| Sin app para alumno | Sí, pero sin estructura | No | Sí, con estructura |
| Catálogo curado | No | Fijo / externo | Sí, controlado por el trainer |
| Alertas de molestias | No | No | Sí |
| Plantillas asignables | Manual | Limitado | Sí, multi-alumno |
| Multi-tenant | No | Varía | Sí, desde Fase 1 |

---

## A quién está dirigido

**Usuario principal:** entrenador personal independiente o profesor de gimnasio que gestiona entre 5 y 50 alumnos de forma individual o semipersonalizada.

**Usuario final:** alumno que recibe la rutina y puede enviar feedback desde el celular sin instalar nada.

**Administrador:** responsable del gimnasio o de la cuenta que gestiona trainers, aprueba ejercicios y tiene visibilidad del tenant completo.

---

## El diferencial meta: cómo se construyó

Este producto fue diseñado y construido de principio a fin con un proceso AI-first:

1. **PRD completo** generado con un solo prompt estructurado
2. **Revisión de arquitectura** ejecutada por IA en rol de CTO
3. **Technical Foundation** producida por IA en rol de Principal Engineer
4. **Plan de implementación** generado por IA en rol de Lead Engineer
5. **9 módulos implementados** con Claude Code bajo supervisión humana

Toda la documentación del proceso está versionada en el repositorio en la carpeta `spec/`. El proyecto es en sí mismo una demostración de lo que es posible construir cuando se usa IA de forma sistemática y deliberada desde el día 0.

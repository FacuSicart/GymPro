# Funcionalidades — Los 9 módulos del MVP

## Módulo 1: Auth, Usuarios, Roles y Tenant

### Qué hace
- Login con email/contraseña y JWT propio
- Roles: `ADMIN` y `TRAINER`
- Signup público solo para trainers → estado `PENDING_APPROVAL`
- Admin aprueba o rechaza trainers pendientes
- El primer admin se crea por seed (no hay signup público de admin)
- Multi-tenant desde el arranque

### Por qué importa
El modelo de onboarding controlado evita que cualquiera entre al sistema. El trainer no opera hasta que una persona responsable lo aprueba. Esto es crítico para un producto B2B donde la confianza del dato es central.

---

## Módulo 2: Alumnos e Historial

### Qué hace
- CRUD completo de alumnos con perfil deportivo
- Datos registrados por alumno: nombre, email, edad, peso, altura, experiencia, objetivo
- Objetivos: Fuerza, Hipertrofia, Movilidad, Resistencia, Acondicionamiento
- Registro de lesiones anteriores, restricciones físicas, molestias recurrentes declaradas, ejercicios a evitar y observaciones del entrenador
- Timeline de eventos tipificado: 19 tipos de eventos automáticos que se registran ante cada acción relevante (rutina creada, feedback enviado, molestia reportada, etc.)

### Por qué importa
El historial del alumno es el activo principal del producto. No son notas sueltas: es un timeline estructurado que el entrenador y la futura IA pueden leer para tomar mejores decisiones. La diferencia entre "acordarse" y "tener contexto real".

---

## Módulo 3: Catálogo de Ejercicios

### Qué hace
- ABM completo de ejercicios
- Campos por ejercicio: nombre, descripción, imagen (URL), video (URL), grupo muscular, equipamiento, nivel de dificultad, objetivos recomendados, patrones de movimiento, beneficios, precauciones, observaciones
- Doble estado por ejercicio: aprobación (PENDING / APPROVED / REJECTED) y operativo (ACTIVE / INACTIVE)
- Trainers proponen ejercicios → quedan en PENDING
- Solo ADMIN aprueba/activa → el ejercicio queda disponible para rutinas
- Vista de cobertura del catálogo por grupo muscular y objetivo

### Por qué importa
La IA de rutinas solo puede usar ejercicios `APPROVED + ACTIVE`. Nunca inventa ejercicios ni busca en internet en tiempo real. El catálogo es la única fuente válida. Esto da al entrenador control total sobre qué puede proponer la IA.

---

## Módulo 4: Rutinas

### Qué hace
- Crear rutinas por alumno y entrenador
- Estructura jerárquica: Rutina → Días → Ejercicios con parámetros
- Parámetros por ejercicio: series, repeticiones, descanso, intensidad, tempo, RIR/RPE, observaciones, motivo de selección
- Estados: `DRAFT` → `ACTIVE` → `ARCHIVED`
- Al publicar se genera un `RoutineSnapshot` inmutable
- El snapshot preserva los datos de cada ejercicio al momento de la publicación
- Validación obligatoria contra catálogo oficial antes de guardar
- Eventos de historial automáticos en cada transición de estado

### Por qué importa
El snapshot pattern garantiza que si un ejercicio se edita o desactiva después, las rutinas ya publicadas no cambian. Eso es trazabilidad real. Un entrenador puede ver exactamente qué le dio a su alumno hace 6 meses.

---

## Módulo 5: Enlace Público de Rutina

### Qué hace
- Generar un link público (`/r/[token]`) para compartir una rutina publicada
- Token no adivinable, único por rutina
- Estados: `ACTIVE` / `REVOKED`
- El entrenador puede revocar el acceso en cualquier momento
- Vista mobile-first del alumno: muestra la rutina desde el snapshot publicado, no del catálogo vivo
- No requiere login del alumno
- Filtra información interna (sin datos de otros alumnos, sin historial completo, sin logs de IA)

### Por qué importa
El alumno no necesita instalar una app ni registrarse. Recibe un link, lo abre desde el celular y ve su rutina. Eso elimina la fricción de adopción en Fase 1. El entrenador puede seguir compartiendo por WhatsApp como siempre, pero ahora el contenido tiene estructura.

---

## Módulo 6: Ejecución / Registro de Entrenamientos

### Qué hace
- El alumno puede iniciar una sesión de entrenamiento desde el link público
- Registro por día: marca cada día como completado o no
- Registro por ejercicio: permite anotar peso real, repeticiones reales y observaciones durante la sesión
- Estados de sesión: `PLANNED` → `IN_PROGRESS` → `COMPLETED` / `CANCELLED`
- Manejo de republishing: si se publica una nueva versión de la rutina, los días ya completados se preservan y los días nuevos se agregan
- El entrenador puede ver las sesiones desde el panel privado y desde el detalle del alumno

### Por qué importa
El gap entre "rutina planificada" y "lo que realmente hizo el alumno" es donde se pierde toda la información. Este módulo captura esa ejecución real sin obligar al alumno a usar una app.

---

## Módulo 7: Feedback del Alumno / Molestias

### Qué hace
- Después de completar cada día de entrenamiento, el alumno puede enviar feedback
- Feedback por día (no un único feedback al final de toda la rutina)
- Campos: dificultad (1-10), energía (1-10), si completó el entrenamiento, razón si no completó
- Si tuvo molestias: zona afectada (lista estructurada), intensidad (1-10), descripción libre opcional
- Sin login del alumno
- Un solo feedback por día completado (sin duplicados)
- El feedback queda asociado a: tenant, alumno, entrenador, rutina, snapshot, sesión, día y link público

### Por qué importa
La molestia reportada el martes en la rodilla vale si está en el sistema. No si el entrenador lo anotó en un chat que va a perder. Este módulo captura señales del cuerpo del alumno de forma estructurada, no como texto libre.

---

## Módulo 8: Molestias Recurrentes y Alertas

### Qué hace
- Analiza el historial de feedback del alumno buscando patrones de molestia
- Regla MVP: 3 o más reportes de la misma zona en los últimos 30 días
- Endpoint `GET /api/students/:id/discomfort-alerts` para el entrenador
- Resumen por zona: cantidad de reportes, intensidad promedio, intensidad máxima, última fecha, últimos comentarios
- Evento de historial `TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED` al cruzar el umbral
- Sin IA, sin diagnóstico médico, sin recomendaciones automáticas

### Por qué importa
Sin este módulo, el entrenador tendría que revisar manualmente el historial de feedback de cada alumno cada vez. Con este módulo, el sistema hace esa detección automáticamente y levanta una alerta visible. El entrenador decide qué hacer con esa información. La IA no decide nada.

---

## Módulo 9: Plantillas de Rutinas y Asignación

### Qué hace
- Crear rutinas genéricas como plantillas (sin alumno asociado)
- Editar estructura completa: días, ejercicios, series, repeticiones, descanso, intensidad, tempo, RIR/RPE, observaciones
- Validación contra catálogo oficial obligatoria
- Listar y archivar plantillas propias
- Asignar una plantilla a uno o varios alumnos activos en un solo paso
- Cada asignación crea una rutina `DRAFT` independiente para cada alumno
- Evento de historial `ROUTINE_CREATED` en cada alumno asignado
- Admin puede visualizar plantillas del tenant (no crear/editar/archivar)
- Trainer gestiona solo sus propias plantillas

### Por qué importa
Un entrenador que tiene 20 alumnos con objetivos similares no tiene que crear la misma rutina 20 veces. Crea una plantilla una vez, la ajusta, y la asigna al grupo en un click. Cada alumno obtiene su propia copia editable e independiente.

---

## Módulos planificados (no en MVP actual)

- IA de generación de rutinas (borrador con motivo de selección por ejercicio)
- Exportaciones PDF / Excel
- Dashboard con métricas de uso y feedback
- Crear plantilla desde rutina existente
- Duplicar plantilla
- Notificaciones por email

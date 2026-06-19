# Estado actual y proxima sesion

Fecha de corte: 2026-06-16

Este documento resume donde quedo el proyecto y como seguir en una proxima sesion. La idea es usarlo como handoff rapido antes de pedir nuevos cambios.

## Proyecto

- Workspace: `F:\ProyectoGym`
- Backend: NestJS + Prisma + PostgreSQL.
- Frontend: Next.js.
- Mantener arquitectura, permisos, estilos y componentes existentes.
- Antes de implementar nuevos modulos, leer `/spec` y revisar el codigo actual.

## Modulos implementados

### Modulo 1: Auth, Usuarios, Roles y Tenant

Implementado:

- Registro/login.
- Roles `ADMIN` y `TRAINER`.
- Estado de usuarios.
- Tenant.
- Guardas de auth y usuario activo.
- Flujo de aprobacion de entrenadores por admin.

### Modulo 2: Alumnos e Historial

Implementado:

- CRUD de alumnos.
- Perfil deportivo.
- Lesiones, restricciones, molestias recurrentes y observaciones.
- Timeline/historial del alumno.
- Eventos automaticos vinculados a cambios relevantes.

### Modulo 3: Catalogo de Ejercicios

Implementado:

- Catalogo de ejercicios.
- Estados de aprobacion y estado operativo.
- Flujo admin/trainer para ejercicios.
- Solo ejercicios `APPROVED` y `ACTIVE` son utilizables por rutinas.
- Scripts relacionados con videos de ejercicios.

### Modulo 4: Rutinas / Planes de Entrenamiento

Implementado:

- Rutinas por alumno y entrenador.
- Estados `DRAFT`, `ACTIVE`, `ARCHIVED`.
- Dias de entrenamiento.
- Ejercicios por dia.
- Parametros: series, repeticiones, descanso, intensidad, tempo, RIR/RPE, observaciones.
- Validacion contra catalogo oficial: solo ejercicios `APPROVED` y `ACTIVE`.
- Versionado/snapshot al publicar.
- Eventos en historial del alumno.
- Pantallas de listado, creacion, detalle/editor e integracion en alumno.

Notas:

- Admin visualiza rutinas, pero no debe crear/editar/publicar/archivar.
- Trainer gestiona rutinas propias.
- Se corrigio que el detalle de rutina no quede bloqueado si falla la carga auxiliar de catalogo o enlace publico.

### Modulo 5: Enlace Publico de Rutina

Implementado:

- Modelo `PublicRoutineLink`.
- Token seguro/no adivinable.
- Estados `ACTIVE` y `REVOKED`.
- Generar enlace publico solo para rutinas `ACTIVE`.
- Reutilizar link activo si ya existe.
- Revocar link.
- Endpoint publico sin login para obtener rutina por token.
- Vista publica mobile-first en `/r/[token]`.
- La vista publica usa snapshot publicado, no catalogo vivo.
- La respuesta publica filtra informacion interna.

Endpoints principales:

- `GET /api/routines/:id/public-link`
- `POST /api/routines/:id/public-link`
- `PATCH /api/routines/:id/public-link/revoke`
- `GET /api/public-routines/:token`

Notas:

- En produccion conviene guardar hash del token en vez de token plano.
- Hoy el link no expira automaticamente; se revoca manualmente.

### Modulo 6: Ejecucion / Registro de Entrenamientos

Confirmado como ya implementado.

Backend:

- Carpeta: `apps/api/src/training-sessions`
- Modelos Prisma:
  - `TrainingSession`
  - `TrainingSessionDay`
  - `TrainingSessionExercise`
- Migraciones:
  - `20260616142353_training_sessions`
  - `20260616151105_training_session_day_completed`
- Eventos de historial:
  - `TRAINING_SESSION_CREATED`
  - `TRAINING_SESSION_STARTED`
  - `TRAINING_SESSION_COMPLETED`
  - `TRAINING_SESSION_CANCELLED`
  - `TRAINING_SESSION_EXERCISE_UPDATED`

Endpoints privados:

- `GET /api/training-sessions`
- `POST /api/training-sessions`
- `GET /api/training-sessions/:id`
- `PATCH /api/training-sessions/:id`
- `PATCH /api/training-sessions/:id/start`
- `PATCH /api/training-sessions/:id/complete`
- `PATCH /api/training-sessions/:id/cancel`
- `PATCH /api/training-sessions/exercises/:id`
- `GET /api/students/:id/training-sessions`

Endpoints publicos desde token:

- `POST /api/public-routines/:token/training-session`
- `GET /api/public-routines/:token/training-session`
- `PATCH /api/public-routines/:token/training-session/days/:dayId/complete`
- `PATCH /api/public-routines/:token/training-session/exercises/:exerciseId`

Frontend:

- `/training-sessions`
- `/training-sessions/new`
- `/training-sessions/[id]`
- Integracion en detalle de alumno.
- Integracion en `/r/[token]` para que el alumno registre entrenamiento desde el link publico.

## Estado operativo local

Ultimas verificaciones ejecutadas:

- `npm.cmd test --workspace api`: OK.
- `npm.cmd run build --workspace api`: OK.
- `npm.cmd run build --workspace web`: OK.
- `http://localhost:3001/api/health`: respondio 200.
- `http://localhost:3000/routines`: respondio 200.

Servicios usados localmente:

- Web: `http://localhost:3000`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`
- Postgres Docker: servicio `proyecto-gym-postgres`
- pgAdmin: `http://localhost:5050`

## Dato importante detectado

Existe una rutina real en DB:

- Nombre: `Rutina Facu`
- Estado: `ACTIVE`
- Trainer: `fliasicart1@gmail.com`

Si se intenta abrir con otro usuario o tenant, el backend puede bloquearla por permisos. Para verla/gestionarla, entrar con el entrenador propietario o revisar la politica de admin/tenant.

## Problemas conocidos o detalles a corregir

1. En produccion, los public routine links deberian guardar token hasheado.

2. El flujo publico `/r/[token]` luego de completar dias/entrenamiento queda desestimado por ahora. Retomarlo solo si aparece confusion real en pruebas con usuarios.

3. En plantillas de rutina, la asignacion crea rutinas `DRAFT`. Para entregar al alumno todavia hay que abrir cada rutina asignada, revisar/ajustar si corresponde, publicarla y generar su enlace publico desde la rutina concreta del alumno.

4. No existe todavia una accion para convertir una rutina existente en plantilla ni para duplicar una plantilla. Hoy las plantillas se crean desde cero.

## Correcciones de calidad recientes

- Se revisaron textos con encoding roto. No quedaron ocurrencias reales de mojibake en `apps/web/src` o `apps/api/src`; lo visto en consola era salida de PowerShell decodificando UTF-8.
- Se ajusto el manejo de errores del frontend para evitar mostrar mensajes tecnicos al usuario, por ejemplo errores de JSON, `Request failed`, `Unexpected token` o respuestas crudas del backend.
- Se agrego traduccion de errores conocidos del backend a mensajes simples para usuario.
- Se corrigio el flujo publico de entrenamiento: si una rutina se republica y habia una sesion publica de una version anterior, esa sesion se sincroniza con la ultima version publicada. Los dias ya completados quedan completados e intactos; los dias pendientes se reemplazan por la version nueva y los dias nuevos se agregan. Los ejercicios de dias completados no pueden editarse desde el flujo privado ni publico.

## Modulo 7 implementado

### Feedback del Alumno / Molestias Post Entrenamiento

### Objetivo

Despues de que el alumno completa un dia de entrenamiento desde el link publico, permitirle enviar feedback simple y rapido sobre:

- como se sintio
- dificultad general
- energia
- si pudo completar el entrenamiento
- si tuvo molestias o dolor
- zona afectada
- intensidad de molestia
- comentario general

Ese feedback debe quedar asociado a:

- tenant
- alumno
- entrenador
- rutina
- version/snapshot de rutina
- training session
- training session day
- public routine link si aplica

Y debe alimentar el historial del alumno.

### Estado real del codigo

Implementado. Durante el desarrollo se corrigio el alcance para que el feedback sea por dia completado, no un unico feedback al final de toda la rutina/sesion. Esto permite registrar como se sintio el alumno ese dia con esos ejercicios, pesos, cargas y observaciones.

### Alcance MVP implementado

Publico:

- En `/r/[token]`, despues de completar un dia de entrenamiento, mostrar formulario de feedback.
- No requerir login del alumno.
- Evitar duplicados: un feedback final por dia completado en MVP.
- Si ya existe feedback, mostrar estado `Feedback ya enviado`.
- Si el link publico esta revocado, no permitir enviar feedback.
- Si el dia no esta completado, no permitir feedback final.

Campos:

- `difficulty_score`: numero 1 a 10.
- `energy_score`: numero 1 a 10.
- `completed_workout`: boolean.
- `incomplete_reason`: texto opcional, obligatorio si no completo.
- `had_discomfort`: boolean.
- `discomfort_area`: texto opcional, obligatorio si tuvo molestia.
- `discomfort_intensity`: numero 1 a 10 opcional, obligatorio si tuvo molestia.
- `discomfort_description`: texto opcional.
- `general_comment`: texto opcional.

Privado:

- Ver feedback en detalle de alumno.
- Ver feedback en detalle de sesion de entrenamiento.
- Mostrar resumen: fecha, rutina/sesion/dia, dificultad, energia, completo si/no, molestia si/no, zona/intensidad si aplica.

Historial:

- Evento `feedback enviado`.
- Evento `molestia reportada` si corresponde.

### No implementar todavia

- IA.
- Diagnostico medico.
- Recomendaciones automaticas.
- Notificaciones.
- App mobile.
- Wearables.
- Pagos.
- PDF/Excel.
- Analisis avanzado.
- Clasificacion automatica compleja de molestias recurrentes.
- Chat con entrenador.

## Modulo 8 implementado

### Molestias recurrentes y alertas

Implementado:

- Detectar recurrencia de molestias a partir del feedback diario del alumno.
- Agrupar por alumno, zona afectada e intensidad.
- Regla MVP: 3 o mas reportes para la misma zona en los ultimos 30 dias.
- Endpoint privado `GET /api/students/:id/discomfort-alerts`.
- Resumen visible para el entrenador en detalle del alumno:
  - zona
  - cantidad de reportes
  - intensidad promedio
  - intensidad maxima
  - ultima fecha reportada
  - ultimos comentarios
- Evento de historial `TRAINING_FEEDBACK_RECURRENT_DISCOMFORT_DETECTED` cuando una zona cruza la regla.
- Evita duplicar eventos para la misma zona dentro de la ventana reciente.
- Sin IA, diagnostico medico ni recomendaciones automaticas.

## Modulo 9 implementado

### Plantillas de rutinas y asignacion a alumnos

Implementado:

- Crear rutinas genericas como plantillas, sin alumno asociado.
- Editar datos generales de plantilla:
  - nombre
  - descripcion
  - objetivo
- Editar estructura de plantilla:
  - dias
  - ejercicios por dia
  - series, repeticiones, descanso, intensidad, tempo, RIR/RPE y observaciones
- Validar contra catalogo oficial: solo ejercicios `APPROVED` y `ACTIVE`.
- Listar plantillas por entrenador y tenant.
- Archivar plantillas.
- Asignar una plantilla activa a uno o varios alumnos activos.
- Cada asignacion crea una rutina `DRAFT` independiente para cada alumno.
- Registrar evento de historial `ROUTINE_CREATED` en cada alumno asignado, con metadata de origen `routine-templates`.
- Pantallas nuevas:
  - `/routine-templates`
  - `/routine-templates/new`
  - `/routine-templates/[id]`
- Navegacion lateral: item `Plantillas`.

Backend:

- Modelos Prisma:
  - `RoutineTemplate`
  - `RoutineTemplateDay`
  - `RoutineTemplateExercise`
- Enum Prisma:
  - `RoutineTemplateStatus`
- Migracion:
  - `20260616193000_routine_templates`

Endpoints privados:

- `GET /api/routine-templates`
- `POST /api/routine-templates`
- `GET /api/routine-templates/:id`
- `PATCH /api/routine-templates/:id`
- `PATCH /api/routine-templates/:id/archive`
- `POST /api/routine-templates/:id/assign`

Notas:

- La asignacion no genera enlace publico. El link publico sigue perteneciendo a la rutina concreta del alumno.
- Admin puede visualizar plantillas del tenant, pero no crear, editar, archivar ni asignar.
- Trainer gestiona solo sus propias plantillas.

Pendiente / fuera del alcance actual:

- No hay generacion de link publico desde la plantilla. El link se genera sobre la rutina ya asignada y publicada.
- No hay publicacion masiva de rutinas creadas desde plantilla.
- No hay flujo para asignar una plantilla y publicar/generar links en un solo paso.
- No hay trazabilidad visible en UI de que una rutina concreta nacio desde una plantilla; la metadata queda registrada en historial.
- No hay pantalla de detalle de plantilla con historial de asignaciones realizadas.
- No hay opcion para crear una plantilla a partir de una rutina existente.
- No hay opcion para duplicar una plantilla.
- No hay versionado/snapshot de plantillas. El versionado sigue perteneciendo a las rutinas publicadas.
- No hay sincronizacion automatica entre una plantilla editada y las rutinas ya asignadas. Si una plantilla cambia, no modifica rutinas existentes.
- Tests backend del modulo agregados en `apps/api/src/routine-templates/routine-templates.service.spec.ts`.

## Estado actual resumido

Hecho:

- Modulos 1 a 9 implementados en codigo.
- Auth, usuarios, roles y tenant operativos.
- Alumnos, perfiles e historial operativos.
- Catalogo de ejercicios operativo.
- Rutinas por alumno operativas.
- Publicacion, versionado y enlace publico de rutinas operativos.
- Ejecucion/registro de entrenamientos operativo.
- Feedback diario post entrenamiento operativo.
- Molestias recurrentes y alertas operativas.
- Plantillas de rutina y asignacion a multiples alumnos operativas.
- Errores tecnicos del backend se traducen a mensajes simples en frontend cuando estan contemplados.

Falta / proximos bloques posibles:

- Mejorar flujo de plantillas asignadas: ver rutinas creadas luego de asignar, publicar varias rutinas creadas desde plantilla, generar links de varias rutinas asignadas y mostrar en UI el origen plantilla de una rutina.
- Crear plantilla desde rutina existente.
- Duplicar plantilla.
- Metricas basicas de uso, cumplimiento y feedback.
- Exportaciones PDF/Excel.
- IA de rutinas, si se decide avanzar con IA mas adelante.
- Hardening productivo de enlaces publicos: guardar hash de token y evaluar expiracion opcional.
- Revisar con pruebas reales si el flujo publico necesita una pantalla final mas clara luego de completar dias y enviar feedback.

## Proximo modulo recomendado

Proximo paso recomendado:

- Mejorar el flujo posterior a asignar plantillas, porque es la continuacion natural del modulo 9: una plantilla crea rutinas borrador, pero todavia falta una experiencia comoda para revisar, publicar y generar links de esas rutinas asignadas.

Candidatos alternativos:

- IA de rutinas.
- Exportaciones PDF/Excel.
- Metricas basicas de uso y feedback.
- Crear plantilla desde rutina existente.
- Duplicar plantilla.

## Prompt breve para retomar

Usar este prompt en una proxima sesion:

```txt
Estamos en F:\ProyectoGym.
Lee primero /spec, especialmente spec/estado-actual-y-proxima-sesion.md, y revisa el codigo actual.

No programes hasta confirmar el estado real del codigo.

Modulos ya implementados:
1 Auth/Usuarios/Roles/Tenant.
2 Alumnos e Historial.
3 Catalogo de Ejercicios.
4 Rutinas.
5 Enlace Publico de Rutina.
6 Ejecucion/Registro de Entrenamientos.
7 Feedback del Alumno / Molestias Post Entrenamiento.
8 Molestias recurrentes y alertas.
9 Plantillas de rutinas y asignacion a alumnos.

Proximo modulo recomendado:
Mejorar el flujo posterior a asignar plantillas: revisar rutinas creadas, publicar y generar links sobre las rutinas concretas del alumno. Alternativas: crear plantilla desde rutina existente, duplicar plantilla, metricas basicas, exportaciones PDF/Excel o IA de rutinas.

Objetivo:
Antes de avanzar, confirmar prioridad del proximo bloque funcional.

Antes de implementar:
- Verificar modelos/endpoints/pantallas existentes.
- Detectar contradicciones.
- Reportarlas antes de avanzar.

No implementar IA, diagnostico medico, notificaciones, app mobile, PDF/Excel ni analisis avanzado.
No romper auth, alumnos, catalogo, rutinas, enlaces publicos ni training-sessions existentes.
```

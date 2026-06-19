# Technical Foundation - MVP Plataforma Fitness

## 1. Resumen Ejecutivo

Se esta construyendo una plataforma SaaS B2B para entrenadores, incluyendo personal trainers y profesores de gimnasio, y administradores internos. Personal trainer y profesor de gimnasio se modelan como el mismo rol operativo: entrenador. El objetivo del MVP es centralizar alumnos, perfiles deportivos, restricciones, molestias reportadas, historial, catalogo de ejercicios, rutinas, feedback y generacion asistida de borradores de rutina con IA.

La propuesta de valor principal no es generar rutinas automaticamente, sino construir un historial deportivo inteligente del alumno para que el entrenador tome mejores decisiones futuras.

Principio rector:

> La IA propone, el entrenador decide.

La IA nunca debe aprobar, publicar, entregar ni modificar rutinas sin aprobacion humana. Tampoco debe diagnosticar lesiones, indicar tratamientos ni actuar como autoridad medica.

Antes de programar deben quedar cerradas estas decisiones:

- Stack definitivo de frontend, backend, base de datos, ORM, auth, hosting, IA, PDF, Excel y monitoreo.
- Modelo de datos MVP y entidades historicas.
- Estados permitidos para rutinas, ejercicios, feedback, tokens, usuarios y recomendaciones.
- Matriz de permisos para administrador y entrenador.
- Reglas de negocio que bloquean acciones invalidas.
- Contrato de IA: datos de entrada, formato de salida, validaciones y limites.
- Estrategia de snapshots para rutinas aprobadas/publicadas.
- Estrategia de tokens para enlace web mobile-first del alumno.
- Criterios de cobertura minima del catalogo antes de habilitar IA de rutinas.

Riesgos de no cerrar Fase 0:

- Codex u otras IAs podrian implementar decisiones incompatibles entre modulos.
- La IA podria quedar con permisos excesivos o generar ejercicios fuera del catalogo.
- Rutinas historicas podrian cambiar si se edita el catalogo vivo.
- Los permisos cross-tenant podrian quedar debiles.
- El lenguaje de molestias podria acercar el producto a interpretacion medica.
- PDF, Excel y enlace web podrian generarse desde fuentes inconsistentes.
- El MVP podria crecer hacia app mobile, pagos, chat o integraciones antes de validar el flujo core.

Contradiccion relevante detectada:

- Algunos casos de uso heredados mencionan aplicacion mobile del alumno y vinculacion con codigo. El PRD actualizado y la CTO Review establecen que la app mobile queda fuera de Fase 1. Decision final: el MVP usara enlace web mobile-first, PDF y Excel. El modelo debe permitir evolucion futura a app, pero no debe implementarla ahora.

## 2. Stack Tecnologico Definitivo

### Frontend

Decision: Next.js + TypeScript.

Por que:

- Permite construir dashboard interno y vista web mobile-first con un mismo stack.
- Facilita desarrollo asistido por IA por su ecosistema maduro.
- Puede alojarse facilmente en Vercel.

Ventajas:

- TypeScript end-to-end.
- Buen soporte para formularios, rutas, componentes y SSR/CSR segun necesidad.
- Reutilizacion de componentes de rutina entre dashboard y vista alumno.

Riesgos:

- Usar API routes o server actions como backend principal mezclaria responsabilidades.
- Next.js puede inducir acoplamiento si no se respeta el contrato REST.

Decision operativa:

- Next.js queda como frontend.
- No usar Next.js API routes como backend principal.

### Backend

Decision: NestJS + TypeScript como API REST monolitica modular.

Por que:

- Mantiene separacion clara entre frontend y dominio.
- Permite modulos por contexto: usuarios, alumnos, catalogo, rutinas, feedback, IA, exportaciones.
- Facilita OpenAPI/Swagger para que Codex implemente frontend y backend con contratos claros.

Ventajas:

- Estructura explicita.
- Buen soporte para validacion, guards, servicios y testing.
- Preparado para una futura app mobile sin reescribir backend.

Riesgos:

- Puede volverse ceremonial si se sobredisenan capas.
- Requiere disciplina para mantener modulos simples.

### Base de datos

Decision: PostgreSQL.

Por que:

- Excelente para datos relacionales, ownership, historial, rutinas y permisos.
- Soporta JSONB para snapshots o payloads IA sin reemplazar el modelo central.

Ventajas:

- Integridad transaccional.
- Indices por tenant, alumno, rutina y entrenador.
- Madurez operacional.

Riesgos:

- Modelo mal normalizado podria dificultar historial y auditoria.
- JSONB excesivo podria ocultar reglas de dominio.

### ORM

Decision: Prisma.

Por que:

- DX simple para un fundador solo con IA.
- Tipado fuerte y migraciones accesibles.
- Facil de entender por Codex.

Ventajas:

- Productividad alta.
- Contrato de datos claro.
- Buen soporte TypeScript.

Riesgos:

- Consultas complejas pueden requerir optimizacion.
- Migraciones deben revisarse antes de aplicar en produccion.

### Autenticacion

Decision: Supabase Auth o Clerk para usuarios internos. Preferencia inicial: Supabase Auth si tambien se usa Supabase Postgres.

Por que:

- Evita construir auth propia.
- Reduce riesgo en login, sesiones y recuperacion de acceso.

Ventajas:

- Menos codigo sensible.
- Integracion rapida.
- Escala suficiente para MVP.

Riesgos:

- Dependencia de proveedor.
- El modelo de roles y tenant debe seguir controlado por el backend, no solo por metadata del proveedor.

Decision de MVP:

- Hay registro publico solo para entrenadores.
- El registro publico de entrenador crea una cuenta en estado `pendiente_aprobacion`; no habilita acceso automatico al sistema.
- Un administrador debe aprobar o rechazar cada registro de entrenador.
- No hay registro publico de administradores.
- Primer administrador por seed o proceso operativo controlado.
- Alumno no necesita cuenta ni login en Fase 1.

### Hosting

Decision:

- Frontend: Vercel.
- Backend: Render, Fly.io o Railway.
- Base de datos: Supabase Postgres o proveedor administrado equivalente.

Por que:

- Menor carga operativa.
- Despliegues simples.
- Costos iniciales bajos.

Ventajas:

- Rapidez para validar.
- Infraestructura administrada.
- Separacion clara de frontend y API.

Riesgos:

- Costos pueden crecer si no se monitorea IA/exportaciones.
- Railway/Render/Fly requieren configurar variables y health checks correctamente.

### Almacenamiento de archivos

Decision MVP: no almacenar imagenes ni videos propios. Usar URLs externas en ejercicios.

Por que:

- El PRD define imagen_url y video_url como referencias externas.
- Evita S3/CDN, procesamiento, cuotas y backups multimedia.

Ventajas:

- Menor costo.
- Menor complejidad.
- Implementacion mas rapida.

Riesgos:

- URLs externas pueden romperse.
- Experiencia visual puede ser inconsistente.

Regla:

- Un ejercicio debe seguir siendo usable sin imagen o video.

Para PDFs generados, decidir por implementacion:

- Generacion on demand al inicio.
- Object storage solo si se necesita persistir archivos.

### Generacion PDF

Decision: generacion server-side desde HTML/template controlado.

Por que:

- El PDF debe reflejar la rutina aprobada y sus snapshots.
- HTML facilita mantener consistencia con la vista web.

Ventajas:

- Plantilla visual controlada.
- Menos duplicacion.
- Facil de probar manualmente.

Riesgos:

- Renderizado PDF consume tiempo.
- Diferencias visuales entre navegadores/renderers.

Regla:

- PDF solo desde rutina aprobada/publicada y snapshots, nunca desde catalogo vivo.

### Exportacion Excel

Decision: ExcelJS o libreria equivalente en backend.

Por que:

- Excel es requisito del MVP.
- Debe mantenerse con formato acotado, sin personalizacion avanzada.

Ventajas:

- Generacion programatica simple.
- Compatible con flujos actuales de entrenadores.

Riesgos:

- Puede consumir tiempo si se permite demasiada personalizacion.
- Compatibilidad visual con distintas versiones de Excel/Sheets.

Regla:

- Una plantilla inicial cerrada.
- Exportar desde snapshot de rutina aprobada/publicada.

### Servicio IA

Decision: proveedor LLM externo mediante API, con capa propia `AI Orchestrator`.

Por que:

- No hay datos ni necesidad para entrenar modelos propios.
- La IA debe estar aislada del dominio y validada por schemas.

Ventajas:

- Rapidez de implementacion.
- Posibilidad de cambiar proveedor.
- Versionado de prompts.

Riesgos:

- Respuestas invalidas.
- Costos variables.
- Latencia.
- Posible filtrado de informacion sensible si no se limita el contexto.

Regla:

- La IA devuelve JSON estructurado.
- El backend valida schema, IDs, enums, permisos y estados antes de persistir.

### Monitoreo

Decision MVP: Sentry para errores + logs estructurados + metricas basicas de producto.

Por que:

- Permite detectar errores en flujos criticos sin montar observabilidad compleja.

Ventajas:

- Rapida instalacion.
- Visibilidad de excepciones frontend/backend.
- Suficiente para primeras validaciones.

Riesgos:

- Logs con datos sensibles si no se filtran.
- Falta de metricas de negocio si solo se mide tecnica.

Regla:

- No loguear payloads completos con datos personales o historial sensible.
- Registrar eventos agregados: rutinas creadas, IA solicitada, IA rechazada, feedback enviado, exports generados.

### Variables de entorno

Definir desde el inicio:

- `DATABASE_URL`
- `DIRECT_DATABASE_URL` si el proveedor lo requiere para migraciones
- `AUTH_PROVIDER_URL`
- `AUTH_PROVIDER_SECRET`
- `JWT_SECRET` si aplica
- `OPENAI_API_KEY` o clave del proveedor IA elegido
- `AI_MODEL_ROUTINE_GENERATION`
- `AI_MODEL_SUMMARY`
- `AI_REQUEST_TIMEOUT_MS`
- `AI_MAX_CATALOG_ITEMS`
- `PUBLIC_APP_URL`
- `API_BASE_URL`
- `TOKEN_SECRET`
- `ACCESS_TOKEN_TTL_DAYS`
- `PDF_RENDER_TIMEOUT_MS`
- `SENTRY_DSN`
- `LOG_LEVEL`

Regla:

- Separar variables frontend publicas de secretos backend.
- Nunca exponer claves IA ni secretos de auth al cliente.

## 3. Estructura General del Sistema

### Vista de alto nivel

```text
-------------------+          +-----------------------+
| Admin/Entrenador |          | Alumno sin app        |
| Dashboard Web    |          | Link mobile-first     |
+---------+---------+          +----------+------------+
          |                               |
          v                               v
+------------------------------------------------------+
| Frontend Next.js                                     |
| Dashboard interno | Vista publica por token          |
+---------------------------+--------------------------+
                            |
                            v
+------------------------------------------------------+
| Backend NestJS API REST                              |
| Auth | Usuarios | Alumnos | Catalogo | Rutinas       |
| Feedback | Historial | IA | Exportaciones | Tokens   |
+---------------------------+--------------------------+
                            |
      +---------------------+----------------------+
      |                     |                      |
      v                     v                      v
+-------------+     +---------------+      +---------------+
| PostgreSQL  |     | LLM Provider  |      | PDF/Excel     |
| Datos MVP   |     | IA controlada |      | Render/export |
+-------------+     +---------------+      +---------------+
```

### Modulos principales

```text
Auth y Usuarios
  -> Alumnos
  -> Catalogo
  -> Rutinas
       -> Exportaciones
       -> Tokens de acceso web
       -> Feedback
            -> Historial
            -> Alertas/Recomendaciones
  -> IA Orchestrator
       -> Rutinas borrador
       -> Catalogo admin-only
       -> Resumen/Recomendaciones
```

### Responsabilidades

Auth y usuarios:

- Login de usuarios internos.
- Roles: administrador, entrenador.
- Estado de usuario.
- Pertenencia a tenant.

Alumnos:

- Datos personales minimos.
- Perfil deportivo.
- Restricciones, lesiones anteriores, molestias recurrentes declaradas y observaciones.

Catalogo:

- Ejercicios controlados.
- Estados de validacion y actividad.
- Cobertura minima.
- Propuestas de entrenadores.
- Curado/admin con IA si se implementa.

Rutinas:

- Borradores manuales o IA.
- Dias/sesiones.
- Ejercicios y parametros.
- Estados.
- Snapshots al aprobar/publicar.

Feedback:

- Formulario mobile-first.
- Dificultad, cumplimiento y molestias reportadas.
- Asociacion a rutina, dia y ejercicio cuando corresponda.

Historial:

- Timeline de eventos tipificados.
- Contexto historico para entrenador e IA.

IA:

- Construccion de contexto.
- Invocacion a LLM.
- Validacion de salida.
- Creacion de borradores o recomendaciones revisables.

Exportaciones:

- PDF y Excel desde snapshots.

Tokens:

- Enlace web no adivinable.
- Expiracion, revocacion y usos registrados.

## 4. Modelo de Datos MVP

### Tenant

Proposito: representar una cuenta, gimnasio u organizacion. Tambien soporta al entrenador independiente como tenant propio.

Atributos:

- id
- nombre
- estado
- created_at
- updated_at

Relaciones:

- Tiene muchos usuarios.
- Tiene muchos alumnos.
- Tiene muchos ejercicios.
- Tiene muchas rutinas.

### User

Proposito: usuario interno que opera la plataforma.

Atributos:

- id
- tenant_id
- auth_provider_user_id
- nombre
- apellido
- email
- rol: administrador, entrenador
- estado: pendiente_aprobacion, activo, rechazado, suspendido, desactivado
- approved_at
- approved_by_user_id
- rejected_at
- rejected_by_user_id
- rejection_reason
- created_at
- updated_at

Relaciones:

- Pertenece a tenant.
- Puede crear alumnos, ejercicios, rutinas, feedback interno o aprobaciones segun rol.

### Alumno

Proposito: perfil del alumno gestionado por entrenador.

Atributos:

- id
- tenant_id
- entrenador_id principal
- nombre
- apellido
- email
- edad
- peso
- altura
- estado
- created_at
- updated_at

Relaciones:

- Pertenece a tenant.
- Puede tener entrenador asignado.
- Tiene un perfil fitness.
- Tiene muchas rutinas.
- Tiene muchos feedbacks.
- Tiene muchos eventos historicos.

### AlumnoPerfilFitness

Proposito: guardar informacion deportiva y restricciones relevantes.

Atributos:

- alumno_id
- objetivo: hipertrofia, fuerza, perdida_grasa, acondicionamiento_fisico
- experiencia
- lesiones_anteriores
- restricciones
- molestias_recurrentes_declaradas
- ejercicios_que_generan_molestias
- observaciones_entrenador

Relaciones:

- Pertenece a alumno.
- Alimenta contexto de IA e historial.

### Ejercicio

Proposito: catalogo cerrado de ejercicios. Es la unica fuente valida para rutinas e IA runtime.

Atributos:

- id
- tenant_id
- nombre
- descripcion
- imagen_url
- video_url
- grupo_muscular
- equipamiento_requerido
- nivel_dificultad
- objetivos_recomendados
- patrones_movimiento
- beneficios
- precauciones
- observaciones
- estado_validacion: pendiente, aprobado, rechazado
- estado_actividad: activo, inactivo, archivado
- origen: admin, propuesta_usuario, ia_admin
- creado_por_id
- aprobado_por_id
- approved_at
- created_at
- updated_at

Relaciones:

- Puede tener muchas fuentes.
- Puede ser referenciado por rutina_ejercicio.
- Puede ser propuesto por entrenador.

### EjercicioFuenteReferencia

Proposito: registrar fuentes usadas para curar ejercicios.

Atributos:

- id
- ejercicio_id
- titulo
- url
- fecha_consulta
- observacion

Relaciones:

- Pertenece a ejercicio.

### Rutina

Proposito: contenedor de una planificacion para un alumno.

Atributos:

- id
- tenant_id
- alumno_id
- entrenador_id
- nombre
- objetivo
- disponibilidad_semanal_dias
- estado: borrador, borrador_ia, propuesta, aprobada, publicada, archivada
- fuente_generacion: manual, ia
- version
- approved_at
- published_at
- archived_at
- created_at
- updated_at

Relaciones:

- Pertenece a alumno.
- Tiene muchos dias.
- Tiene snapshots.
- Tiene exportaciones.
- Tiene tokens de acceso.
- Tiene feedbacks.

### RutinaDia

Proposito: representar un dia o sesion dentro de una rutina.

Atributos:

- id
- rutina_id
- nombre
- orden
- descripcion

Relaciones:

- Pertenece a rutina.
- Tiene muchos ejercicios asignados.

### RutinaEjercicio

Proposito: asignar un ejercicio del catalogo a una rutina con parametros.

Atributos:

- id
- rutina_dia_id
- ejercicio_id
- orden
- series
- repeticiones
- descanso
- observaciones
- motivo_seleccion
- alertas_restricciones
- ejercicio_snapshot

Relaciones:

- Pertenece a rutina_dia.
- Referencia ejercicio de catalogo.
- Puede ser asociado por feedback.

### RutinaSnapshot

Proposito: preservar la rutina aprobada/publicada para exportaciones e historial.

Atributos:

- id
- rutina_id
- version
- estado_origen
- data_snapshot
- created_at
- created_by_id

Relaciones:

- Pertenece a rutina.
- Es usado por PDF, Excel y vista publica.

### AccessToken

Proposito: permitir acceso web limitado a una rutina sin cuenta de alumno.

Atributos:

- id
- rutina_id
- alumno_id
- token_hash
- estado: activo, usado, expirado, revocado
- expires_at
- max_usos
- usos_count
- primer_uso_at
- revoked_at
- created_at

Relaciones:

- Pertenece a rutina.
- Puede tener registros de uso.

### AccessTokenUso

Proposito: auditar usos de tokens.

Atributos:

- id
- access_token_id
- canal: web
- used_at
- user_agent_hash opcional
- ip_hash opcional

Relaciones:

- Pertenece a access_token.

### Feedback

Proposito: capturar percepcion del alumno sobre rutina o sesion.

Atributos:

- id
- tenant_id
- alumno_id
- rutina_id
- rutina_dia_id opcional
- dificultad_percibida: muy_dificil, dificil, bien, facil
- cumplimiento: completa, parcial, no_realizada
- tuvo_molestia
- comentario
- created_at

Relaciones:

- Pertenece a alumno.
- Pertenece a rutina.
- Puede tener detalle de molestia.
- Genera historial_evento.

### FeedbackMolestia

Proposito: estructurar molestias reportadas sin lenguaje medico.

Atributos:

- id
- feedback_id
- zona: hombro, codo, muneca_mano, cuello, espalda_alta, espalda_baja_lumbar, cadera, rodilla, tobillo_pie, otra
- intensidad: leve, moderada, alta
- momento_aparicion: antes, durante, despues, dia_siguiente
- ejercicio_asociado_id opcional
- asociacion_ejercicio: ejercicio, no_sabe, no_asociado
- descripcion opcional
- estado_recurrencia: aislada, en_observacion, recurrente, desestimada

Relaciones:

- Pertenece a feedback.
- Puede referenciar rutina_ejercicio o ejercicio de catalogo.

### HistorialEvento

Proposito: timeline tipificado del alumno.

Atributos:

- id
- tenant_id
- alumno_id
- tipo
- titulo
- resumen
- origen_modulo
- entidad_tipo
- entidad_id
- metadata
- created_by_id opcional
- created_at

Relaciones:

- Pertenece a alumno.
- Puede referenciar rutina, feedback, molestia o recomendacion.

### RecomendacionIA

Proposito: guardar sugerencias revisables, nunca cambios automaticos.

Atributos:

- id
- tenant_id
- alumno_id
- rutina_id opcional
- feedback_id opcional
- tipo
- estado: pendiente_revision, revisada, descartada, aplicada_manualmente, archivada
- recomendacion
- contexto_resumido
- created_at
- reviewed_by_id opcional
- reviewed_at opcional

Relaciones:

- Pertenece a alumno.
- Puede relacionarse con feedback, rutina o ejercicio.

### Exportacion

Proposito: registrar PDF/Excel generados.

Atributos:

- id
- rutina_id
- tipo: pdf, excel
- estado: solicitada, generada, fallida, expirada
- snapshot_id
- url_archivo opcional
- error opcional
- created_at

Relaciones:

- Pertenece a rutina.
- Usa rutina_snapshot.

### AILog

Proposito: auditar uso de IA sin guardar datos sensibles innecesarios.

Atributos:

- id
- tenant_id
- user_id
- tipo: catalogo_admin, rutina, resumen_historial, recomendacion_molestia
- prompt_version
- modelo
- estado: exitoso, rechazado_schema, rechazado_reglas, error
- input_resumen
- output_resumen
- error
- created_at

Relaciones:

- Puede referenciar rutina, alumno, ejercicio o recomendacion segun uso.

## 5. Convenciones de Estados

### Rutinas

Estados:

- borrador
- borrador_ia
- propuesta
- aprobada
- publicada
- archivada

Transiciones:

```text
borrador -> aprobada
borrador_ia -> propuesta -> aprobada
borrador_ia -> aprobada
aprobada -> publicada
aprobada -> archivada
publicada -> archivada
```

Reglas:

- Solo borrador, borrador_ia y propuesta son editables.
- Aprobada congela snapshot.
- Publicada habilita entrega por enlace/PDF/Excel.
- Archivada no se entrega ni se edita.
- Una rutina entregada no debe modificarse directamente; debe generarse una nueva version o volver a borrador segun decision futura. Para MVP, preferir nueva version.

### Ejercicios

Estados de validacion:

- pendiente
- aprobado
- rechazado

Estados de actividad:

- activo
- inactivo
- archivado

Transiciones:

```text
pendiente -> aprobado
pendiente -> rechazado
aprobado + inactivo -> activo
activo -> inactivo
inactivo -> activo
activo/inactivo -> archivado
```

Reglas:

- Solo ejercicios aprobados y activos pueden usarse en rutinas.
- Ejercicios pendientes no aparecen como seleccionables.
- Propuestas de entrenadores siempre nacen pendientes.
- Ejercicios generados o enriquecidos por IA admin-only siempre nacen pendientes.
- Ningun ejercicio se activa automaticamente por IA.

### Feedback

Estados operativos:

- recibido
- procesado
- requiere_revision
- archivado

Estados de molestia:

- aislada
- en_observacion
- recurrente
- desestimada

Transiciones de molestia:

```text
primer reporte -> aislada
segundo reporte similar en ventana definida -> en_observacion
tercer reporte similar -> recurrente
sin reaparicion durante varias sesiones -> desestimada
```

Reglas:

- El alumno no clasifica recurrencia.
- El sistema calcula recurrencia con reglas.
- Una molestia aislada no se convierte en restriccion permanente.

### Tokens publicos

Estados:

- activo
- usado
- expirado
- revocado

Transiciones:

```text
activo -> usado
activo/usado -> expirado
activo/usado -> revocado
```

Reglas:

- Token no adivinable.
- Se guarda hash, no token plano.
- Expiracion inicial recomendada: 7 dias.
- Revocable por entrenador/admin.
- No expone historial completo antes de confirmar acceso.

### Usuarios

Estados:

- pendiente_aprobacion
- activo
- rechazado
- suspendido
- desactivado

Transiciones:

```text
pendiente_aprobacion -> activo
pendiente_aprobacion -> rechazado
activo -> suspendido
suspendido -> activo
activo/suspendido -> desactivado
```

Reglas:

- Hay signup publico solo para entrenadores.
- El signup publico deja al entrenador en `pendiente_aprobacion`.
- Usuario `pendiente_aprobacion` o `rechazado` no inicia sesion operativa ni accede a datos privados.
- Solo admin aprueba o rechaza entrenadores registrados publicamente.
- Solo admin crea administradores.
- Usuario desactivado no inicia sesion.
- Usuario suspendido no opera datos.

### Recomendaciones IA

Estados:

- pendiente_revision
- revisada
- descartada
- aplicada_manualmente
- archivada

Reglas:

- La IA no aplica cambios.
- El entrenador decide si descarta, revisa o aplica manualmente.

## 6. Modelo de Permisos

### Administrador

Puede ver:

- Usuarios internos del tenant.
- Alumnos del tenant.
- Catalogo completo.
- Rutinas y feedback del tenant.
- Reporte de cobertura.
- Logs/resumenes operativos de IA.

Puede crear:

- Entrenadores.
- Ejercicios.
- Propuestas de catalogo admin-only con IA.
- Criterios de cobertura.

Puede editar:

- Usuarios internos.
- Ejercicios y estados.
- Configuracion basica del tenant.

Puede eliminar:

- No se recomienda eliminacion fisica en MVP.
- Puede desactivar usuarios.
- Puede archivar ejercicios si no deben usarse.

### Entrenador

Puede ver:

- Sus alumnos asignados.
- Rutinas de sus alumnos.
- Feedback e historial de sus alumnos.
- Catalogo aprobado y activo.
- Estado de sus propuestas de ejercicios.

Puede crear:

- Alumnos.
- Rutinas manuales.
- Borradores IA.
- Propuestas de ejercicios pendientes.
- Enlaces de entrega para rutinas aprobadas/publicadas.

Puede editar:

- Sus alumnos.
- Rutinas propias en estados editables.
- Parametros de rutinas antes de aprobar.
- Observaciones propias.

Puede eliminar:

- No eliminacion fisica.
- Puede archivar rutinas propias.
- Puede desactivar/revocar enlaces propios.

### Matriz de permisos

| Accion | Administrador | Entrenador |
| --- | --- | --- |
| Crear primer admin | Operativo/seed | No |
| Crear usuarios administradores | Si | No |
| Editar usuarios internos | Si | No |
| Desactivar usuarios | Si | No |
| Ver alumnos del tenant | Si | Solo asignados/propios |
| Crear alumnos | Si | Si |
| Editar alumnos | Si | Propios/asignados |
| Eliminar alumnos | No, archivar | No, archivar si permitido |
| Ver catalogo aprobado | Si | Si |
| Crear ejercicio activo | Si | No |
| Proponer ejercicio | Si | Si |
| Aprobar/rechazar ejercicio | Si | No |
| Activar/inactivar ejercicio | Si | No |
| Ver reporte cobertura | Si | Lectura opcional |
| Crear rutina manual | Si | Si |
| Solicitar borrador IA | Si | Si |
| Editar rutina borrador | Si | Propia/asignada |
| Aprobar rutina | Si | Propia/asignada |
| Publicar/entregar rutina | Si | Propia/asignada |
| Generar PDF/Excel | Si | Rutinas propias/asignadas |
| Revocar token web | Si | Propio/asignado |
| Ver feedback | Si | Propios/asignados |
| Ver historial | Si | Propios/asignados |
| Ver logs IA | Si | Resumen propio |

## 7. Reglas de Negocio Fundamentales

- La IA propone, el entrenador autorizado decide.
- La IA no modifica automaticamente rutinas aprobadas, publicadas o entregadas.
- La IA no diagnostica, no prescribe tratamientos y no usa lenguaje medico.
- Usar "molestias reportadas" o "sensaciones reportadas", no "sintomas".
- Hay registro publico solo para entrenadores, siempre sujeto a aprobacion administrativa.
- No hay registro publico de administradores.
- El primer administrador se crea por seed, consola interna o proceso operativo controlado.
- Solo administradores crean otros administradores y aprueban o rechazan entrenadores registrados publicamente.
- Solo administradores aprueban, rechazan, activan o archivan ejercicios.
- Entrenadores pueden proponer ejercicios, pero quedan pendientes.
- Solo ejercicios aprobados y activos pueden usarse en rutinas.
- La IA de rutinas solo puede usar ejercicios aprobados y activos existentes en base de datos.
- La IA de rutinas no consulta internet ni fuentes externas en runtime.
- La IA de rutinas no crea ejercicios nuevos.
- Si el catalogo aprobado no tiene cobertura suficiente, el sistema debe informar limitacion funcional.
- Las respuestas de IA deben ser JSON estructurado validado por backend.
- Si la IA devuelve IDs invalidos, ejercicios inactivos o campos fuera de enum, la respuesta se rechaza.
- Toda rutina generada por IA nace como borrador_ia o propuesta editable.
- Una rutina no puede entregarse si no esta aprobada o publicada.
- Al aprobar o publicar una rutina se guarda snapshot de ejercicios y parametros relevantes.
- PDF, Excel y enlace web se generan desde snapshot, no desde catalogo vivo.
- Cambios posteriores en el catalogo no modifican rutinas historicas.
- El alumno no necesita app mobile ni cuenta en Fase 1.
- El enlace web debe usar token no adivinable, expirable y revocable.
- El acceso web no debe exponer historial completo del alumno.
- El feedback debe asociarse a alumno y rutina.
- Si el alumno reporta molestia, zona, intensidad y momento son obligatorios.
- Si la zona es "otra", descripcion libre es obligatoria.
- La recurrencia de molestias la calcula el sistema, no el alumno.
- Una molestia aislada no se convierte automaticamente en restriccion cronica.
- Una molestia recurrente genera alerta o recomendacion revisable, nunca cambio automatico.
- No eliminar fisicamente entidades centrales en MVP; preferir estados de archivado/desactivacion.
- Todo acceso debe respetar tenant y ownership.
- No construir app mobile, pagos, marketplace, wearables, chat ni multi-sucursal avanzado en MVP.

## 8. Estrategia de IA

### Datos que recibe la IA para generar rutinas

- alumno_id
- entrenador_id
- objetivo
- experiencia
- disponibilidad_semanal_dias
- restricciones declaradas por entrenador
- lesiones anteriores como contexto fitness preventivo
- molestias reportadas relevantes y resumidas
- historial resumido
- catalogo permitido con IDs, nombres, grupos musculares, equipamiento, dificultad, objetivos, patrones, beneficios y precauciones

### Datos que devuelve la IA

- estructura de rutina
- dias/sesiones
- ejercicios por ID existente
- series
- repeticiones
- descansos
- observaciones
- motivo de seleccion por ejercicio
- alertas de restricciones si detecta conflicto

### Validaciones obligatorias

- JSON valido.
- Schema valido.
- IDs existentes.
- Ejercicios aprobados y activos.
- Enums validos.
- Rutina consistente con disponibilidad semanal.
- No incluir ejercicios fuera del catalogo.
- No incluir diagnosticos ni recomendaciones medicas.
- No aprobar ni publicar la rutina.

### Que se resuelve con prompts

- Composicion inicial de rutina.
- Motivo de seleccion por ejercicio.
- Resumen breve del historial para entrenador.
- Redaccion de sugerencias cuando una regla detecta molestia recurrente.
- Generacion/enriquecimiento de catalogo solo en flujo admin-only.

### Que se resuelve con reglas

- Permisos.
- Estados.
- Validacion de catalogo aprobado/activo.
- Deteccion inicial de recurrencia.
- Expiracion y revocacion de tokens.
- Bloqueo de entrega sin aprobacion.
- Rechazo de respuestas IA invalidas.
- Cobertura minima del catalogo.
- Separacion entre molestias aisladas, en observacion, recurrentes y desestimadas.

### Que NO debe decidir la IA

- Diagnosticos.
- Tratamientos.
- Lesiones reales o severidad clinica.
- Aprobacion de ejercicios.
- Activacion de ejercicios.
- Aprobacion, publicacion o entrega de rutinas.
- Cambios automaticos sobre rutinas.
- Permisos.
- Acceso a datos.
- Recurrencia sin base estructurada.
- Creacion de ejercicios durante generacion runtime.

## 9. Estrategia de Historial

El historial debe ser una linea de tiempo tipificada, no una lista de notas libres. Debe preservar contexto suficiente para que el entrenador y la IA entiendan cambios relevantes sin reinterpretar todo el sistema.

### Eventos historicos a registrar

- Alumno creado.
- Perfil fitness actualizado.
- Restriccion agregada, modificada o removida.
- Lesion anterior registrada como contexto fitness.
- Observacion del entrenador agregada.
- Rutina creada.
- Rutina generada por IA.
- Rutina aprobada.
- Rutina publicada/entregada.
- PDF/Excel generado.
- Token web creado, usado, expirado o revocado.
- Feedback recibido.
- Molestia reportada.
- Molestia clasificada como aislada, en observacion, recurrente o desestimada.
- Recomendacion IA generada.
- Recomendacion revisada, descartada o aplicada manualmente.
- Ejercicio propuesto por usuario.
- Ejercicio aprobado/rechazado/activado/inactivado.

### Auditoria

Cada evento debe conservar:

- fecha
- alumno_id cuando aplique
- user_id cuando aplique
- origen_modulo
- entidad_tipo
- entidad_id
- resumen legible
- metadata minima

No guardar payloads IA completos con datos sensibles salvo necesidad explicita. Preferir resumen, estado y referencias.

### Preservacion de contexto historico

- Rutinas aprobadas/publicadas guardan snapshot.
- Feedback queda asociado a rutina y, si aplica, dia/ejercicio.
- Molestias se estructuran por zona, intensidad, momento y ejercicio asociado.
- Recomendaciones IA quedan como entidades revisables.
- Cambios en catalogo no alteran rutinas pasadas.
- Comentarios libres complementan, pero no reemplazan campos estructurados.

## 10. Estrategia de Exportaciones

### PDF

Contenido:

- Nombre del alumno.
- Nombre de rutina.
- Objetivo.
- Dias/sesiones.
- Ejercicios.
- Series.
- Repeticiones.
- Descansos.
- Observaciones.
- Instrucciones basicas del ejercicio desde snapshot.

Queda fuera:

- Historial completo.
- Comentarios internos sensibles.
- Logs IA.
- Datos de otros alumnos.
- Informacion no aprobada.

Reglas:

- Solo desde rutina aprobada/publicada.
- Siempre desde snapshot.
- Plantilla cerrada en MVP.

### Excel

Contenido:

- Una hoja o estructura simple con rutina completa.
- Columnas: dia, orden, ejercicio, grupo muscular, equipamiento, series, repeticiones, descanso, observaciones.
- Datos de alumno minimos.

Queda fuera:

- Personalizacion avanzada.
- Macros.
- Historial completo.
- Logs IA.
- Analitica.

Reglas:

- Exportacion acotada.
- Siempre desde snapshot.
- Debe ser usable en Excel/Google Sheets sin depender de macros.

### Enlace web

Contenido:

- Rutina aprobada/publicada.
- Vista mobile-first.
- Datos minimos de alumno y entrenador para confirmar identidad.
- Ejercicios, parametros y observaciones.
- Acceso a formulario de feedback.

Queda fuera:

- Historial completo.
- Informacion de otros alumnos.
- Catalogo completo.
- Panel interno.
- Logs IA.

Reglas:

- Token no adivinable.
- Expirable y revocable.
- Primer acceso controlado.
- No requiere app mobile.
- No debe tener scroll horizontal ni requerir zoom manual en celular.

## 11. Riesgos Tecnicos

| Riesgo | Clasificacion | Impacto | Mitigacion |
| --- | --- | --- | --- |
| Alcance excesivo del MVP | Alto | Retraso y producto dificil de validar | Mantener fuera app mobile, pagos, chat, wearables, marketplace y personalizacion avanzada |
| IA propone ejercicios fuera de catalogo | Alto | Rutinas invalidas y perdida de confianza | Respuesta por IDs, schema estricto, validacion backend, rechazo de salida invalida |
| Catalogo inicial insuficiente | Alto | IA funciona tecnicamente pero genera rutinas pobres | Definir cobertura minima y reporte antes de habilitar IA comercialmente |
| Catalogo contaminado por IA | Alto | Mala calidad persistida | Admin-only, fuentes, estado pendiente, revision humana obligatoria |
| Rutinas historicas cambian por edicion del catalogo | Alto | Perdida de trazabilidad | Snapshots al aprobar/publicar y exports desde snapshot |
| Permisos cross-tenant defectuosos | Alto | Exposicion de datos | Guards por tenant/ownership, tests de integracion y E2E |
| Producto parece medico | Alto | Riesgo legal/confianza | Lenguaje fitness, no "sintomas", no diagnostico, decision humana |
| Token web expone informacion | Medio | Acceso no deseado a rutina | Tokens hash, expiracion, revocacion, acceso limitado, no exponer historial |
| PDF/Excel consumen demasiado tiempo | Medio | Retrasa MVP | Plantillas cerradas, sin personalizacion avanzada |
| Feedback bajo | Medio | Historial pierde valor | Formulario mobile-first de menos de un minuto, campos estructurados |
| Costos/latencia IA | Medio | Mala UX o costo variable | Timeouts, modelos economicos, limites por tenant, logging de uso |
| Sobreingenieria del historial | Medio | Retraso tecnico | Timeline tipificado simple, no event sourcing completo |
| Dependencia de URLs externas | Bajo | Media rota | Tolerar URLs vacias/rotas, fallback visual |
| Falta de monitoreo inicial | Bajo/Medio | Errores invisibles | Sentry, logs estructurados, metricas basicas |

Riesgos futuros:

- Necesidad de workers para IA/PDF si crece concurrencia.
- Multi-tenant avanzado si aparecen gimnasios con estructuras complejas.
- Versionado mas sofisticado de rutinas.
- App mobile y auth de alumno si se valida adopcion.
- Costos crecientes de IA si no se agregan limites y cache.

## 12. Checklist de Cierre de Fase 0

La Fase 0 queda cerrada cuando todos estos items esten completos:

- [x] PRD identificado como fuente de verdad principal.
- [x] CTO Review considerada como validacion tecnica y recomendaciones.
- [x] Lead Engineer Plan considerado como plan ejecutable.
- [x] Contradiccion app mobile vs web Fase 1 resuelta a favor del PRD actualizado.
- [x] Stack recomendado definido.
- [x] Frontend definido.
- [x] Backend definido.
- [x] Base de datos definida.
- [x] ORM definido.
- [x] Auth definido a nivel de estrategia.
- [x] Hosting definido a nivel recomendado.
- [x] Storage multimedia excluido del MVP.
- [x] PDF definido desde snapshot.
- [x] Excel definido desde snapshot.
- [x] Servicio IA definido con AI Orchestrator.
- [x] Monitoreo inicial definido.
- [x] Variables de entorno iniciales listadas.
- [x] Modulos principales definidos.
- [x] Dependencias entre modulos definidas.
- [x] Modelo de datos MVP definido a nivel arquitectura.
- [x] Estados de rutinas definidos.
- [x] Estados de ejercicios definidos.
- [x] Estados de feedback/molestias definidos.
- [x] Estados de tokens definidos.
- [x] Estados de usuarios definidos.
- [x] Estados de recomendaciones IA definidos.
- [x] Roles administrador y entrenador definidos.
- [x] Matriz de permisos inicial definida.
- [x] Reglas de negocio fundamentales documentadas.
- [x] Estrategia IA definida.
- [x] Limites de IA definidos.
- [x] Estrategia de historial definida.
- [x] Estrategia de auditoria definida.
- [x] Estrategia de exportaciones definida.
- [x] Riesgos tecnicos clasificados.
- [x] Mitigaciones principales definidas.

Items que deben cerrarse justo antes de implementar Fase 1:

- [ ] Elegir proveedor final de auth: Supabase Auth o Clerk.
- [ ] Elegir proveedor final de hosting backend: Render, Fly.io o Railway.
- [ ] Elegir proveedor IA y modelos concretos.
- [ ] Definir cobertura minima numerica del catalogo inicial.
- [ ] Definir si PDF se genera on demand o se persiste.
- [ ] Definir convencion exacta de tenants para entrenador independiente vs gimnasio.

Con estos puntos resueltos, el equipo puede comenzar la implementacion de Fase 1 sin reinterpretar decisiones fundamentales.

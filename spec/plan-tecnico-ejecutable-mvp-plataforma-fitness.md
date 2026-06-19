# Plan tecnico ejecutable - MVP Plataforma Fitness

## 1. Resumen Tecnico

Se esta construyendo una plataforma SaaS B2B para entrenadores, incluyendo personal trainers y profesores de gimnasio. Ambos se modelan como el mismo rol operativo: entrenador. El objetivo del MVP es centralizar alumnos, perfiles deportivos, restricciones, historial, rutinas, feedback y generacion asistida de borradores de rutina con IA.

El valor principal no es "hacer rutinas con IA", sino construir un historial deportivo inteligente del alumno para que el entrenador tome mejores decisiones. La regla central del producto es: la IA propone, el entrenador decide.

Modulos principales:

- Autenticacion y roles internos.
- Gestion de usuarios internos: administrador y entrenador.
- Gestion de alumnos y perfil deportivo.
- Catalogo cerrado de ejercicios.
- Propuestas y curado de ejercicios.
- Generacion asistida de rutinas con IA.
- Editor, aprobacion y publicacion de rutinas.
- Entrega por PDF, Excel y enlace web mobile-first.
- Feedback del alumno.
- Historial deportivo.
- Alertas internas por molestias reportadas.
- Exportaciones.

Partes de mayor complejidad:

- Mantener el catalogo como unica fuente valida para IA.
- Validar que la IA devuelva solo ejercicios aprobados y activos.
- Guardar snapshots de ejercicios en rutinas aprobadas para preservar historico.
- Modelar molestias reportadas como eventos estructurados, no como texto libre.
- Definir recurrencia de molestias con reglas simples y auditables.
- Controlar acceso a rutinas por token sin exponer historial completo.
- Evitar lenguaje medico o comportamiento que parezca diagnostico.

Riesgos inmediatos:

- Intentar construir demasiado en el primer ciclo.
- Catalogo inicial insuficiente para que la IA genere rutinas utiles.
- Respuestas de IA invalidas, incompletas o con ejercicios fuera de catalogo.
- Exportaciones PDF/Excel consumiendo mas tiempo del esperado.
- Feedback del alumno con baja adopcion.
- Confundir molestias fitness con diagnostico medico.
- Sobreingenieria en multi-tenant, notificaciones, app mobile o automatizaciones.

Contradiccion relevante detectada:

- El PRD actualizado define que la aplicacion mobile del alumno queda fuera de Fase 1, aunque algunos casos de uso heredados mencionan app o vinculacion de cuenta. Impacto tecnico: construir app mobile duplicaria QA, autenticacion, soporte y estados de acceso. Alternativa: implementar solo enlace web mobile-first, PDF y Excel en Fase 1. Decision final: respetar el PRD actualizado y no construir app mobile en MVP.

## 2. Dependencias

Dependencias funcionales:

- Usuarios y roles deben existir antes de gestionar alumnos.
- Alumnos deben existir antes de crear rutinas.
- Catalogo aprobado debe existir antes de habilitar generacion de rutinas con IA.
- Rutinas aprobadas deben existir antes de exportar PDF/Excel o generar enlaces de entrega.
- Feedback debe asociarse a alumno y rutina.
- Historial depende de eventos generados por alumnos, rutinas, feedback y molestias.
- Recomendaciones por molestias recurrentes dependen de feedback estructurado acumulado.

Dependencias tecnicas:

- Base de datos y modelo de permisos.
- Autenticacion para usuarios internos.
- Validacion de formularios y enums.
- Estados de entidades: ejercicio, rutina, token, recomendacion.
- Capa de IA con prompts versionados y salida JSON validada.
- Generador de PDF y Excel.
- Tokens no adivinables para acceso web del alumno.

Orden correcto de construccion:

1. Base tecnica, auth, roles y permisos.
2. Modelo de datos inicial.
3. Alumnos y perfil deportivo.
4. Historial simple.
5. Catalogo de ejercicios y estados de validacion.
6. Carga/curado inicial de catalogo.
7. Rutinas manuales y snapshots.
8. Entrega por enlace web.
9. PDF y Excel acotados.
10. Feedback mobile-first.
11. IA para generar borradores de rutina.
12. Reglas de molestias recurrentes y alertas internas.

## 3. Plan de Implementacion

### Fase 0 - Preparacion tecnica

Objetivo: cerrar decisiones tecnicas y evitar ambiguedad antes de escribir codigo.

Entregables:

- Stack definido.
- Modelo de datos MVP.
- Estados de rutina, ejercicio, token y feedback.
- Reglas de permisos.
- Criterios de cobertura minima del catalogo.
- Criterios de aceptacion por flujo.

Dependencias: PRD y revision CTO.

Criterios de finalizacion:

- Se puede implementar cada modulo sin reinterpretar el producto.
- Queda claro que app mobile, pagos, wearables, chat y marketplace estan fuera del MVP.

### Fase 1 - Base de plataforma

Objetivo: tener una aplicacion operable por administrador y entrenadores.

Entregables:

- Proyecto frontend y backend.
- Conexion a PostgreSQL.
- Migraciones iniciales.
- Login de usuarios internos.
- Seed o proceso controlado para primer administrador.
- Signup publico de entrenadores con estado pendiente de aprobacion.
- Listado admin de entrenadores pendientes.
- Aprobacion y rechazo admin de entrenadores registrados.
- Roles: admin, entrenador.
- Layout base de dashboard.

Dependencias: Fase 0.

Criterios de finalizacion:

- Un admin puede existir sin registro publico.
- Un entrenador puede registrarse desde signup publico y queda pendiente de aprobacion.
- Un admin puede aprobar o rechazar entrenadores pendientes.
- Un admin puede crear otros usuarios internos permitidos.
- Los usuarios solo ven datos permitidos por rol y tenant.

### Fase 2 - Alumnos e historial

Objetivo: centralizar el perfil deportivo del alumno.

Entregables:

- CRUD de alumnos.
- Perfil deportivo: objetivo, experiencia, edad, peso, altura.
- Registro de lesiones anteriores, restricciones, molestias recurrentes y observaciones.
- Timeline inicial de historial.
- Eventos automaticos al crear o modificar datos relevantes.

Dependencias: Fase 1.

Criterios de finalizacion:

- Un entrenador puede crear, editar y consultar sus alumnos.
- El historial muestra eventos basicos con fecha, origen y tipo.

### Fase 3 - Catalogo de ejercicios

Objetivo: crear la fuente controlada para rutinas e IA.

Entregables:

- CRUD de ejercicios.
- Estados: pendiente, aprobado, rechazado, activo, inactivo.
- Campos completos del PRD.
- Propuestas de ejercicios por entrenadores.
- Aprobacion exclusiva por admin/responsable interno.
- Reporte de cobertura del catalogo.
- Seed o carga inicial de ejercicios.

Dependencias: Fase 1.

Criterios de finalizacion:

- Solo ejercicios aprobados y activos pueden ser usados en rutinas.
- El sistema informa faltantes de cobertura por grupo muscular, objetivo, nivel, equipamiento y patron.

### Fase 4 - Rutinas manuales

Objetivo: permitir crear rutinas sin depender todavia de IA.

Entregables:

- Crear rutina para alumno.
- Agregar dias/sesiones.
- Agregar ejercicios desde catalogo.
- Editar series, repeticiones, descansos y observaciones.
- Estados: borrador, aprobada, publicada, archivada.
- Snapshot al aprobar/publicar.

Dependencias: Fases 2 y 3.

Criterios de finalizacion:

- Una rutina aprobada no cambia si luego cambia el catalogo.
- No se puede entregar una rutina no aprobada.

### Fase 5 - Entrega al alumno

Objetivo: entregar rutinas con baja friccion.

Entregables:

- Enlace web mobile-first por token.
- Confirmacion minima de identidad antes de ver la rutina.
- Revocacion de acceso.
- PDF desde rutina aprobada.
- Excel desde rutina aprobada.

Dependencias: Fase 4.

Criterios de finalizacion:

- El alumno puede ver la rutina desde celular sin app, sin zoom manual y sin scroll horizontal.
- PDF y Excel se generan desde snapshots.

### Fase 6 - Feedback

Objetivo: alimentar el historial deportivo.

Entregables:

- Formulario web mobile-first.
- Dificultad percibida.
- Cumplimiento.
- Molestias si/no.
- Zona, intensidad, momento, ejercicio asociado y comentario.
- Registro en historial.
- Vista para entrenador.

Dependencias: Fases 2, 4 y 5.

Criterios de finalizacion:

- El alumno puede enviar feedback desde el enlace.
- Toda molestia reportada genera un evento visible para el entrenador.

### Fase 7 - IA de rutinas

Objetivo: generar borradores de rutina bajo control del entrenador.

Entregables:

- Prompt versionado.
- Constructor de contexto.
- Schema JSON de respuesta.
- Validacion de IDs de ejercicios.
- Creacion de rutina en estado borrador_ia.
- Motivo de seleccion por ejercicio.
- Manejo de error por catalogo insuficiente.

Dependencias: Fases 2, 3 y 4.

Criterios de finalizacion:

- La IA no puede usar ejercicios inexistentes, pendientes o inactivos.
- El entrenador puede editar y aprobar antes de entregar.

### Fase 8 - Molestias recurrentes y alertas

Objetivo: convertir feedback acumulado en informacion accionable.

Entregables:

- Reglas de recurrencia.
- Estados: aislada, en observacion, recurrente, desestimada.
- Bandeja interna de alertas.
- Recomendacion IA solo como texto de apoyo cuando hay recurrencia.

Dependencias: Fase 6.

Criterios de finalizacion:

- El sistema no diagnostica ni prescribe.
- La IA sugiere revisar, no modifica rutinas.

## 4. Backlog Inicial

| Item | Descripcion | Prioridad | Complejidad | Riesgo |
| --- | --- | --- | --- | --- |
| Setup de proyecto | Frontend, backend, DB, lint, tests base | P0 | Media | Medio |
| Primer admin | Seed o consola para crear administrador inicial | P0 | Baja | Bajo |
| Auth interna | Login y sesiones para admin/entrenador | P0 | Media | Medio |
| RBAC basico | Permisos por rol y tenant | P0 | Media | Alto |
| CRUD usuarios internos | Admin gestiona entrenadores y administradores permitidos | P0 | Media | Medio |
| CRUD alumnos | Alta, edicion y consulta | P0 | Media | Medio |
| Perfil deportivo | Objetivo, experiencia, restricciones, observaciones | P0 | Media | Medio |
| Historial timeline | Eventos tipificados por alumno | P0 | Media | Medio |
| CRUD catalogo | Ejercicios con campos completos | P0 | Alta | Alto |
| Estados de ejercicios | Pendiente/aprobado/rechazado/activo/inactivo | P0 | Media | Alto |
| Propuesta de ejercicios | Entrenador propone, admin revisa | P0 | Media | Medio |
| Cobertura catalogo | Reporte por grupo, objetivo, nivel, equipamiento y patron | P0 | Media | Alto |
| Rutinas manuales | Crear dias y ejercicios desde catalogo | P0 | Alta | Alto |
| Snapshots | Congelar datos al aprobar/publicar | P0 | Media | Alto |
| Estados de rutina | Borrador, aprobada, publicada, archivada | P0 | Media | Alto |
| Enlace web alumno | Token, acceso mobile-first y revocacion | P0 | Alta | Alto |
| PDF | Exportacion acotada desde snapshot | P0 | Media | Medio |
| Excel | Exportacion acotada desde snapshot | P0 | Media | Medio |
| Feedback web | Formulario simple asociado a rutina | P0 | Media | Alto |
| IA rutinas | Generar borrador con catalogo aprobado | P0 | Alta | Alto |
| Validacion IA | Schema, IDs existentes, errores funcionales | P0 | Alta | Alto |
| Motivo seleccion | Justificacion por ejercicio | P0 | Media | Medio |
| Alertas internas | Mostrar molestias reportadas al entrenador | P1 | Media | Medio |
| Reglas recurrencia | Aislada/en observacion/recurrente/desestimada | P1 | Media | Medio |
| Recomendacion IA molestia | Texto de apoyo ante recurrencia | P1 | Media | Alto |
| Metricas basicas | Rutinas creadas, entregas, feedback recibido | P1 | Baja | Bajo |
| Plantillas rutina | Reutilizacion de estructuras | P2 | Media | Medio |
| Clonado rutina | Duplicar rutina para otro alumno | P2 | Media | Medio |
| Email transaccional | Envio de links/codigos | P2 | Media | Medio |

## 5. Modulos del Sistema

### Autenticacion y permisos

Responsabilidad: controlar acceso de usuarios internos.

Datos: usuarios, roles, tenant, estado, sesiones.

Dependencias: base de datos, proveedor auth o auth propia robusta.

### Usuarios internos

Responsabilidad: administrar admins, entrenadores y aprobacion de entrenadores registrados publicamente.

Datos: nombre, email, rol, estado, tenant, aprobacion, rechazo.

Dependencias: autenticacion y permisos.

### Alumnos

Responsabilidad: gestionar datos personales y perfil deportivo.

Datos: nombre, apellido, email, edad, peso, altura, experiencia, objetivo, restricciones, lesiones anteriores, observaciones.

Dependencias: usuarios internos y tenant.

### Historial

Responsabilidad: mantener linea de tiempo del alumno.

Datos: eventos tipificados, fecha, origen, entidad relacionada, resumen.

Dependencias: alumnos, rutinas, feedback, recomendaciones.

### Catalogo de ejercicios

Responsabilidad: mantener fuente cerrada de ejercicios.

Datos: nombre, descripcion, URLs, grupo muscular, equipamiento, dificultad, objetivos, patrones, beneficios, precauciones, fuentes, estado, activo.

Dependencias: usuarios, permisos, IA admin si se implementa curado asistido.

### Rutinas

Responsabilidad: crear, editar, aprobar, publicar y archivar rutinas.

Datos: rutina, dias, ejercicios, parametros, observaciones, estado, snapshots.

Dependencias: alumnos, catalogo, usuarios.

### IA

Responsabilidad: preparar contexto, invocar modelo, validar salida y convertir propuestas en borradores o recomendaciones.

Datos: prompts versionados, request/respuesta resumida, errores, resultado validado.

Dependencias: alumnos, historial, catalogo, rutinas.

### Exportaciones

Responsabilidad: generar PDF y Excel.

Datos: formato generado, fecha, rutina origen, snapshot usado.

Dependencias: rutinas aprobadas/publicadas.

### Acceso web alumno

Responsabilidad: permitir acceso limitado por token.

Datos: token, expiracion, usos, canal, revocacion, rutina asociada.

Dependencias: rutinas aprobadas, alumnos.

### Feedback

Responsabilidad: capturar percepcion del alumno y molestias reportadas.

Datos: dificultad, cumplimiento, molestia, zona, intensidad, momento, ejercicio asociado, comentario.

Dependencias: acceso web, rutina, alumno.

### Alertas y recomendaciones

Responsabilidad: mostrar eventos que requieren revision del entrenador.

Datos: tipo, severidad, contexto, estado, recomendacion IA opcional.

Dependencias: feedback, historial, reglas de recurrencia, IA.

## 6. Diseno de Base de Datos

Entidades principales:

- Tenant.
- User.
- Alumno.
- AlumnoPerfilFitness.
- Ejercicio.
- EjercicioFuenteReferencia.
- Rutina.
- RutinaDia.
- RutinaEjercicio.
- RutinaSnapshot.
- AccessToken.
- Feedback.
- FeedbackMolestia.
- HistorialEvento.
- RecomendacionIA.
- Exportacion.
- AILog.

Relaciones:

- Un tenant tiene muchos usuarios, alumnos y ejercicios.
- Un usuario entrenador puede gestionar muchos alumnos segun permisos.
- Un alumno tiene un perfil fitness y muchos eventos de historial.
- Un alumno tiene muchas rutinas.
- Una rutina tiene muchos dias.
- Un dia tiene muchos ejercicios.
- Un ejercicio de rutina referencia al catalogo, pero tambien guarda snapshot.
- Un feedback pertenece a alumno y rutina, opcionalmente a dia y ejercicio.
- Un access token pertenece a una rutina y puede registrar usos.
- Una recomendacion IA pertenece a alumno y puede relacionarse con feedback, ejercicio o rutina.

Problemas futuros a prevenir:

- No depender del catalogo vivo para rutinas historicas.
- No guardar todo el historial como texto libre.
- No mezclar restricciones declaradas por entrenador con molestias reportadas por alumno.
- No permitir que la IA inserte registros sin validacion.
- No modelar "sintomas" como entidad; usar molestias o sensaciones reportadas.
- No permitir acceso cross-tenant por errores de ownership.
- No usar JSONB para reemplazar el modelo central.

## 7. Estrategia de IA

Implementar primero:

1. Validacion estricta de catalogo aprobado y activo.
2. Prompt versionado para generar rutina.
3. Schema JSON de respuesta.
4. Validacion de IDs contra base de datos.
5. Creacion de borrador editable.
6. Motivo de seleccion por ejercicio.

Postergar:

- Recomendaciones avanzadas por molestias.
- Resumen sofisticado de historial.
- Optimizacion de costos por caching.
- Asistentes conversacionales.
- Analisis semantico profundo de comentarios libres.

Donde usar prompts:

- Generacion de borrador de rutina.
- Motivo de seleccion.
- Resumen breve de historial para el entrenador.
- Redaccion de sugerencia cuando una regla detecta molestia recurrente.
- Generacion/enriquecimiento de catalogo solo en flujo administrativo.

Donde usar reglas:

- Permisos.
- Estados.
- Validacion de ejercicios activos/aprobados.
- Recurrencia inicial de molestias.
- Expiracion y revocacion de tokens.
- Bloqueo de entrega si la rutina no esta aprobada.
- Rechazo de respuestas IA con IDs invalidos.

Partes que no deberian resolverse mediante IA:

- Diagnosticos o tratamientos.
- Decidir cambios automaticos de rutina.
- Aprobar ejercicios.
- Determinar permisos.
- Crear ejercicios durante generacion runtime de rutinas.
- Clasificar recurrencia sin datos estructurados.
- Generar rutinas si el catalogo no tiene cobertura suficiente.

## 8. Estrategia para Codex

Regla operativa: nunca pedir a Codex construir todo el sistema de una sola vez. Cada tarea debe tocar pocos archivos, tener contexto claro y criterios verificables.

### Tarea 1 - Inicializar proyecto

Objetivo: crear estructura base frontend/backend, TypeScript, DB y scripts.

Contexto necesario: stack elegido, convenciones, rutas.

Criterios de aceptacion:

- Proyecto instala dependencias.
- Hay script de dev/test/lint.
- Backend conecta a DB local o configurada.

Dependencias: ninguna.

### Tarea 2 - Modelo y migraciones base

Objetivo: crear entidades principales sin UI compleja.

Contexto necesario: modelo de datos MVP y enums.

Criterios de aceptacion:

- Migraciones aplican correctamente.
- Existen constraints basicos e indices de ownership.

Dependencias: Tarea 1.

### Tarea 3 - Auth y roles

Objetivo: login interno y control de roles.

Contexto necesario: roles, creacion primer admin, reglas de acceso.

Criterios de aceptacion:

- Admin seeded puede iniciar sesion.
- Rutas protegidas rechazan usuarios no autorizados.

Dependencias: Tareas 1 y 2.

### Tarea 4 - Usuarios internos

Objetivo: soportar signup publico de entrenadores con aprobacion admin y administracion interna de usuarios permitidos.

Contexto necesario: campos de usuario, estados, permisos, aprobacion y rechazo.

Criterios de aceptacion:

- Entrenador puede registrarse desde signup publico.
- Entrenador registrado queda en estado pendiente de aprobacion.
- Entrenador pendiente no accede al dashboard ni a datos privados.
- Admin ve entrenadores pendientes.
- Admin puede aprobar o rechazar entrenadores.
- Entrenador aprobado queda activo.
- Entrenador rechazado no accede al sistema.
- Admin crea, edita y desactiva usuarios internos permitidos.
- No hay registro publico de administradores.

Dependencias: Tarea 3.

### Tarea 5 - Alumnos

Objetivo: CRUD de alumnos y perfil fitness.

Contexto necesario: campos del PRD y ownership.

Criterios de aceptacion:

- Entrenador crea y edita alumnos propios.
- Se validan objetivo y experiencia.

Dependencias: Tarea 3.

### Tarea 6 - Historial simple

Objetivo: registrar eventos relevantes del alumno.

Contexto necesario: tipos de evento y entidades origen.

Criterios de aceptacion:

- Crear alumno genera evento.
- Editar restricciones genera evento.
- Timeline se consulta por alumno.

Dependencias: Tarea 5.

### Tarea 7 - Catalogo

Objetivo: CRUD de ejercicios con estados.

Contexto necesario: campos completos, permisos, estados.

Criterios de aceptacion:

- Admin puede aprobar/activar.
- Entrenador solo propone.
- Ejercicios pendientes no aparecen como seleccionables para rutinas.

Dependencias: Tarea 3.

### Tarea 8 - Cobertura de catalogo

Objetivo: mostrar reporte de suficiencia.

Contexto necesario: criterios minimos por categoria.

Criterios de aceptacion:

- Reporte distingue suficiente, bajo minimo y sin cobertura.

Dependencias: Tarea 7.

### Tarea 9 - Rutinas manuales

Objetivo: crear rutinas desde catalogo.

Contexto necesario: estados, dias, ejercicios, parametros.

Criterios de aceptacion:

- Rutina se guarda como borrador.
- Solo usa ejercicios aprobados y activos.

Dependencias: Tareas 5 y 7.

### Tarea 10 - Aprobacion y snapshots

Objetivo: congelar datos al aprobar/publicar.

Contexto necesario: campos de snapshot.

Criterios de aceptacion:

- Al editar catalogo, la rutina aprobada no cambia.

Dependencias: Tarea 9.

### Tarea 11 - Enlace web alumno

Objetivo: acceso por token a rutina aprobada.

Contexto necesario: reglas de token, expiracion, revocacion.

Criterios de aceptacion:

- Token invalido/expirado/revocado no accede.
- Vista mobile-first no expone historial completo.

Dependencias: Tarea 10.

### Tarea 12 - Exportaciones

Objetivo: PDF y Excel desde snapshot.

Contexto necesario: formato minimo de rutina.

Criterios de aceptacion:

- Solo rutinas aprobadas/exportables.
- PDF y Excel contienen datos consistentes.

Dependencias: Tarea 10.

### Tarea 13 - Feedback

Objetivo: formulario mobile-first y registro asociado.

Contexto necesario: campos estructurados y lenguaje permitido.

Criterios de aceptacion:

- Si hay molestia, zona/intensidad/momento se vuelven obligatorios.
- Feedback crea evento de historial.

Dependencias: Tarea 11.

### Tarea 14 - IA de rutinas

Objetivo: generar borrador editable.

Contexto necesario: prompt, schema, catalogo permitido, perfil alumno.

Criterios de aceptacion:

- Respuesta invalida se rechaza.
- IDs se validan contra catalogo activo.
- Se crea rutina en borrador_ia.

Dependencias: Tareas 5, 7, 9.

### Tarea 15 - Reglas de molestias

Objetivo: detectar recurrencia inicial.

Contexto necesario: umbrales y estados.

Criterios de aceptacion:

- 1 reporte: aislada.
- 2 reportes similares: en observacion.
- 3 o mas reportes similares: recurrente.
- Si deja de aparecer, puede pasar a desestimada.

Dependencias: Tarea 13.

## 9. Plan de Testing

Que probar:

- Auth y permisos por rol.
- Ownership por tenant/entrenador.
- CRUD de alumnos.
- Catalogo y estados.
- Bloqueo de ejercicios pendientes/inactivos.
- Creacion, edicion, aprobacion y publicacion de rutinas.
- Snapshots.
- Exportaciones PDF/Excel.
- Acceso por token.
- Feedback mobile-first.
- Validacion de molestias.
- IA con respuestas validas e invalidas.
- Catalogo insuficiente.

Cuando probar:

- Unit tests en reglas de dominio: permisos, estados, recurrencia, validaciones.
- Integration tests en API: alumnos, catalogo, rutinas, feedback.
- E2E en flujos criticos: crear alumno, crear rutina, aprobar, compartir, feedback.
- Tests manuales de PDF/Excel por compatibilidad visual.
- Pruebas con casos limite de IA antes de habilitar para usuarios.

Riesgos de regresion:

- Cambios en catalogo afectando rutinas historicas.
- Respuestas IA generando IDs invalidos.
- Tokens exponiendo rutinas incorrectas.
- Entrenador accediendo a alumnos de otro tenant.
- Feedback sin datos obligatorios cuando hay molestia.
- PDF/Excel generados desde datos vivos en lugar de snapshots.

Flujos criticos prioritarios:

1. Admin crea entrenador.
2. Entrenador crea alumno.
3. Admin aprueba ejercicios.
4. Entrenador genera/crea rutina.
5. Entrenador aprueba rutina.
6. Alumno abre enlace web.
7. Alumno envia feedback.
8. Historial se actualiza.
9. IA genera borrador solo con ejercicios aprobados.

## 10. Definicion de MVP Terminado

El MVP puede considerarse terminado cuando un entrenador real puede gestionar alumnos, usar un catalogo aprobado, generar o crear una rutina, aprobarla, entregarla al alumno, recibir feedback y consultar historial sin intervencion tecnica.

Funcionalidades minimas:

- Primer administrador creado por seed o proceso controlado.
- Admin gestiona entrenadores y usuarios internos permitidos.
- Login interno.
- CRUD de alumnos.
- Perfil deportivo con restricciones y observaciones.
- Historial simple.
- Catalogo completo con estados.
- Propuestas de ejercicios por entrenadores.
- Aprobacion de ejercicios por admin.
- Reporte basico de cobertura.
- Rutinas manuales.
- Generacion IA de borrador de rutina usando solo catalogo aprobado.
- Motivo de seleccion por ejercicio.
- Edicion y aprobacion por entrenador.
- Snapshots al aprobar/publicar.
- Enlace web mobile-first.
- PDF y Excel acotados.
- Feedback web.
- Eventos de molestias reportadas.
- Alertas internas basicas.

Criterios de aceptacion:

- Ninguna rutina se entrega sin aprobacion.
- La IA no inventa ejercicios ni consulta internet en runtime.
- El sistema informa catalogo insuficiente.
- La vista alumno funciona en celular.
- PDF/Excel salen desde snapshot.
- Molestias usan lenguaje fitness, no medico.
- El alumno no necesita app mobile.

No necesarias para MVP:

- App mobile del alumno.
- Registro publico.
- Pagos.
- Marketplace.
- Chat.
- Wearables.
- Multi-sucursal avanzado.
- Plantillas avanzadas.
- Personalizacion avanzada de PDF/Excel.
- Notificaciones por WhatsApp/push.
- Diagnosticos, tratamientos o recomendaciones medicas.
- Modelos propios de IA.

## 11. Auditoria Tecnica Final

Que simplificaria:

- Mantener un backend monolitico modular.
- Usar un solo frontend web responsive.
- Usar tokens para alumno en lugar de auth de alumno.
- PDF y Excel con formato cerrado.
- Reglas simples para molestias antes de IA avanzada.
- Catalogo cerrado con estados estrictos.

Que eliminaria:

- App mobile en Fase 1.
- Internet/runtime en generacion de rutinas.
- Edicion avanzada de plantillas.
- Automatizacion de cambios de rutina.
- Multi-tenant complejo mas alla de ownership basico.
- Storage propio de imagenes/videos.

Que dejaria para futuro:

- App mobile.
- Plantillas y clonado.
- Email/WhatsApp avanzado.
- Analitica profunda.
- Integraciones externas.
- Asistente conversacional.
- Reportes comerciales.
- Multi-sucursal avanzado.

Riesgos de sobreingenieria:

- Construir microservicios.
- Crear auth propia compleja.
- Tratar el historial como event sourcing completo.
- Hacer motor de recomendaciones demasiado sofisticado.
- Diseñar para 10.000 entrenadores antes de validar 10.
- Construir una app mobile para resolver un problema que un enlace web resuelve mejor en Fase 1.

Errores comunes:

- Pedir a la IA que "arme todo" sin validar IDs y schema.
- Permitir ejercicios fuera de catalogo.
- No guardar snapshots.
- Mezclar molestias con lenguaje medico.
- Depender del comentario libre para detectar recurrencia.
- No probar permisos entre entrenadores.
- Subestimar PDF/Excel.
- Medir solo rutinas generadas y no feedback recibido.
- Construir canales de entrega antes de validar el flujo core.

## 12. Plan de Construccion para un Fundador Solo

Orden exacto de construccion:

1. Definir stack, modelo y estados.
2. Crear proyecto base.
3. Implementar auth interna y primer admin.
4. Implementar usuarios internos.
5. Implementar alumnos.
6. Implementar historial simple.
7. Implementar catalogo.
8. Cargar catalogo inicial minimo.
9. Implementar aprobacion y reporte de cobertura.
10. Implementar rutinas manuales.
11. Implementar snapshots.
12. Implementar enlace web mobile-first.
13. Implementar PDF.
14. Implementar Excel simple.
15. Implementar feedback.
16. Implementar IA de rutinas.
17. Implementar reglas de molestias.
18. Hacer QA completo con 3 a 5 entrenadores.

Que hacer primero:

- Construir el flujo sin IA: alumno -> catalogo -> rutina manual -> aprobar -> enlace -> feedback -> historial.
- Esto prueba el nucleo del producto y reduce incertidumbre antes de sumar LLM.

Que hacer despues:

- Agregar IA como acelerador de rutina, no como base del sistema.
- Agregar validacion estricta, motivos de seleccion y manejo de catalogo insuficiente.
- Agregar reglas simples de molestias y alertas.

Que evitar:

- App mobile.
- Pagos.
- Automatizaciones complejas.
- Plantillas avanzadas.
- Personalizacion de exportaciones.
- Prompts gigantes.
- Construir para escala alta prematuramente.
- Permitir que la IA escriba directo en entidades aprobadas.

Que validar con usuarios reales antes de continuar:

- Si los entrenadores cargan alumnos sin friccion.
- Si el catalogo cerrado les resulta suficiente.
- Si el borrador IA realmente ahorra tiempo.
- Si el motivo de seleccion aumenta confianza.
- Si el alumno abre el enlace web desde celular.
- Si el alumno completa feedback en menos de un minuto.
- Si PDF y Excel siguen siendo necesarios junto al enlace web.
- Si las alertas de molestias son utiles o generan ruido.
- Si el historial se percibe como valor diferencial.

Decision tecnica recomendada:

Construir un MVP web monolitico modular, con backend API REST, PostgreSQL, TypeScript, validaciones fuertes y una capa de IA aislada. Priorizar integridad de datos, velocidad de entrega y control humano por encima de automatizacion avanzada.

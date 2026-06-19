# Revision CTO - MVP Plataforma Fitness para Entrenadores y Gimnasios

Fecha: 2026-06-04  
Documento revisado: `spec/mvp-plataforma-fitness-entrenadores-prd.md`  
Rol de revision: Software Architect Senior / Technical Lead / CTO
Estado: revision actualizada para Fase 1 de bajo costo: sin app mobile del alumno, con web mobile-first, PDF/Excel, catalogo administrado y propuestas de ejercicios por entrenadores pendientes de revision.

## 1. Resumen Ejecutivo

La idea es viable, comercializable y tiene una propuesta de valor razonable: centralizar el historial deportivo del alumno y asistir al entrenador con IA sin reemplazar su criterio. El principio "La IA propone, el entrenador decide" es correcto y reduce riesgos operativos, legales y de confianza.

El PRD corregido resuelve una ambiguedad importante: el uso de IA para generar/enriquecer ejercicios no forma parte de la generacion de rutinas en runtime. Puede existir como feature controlada para administradores o responsables internos, con estados pendiente/aprobado, fuentes registradas y revision humana obligatoria. Esa decision mejora la viabilidad tecnica del MVP porque evita que la IA busque ejercicios en internet durante la generacion de rutinas y convierte el catalogo aprobado en una fuente cerrada y auditable.

El problema principal era que el PRD describia un MVP amplio. Para una Fase 1 de bajo costo, la decision correcta es no construir app mobile del alumno: usar web mobile-first, PDF y Excel. Esto reduce QA, soporte, autenticacion de alumno y costo operativo, manteniendo la propuesta de valor central.

Mi recomendacion como CTO: aprobar el inicio solo si se reduce el alcance del MVP. El producto no deberia arrancar intentando demostrar todas las capacidades. Debe demostrar primero que los entrenadores:

- Cargan alumnos y restricciones.
- Usan un catalogo cerrado.
- Generan o arman rutinas mas rapido.
- Entregan rutinas por un canal simple.
- Reciben feedback suficiente para que el historial tenga valor.

La opcion de generar borradores de rutina con IA es un requisito imprescindible del MVP para entrenadores, incluyendo personal trainers y profesores de gimnasio como el mismo rol operativo, no una mejora opcional. El producto compite en un mercado donde esa opcion ya es esperada. Esto no significa que la IA cree, apruebe o publique rutinas directamente: el entrenador solicita el borrador, revisa, modifica y decide. Los usos de IA quedan claros: generar/enriquecer catalogo desde administracion, generar borradores de rutina con catalogo validado, explicar motivos de seleccion, resumir historial y redactar recomendaciones por molestias recurrentes. La regla critica es que la IA de rutinas no consulta internet, no crea ejercicios nuevos y no modifica rutinas sin aprobacion.

Riesgo general del proyecto: medio-alto si se construye el PRD completo como MVP; medio si se mantiene IA obligatoria pero estrictamente limitada a ejercicios aprobados en base de datos, catalogo curado, entrega controlada y feedback simple.

Veredicto CTO: aprobado con condicion. La arquitectura de IA queda aceptada con la aclaracion del catalogo administrado. Para Fase 1 recomiendo explicitamente no construir app mobile del alumno; usar enlace web mobile-first, PDF y Excel. La app puede pasar a V2 si se valida adopcion.

### Modificaciones requeridas al MVP luego de esta revision

1. Implementar la generacion/enriquecimiento de catalogo con IA como feature exclusiva para administradores o responsables internos, no para entrenadores comunes.
3. Mantener prohibicion explicita de internet/runtime en generacion de rutinas.
4. Guardar snapshots de ejercicios dentro de rutinas aprobadas para que cambios posteriores del catalogo no alteren rutinas historicas.
5. Permitir que entrenadores propongan ejercicios para nutrir el catalogo, siempre pendientes de revision.
6. Mantener activacion de ejercicios exclusivamente en administradores o responsables internos.
7. No construir app mobile del alumno en Fase 1; usar web mobile-first como canal principal de bajo costo.

## 2. Revision de Alcance

### Clasificacion de funcionalidades

| Funcionalidad | Clasificacion | Comentario CTO |
| --- | --- | --- |
| Login de entrenador/admin | MVP obligatorio | Necesario para cualquier operacion real. Usar proveedor de auth o auth simple robusta. |
| Alta y gestion basica de alumnos | MVP obligatorio | Nucleo del producto. Sin esto no hay valor. |
| Perfil deportivo del alumno | MVP obligatorio | Debe incluir objetivo, experiencia, restricciones, observaciones y datos basicos. |
| Registro de lesiones anteriores y molestias | MVP obligatorio | Valor central, pero redactado como dato fitness preventivo, no medico. |
| Historial del alumno como timeline | MVP obligatorio | Debe existir desde el inicio. Puede ser simple. |
| Catalogo de ejercicios cerrado | MVP obligatorio | Imprescindible para controlar IA y consistencia. |
| ABM/catalogo completo de ejercicios | MVP obligatorio | Los campos definidos en el MVP son necesarios para que la IA seleccione bien. La UI puede ser simple, pero la base debe guardar todos los campos. |
| Imagen/video por URL externa | MVP obligatorio reducido | Correcto para evitar storage propio. Debe tolerar URL vacia o rota. |
| Generacion de borrador de rutina con IA | MVP obligatorio | Requisito core como opcion siempre disponible para entrenadores. Solo usa ejercicios aprobados y activos de base de datos. |
| Motivo de seleccion por ejercicio | MVP obligatorio | Necesario para trazabilidad y confianza. |
| Edicion manual de rutina | MVP obligatorio | El entrenador debe poder corregir todo. |
| Aprobacion antes de entregar | MVP obligatorio | Regla critica de control humano. |
| Exportacion PDF | MVP obligatorio | Canal de baja friccion y esperado por entrenadores. |
| Exportacion Excel | MVP incluido, riesgo medio | Se mantiene segun PRD. Controlar formato y limitar personalizacion inicial. |
| Enlace web de rutina | MVP obligatorio | Mejor canal para alumnos sin app. |
| App del alumno | Post-Fase 1 | No construir en Fase 1 por costo economico, QA y soporte. Validar primero con web mobile-first. |
| Registro del alumno en app | Post-Fase 1 | Depende de app mobile. No necesario para validar Fase 1. |
| Codigo/enlace de acceso web | MVP obligatorio | Necesario para que el alumno acceda sin app mobile. |
| Feedback del alumno via enlace | MVP obligatorio | Debe ser simple y mobile-first. |
| Feedback desde app | Post-Fase 1 | Depende de app mobile. En Fase 1 el feedback va por web mobile-first. |
| Deteccion de recurrencia de molestias | MVP reducido / Post-MVP | Inicialmente reglas simples. IA avanzada despues. |
| Notificaciones al entrenador | MVP reducido | Puede ser bandeja interna o indicador. Email/push post-MVP. |
| Generacion/enriquecimiento de catalogo con IA para administradores | MVP obligatorio administrativo | Feature admin-only. Debe generar registros persistidos, completos, pendientes de validacion, con fuentes, auditoria y aprobacion humana. |
| Propuesta de ejercicios por entrenadores | MVP obligatorio controlado | Permite nutrir catalogo sin perder control. Todo queda pendiente hasta aprobacion admin. |
| Consultar internet en runtime para generar rutinas | Eliminar | La generacion de rutinas debe usar solo base de datos aprobada. |
| Almacenamiento propio multimedia | Eliminar del MVP | Correctamente fuera de alcance. |
| Pagos, marketplace, wearables, chat | Eliminar del MVP | Correctamente fuera de alcance. |

### Funcionalidades imprescindibles

- Gestion de entrenadores/admin.
- Gestion de alumnos.
- Perfil deportivo y restricciones.
- Catalogo inicial de ejercicios aprobado, completo y persistido en base de datos.
- Propuestas de ejercicios por entrenadores con revision admin.
- Opcion obligatoria de generar borrador de rutina con IA usando solo catalogo aprobado en base de datos.
- Constructor/editor manual para revisar y modificar la rutina generada.
- Edicion y aprobacion de rutina.
- Entrega por enlace web y PDF.
- Feedback mobile-first.
- Historial visible del alumno.

### Funcionalidades opcionales

- Plantillas de rutina.
- Clonado de rutinas.
- Notificaciones por email.
- Recomendaciones de ajuste por reglas.
- Dashboard de metricas basicas.

### Funcionalidades a eliminar del MVP

- Enriquecimiento del catalogo para entrenadores comunes o usuarios no administradores.
- Busqueda externa de ejercicios en runtime.
- App mobile del alumno en Fase 1.
- Analisis avanzado de molestias con LLM.
- Multi-sucursal avanzado.
- Biblioteca multimedia propia.

## 3. Riesgos Tecnicos

| Riesgo | Impacto | Probabilidad | Mitigacion |
| --- | --- | --- | --- |
| Alcance excesivo del MVP | Alto | Alta | Mantener fases internas estrictas, priorizar core y evitar personalizaciones en app/Excel durante MVP. |
| La IA propone ejercicios fuera de catalogo | Alto | Media | Forzar seleccion por `ejercicio_id`, validar IDs contra catalogo activo, rechazar respuestas invalidas. |
| Recomendaciones percibidas como diagnostico medico | Alto | Media | Copy legal claro, etiquetas de "informacion fitness", no usar terminos clinicos, decision humana obligatoria. |
| Datos sensibles mal protegidos | Alto | Media | RBAC, cifrado en transito, politicas de acceso por entrenador/gimnasio, auditoria basica. |
| Feedback libre dificil de interpretar | Medio | Alta | Usar campos estructurados para zona, intensidad, momento y ejercicio asociado; texto libre como complemento. |
| Catalogo insuficiente para IA | Alto | Alta | Seed inicial asistido por IA, curado humanamente, con cobertura minima por grupo muscular, objetivo, nivel y equipamiento. |
| Catalogo inicial contaminado por datos malos | Alto | Media | Revision humana obligatoria, deduplicacion, fuentes registradas, estados pendiente/aprobado y reporte de cobertura antes de uso comercial. |
| Exportacion PDF/Excel consume mucho tiempo | Medio | Media | Limitar formatos, plantillas y personalizacion; generar desde snapshot aprobado. |
| Enlace web expone rutinas por token compartible | Medio | Media | Tokens no adivinables, expiracion configurable, revocacion, no exponer historial completo. |
| App del alumno duplica superficie de QA | Alto | Alta | Mantener app simple: consulta de rutinas, vinculacion y feedback; evitar funciones avanzadas en MVP. |
| Versionado de rutinas mal definido | Alto | Media | Estados claros: borrador, aprobada, publicada, archivada; snapshots de rutina entregada. |
| IA costosa o lenta | Medio | Media | Cache de contexto, prompts compactos, modelos economicos, limites por usuario. |
| Falta de trazabilidad de cambios | Medio | Media | Guardar autor, fecha, origen y cambios relevantes en rutina/historial. |
| Dependencia de URLs externas multimedia | Bajo/Medio | Alta | Permitir fallback sin media, validacion opcional de URL, no bloquear rutinas. |

### Complejidades ocultas

- El historial no es solo una lista de notas. Si alimenta IA, necesita eventos tipificados, fechas, origen, relacion con rutina/dia/ejercicio y estado.
- Una rutina entregada no deberia cambiar retroactivamente si se edita el catalogo. Deben guardarse snapshots de nombre, instrucciones y parametros relevantes.
- "Molestia recurrente" requiere una definicion operativa. Sin umbrales, el sistema sera inconsistente.
- La app del alumno no es una simple pantalla adicional: implica auth separada, vinculacion, permisos, soporte, estados offline/parciales y QA movil.
- Excel parece menor, pero suele abrir discusiones de formato, compatibilidad, columnas, idioma y edicion posterior.
- Generar el catalogo inicial con IA antes del lanzamiento reduce trabajo manual, pero exige una etapa real de curacion: fuentes revisadas, nombres normalizados, campos completos, ejercicios duplicados removidos y estado aprobado antes de que la IA de rutinas pueda usarlos.

## 4. Arquitectura Recomendada

### Principio arquitectonico

Construir una aplicacion web modular con backend monolitico bien separado por dominios. No recomiendo microservicios. El producto necesita velocidad, consistencia transaccional y baja complejidad operativa.

### Vista de alto nivel

```text
Entrenador/Admin
      |
      v
+-------------------+        +---------------------+
| Web App           |        | Alumno Web Link     |
| Dashboard         |        | Mobile-first        |
+---------+---------+        +----------+----------+
          |                             |
          v                             v
+--------------------------------------------------+
| Backend API                                      |
| Auth | Alumnos | Catalogo | Rutinas | Feedback   |
| IA Orchestrator | Exportaciones | Notificaciones |
+--------------------------+-----------------------+
                           |
          +----------------+----------------+
          |                                 |
          v                                 v
+-------------------+              +----------------+
| PostgreSQL        |              | LLM Provider   |
| Datos transacc.   |              | Rutinas/analisis|
+-------------------+              +----------------+
          |
          v
+-------------------+
| PDF Renderer      |
| Storage opcional  |
+-------------------+
```

### Frontend

- Web app responsive para entrenador/admin.
- Vista web mobile-first para alumno.
- Un solo sistema de componentes para rutina, reutilizado en dashboard y link alumno.
- El frontend debe estar separado del backend y consumirlo mediante API REST.
- Fase 1 sin app mobile del alumno. Usar vista web mobile-first, reutilizable como base funcional futura.

### Backend

- API REST monolitica modular, independiente del frontend.
- Backend recomendado: Node.js con NestJS y TypeScript.
- Validacion fuerte de permisos y ownership.
- Estados explicitos para rutinas y ejercicios.
- Jobs asincronicos para generacion IA y exportaciones si tardan mas de unos segundos.
- No usar Next.js API routes ni Server Actions como backend principal. Next.js queda reservado para la capa frontend.

### Base de datos

- PostgreSQL.
- UUIDs.
- Indices por `tenant_id`, `entrenador_id`, `alumno_id`, `rutina_id`.
- JSONB solo para datos flexibles de IA o snapshots, no como sustituto del modelo central.

### IA

- Capa `AI Orchestrator` separada del resto del dominio.
- Prompts versionados.
- Salida JSON validada por schema.
- Rechazo de respuestas con ejercicios inexistentes.
- Registro de request/respuesta resumida para auditoria, sin guardar datos innecesarios.

### Almacenamiento de archivos

- MVP: sin storage propio para multimedia.
- PDF generado on demand o guardado temporalmente.
- Si se guarda PDF, usar object storage tipo S3/R2/Supabase Storage.

### Exportacion PDF/Excel

- PDF en MVP.
- Excel en MVP con formato acotado.
- PDF y Excel deben generarse desde snapshot de rutina aprobada, no desde datos vivos del catalogo.

### Autenticacion

- Auth web para admin/entrenador.
- Link alumno por token con acceso limitado.
- Acceso web de alumno por token/codigo, sin registro obligatorio en Fase 1.
- Auth de alumno y vinculacion con cuenta quedan para app mobile en fase posterior.

### Integraciones futuras

- Email transaccional.
- WhatsApp.
- Pagos.
- Wearables.
- Sistemas de gimnasios.

## 5. Diseno Modular

### Usuarios y permisos

Responsable de administradores, entrenadores, roles, estados y pertenencia a tenant/gimnasio. Profesor de gimnasio se modela como entrenador. Debe impedir que un entrenador acceda a alumnos de otro tenant.

### Alumnos

Responsable de datos basicos, perfil deportivo, objetivo, experiencia, restricciones y observaciones. Debe exponer resumen compacto para IA y vista detallada para entrenador.

### Catalogo de ejercicios

Responsable de ejercicios aprobados, grupos musculares, equipamiento, dificultad, patrones de movimiento, multimedia externa y estado activo. Debe ser la unica fuente permitida para rutinas IA.

### Rutinas

Responsable de borradores, edicion, aprobacion, publicacion, dias, ejercicios, parametros, snapshots y versionado minimo.

### Feedback

Responsable de dificultad percibida, cumplimiento, molestias, comentarios, asociacion con rutina/dia/ejercicio y eventos derivados al historial.

### Historial

Responsable de construir la linea de tiempo del alumno: alta, restricciones, rutinas aprobadas, feedback, molestias, observaciones y recomendaciones.

### IA

Responsable de preparar contexto, invocar proveedor LLM, validar salida, registrar resultados y convertir propuestas en borradores o recomendaciones. No debe tener permiso directo para modificar entidades aprobadas.

### Exportaciones

Responsable de PDF y Excel. Debe leer snapshots aprobados para garantizar consistencia.

### Notificaciones

Responsable de alertas internas para entrenador. En MVP puede ser una bandeja simple; email/WhatsApp pueden esperar.

## 6. Modelo de Datos

### Entidades principales

- `Tenant`: gimnasio, organizacion o cuenta del entrenador independiente.
- `User`: admin, entrenador.
- `Alumno`: perfil gestionado por un entrenador/tenant.
- `AlumnoPerfilFitness`: objetivo, experiencia, peso, altura, restricciones y observaciones.
- `Ejercicio`: catalogo controlado.
- `Rutina`: contenedor de una planificacion.
- `RutinaDia`: dia o sesion dentro de una rutina.
- `RutinaEjercicio`: ejercicio asignado con series, repeticiones, descanso y observaciones.
- `RutinaSnapshot`: datos congelados de la rutina aprobada/publicada.
- `Feedback`: respuesta del alumno sobre una rutina o sesion.
- `HistorialEvento`: evento tipificado del alumno.
- `RecomendacionIA`: sugerencia generada por IA pendiente de revision.
- `AccessToken`: token para enlace web, revocable y con expiracion.
- `Exportacion`: registro de PDF/Excel generado.

### Relaciones y cardinalidades

- Un `Tenant` tiene muchos `User`.
- Un `Tenant` tiene muchos `Alumno`.
- Un `User` entrenador puede tener muchos `Alumno`.
- Un `Alumno` tiene muchos `HistorialEvento`.
- Un `Alumno` tiene muchas `Rutina`.
- Una `Rutina` tiene muchos `RutinaDia`.
- Un `RutinaDia` tiene muchos `RutinaEjercicio`.
- Un `RutinaEjercicio` referencia un `Ejercicio`, pero tambien guarda snapshot minimo.
- Un `Alumno` tiene muchos `Feedback`.
- Un `Feedback` puede relacionarse con una `Rutina`, un `RutinaDia` y opcionalmente ejercicios.
- Una `Rutina` puede tener muchas `Exportacion`.
- Una `Rutina` puede tener uno o mas `AccessToken`.

### Decisiones de modelo importantes

- No modelar molestias solo como texto libre. Usar zona, intensidad simple, momento de aparicion, descripcion opcional, fecha y relacion con rutina/ejercicio.
- No usar "sintomas" como concepto principal. Usar "molestias reportadas" o "sensaciones reportadas" para reducir riesgo de interpretacion medica.
- No depender del catalogo vivo para mostrar rutinas historicas. Guardar snapshot.
- Separar restricciones declaradas por entrenador de molestias reportadas por alumno.
- Mantener recomendaciones IA como entidades revisables, no como cambios aplicados.

## 7. Estrategia de IA

### Usos aprobados de IA para el MVP

| Uso de IA | Momento | Estado CTO | Reglas obligatorias |
| --- | --- | --- | --- |
| Generacion/enriquecimiento de ejercicios del catalogo | Admin producto | Aprobado | Feature admin-only, puede consultar fuentes externas, persiste en base de datos, requiere validacion humana. |
| Generacion de borradores de rutina | Runtime producto | MVP obligatorio como opcion | Disponible para entrenadores a solicitud. Solo usa ejercicios aprobados y activos de base de datos, devuelve IDs existentes, queda en borrador. |
| Motivo de seleccion por ejercicio | Runtime producto | Aprobado | Debe referenciar datos concretos del alumno, restricciones, historial o atributos del catalogo. |
| Resumen del historial del alumno | Runtime producto | Aprobado | Debe ser ayuda para el entrenador, no decision automatica. |
| Recomendacion por molestia recurrente | Runtime producto | Aprobado limitado | La recurrencia debe detectarse con reglas/eventos; la IA redacta contexto y sugerencia, no diagnostica ni modifica rutinas. |

Usos no aprobados para el MVP:

- Buscar ejercicios en internet durante la generacion de rutinas.
- Crear ejercicios nuevos durante la generacion de rutinas.
- Activar ejercicios generados por IA sin revision humana.
- Modificar rutinas automaticamente.
- Diagnosticar lesiones o recomendar tratamientos.

### Donde aporta valor

- Generar y completar el catalogo inicial antes del lanzamiento, siempre que haya curacion humana.
- Generar un primer borrador de rutina desde perfil, objetivo, disponibilidad y catalogo.
- Explicar motivo de seleccion por ejercicio.
- Resumir historial del alumno para el entrenador.
- Detectar posibles conflictos entre rutina y restricciones.
- Sugerir alternativas dentro del catalogo.

### Donde no aporta valor suficiente en MVP

- Consultar internet en tiempo real para enriquecer catalogo o generar rutinas durante la operacion normal del producto.
- Reemplazar reglas simples de recurrencia.
- Clasificar libremente molestias sin estructura.
- Decidir cambios automaticos.
- Crear ejercicios nuevos durante la generacion de rutinas.

### Reglas vs LLM

Reglas:

- Solo ejercicios activos y aprobados.
- Estados de rutina.
- Validacion de restricciones explicitas.
- Umbrales iniciales de recurrencia.
- Clasificacion de molestias reportadas por zona, intensidad, momento y ejercicio asociado.
- Permisos.
- Expiracion/revocacion de tokens.

LLM:

- Generacion/enriquecimiento asistido del catalogo, solo desde administracion.
- Composicion inicial de rutina.
- Justificacion textual.
- Resumen de historial.
- Recomendacion redactada para el entrenador.

### Generacion de rutinas

El backend debe enviar al LLM un contexto limitado:

- Datos fitness del alumno.
- Restricciones relevantes.
- Historial resumido.
- Disponibilidad semanal.
- Lista de ejercicios permitidos con IDs y atributos.

La respuesta debe traer IDs existentes. Si el LLM devuelve nombres sin IDs validos, se rechaza o se solicita regeneracion.

### Recomendaciones

Para MVP, recomiendo reglas:

- 1 reporte de molestia: evento aislado.
- 2 reportes similares en corto plazo: en observacion.
- 3 o mas reportes similares: recurrente y alerta al entrenador.
- Si no reaparece durante varias sesiones posteriores: desestimada.

Luego el LLM puede redactar una recomendacion, pero la deteccion debe ser determinista al inicio.

### Clasificacion de molestias reportadas

Recomendacion CTO: no usar "sintomas" como entidad ni etiqueta principal. El producto debe hablar de "molestias reportadas" o "sensaciones reportadas" porque opera en fitness, no en diagnostico medico.

Campos recomendados para MVP:

- Zona: Hombro, Codo, Muneca/mano, Cuello, Espalda alta, Espalda baja/lumbar, Cadera, Rodilla, Tobillo/pie u Otra.
- Intensidad percibida: Leve, Moderada, Alta.
- Momento: Antes de entrenar, Durante el ejercicio, Despues de entrenar, Al dia siguiente.
- Ejercicio asociado: ejercicio de la rutina, No sabe / no esta seguro, No asociado a un ejercicio.
- Comentario libre: complemento, obligatorio solo si la zona es Otra.

La recurrencia no la elige el alumno. La calcula el sistema como Aislada, En observacion, Recurrente o Desestimada.

### Modelos propios

No entrenar modelos propios. No hay datos suficientes, no hay necesidad y agregaria costo. Usar modelos existentes mediante API, prompts versionados y validacion fuerte.

## 8. Escalabilidad

### 10 entrenadores

Arquitectura simple funciona sin problemas. Un backend, PostgreSQL administrado y generacion PDF sin jobs complejos pueden alcanzar.

Riesgo principal: producto, no tecnologia.

### 100 entrenadores

Empiezan a importar:

- Indices por tenant/alumno/rutina.
- Control de costos IA.
- Logs de errores.
- Plantillas para reducir carga manual.
- Jobs para PDF y LLM.

### 1.000 entrenadores

Cuellos de botella probables:

- Generacion IA concurrente.
- Exportaciones PDF.
- Consultas de historial sin indices.
- Busqueda en catalogo.
- Soporte por tokens y enlaces compartidos.

Mitigaciones:

- Cola de jobs.
- Rate limits por tenant.
- Cache de catalogo.
- Observabilidad.
- Separar worker de API.

### 10.000 entrenadores

El producto ya requiere operacion SaaS madura:

- Multi-tenant robusto.
- Auditoria.
- SLOs.
- Monitoreo de costos IA.
- Procesamiento asincronico.
- Eventual separacion de servicios de IA/exportaciones.
- CDN/storage para assets si se incorporan archivos propios.

No disenar desde el dia uno para 10.000 entrenadores. Disenar el modelo y permisos para no bloquear ese crecimiento, pero operar simple.

## 9. Roadmap Tecnico

### Fase 1: MVP funcional reducido

Objetivo: validar que el entrenador gestiona alumnos, crea rutinas y recibe feedback.

Construir:

- Auth admin/entrenador.
- Alumnos.
- Catalogo generado/enriquecido con asistencia de IA desde feature admin-only, curado y persistido en base de datos.
- Propuesta de ejercicios por entrenadores, siempre pendiente de aprobacion.
- Constructor manual de rutina.
- Opcion obligatoria de generar borradores de rutina con IA usando solo ejercicios aprobados de base de datos.
- Edicion/aprobacion.
- Enlace web de rutina.
- PDF.
- Excel acotado.
- Acceso web por codigo/token.
- Feedback web mobile-first.
- Historial simple.

No construir:

- Enriquecimiento de catalogo expuesto a entrenadores comunes o alumnos.
- Busqueda externa durante generacion de rutinas.
- Personalizaciones avanzadas de Excel/PDF.
- App mobile del alumno.
- Registro/login de alumno en app.
- Notificaciones externas.
- Wearables/pagos/chat.

### Fase 2: Optimizacion

- Plantillas y clonado de rutinas.
- Mejora de UX de generacion.
- Reglas de recurrencia.
- Bandeja de alertas.
- Mejoras de PDF.
- Metricas de adopcion.
- Auditoria de ediciones sobre rutinas IA.

### Fase 3: Escalabilidad

- Workers para IA/PDF.
- Rate limiting.
- Observabilidad.
- Multi-tenant avanzado.
- Cache de catalogo.
- Mejor control de costos IA.
- Backups y politicas de retencion.

### Fase 4: Funciones avanzadas

- Experiencia avanzada de app alumno.
- App mobile del alumno si se valida adopcion.
- Vinculacion avanzada, revinculacion y soporte multi-dispositivo.
- Exportaciones avanzadas y plantillas personalizables.
- WhatsApp/email avanzado.
- Analitica.
- Asistente conversacional.
- Integraciones con pagos o sistemas de gimnasios.

## 10. Stack Tecnologico

### Recomendacion pragmatica

Frontend:

- Next.js.
- TypeScript.
- Componentes compartidos para rutina.
- Consumo del backend mediante API REST.

Backend:

- Node.js con NestJS.
- TypeScript end-to-end.
- API REST monolitica modular.
- OpenAPI/Swagger para documentar contrato entre frontend y backend.

Base de datos:

- PostgreSQL.
- Prisma o Drizzle como ORM.

Hosting:

- Vercel para frontend si se usa Next.js.
- Render/Fly.io/Railway para backend.
- Supabase puede ser opcion pragmatica para Postgres, Auth y Storage futuro.

Autenticacion:

- Supabase Auth, Clerk o Auth.js.
- Para MVP, evitar construir auth propia salvo que haya motivo fuerte.

IA:

- API de modelos existentes.
- Salida estructurada con schema.
- Logs y limites por tenant.

PDF:

- Generacion server-side con HTML a PDF o libreria de PDF.
- Priorizar consistencia visual antes que formato complejo.

Excel:

- MVP con libreria tipo ExcelJS o equivalente, manteniendo una plantilla inicial cerrada.

Almacenamiento:

- MVP sin storage propio para media.
- Object storage para PDFs si se decide persistirlos.

### Stack preferido si el equipo va a usar Codex intensivamente

- Next.js + TypeScript.
- NestJS + TypeScript para backend API REST.
- PostgreSQL + Prisma.
- Tailwind o sistema de componentes simple.
- OpenAPI/Swagger para contrato REST.
- No usar API routes/server actions de Next.js como backend principal.
- Zod para validacion de formularios y respuestas IA.
- Playwright para flujos criticos.

Justificacion: mantiene TypeScript end-to-end y facilita generacion asistida por IA, pero conserva una separacion clara entre frontend y backend. La API REST permite que el backend sea consumido luego por una app mobile, integraciones externas o clientes internos sin depender del ciclo de vida de Next.js.

## 11. Auditoria de Producto

### Que me preocupa

- El PRD llama MVP a un producto con demasiadas superficies.
- La app del alumno contradice parcialmente la baja friccion buscada. Si el alumno no debe estar obligado a instalar app, construir app primero no es la mejor inversion.
- La deteccion de molestias puede ser interpretada como salud/medicina si no se cuida el lenguaje.
- El catalogo inicial asistido por IA es razonable, pero si no hay curacion humana fuerte puede contaminar todo el sistema de rutinas desde el primer dia.
- No aparece todavia una definicion cuantitativa de cobertura minima del catalogo inicial. Sin ese criterio, la IA puede estar "tecnicamente funcionando" pero generar rutinas pobres.
- El valor real es historial + rutina + feedback, pero el documento todavia invierte demasiada complejidad en canales de entrega y flujos de vinculacion.
- No hay definicion suficientemente concreta de pricing, segmento inicial ni contexto de uso: entrenador independiente vs gimnasio tienen necesidades muy distintas.

### Que validaria antes de invertir fuerte

- Cuantos entrenadores cargarian datos de alumnos de forma disciplinada.
- Si prefieren generar rutina con IA o usar plantillas editables.
- Si el alumno completa feedback desde un link.
- Si PDF y link cubren la entrega inicial.
- Que campos de restricciones realmente usan entrenadores.
- Cuanto catalogo inicial hace falta para que la IA sea util.
- Que cobertura minima se exige antes de activar IA: grupos musculares, patrones, objetivos, niveles y equipamiento.
- Si pagarian por historial inteligente o solo por generacion rapida de rutinas.

### Que cambiaria

- Mantendria app alumno, Excel y vinculacion dentro del MVP, pero con alcance minimo y sin funciones avanzadas.
- Implementaria generacion/enriquecimiento de catalogo con IA como feature admin-only, no para entrenadores comunes.
- Agregaria reporte de cobertura del catalogo inicial antes de uso comercial de la IA de rutinas.
- Definiria umbrales simples para molestias recurrentes.
- Construiria primero el flujo "solicitar borrador IA -> revisar -> editar -> aprobar", porque la opcion IA es requisito core pero el entrenador conserva la decision final.

### Que simplificaria

- Canales de alumno con la misma estructura funcional: app, web, PDF y Excel, sin divergencias de modelo.
- PDF y Excel con plantillas iniciales cerradas.
- Catalogo asistido por IA desde administracion, curado, normalizado y aprobado antes de usar ejercicios en rutinas.
- Notificaciones internas, no email/WhatsApp.
- Vinculacion de cuenta alumno simple, con codigo revocable y vencimiento.

### Que el Product Manager no esta viendo

- El principal cuello de botella no sera la IA; sera la adopcion y carga de datos.
- Los entrenadores pueden querer velocidad mas que precision documental.
- Si el feedback del alumno no llega, el historial inteligente pierde valor.
- Una app puede reducir adopcion en lugar de aumentarla.
- Las molestias son un area sensible: aunque el producto diga que no diagnostica, usuarios pueden interpretarlo asi.
- El catalogo cerrado es correcto tecnicamente, pero exige trabajo editorial inicial.

## 12. Plan de Construccion para IA

Este plan asume que gran parte del desarrollo sera realizado con herramientas como Codex. El orden debe minimizar ambiguedad y evitar que la IA implemente partes avanzadas antes de cerrar el core.

### Hito 0: Preparacion

Entregables:

- Documento de alcance reducido aprobado.
- Modelo de datos definitivo para MVP.
- Estados de rutina y ejercicio.
- Reglas de permisos.
- Criterios de aceptacion por flujo.
- Criterios de cobertura minima del catalogo inicial.

Dependencias:

- Decision sobre stack.
- Decision sobre proveedor auth.
- Decision sobre proveedor IA.

### Hito 1: Base de aplicacion

Entregables:

- Proyecto inicial.
- Auth.
- Layout dashboard.
- Roles basicos.
- Conexion a base de datos.
- Migraciones iniciales.

### Hito 2: Alumnos e historial

Entregables:

- CRUD alumnos.
- Perfil fitness.
- Restricciones y observaciones.
- Timeline de historial.
- Eventos generados al crear/editar datos relevantes.

### Hito 3: Catalogo de ejercicios

Entregables:

- CRUD ejercicios.
- Estados activo/inactivo.
- Filtros por grupo, equipamiento, dificultad.
- Seed de ejercicios inicial generado con asistencia de IA antes del lanzamiento.
- Campos completos segun MVP: nombre, descripcion, imagen URL, video URL, grupo muscular, equipamiento, dificultad, objetivos recomendados, patrones de movimiento, beneficios, precauciones, fuentes y observaciones.
- Revision humana de duplicados, nombres, fuentes, precauciones y coherencia tecnica.
- Reporte de cobertura del catalogo inicial por grupo muscular, objetivo, nivel, equipamiento y patron de movimiento.
- Reporte de cobertura: informar si el catalogo aprobado no cumple la cobertura minima definida.
- Solo ejercicios aprobados y activos quedan disponibles para la IA de rutinas.
- Validacion de URL externa sin bloquear operacion.

### Hito 4: Rutinas manuales

Entregables:

- Crear rutina.
- Agregar dias.
- Agregar ejercicios desde catalogo.
- Editar series, repeticiones, descanso y observaciones.
- Estados: borrador, aprobada, publicada.
- Snapshot al aprobar/publicar.

### Hito 5: Entrega alumno

Entregables:

- Enlace web con token.
- Vista mobile-first.
- Revocacion de acceso.
- PDF desde rutina aprobada.

### Hito 6: Feedback

Entregables:

- Formulario web.
- Registro de dificultad, cumplimiento, molestia y comentario.
- Asociacion a rutina/alumno.
- Evento en historial.
- Vista de feedback para entrenador.

### Hito 7: IA de rutinas

Entregables:

- Prompt versionado.
- Context builder.
- Schema de respuesta.
- Validacion de `ejercicio_id`.
- Creacion de borrador IA.
- Motivo de seleccion visible.
- Manejo de errores y regeneracion.

### Hito 8: Reglas de molestias

Entregables:

- Normalizacion simple de zona de molestia.
- Estados: aislada, en observacion, recurrente.
- Alerta interna al entrenador.
- Recomendacion redactada por IA solo cuando hay recurrencia.

### Hito 9: Medicion y cierre MVP

Entregables:

- Eventos de producto.
- Metricas basicas.
- QA de flujos criticos.
- Pruebas de permisos.
- Pruebas de IA con casos limite.
- Checklist legal/copy de no diagnostico.

## Decision Final CTO

No construiria el PRD completo como MVP. Es tecnicamente posible, pero comercialmente riesgoso y operativamente costoso para una primera version.

La version que si aprobaria es:

- Web para entrenador.
- Alumnos + historial.
- Catalogo cerrado.
- Opcion de borrador de rutina generado por IA + editor manual de revision.
- Aprobacion humana.
- Link web mobile-first para alumno.
- PDF.
- Feedback simple.
- Reglas iniciales para molestias recurrentes.

Todo lo avanzado fuera del alcance minimo de esas funciones debe pasar a Post-MVP hasta que existan datos reales de uso.

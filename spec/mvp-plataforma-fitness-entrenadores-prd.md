# MVP - Plataforma Fitness para Entrenadores y Gimnasios

## 1. Product Requirements Document (PRD)

### 1.1 Resumen ejecutivo

La plataforma tiene como objetivo centralizar la gestion de alumnos, rutinas, historial deportivo, restricciones fisicas y feedback dentro del ambito fitness/gimnasio.

El producto esta orientado a entrenadores: personal trainers independientes y profesores de gimnasio. Ambos se consideran el mismo tipo de usuario operativo dentro del sistema. El alumno es usuario final y en Fase 1 debe poder consumir la rutina mediante enlace web mobile-first, PDF o Excel, sin instalar una aplicacion mobile.

La propuesta de valor principal no es solamente generar rutinas con IA, sino construir un historial deportivo inteligente del alumno para que el entrenador pueda tomar mejores decisiones futuras.

Principio rector:

> La IA propone, el entrenador decide.

La IA nunca debe modificar automaticamente una rutina sin aprobacion explicita del entrenador.

### 1.2 Contexto del producto

La plataforma pertenece exclusivamente al ambito fitness/gimnasio.

No es una plataforma de kinesiologia, no realiza diagnosticos medicos y no prescribe tratamientos medicos.

Debe permitir registrar informacion relevante para la planificacion del entrenamiento, como:

- Lesiones anteriores.
- Restricciones fisicas.
- Molestias recurrentes.
- Limitaciones de movimiento.
- Ejercicios que generan molestias.
- Observaciones del entrenador.

Esta informacion debe ser usada como contexto preventivo y operativo para la toma de decisiones del entrenador, no como diagnostico ni indicacion medica.

### 1.3 Problema a resolver

Los entrenadores gestionan alumnos usando herramientas dispersas:

- WhatsApp.
- Excel.
- PDFs.
- Notas personales.
- Memoria.

Esto genera:

- Perdida de informacion.
- Dificultad para hacer seguimiento.
- Rutinas poco consistentes.
- Duplicacion de tareas administrativas.
- Baja trazabilidad sobre cambios, molestias y progreso.
- Dependencia excesiva de conversaciones informales.

### 1.4 Usuarios

#### Usuario principal

Entrenador, incluyendo personal trainer independiente y profesor de gimnasio que gestiona alumnos de forma individual, semipersonalizada o dentro de una institucion.

Necesita:

- Registrar alumnos rapidamente.
- Crear y ajustar rutinas.
- Ahorrar tiempo administrativo.
- Mantener historial claro por alumno.
- Entregar rutinas por aplicacion, PDF, Excel o enlace web, dejando que el alumno elija el canal de consumo.

#### Usuario final

Alumno que recibe la rutina y puede enviar feedback basico.

Necesita:

- Acceder facilmente a la rutina.
- Entender ejercicios, series, repeticiones y descansos.
- Informar dificultad, cumplimiento y molestias.
- Poder usar la aplicacion como canal principal, pero sin depender exclusivamente de ella.

### 1.5 Objetivos del MVP

- Centralizar el perfil deportivo del alumno.
- Registrar historial de restricciones, molestias y observaciones.
- Detectar recurrencia de molestias a lo largo del tiempo para que la IA pueda aconsejar cambios de rutina cuando exista un patron persistente.
- Mantener un catalogo de ejercicios controlado.
- Ofrecer a entrenadores la opcion de generar propuestas de rutina con IA como requisito imprescindible del MVP, usando solo ejercicios aprobados del catalogo en base de datos.
- Permitir revision, modificacion y aprobacion por parte del entrenador.
- Entregar rutinas en PDF, Excel y enlace web mobile-first en Fase 1.
- Postergar la aplicacion mobile del alumno para una fase posterior, si se valida adopcion y retorno del costo.
- Recibir feedback simple del alumno.
- Alimentar el historial deportivo con cada rutina y feedback.

### 1.6 No objetivos del MVP

- No obligar al alumno a usar exclusivamente la aplicacion.
- No construir aplicacion mobile del alumno en Fase 1.
- No ofrecer diagnosticos medicos.
- No prescribir tratamientos.
- No reemplazar al entrenador.
- No modificar rutinas automaticamente sin aprobacion.
- No inventar ejercicios fuera del catalogo.
- No construir una red social fitness.
- No implementar pagos, facturacion o marketplace en el MVP.

### 1.7 Principios de producto

- El entrenador mantiene control final sobre toda rutina.
- La IA funciona como asistente, no como autoridad.
- El historial del alumno es el activo principal del producto.
- Fase 1 debe priorizar bajo costo economico, baja complejidad operativa y velocidad de validacion.
- El historial debe distinguir molestias aisladas de molestias recurrentes antes de influir en recomendaciones futuras.
- La entrega al alumno debe ser simple y de baja friccion.
- La visualizacion de rutina debe ser consistente entre web mobile-first y futuras superficies mobile para que el alumno no tenga que aprender dos experiencias distintas.
- El sistema debe separar claramente informacion fitness de informacion medica.
- Toda recomendacion automatizada debe ser trazable y editable.
- La busqueda en internet, cuando exista, debe usarse solo como apoyo controlado de administradores o responsables internos para generar y curar ejercicios del catalogo. No debe usarse para improvisar rutinas en tiempo real.
- El producto debe usar el concepto "molestias reportadas" o "sensaciones reportadas", no "sintomas", para evitar lenguaje medico y mantener el foco fitness/operativo.

## 2. Alcance del MVP

### 2.1 Incluido en MVP

#### Gestion de usuarios internos

- Creacion del primer usuario administrador mediante seed, consola interna o proceso operativo controlado.
- Alta, edicion basica y consulta de entrenadores desde el panel de administrador.
- Asignacion de rol y estado para usuarios internos.
- Signup publico solo para entrenadores, con aprobacion administrativa obligatoria antes de acceder al sistema.
- En el MVP no existe registro publico para administradores.
- Solo un administrador puede crear administradores internos y aprobar o rechazar entrenadores registrados publicamente.

#### Gestion de alumnos

- Alta, edicion y consulta de alumnos.
- Datos basicos: nombre, apellido, email, edad, peso, altura, experiencia y objetivo.
- Objetivos disponibles:
  - Hipertrofia.
  - Fuerza.
  - Perdida de grasa.
  - Acondicionamiento fisico.
- Registro de lesiones anteriores, restricciones, molestias recurrentes y observaciones.

#### Catalogo de ejercicios

- ABM de ejercicios.
- Campos por ejercicio:
  - Nombre.
  - Descripcion.
  - Imagen mediante URL externa.
  - Video mediante URL externa.
  - Grupo muscular.
  - Equipamiento requerido.
  - Nivel de dificultad.
  - Objetivos recomendados.
  - Patrones de movimiento.
  - Beneficios esperados.
  - Precauciones.
  - Fuentes o referencias usadas para curar el ejercicio.
  - Estado de validacion.
  - Observaciones.
- El catalogo es la unica fuente valida para generar rutinas con IA.
- Antes de habilitar la generacion de rutinas con IA al publico, debe existir una base inicial de ejercicios persistida en base de datos con los campos definidos para el MVP.
- La IA puede asistir la generacion inicial y el enriquecimiento posterior de esa base de ejercicios como feature exclusiva para administradores o responsables internos, consultando fuentes externas si corresponde.
- Los ejercicios generados o enriquecidos por IA deben quedar en estado pendiente hasta ser revisados, normalizados, editados y aprobados por una persona responsable.
- Entrenadores pueden proponer ejercicios manualmente para nutrir el catalogo, pero esas propuestas quedan en estado pendiente de revision.
- Solo administradores o responsables internos pueden aprobar y activar ejercicios para que queden disponibles en rutinas.
- Solo ejercicios aprobados y activos pueden quedar disponibles para generar rutinas.
- El administrador debe poder definir y consultar cobertura minima esperada del catalogo por grupo muscular, objetivo, nivel de dificultad, equipamiento y patron de movimiento.
- El sistema debe mostrar un reporte de cobertura del catalogo para identificar faltantes antes de usar la IA de rutinas comercialmente.
- La generacion de rutinas con IA no puede consultar internet ni fuentes externas en tiempo real; debe usar exclusivamente el catalogo aprobado en base de datos.

#### Generacion asistida de rutinas

- La opcion de generar borradores de rutina con IA es una funcionalidad obligatoria del MVP para entrenadores.
- La IA debe generar un borrador de rutina solo cuando el entrenador lo solicita.
- La IA debe generar ese borrador exclusivamente a partir de ejercicios aprobados y activos existentes en base de datos.
- La IA no puede buscar ejercicios en internet, consultar fuentes externas ni crear ejercicios nuevos durante este flujo.
- Si el catalogo aprobado no tiene ejercicios suficientes para cumplir la solicitud, el sistema debe informar la limitacion al entrenador o administrador en lugar de completar la rutina con ejercicios externos o inventados.
- Solicitud de rutina indicando alumno y disponibilidad semanal.
- La IA considera:
  - Objetivo.
  - Experiencia.
  - Disponibilidad semanal.
  - Historial.
  - Recurrencia o desaparicion de molestias reportadas en feedback anteriores.
  - Restricciones.
- Catalogo de ejercicios.
- La IA genera un borrador con:
  - Ejercicios.
  - Series.
  - Repeticiones.
  - Descansos.
- El entrenador puede aprobar, modificar, reemplazar ejercicios y cambiar parametros.
- Cada ejercicio propuesto debe incluir un motivo de seleccion basado en el perfil del alumno, objetivo, restricciones, historial y atributos del catalogo.
- Al aprobar o publicar una rutina, el sistema debe guardar un snapshot de los datos relevantes de cada ejercicio usado para que cambios posteriores del catalogo no alteren rutinas historicas.
- Si la IA detecta molestias repetidas asociadas a un ejercicio, grupo muscular o patron de movimiento, debe sugerir alternativas o ajustes como recomendacion, nunca aplicarlos automaticamente.
- Si una molestia aparece en un feedback pero desaparece en feedback posteriores, la IA puede tratarla como evento aislado y no asumir que es una restriccion cronica.

#### Entrega de rutinas

- Exportacion a PDF.
- Exportacion a Excel.
- Enlace web accesible para el alumno.
- Vista web del alumno optimizada para celular con enfoque mobile-first.
- Diseno funcional preparado para que una futura aplicacion mobile reutilice la misma estructura de rutina.
- El alumno debe poder elegir el canal de acceso de Fase 1: PDF, Excel o enlace web.
- La aplicacion mobile del alumno queda fuera de Fase 1 por costo economico, QA y complejidad operativa.

#### Feedback del alumno

- Formulario simple por rutina o sesion.
- Campos:
  - Dificultad percibida: Muy dificil, Dificil, Bien, Facil.
  - Cumplimiento: Completa, Parcial, No realizada.
  - Molestias: Si / No.
  - Zona de molestia: campo estructurado obligatorio solo si el alumno indica que tuvo molestias.
  - Intensidad percibida: Leve, Moderada, Alta.
  - Momento de aparicion: Antes de entrenar, Durante el ejercicio, Despues de entrenar, Al dia siguiente.
  - Ejercicio asociado: ejercicio especifico de la rutina, No sabe / no esta seguro, No asociado a un ejercicio.
  - Descripcion de molestia: campo libre opcional, obligatorio solo si selecciona zona Otra.
  - Comentario opcional.
- El feedback queda asociado al historial del alumno.
- El alumno no clasifica recurrencia. El sistema calcula si una molestia es aislada, en observacion, recurrente o desestimada.

### 2.2 Fuera de alcance del MVP

- Planes nutricionales.
- Diagnostico o seguimiento medico.
- Almacenamiento propio de archivos, imagenes o videos.
- Aplicacion mobile del alumno en Fase 1.
- Integracion con wearables.
- Chat en tiempo real.
- Pagos y suscripciones.
- Multi-sucursal avanzado.
- Marketplace de entrenadores.
- Automatizacion completa de cambios de rutina.

## 3. Casos de uso

### CU-00: Registrar entrenador desde signup publico

Actor principal: Entrenador.

Objetivo: Permitir que un entrenador solicite acceso a la plataforma sin quedar habilitado automaticamente.

Precondicion: Debe existir al menos un administrador creado previamente mediante seed, consola interna o proceso operativo controlado para revisar solicitudes.

Flujo principal:

1. El entrenador accede al signup publico.
2. Completa nombre, apellido, email y credenciales segun el proveedor de auth definido.
3. El sistema crea la cuenta o solicitud con rol Entrenador y estado `pendiente_aprobacion`.
4. El sistema informa que la solicitud quedo pendiente de revision administrativa.
5. Hasta ser aprobada, la cuenta no puede acceder al dashboard ni a datos privados.

Resultado esperado: El entrenador queda registrado como pendiente de aprobacion y no puede operar la plataforma hasta que un administrador lo apruebe.

Reglas:

- El signup publico solo permite rol Entrenador.
- No existe registro publico de administradores en el MVP.
- El primer administrador no se crea desde la interfaz publica.
- Solo un administrador puede aprobar o rechazar entrenadores registrados publicamente.
- Solo un administrador puede crear administradores internos.

### CU-00B: Aprobar o rechazar entrenador registrado

Actor principal: Administrador.

Objetivo: Revisar solicitudes de entrenadores y decidir si pueden acceder al sistema.

Precondicion: Debe existir al menos un entrenador en estado `pendiente_aprobacion`.

Flujo principal:

1. El administrador accede al listado de entrenadores pendientes.
2. Revisa nombre, apellido, email y datos de la solicitud.
3. Selecciona aprobar o rechazar.
4. Si aprueba, el sistema cambia el estado a `activo`.
5. Si rechaza, el sistema cambia el estado a `rechazado` y guarda motivo opcional.

Resultado esperado: Solo entrenadores aprobados quedan habilitados para iniciar sesion operativa.

### CU-01: Registrar alumno

Actor principal: Entrenador.

Objetivo: Crear el perfil inicial de un alumno con datos basicos, objetivo, experiencia y restricciones.

Flujo principal:

1. El entrenador accede a la seccion de alumnos.
2. Selecciona crear nuevo alumno.
3. Completa datos personales y deportivos.
4. Registra lesiones anteriores, restricciones y observaciones.
5. Guarda el perfil.

Resultado esperado: El alumno queda disponible para generar rutinas y registrar historial.

### CU-02: Gestionar catalogo de ejercicios

Actor principal: Entrenador o administrador.

Objetivo: Mantener ejercicios disponibles para rutinas y permitir que entrenadores propongan nuevos ejercicios para revision.

Flujo principal:

1. El usuario accede al catalogo.
2. Crea, edita o propone un ejercicio segun su rol.
3. Completa descripcion, grupo muscular, equipamiento, dificultad, URL de imagen, URL de video y observaciones.
4. Guarda los cambios.

Resultado esperado: Si lo crea o aprueba un administrador, el ejercicio puede quedar activo. Si lo propone un entrenador, queda pendiente de revision y no puede ser usado por la IA hasta que un administrador lo apruebe y active.

Reglas:

- Entrenadores pueden proponer ejercicios.
- Administradores o responsables internos revisan, editan, aprueban, rechazan o activan ejercicios.
- Un ejercicio pendiente no puede usarse en rutinas ni en generacion IA.

### CU-03: Generar y curar ejercicios del catalogo con IA

Actor principal: Administrador o responsable interno autorizado.

Objetivo: Generar o enriquecer ejercicios del catalogo en la base de datos, completos segun los campos del MVP, sin que queden disponibles para rutinas hasta su aprobacion.

Flujo principal:

1. El administrador define la cantidad minima, cobertura esperada o ejercicio a completar.
2. Se solicita asistencia de IA para generar o completar ejercicios con los campos requeridos por el MVP.
3. La IA puede consultar fuentes externas o internet solo durante este flujo administrativo.
4. El sistema o script interno genera propuestas persistibles en JSON estructurado.
5. Las propuestas se guardan en base de datos como pendientes de validacion.
6. Una persona responsable revisa duplicados, nombres, descripciones, grupos musculares, equipamiento, dificultad, objetivos, patrones de movimiento, beneficios, precauciones, fuentes y observaciones.
7. La persona responsable aprueba, edita o descarta cada ejercicio.
8. Solo los ejercicios aprobados y activos quedan disponibles para la generacion de rutinas con IA.

Resultado esperado: Existe un catalogo persistido, curado y aprobado en base de datos. La IA de rutinas usa ese catalogo como fuente cerrada y no consulta internet en tiempo real.

Reglas:

- Este flujo es una feature administrativa del MVP, no una funcionalidad expuesta al entrenador comun ni al alumno.
- Ningun ejercicio generado por IA queda activo automaticamente.
- La generacion de rutinas solo puede usar ejercicios aprobados y activos.

### CU-04: Generar borrador de rutina con IA

Actor principal: Entrenador.

Objetivo: Obtener una propuesta inicial de rutina basada en perfil e historial.

Flujo principal:

1. El entrenador selecciona un alumno.
2. Indica disponibilidad semanal y parametros generales.
3. Solicita generacion asistida.
4. El sistema envia a la IA el perfil, historial, restricciones y catalogo permitido.
5. La IA devuelve un borrador con ejercicios, parametros y motivo de seleccion por ejercicio.
6. El sistema muestra la propuesta como borrador no aprobado.

Resultado esperado: El entrenador recibe una rutina editable sin que haya sido enviada automaticamente al alumno.

### CU-05: Revisar y aprobar rutina

Actor principal: Entrenador.

Objetivo: Validar la rutina antes de entregarla.

Flujo principal:

1. El entrenador revisa ejercicios, series, repeticiones y descansos.
2. Modifica parametros si corresponde.
3. Reemplaza ejercicios si detecta conflicto o preferencia.
4. Aprueba la rutina.

Resultado esperado: La rutina queda aprobada y lista para entrega.

### CU-06: Entregar rutina al alumno

Actor principal: Entrenador.

Objetivo: Compartir rutina en formato accesible.

Flujo principal:

1. El entrenador abre una rutina aprobada.
2. Selecciona formato de entrega: aplicacion, PDF, Excel o enlace web.
3. El sistema genera el recurso.
4. El entrenador comparte el recurso con el alumno.

Resultado esperado: El alumno puede acceder a la rutina desde la aplicacion o desde un formato alternativo.

### CU-07: Registrar alumno en la aplicacion y vincularlo con codigo

Actor principal: Alumno.

Objetivo: Crear una cuenta en la aplicacion y asociarla al perfil creado previamente por el entrenador.

Estado de alcance: Post-Fase 1. En Fase 1 el alumno accede por enlace web mobile-first, PDF o Excel sin instalar aplicacion mobile.

Flujo principal:

1. El entrenador genera un codigo de vinculacion desde el perfil del alumno o desde una rutina aprobada.
2. El sistema puede enviar el codigo por email al alumno.
3. El entrenador tambien puede compartir el codigo por otro canal si lo necesita.
4. El alumno descarga o abre la aplicacion.
5. El alumno crea una cuenta o inicia sesion.
6. La aplicacion solicita el codigo de vinculacion.
7. El alumno ingresa el codigo.
8. El sistema valida que el codigo exista, este vigente y tenga uso disponible para aplicacion.
9. El sistema vincula la cuenta del alumno con el perfil gestionado por el entrenador.
10. La aplicacion muestra las rutinas aprobadas y publicadas para ese alumno.

Resultado esperado: El alumno ve en la aplicacion solo las rutinas asociadas a su perfil vinculado.

Flujos alternativos:

- Codigo invalido: la aplicacion informa que el codigo no existe o fue escrito incorrectamente.
- Codigo expirado: la aplicacion solicita pedir un nuevo codigo al entrenador.
- Codigo ya usado: la aplicacion informa que el codigo ya fue utilizado o requiere validacion del entrenador.

### CU-08: Registrar feedback del alumno

Actor principal: Alumno.

Objetivo: Informar percepcion, cumplimiento y molestias.

Flujo principal:

1. El alumno abre el formulario desde la aplicacion o desde el enlace de feedback.
2. Selecciona dificultad percibida.
3. Selecciona cumplimiento.
4. Indica si hubo molestias.
5. Si hubo molestias, selecciona zona, intensidad percibida y momento de aparicion.
6. Si puede identificarlo, asocia la molestia a un ejercicio de la rutina.
7. Si selecciona zona Otra, describe la molestia con texto libre.
8. Agrega comentario opcional.
9. Envia el formulario.

Resultado esperado: El feedback queda asociado a la rutina y al historial del alumno.

### CU-09: Detectar recurrencia de molestias y sugerir cambios

Actor principal: Entrenador.

Objetivo: Recibir recomendaciones de ajuste cuando el historial indique molestias persistentes.

Flujo principal:

1. El alumno envia feedback de una rutina o sesion.
2. El sistema registra si hubo molestia, zona, intensidad, momento, ejercicio asociado si existe y comentario.
3. El sistema asocia el feedback con rutina, dia y ejercicios realizados.
4. El sistema compara la molestia reportada con feedback historico del alumno.
5. Si la molestia se repite en el tiempo o aparece asociada varias veces a un ejercicio, zona, grupo muscular o patron de movimiento, el sistema clasifica la recurrencia y la IA puede redactar una recomendacion.
6. El sistema genera una notificacion al entrenador.
7. Si el caso es recurrente, la IA personaliza la notificacion con contexto y recomendacion.
8. El entrenador decide si modifica, reemplaza o mantiene el ejercicio.

Resultado esperado: La IA ayuda a detectar patrones persistentes, pero el entrenador mantiene la decision final.

Reglas:

- Un unico reporte de molestia no debe transformarse automaticamente en restriccion permanente.
- Si la molestia desaparece en feedback posteriores, la IA puede desestimarla como evento aislado.
- Si la molestia se mantiene o reaparece, la IA debe considerarla referencia relevante para futuras recomendaciones.
- El sistema no debe diagnosticar ni indicar tratamiento medico.
- La notificacion debe informar contexto operativo, no diagnostico.

## 4. User Stories

### Entrenador

- Como entrenador, quiero registrar alumnos con sus datos deportivos para tener toda la informacion centralizada.
- Como entrenador, quiero registrar restricciones y molestias para evitar ejercicios inadecuados.
- Como entrenador, quiero consultar el historial de un alumno antes de crear una rutina.
- Como entrenador, quiero que el sistema me alerte si una molestia se repite en el tiempo para evaluar cambios en la rutina.
- Como entrenador, quiero que la IA proponga una rutina para ahorrar tiempo de planificacion.
- Como entrenador, quiero ver el motivo de seleccion de cada ejercicio propuesto para poder evaluar el criterio de la IA.
- Como entrenador, quiero editar la rutina propuesta para mantener control profesional.
- Como entrenador, quiero aprobar la rutina antes de compartirla para asegurarme de que sea adecuada.
- Como entrenador, quiero exportar rutinas en PDF y Excel para compartirlas por canales existentes.
- Como entrenador, quiero proponer ejercicios para nutrir el catalogo, sabiendo que quedaran pendientes hasta revision del administrador.
- Como entrenador, quiero enviar un enlace web para que el alumno tenga una alternativa a la aplicacion.
- Como entrenador, quiero ver feedback del alumno para ajustar futuras rutinas.

### Alumno

- Como alumno, quiero elegir si veo mi rutina por enlace web, PDF o Excel para usar el canal que me resulte mas comodo en Fase 1.
- Como alumno, quiero ver ejercicios con descripcion, imagen o video para entender la ejecucion.
- Como alumno, quiero informar si la rutina fue facil o dificil para que mi entrenador ajuste el plan.
- Como alumno, quiero describir con mis palabras cualquier molestia para que el entrenador tenga contexto antes de la siguiente rutina.

### Administrador del gimnasio

- Como administrador, quiero mantener un catalogo de ejercicios para estandarizar el contenido usado por entrenadores.
- Como administrador, quiero que la IA solo use ejercicios aprobados para evitar propuestas incorrectas o inventadas.
- Como administrador o responsable interno, quiero generar una base inicial de ejercicios con asistencia de IA antes del lanzamiento para acelerar la carga del catalogo.
- Como administrador, quiero revisar, editar, aprobar o rechazar ejercicios generados por IA antes de que puedan usarse en rutinas.
- Como administrador, quiero revisar, editar, aprobar o rechazar ejercicios propuestos por entrenadores antes de activarlos.

## 5. Flujos funcionales

### 5.1 Flujo de alta de alumno

1. Entrenador abre modulo Alumnos.
2. Selecciona Nuevo alumno.
3. Completa datos basicos.
4. Define objetivo y experiencia.
5. Registra restricciones, lesiones anteriores y molestias.
6. Agrega observaciones.
7. Guarda.
8. Sistema crea historial inicial.

### 5.2 Flujo de generacion de rutina

1. Entrenador selecciona alumno.
2. Sistema muestra resumen deportivo e historial.
3. Entrenador define disponibilidad semanal.
4. Entrenador solicita propuesta de IA.
5. Sistema valida que haya catalogo de ejercicios disponible.
6. Sistema envia contexto limitado y estructurado a IA.
7. IA devuelve rutina propuesta con motivo de seleccion por ejercicio.
8. Sistema valida que todos los ejercicios existan en catalogo.
9. Sistema guarda rutina como borrador.

### 5.3 Flujo de aprobacion de rutina

1. Entrenador abre borrador.
2. Revisa alertas por restricciones.
3. Edita ejercicios o parametros.
4. Reemplaza ejercicios si corresponde.
5. Aprueba rutina.
6. Sistema registra fecha, autor y version aprobada.

### 5.4 Flujo de entrega

1. Entrenador abre rutina aprobada.
2. En Fase 1 selecciona PDF, Excel o enlace web.
3. Si se entrega por enlace web, el sistema permite generar codigo o token de acceso.
4. El sistema puede enviar el enlace o codigo por email al alumno.
5. Si selecciona PDF, Excel o enlace web, el sistema genera salida correspondiente.
6. Entrenador comparte por canal externo cuando corresponda.
7. Sistema registra que la rutina fue preparada o publicada para entrega.

### 5.5 Flujo de vinculacion del alumno en la aplicacion

Estado de alcance: Post-Fase 1. En Fase 1 el alumno consume rutinas por enlace web mobile-first, PDF o Excel.

1. Entrenador abre el perfil del alumno.
2. Entrenador genera un codigo de vinculacion.
3. Sistema crea un codigo unico, con expiracion, asociado al alumno y con hasta 2 usos habilitados.
4. Sistema puede enviar el codigo por email al alumno.
5. Entrenador puede compartir el codigo por otro canal si corresponde.
6. Alumno abre la aplicacion.
7. Alumno se registra o inicia sesion.
8. Alumno ingresa el codigo.
9. Sistema valida codigo, vigencia, estado y uso disponible para aplicacion.
10. Sistema vincula la cuenta del alumno con el perfil del alumno.
11. Aplicacion muestra rutinas aprobadas y publicadas.

### 5.6 Flujo de feedback

1. Alumno accede al feedback desde la aplicacion o desde un enlace web.
2. Completa dificultad, cumplimiento, si tuvo molestias y comentario.
3. Si tuvo molestias, selecciona zona, intensidad percibida, momento de aparicion y ejercicio asociado si lo identifica.
4. Si selecciona zona Otra, escribe una descripcion libre de la molestia.
5. Sistema guarda respuesta asociada a rutina, dia y ejercicios correspondientes.
6. Sistema agrega entrada al historial.
7. Sistema actualiza el analisis de recurrencia de molestias del alumno.
8. Sistema genera una notificacion para el entrenador.
9. Si existe patron persistente, la IA personaliza la notificacion con contexto y sugerencia de revision o cambio.
10. Entrenador visualiza feedback y notificacion en perfil del alumno.

## 6. Modelo conceptual de datos

### Entidades principales

#### Usuario

- id
- nombre
- apellido
- email
- rol
- estado
- fecha_creacion
- creado_por_usuario_id
- aprobado_por_usuario_id
- fecha_aprobacion
- rechazado_por_usuario_id
- fecha_rechazo
- motivo_rechazo

Roles sugeridos:

- Entrenador.
- Administrador.
- Alumno.

Reglas:

- El primer usuario administrador del MVP se crea mediante seed, consola interna o proceso operativo controlado.
- Los usuarios con rol Entrenador pueden registrarse desde signup publico, siempre en estado `pendiente_aprobacion`.
- El rol Entrenador incluye personal trainers y profesores de gimnasio.
- En el MVP no hay registro publico para Administrador.
- Un entrenador `pendiente_aprobacion` o `rechazado` no puede acceder al sistema.
- `creado_por_usuario_id` puede ser nulo para el primer administrador creado por seed o consola interna.

#### Alumno

- id
- entrenador_id
- nombre
- apellido
- email
- edad
- peso
- altura
- experiencia
- objetivo
- fecha_creacion
- estado
- usuario_app_id
- vinculado_app

Reglas:

- `email` corresponde al correo de contacto del alumno dentro del perfil gestionado por el entrenador.
- Este email puede usarse para enviar codigos de vinculacion/acceso antes de que el alumno tenga una cuenta de aplicacion.
- Si luego el alumno crea una cuenta, `usuario_app_id` vincula el perfil deportivo con el `Usuario` de rol Alumno.
- El email del perfil `Alumno` y el email del `Usuario` de app pueden coincidir, pero conceptualmente cumplen funciones distintas.
- `nombre` y `apellido` deben guardarse separados para todos los roles y para el perfil deportivo del alumno.

#### RestriccionAlumno

- id
- alumno_id
- tipo
- descripcion
- zona_afectada
- fecha_inicio
- estado
- observaciones

Tipos posibles:

- Lesion anterior.
- Restriccion fisica.
- Molestia recurrente.
- Limitacion de movimiento.
- Ejercicio a evitar.

#### Ejercicio

- id
- nombre
- descripcion
- imagen_url
- video_url
- grupo_muscular
- equipamiento
- nivel_dificultad
- objetivos_recomendados
- patrones_movimiento
- beneficios
- precauciones
- fuentes_referencia
- estado_validacion
- origen
- propuesto_por_usuario_id
- aprobado_por_usuario_id
- fecha_aprobacion
- observaciones
- activo

Origenes posibles:

- Seed inicial.
- IA administrativa.
- Propuesta entrenador.
- Carga administrador.

Reglas multimedia para MVP:

- `imagen_url` y `video_url` deben apuntar a recursos externos.
- El sistema no almacena archivos binarios de imagen o video en el MVP.
- El sistema debe validar que las URLs tengan formato valido.
- Un ejercicio puede existir aunque no tenga imagen o video.
- La carga propia de archivos queda fuera del MVP para evitar costos de almacenamiento y complejidad operativa.

#### CoberturaCatalogo

- id
- grupo_muscular
- objetivo
- nivel_dificultad
- equipamiento
- patron_movimiento
- cantidad_minima_esperada
- cantidad_actual_aprobada
- estado_cobertura
- fecha_actualizacion

Estados posibles:

- Suficiente.
- Bajo minimo.
- Sin cobertura.

Reglas:

- La cobertura sirve como criterio de calidad del catalogo para administradores.
- La cobertura no activa ejercicios automaticamente ni reemplaza la revision humana.
- El reporte debe permitir detectar faltantes antes de usar comercialmente la IA de rutinas.
- La cobertura no debe permitir que la IA de rutinas use ejercicios pendientes, inactivos o no aprobados.

#### Rutina

- id
- alumno_id
- entrenador_id
- estado
- objetivo
- disponibilidad_semanal_dias
- fuente_generacion
- fecha_creacion
- fecha_aprobacion
- version

Estados posibles:

- Borrador IA.
- Borrador manual.
- Aprobada.
- Entregada.
- Archivada.

#### RutinaDia

- id
- rutina_id
- nombre
- orden
- descripcion

#### RutinaEjercicio

- id
- rutina_dia_id
- ejercicio_id
- ejercicio_snapshot
- orden
- series
- repeticiones
- descanso
- observaciones
- motivo_seleccion
- alertas_restricciones

Reglas:

- `ejercicio_id` referencia el ejercicio vigente del catalogo.
- `ejercicio_snapshot` guarda una copia de los datos relevantes del ejercicio al aprobar o publicar la rutina.
- El snapshot debe incluir, como minimo: nombre, descripcion, imagen_url, video_url, grupo_muscular, equipamiento, nivel_dificultad, patrones_movimiento, precauciones y observaciones relevantes.
- La vista de rutinas aprobadas, publicadas, exportadas o historicas debe renderizarse desde el snapshot cuando exista.
- Si luego se modifica o desactiva un ejercicio del catalogo, las rutinas ya aprobadas no deben cambiar retroactivamente.

#### FeedbackAlumno

- id
- alumno_id
- rutina_id
- rutina_dia_id
- ejercicio_id
- dificultad_percibida
- cumplimiento
- hubo_molestia
- zona_molestia_reportada
- intensidad_molestia
- momento_aparicion
- ejercicio_asociado_por_alumno
- descripcion_molestia
- patron_movimiento_asociado
- recurrencia_detectada
- comentario
- fecha_creacion

Zonas de molestia:

- Hombro.
- Codo.
- Muneca/mano.
- Cuello.
- Espalda alta.
- Espalda baja/lumbar.
- Cadera.
- Rodilla.
- Tobillo/pie.
- Otra.

Intensidad de molestia:

- Leve.
- Moderada.
- Alta.

Momento de aparicion:

- Antes de entrenar.
- Durante el ejercicio.
- Despues de entrenar.
- Al dia siguiente.

Reglas:

- Estos datos representan molestias reportadas por el alumno, no sintomas medicos.
- `descripcion_molestia` es opcional, salvo cuando la zona seleccionada sea Otra.
- `recurrencia_detectada` es calculada por el sistema, no seleccionada por el alumno.
- El texto libre complementa el analisis, pero no debe ser la unica fuente para clasificar recurrencia.

#### AnalisisMolestiaAlumno

- id
- alumno_id
- descripcion_normalizada
- zona_molestia
- intensidad_maxima_reportada
- ejercicio_id
- grupo_muscular
- patron_movimiento
- cantidad_reportes
- primera_fecha
- ultima_fecha
- estado
- recomendacion_ia
- requiere_revision_entrenador

Estados posibles:

- Evento aislado.
- En observacion.
- Recurrente.
- Desestimado.
- Revisado por entrenador.

#### NotificacionEntrenador

- id
- entrenador_id
- alumno_id
- tipo
- titulo
- mensaje
- severidad
- referencia_id
- generada_por_ia
- estado
- fecha_creacion
- fecha_lectura

Tipos posibles:

- Molestia reportada.
- Molestia recurrente.
- Recomendacion de revision.

Estados posibles:

- Pendiente.
- Leida.
- Archivada.

#### CodigoVinculacionAlumno

- id
- alumno_id
- entrenador_id
- rutina_id
- codigo
- usos_maximos
- usos_realizados
- canales_habilitados
- estado
- fecha_creacion
- fecha_expiracion
- fecha_uso
- enviado_por_email
- fecha_envio_email
- usuario_app_id

Estados posibles:

- Activo.
- Usado.
- Expirado.
- Revocado.

Reglas:

- El codigo debe ser alfanumerico, corto, no adivinable y con expiracion de 7 dias.
- El codigo puede habilitar hasta 2 usos: vinculacion de aplicacion y primer acceso web.
- El sistema debe registrar usos realizados y canal usado.
- El codigo puede enviarse por email al alumno cuando el entrenador crea, aprueba o entrega una rutina.
- El entrenador puede revocar el codigo.

#### AccesoWebRutina

- id
- rutina_id
- alumno_id
- token_primer_acceso
- codigo_vinculacion_id
- estado
- fecha_creacion
- fecha_primer_acceso
- fecha_ultimo_acceso
- access_id_persistente

Estados posibles:

- Pendiente.
- Activado.
- Revocado.

Reglas:

- `token_primer_acceso` se usa para validar la primera apertura del enlace web.
- Luego del primer acceso, el sistema debe permitir que el alumno vuelva a ver la rutina desde el mismo navegador o dispositivo sin pedir el token nuevamente.
- El acceso web no reemplaza la aplicacion ni requiere login obligatorio.
- Si el acceso se revoca, el enlace deja de permitir ver la rutina.

#### HistorialAlumno

- id
- alumno_id
- tipo_evento
- referencia_id
- resumen
- fecha_creacion

Tipos de evento:

- Alta de alumno.
- Codigo de vinculacion generado.
- Cuenta de alumno vinculada.
- Ejercicio propuesto por IA para catalogo.
- Ejercicio aprobado en catalogo.
- Restriccion registrada.
- Rutina generada.
- Rutina aprobada.
- Feedback recibido.
- Molestia aislada registrada.
- Molestia recurrente detectada.
- Recomendacion de cambio sugerida por IA.
- Observacion del entrenador.

### Relaciones clave

- Un entrenador puede tener muchos alumnos.
- En Fase 1, un alumno puede acceder por enlace web sin usuario de aplicacion.
- En fases posteriores, un alumno puede estar vinculado a un usuario de aplicacion.
- Un alumno puede tener muchos codigos de vinculacion historicos, pero solo uno activo por vez.
- Un alumno puede tener muchas restricciones.
- Un alumno puede tener muchas rutinas.
- Una rutina pertenece a un alumno y a un entrenador.
- Una rutina contiene uno o mas dias.
- Cada dia contiene uno o mas ejercicios.
- Cada ejercicio de rutina referencia un ejercicio del catalogo.
- Cada ejercicio de rutina debe guardar snapshot de los datos relevantes del ejercicio al aprobar o publicar la rutina.
- El catalogo puede tener multiples registros de cobertura por combinacion de grupo muscular, objetivo, nivel, equipamiento y patron de movimiento.
- Cada feedback pertenece a un alumno y puede asociarse a una rutina o sesion.
- Cada feedback puede asociarse a ejercicios concretos cuando la rutina lo permita.
- El historial consolida eventos relevantes del alumno y alimenta el analisis de recurrencia.
- El analisis de molestias resume patrones persistentes sin convertir automaticamente un evento aislado en restriccion.
- Las notificaciones informan al entrenador sobre molestias reportadas, recurrencias y recomendaciones de revision.
- En Fase 1, el codigo o token habilita acceso web a rutina. En fases posteriores, puede conectar una cuenta de aplicacion con un perfil de alumno existente.

## 7. Arquitectura de alto nivel

### 7.1 Componentes

#### Frontend web

Aplicacion web para entrenadores y administradores.

Modulos:

- Dashboard.
- Alumnos.
- Perfil del alumno.
- Generacion de enlace/codigo de acceso web.
- Catalogo de ejercicios.
- Rutinas.
- Generacion con IA.
- Exportacion.
- Feedback.

#### Portal web de alumno

Vista liviana accesible por enlace, disenada con enfoque mobile-first para que el alumno pueda usarla comodamente desde el celular.

Debe quedar preparado para compartir la misma estructura visual y funcional de rutina con una futura aplicacion del alumno.

Funciones:

- Ver rutina.
- Consultar descripcion, imagen y video de ejercicios.
- Enviar feedback.
- Navegar dias y ejercicios sin tablas anchas ni elementos dificiles de tocar.
- Leer series, repeticiones y descansos con jerarquia visual clara en pantalla chica.

Funciona como canal principal de bajo costo para Fase 1.

#### Aplicacion de alumno

Estado de alcance: fuera de Fase 1 por costo economico, QA y complejidad operativa. Puede incorporarse en una fase posterior si se valida adopcion.

Cuando se construya, debe compartir la misma estructura visual y funcional de rutina que la vista web del alumno.

Funciones:

- Consultar rutinas asignadas.
- Registro e inicio de sesion del alumno.
- Ingreso de codigo de vinculacion generado por el entrenador.
- Ver ejercicios, series, repeticiones y descansos.
- Acceder a imagenes o videos de ejercicios.
- Enviar feedback de rutina o sesion.
- Consultar historial basico de rutinas entregadas.

#### Backend API

Responsable de:

- Autenticacion y autorizacion.
- Validacion de enlaces/codigos de acceso web.
- Envio de enlaces/codigos por email.
- Gestion de alumnos.
- Gestion de ejercicios.
- Gestion de rutinas.
- Registro de historial.
- Analisis de recurrencia de molestias.
- Notificaciones al entrenador.
- Exportaciones.
- Integracion con IA.

#### Base de datos

Almacena:

- Usuarios.
- Alumnos.
- Codigos de vinculacion.
- Restricciones.
- Ejercicios.
- Rutinas.
- Feedback.
- Historial.
- Analisis de molestias.
- Notificaciones.

#### Servicio de IA

Responsable de generar propuestas de rutina y, en flujos administrativos controlados, asistir la generacion o enriquecimiento del catalogo de ejercicios.

Restricciones obligatorias:

- Recibe catalogo permitido.
- No puede inventar ejercicios.
- Devuelve ejercicios referenciados por id.
- Devuelve rutina en formato estructurado.
- Devuelve motivo de seleccion por ejercicio.
- Debe devolver JSON estructurado cuando la respuesta vaya a persistirse en base de datos.
- Puede generar recomendaciones de cambio cuando detecta molestias recurrentes en el historial.
- La salida debe validarse antes de guardarse.
- No debe usar busqueda libre en internet para seleccionar ejercicios durante la generacion de una rutina.
- Puede consultar internet o fuentes externas solo en flujos administrativos de carga, enriquecimiento o curado del catalogo.
- La informacion obtenida desde internet debe quedar pendiente de validacion humana antes de ser usada en rutinas.
- La informacion obtenida desde internet debe ser validada por el administrador antes de activar ejercicios.

#### Servicio de exportacion

Genera:

- PDF.
- Excel.
- Enlaces web compartibles.
- Publicacion de rutinas en la aplicacion.

#### Servicio administrativo de generacion y curado de catalogo

Responsable de asistir la carga inicial y mejora controlada del catalogo de ejercicios desde funciones exclusivas para administradores o responsables internos.

Funciones:

- Buscar informacion externa sobre ejercicios durante el flujo administrativo de catalogo.
- Proponer nuevos ejercicios candidatos.
- Completar atributos faltantes.
- Sugerir beneficios, precauciones y objetivos recomendados.
- Registrar fuentes utilizadas.
- Dejar toda propuesta en estado pendiente hasta revision humana.
- Persistir ejercicios aprobados en base de datos como catalogo cerrado para la generacion de rutinas.

### 7.2 Flujo tecnico de vinculacion en aplicacion

1. Entrenador solicita codigo desde el sitio web.
2. Backend genera codigo unico, no adivinable, asociado al alumno, rutina opcional y con expiracion.
3. Backend guarda el codigo en estado Activo.
4. Backend puede enviar el codigo por email al alumno.
5. Alumno crea cuenta o inicia sesion en la aplicacion.
6. Aplicacion envia codigo al backend.
7. Backend valida codigo, expiracion, estado, alumno asociado y uso disponible para aplicacion.
8. Backend vincula usuario de aplicacion con el perfil del alumno.
9. Backend registra el uso del codigo.
10. Aplicacion consulta rutinas aprobadas y publicadas para ese alumno.

### 7.3 Flujo tecnico de IA

1. Backend construye contexto del alumno.
2. Backend incluye restricciones e historial relevante.
3. Backend incluye analisis de recurrencia de molestias.
4. Backend incluye catalogo de ejercicios disponible.
5. IA devuelve propuesta estructurada con motivo de seleccion por ejercicio.
6. Backend valida que los ejercicios existan.
7. Backend marca conflictos potenciales.
8. Rutina se guarda como borrador.
9. Entrenador revisa y aprueba.

### 7.4 Flujo tecnico de analisis de recurrencia de molestias

1. Alumno envia feedback.
2. Backend guarda feedback asociado a rutina, dia y ejercicios cuando sea posible.
3. Backend registra zona, intensidad percibida, momento de aparicion, ejercicio asociado por el alumno y comentario.
4. Backend usa los datos estructurados para comparar la molestia con feedback anteriores del mismo alumno.
5. Si aparece una sola vez, queda como Evento aislado.
6. Si aparecen 2 reportes similares en 14 a 21 dias, queda En observacion.
7. Si aparecen 3 o mas reportes similares, pasa a Recurrente.
8. Si no reaparece durante varias sesiones posteriores, puede pasar a Desestimado.
9. Sistema genera notificacion al entrenador.
10. IA personaliza la notificacion con contexto y recomendacion de ajuste, reemplazo o revision.
11. El entrenador ve la notificacion y decide si aplica cambios.

### 7.5 Flujo tecnico administrativo de generacion y curado de catalogo

1. El administrador define cobertura minima del catalogo o identifica ejercicios/atributos faltantes.
2. Una herramienta administrativa invoca el servicio de IA con permiso para consultar fuentes externas.
3. IA devuelve ejercicios candidatos, atributos sugeridos y fuentes en JSON estructurado.
4. Backend o script de carga valida estructura, campos requeridos y enums.
5. Backend guarda la informacion en estado Pendiente de validacion.
6. Administrador o responsable interno revisa la propuesta.
7. Si aprueba, el ejercicio queda Activo y disponible para rutinas.
8. Si rechaza, el ejercicio queda descartado o archivado.
9. Para generar rutinas con IA, el catalogo aprobado en base de datos es la unica fuente permitida.

### 7.6 Reglas tecnicas criticas

- La IA no escribe directamente una rutina aprobada.
- La IA no modifica rutinas existentes sin accion del entrenador.
- Toda rutina generada debe quedar en estado borrador.
- Toda entrega debe partir de una rutina aprobada.
- La aplicacion solo muestra rutinas de alumnos vinculados correctamente a la cuenta autenticada.
- Un codigo de vinculacion debe tener expiracion, usos maximos y registro de usos realizados.
- El mismo codigo puede tener hasta 2 usos: aplicacion y web.
- El sistema puede enviar el codigo por email cuando se crea, aprueba o entrega una rutina.
- El feedback debe alimentar historial.
- Las molestias reportadas deben analizarse como eventos longitudinales, no como restricciones permanentes automaticas.
- Una molestia aislada no debe bloquear ejercicios por si sola.
- Una molestia recurrente debe generar recomendacion de revision para el entrenador.
- Toda molestia reportada debe generar notificacion al entrenador.
- Las molestias recurrentes deben generar notificaciones enriquecidas por IA con contexto historico.
- La IA puede aconsejar cambios por recurrencia, pero nunca modificar la rutina automaticamente.
- El catalogo de ejercicios debe funcionar como fuente de verdad.
- La seleccion de ejercicios para una rutina debe basarse solo en ejercicios activos y aprobados del catalogo.
- La IA debe explicar el motivo de seleccion de cada ejercicio usando datos del alumno y atributos del catalogo.
- La informacion obtenida desde internet no puede activar ejercicios automaticamente.
- Las respuestas de IA que persistan datos deben validarse contra esquema antes de guardar.
- La generacion y curado del catalogo inicial requiere aprobacion del administrador o responsable interno antes de activar ejercicios.
- La generacion de rutinas con IA no puede consultar internet ni fuentes externas en tiempo real.
- La generacion de rutinas con IA no puede crear ejercicios nuevos.
- Al aprobar o publicar una rutina, el backend debe persistir snapshot de cada ejercicio usado.
- Las exportaciones PDF/Excel y la vista de rutina aprobada deben usar snapshots cuando existan.
- El modulo de catalogo debe exponer reporte de cobertura para administradores.
- App y web deben renderizar la rutina desde el mismo modelo de datos y respetar una misma estructura de presentacion.

### 7.7 Modelo de presentacion unificado de rutina

La rutina debe tener una estructura comun para aplicacion y vista web.

Bloques funcionales:

- Encabezado de rutina.
- Lista de dias de entrenamiento.
- Detalle de ejercicios por dia.
- Datos principales por ejercicio: nombre, series, repeticiones y descanso.
- Multimedia del ejercicio cuando exista.
- Observaciones.
- Accion de feedback.

Reglas:

- La app y la web pueden adaptar navegacion o gestos propios de cada plataforma, pero no deben cambiar la jerarquia ni la informacion principal.
- La vista web debe ser mobile-first.
- La app debe respetar el mismo orden, etiquetas y agrupacion funcional que la web.
- Las diferencias visuales deben limitarse a componentes nativos o adaptaciones necesarias de plataforma.

## 8. Wireframes textuales

### 8.1 Dashboard del entrenador

Pantalla:

- Encabezado con nombre del entrenador.
- Accesos principales:
  - Alumnos.
  - Crear rutina.
  - Catalogo de ejercicios.
  - Feedback reciente.
- Panel de alumnos activos.
- Panel de rutinas pendientes de aprobacion.
- Panel de feedback con molestias reportadas.
- Panel de alertas por molestias recurrentes.

### 8.2 Listado de alumnos

Pantalla:

- Buscador por nombre.
- Filtros por objetivo, experiencia y estado.
- Tabla con:
  - Nombre.
  - Objetivo.
  - Experiencia.
  - Ultima rutina.
  - Ultimo feedback.
  - Alertas de restricciones.
- Accion: Nuevo alumno.

### 8.3 Perfil del alumno

Pantalla:

- Datos basicos.
- Objetivo y experiencia.
- Restricciones y molestias.
- Observaciones del entrenador.
- Historial cronologico.
- Resumen de molestias aisladas, en observacion y recurrentes.
- Rutinas asociadas.
- Feedback reciente.
- Acciones:
  - Editar perfil.
  - Nueva rutina.
  - Generar codigo de vinculacion.
  - Agregar observacion.

### 8.4 Catalogo de ejercicios

Pantalla:

- Buscador.
- Filtros:
  - Grupo muscular.
  - Equipamiento.
  - Dificultad.
- Tabla o grilla de ejercicios.
- Vista detalle con imagen, video, descripcion y observaciones.
- Estado de validacion del ejercicio.
- Fuentes de referencia.
- Indicador de cobertura del catalogo para administradores.
- Acciones:
  - Crear ejercicio.
  - Editar.
  - Generar o enriquecer con IA.
  - Aprobar propuesta.
  - Rechazar propuesta.
  - Activar/desactivar.
  - Ver reporte de cobertura.

Nota: la accion de generar ejercicios con IA forma parte de la operacion administrativa del MVP. No forma parte de la operacion normal del entrenador. El catalogo puede recibir propuestas generadas por IA y esta pantalla permite revisarlas, editarlas, aprobarlas o rechazarlas.

### 8.5 Generador de rutina

Pantalla:

- Selector de alumno.
- Resumen del alumno.
- Alertas de restricciones.
- Disponibilidad semanal.
- Objetivo.
- Boton: Generar borrador con IA.
- Resultado:
  - Dias de entrenamiento.
  - Ejercicios por dia.
  - Series, repeticiones y descansos.
  - Motivo de seleccion por ejercicio.
  - Alertas o notas.
- Acciones:
  - Editar.
  - Reemplazar ejercicio.
  - Guardar borrador.
  - Aprobar.

### 8.6 Entrega de rutina

Pantalla:

- Vista previa de rutina aprobada.
- Opciones:
  - Descargar PDF.
  - Descargar Excel.
  - Copiar enlace web.
  - Enviar enlace por email.
- Estado de entrega.

### 8.7 Aplicacion del alumno

Estado de alcance: Post-Fase 1.

Pantalla:

- Registro o inicio de sesion.
- Campo para ingresar codigo de vinculacion si la cuenta no esta asociada a un entrenador.
- Inicio con rutina activa.
- Lista de dias de entrenamiento.
- Detalle de ejercicios por dia.
- Series, repeticiones y descansos.
- Imagen o video por ejercicio.
- Accion para completar feedback.
- Historial simple de rutinas anteriores.

La estructura de rutina debe coincidir con la vista web del alumno.

### 8.8 Vinculacion en aplicacion

Pantalla:

- Titulo: Vincular con mi entrenador.
- Campo de codigo.
- Boton: Vincular.
- Estado de validacion.
- Mensaje de error para codigo invalido, expirado o ya utilizado.
- Confirmacion cuando la cuenta queda vinculada.

### 8.9 Vista web del alumno

Pantalla:

- Diseno mobile-first.
- Nombre de rutina.
- Dias de entrenamiento.
- Selector o navegacion simple por dia.
- Lista de ejercicios en formato vertical.
- Series, repeticiones y descansos.
- Imagen o video por ejercicio.
- Boton para completar feedback visible y facil de tocar.
- Indicacion de que tambien puede usar la aplicacion si tiene acceso.

La estructura de rutina debe coincidir con la aplicacion del alumno.

Requisitos de experiencia en celular:

- No depender de tablas horizontales.
- Mantener texto legible sin zoom manual.
- Usar botones y controles con area tactil comoda.
- Permitir recorrer la rutina con scroll vertical.
- Priorizar informacion clave: ejercicio, series, repeticiones, descanso y observaciones.
- Cargar rapido en redes moviles.

### 8.10 Formulario de feedback

Pantalla:

- Dificultad percibida.
- Cumplimiento.
- Indica si hubo molestias.
- Zona de molestia, visible solo si indica que hubo molestias.
- Intensidad percibida: Leve, Moderada, Alta.
- Momento de aparicion.
- Ejercicio asociado, si el alumno puede identificarlo.
- Descripcion libre de la molestia, opcional salvo zona Otra.
- Comentario opcional.
- Boton enviar.
- Mensaje de confirmacion.

## 9. Riesgos del producto

### 9.1 Riesgo: interpretacion medica

El sistema registra lesiones y molestias, lo que puede generar expectativa de diagnostico.

Mitigacion:

- Mensajes claros de alcance no medico.
- Evitar lenguaje clinico.
- Usar "molestias reportadas" o "sensaciones reportadas"; evitar "sintomas" como etiqueta de producto.
- Mantener al entrenador como decisor.
- Registrar restricciones como informacion contextual.

### 9.2 Riesgo: confianza excesiva en IA

El entrenador podria aprobar rutinas sin revisarlas.

Mitigacion:

- Estado obligatorio de borrador.
- Requerir accion explicita de aprobacion.
- Mostrar alertas sobre restricciones.
- Auditar aprobaciones.

### 9.3 Riesgo: IA inventa ejercicios

La IA podria proponer ejercicios fuera del catalogo.

Mitigacion:

- Enviar catalogo estructurado con ids.
- Validar salida contra catalogo.
- Rechazar o marcar propuestas no validas.

### 9.4 Riesgo: baja adopcion por friccion del alumno

Si el alumno percibe que solo puede acceder mediante la aplicacion, puede caer la adopcion.

Mitigacion:

- Mantener la aplicacion como canal disponible y recomendado, no como unico canal.
- Enlace web simple.
- PDF y Excel como formatos de respaldo.
- Feedback rapido.

### 9.5 Riesgo: dependencia de URLs externas para multimedia

Al usar URLs externas para imagenes y videos, los recursos pueden romperse, cambiar permisos, eliminarse o cargar lento.

Mitigacion:

- Validar formato de URL al cargar ejercicios.
- Mostrar estado o aviso si una URL no esta disponible.
- Permitir editar rapidamente URLs rotas.
- Definir imagen o estado placeholder cuando no haya recurso disponible.
- Evaluar almacenamiento propio en una version futura si el uso del producto lo justifica.

### 9.6 Riesgo: datos incompletos

El valor del historial depende de que el entrenador cargue datos y el alumno envie feedback.

Mitigacion:

- Formularios breves.
- Campos obligatorios minimos.
- Feedback de una pantalla.
- Resumen visible del valor del historial.

### 9.7 Riesgo: catalogo insuficiente

Si el catalogo tiene pocos ejercicios, la IA generara rutinas pobres.

Mitigacion:

- Cargar catalogo inicial curado.
- Permitir activacion/desactivacion.
- Identificar ejercicios mas usados y faltantes.

### 9.8 Riesgo: vinculacion incorrecta de alumno

Un alumno podria ingresar un codigo equivocado, vencido o compartido incorrectamente y quedar vinculado a un perfil que no le corresponde.

Mitigacion:

- Codigos unicos, no adivinables y con expiracion.
- Mostrar nombre del entrenador antes de confirmar la vinculacion.
- Permitir revocar codigos desde el sitio del entrenador.
- Registrar evento de vinculacion en historial.
- Evitar mostrar datos sensibles antes de confirmar la vinculacion.

### 9.9 Riesgo: informacion externa de baja calidad en catalogo

Si la IA consulta internet durante el flujo administrativo para generar o completar ejercicios del catalogo, puede traer informacion incompleta, contradictoria o no alineada con el criterio del producto.

Mitigacion:

- Mantener estado Pendiente de validacion para toda informacion obtenida externamente.
- Exigir aprobacion humana antes de activar ejercicios.
- Registrar fuentes usadas.
- Permitir editar o descartar propuestas.
- Separar claramente el flujo administrativo de generacion/curado del catalogo del flujo de generacion de rutinas.
- Mostrar reporte de cobertura del catalogo aprobado para que administradores detecten faltantes antes de uso comercial.

### 9.10 Riesgo: justificaciones poco confiables

La IA podria justificar una seleccion con argumentos genericos o no relacionados con el alumno.

Mitigacion:

- Exigir motivo de seleccion por ejercicio.
- Validar que el motivo mencione atributos concretos: objetivo, experiencia, restricciones, historial o atributos del catalogo.
- Mostrar la justificacion al entrenador como informacion revisable, no como decision final.
- Auditar rutinas rechazadas o editadas por mala justificacion.

## 10. Roadmap MVP a V2 a V3

### MVP / Fase 1 bajo costo

- Gestion de alumnos.
- Registro de restricciones y observaciones.
- Catalogo de ejercicios.
- Generacion asistida del catalogo con IA desde administracion, persistencia en base de datos y validacion humana.
- Propuesta de ejercicios por entrenadores, siempre pendiente de revision.
- Activacion de ejercicios solo por administrador o responsable interno.
- Generacion de borradores con IA.
- Motivo de seleccion por ejercicio propuesto.
- Edicion y aprobacion por entrenador.
- Exportacion PDF y Excel.
- Enlace web de rutina.
- Vista web mobile-first para alumnos.
- Feedback basico del alumno.
- Historial deportivo.
- Analisis de recurrencia de molestias.
- Recomendaciones de revision por molestias persistentes.

### V2

- Aplicacion de alumno para consulta de rutinas y envio de feedback, si se valida adopcion.
- Registro de alumno en aplicacion.
- Vinculacion con codigo generado por el entrenador.
- Plantillas de rutinas.
- Clonacion y versionado avanzado.
- Comparacion de progreso por alumno.
- Alertas inteligentes avanzadas por molestias repetidas.
- Recomendaciones avanzadas de ajuste basadas en feedback historico.
- Roles y permisos para gimnasios.
- Biblioteca multimedia mejorada.
- Almacenamiento propio opcional para imagenes y videos si el volumen de uso lo justifica.
- Notificaciones por email o WhatsApp.
- Base de conocimiento curada con criterios de entrenamiento por objetivo, nivel y patron de movimiento.

### V3

- Experiencia movil avanzada.
- Integracion con wearables.
- Analitica avanzada por entrenador y gimnasio.
- Planificacion por ciclos o mesociclos.
- Asistente conversacional para entrenadores.
- Integracion con pagos o membresias.
- Marketplace de rutinas o ejercicios curados.
- Integraciones con sistemas de gimnasios.

## 11. Metricas de exito

### Activacion

- Porcentaje de entrenadores que crean al menos un alumno.
- Porcentaje de entrenadores que cargan al menos una restriccion u observacion.
- Tiempo promedio para crear el primer alumno.
- Tiempo promedio para generar la primera rutina.
- Porcentaje de enlaces web abiertos correctamente por alumnos.
- Porcentaje de codigos o tokens de acceso web usados correctamente.

### Uso

- Rutinas generadas por entrenador por semana.
- Porcentaje de rutinas generadas con IA que son editadas.
- Porcentaje de rutinas aprobadas sobre rutinas generadas.
- Cantidad de ejercicios del catalogo usados activamente.
- Porcentaje de rutinas consultadas desde enlace web vs PDF o Excel.
- Cantidad de ejercicios generados por IA para el catalogo inicial.
- Porcentaje de ejercicios generados por IA aprobados por administradores o responsables internos.
- Cantidad de ejercicios propuestos por entrenadores.
- Porcentaje de ejercicios propuestos por entrenadores aprobados por administradores.

### Valor

- Reduccion percibida del tiempo administrativo.
- Porcentaje de entrenadores que consultan historial antes de crear rutina.
- Cantidad promedio de eventos de historial por alumno.
- Porcentaje de feedback recibido por rutinas entregadas.
- Porcentaje de feedback recibido desde enlace web.
- Cantidad de molestias aisladas vs recurrentes detectadas.
- Porcentaje de recomendaciones de cambio revisadas por entrenadores.

### Calidad

- Porcentaje de propuestas de IA rechazadas.
- Porcentaje de propuestas con ejercicios fuera de catalogo.
- Cantidad de alertas por conflicto con restricciones.
- Satisfaccion del entrenador con la propuesta inicial.
- Porcentaje de ejercicios propuestos con motivo de seleccion completo.
- Porcentaje de rutinas editadas por motivo de seleccion incorrecto o insuficiente.
- Porcentaje de molestias recurrentes correctamente identificadas segun revision del entrenador.

### Retencion

- Entrenadores activos semanalmente.
- Alumnos activos por entrenador.
- Alumnos que abren enlaces web por entrenador.
- Rutinas entregadas por mes.
- Repeticion de uso luego de la primera rutina.

## 12. Supuestos a validar con entrenadores reales

- Los entrenadores estan dispuestos a cargar datos iniciales del alumno si el proceso es rapido.
- El historial deportivo es percibido como mas valioso que la simple generacion de rutinas.
- Enlace web mobile-first, PDF y Excel cubren la mayoria de casos de entrega de Fase 1.
- La mayoria de alumnos abrira el enlace web desde un celular.
- Una estructura visual mobile-first en web reduce friccion para el alumno.
- Los entrenadores aceptaran compartir un codigo de vinculacion como parte del alta del alumno.
- Los alumnos completaran feedback si el formulario demora menos de un minuto.
- Los entrenadores quieren mantener control final sobre la rutina generada por IA.
- El catalogo cerrado de ejercicios es aceptable aunque limite la creatividad de la IA.
- Los administradores o responsables internos revisaran informacion sugerida por IA antes de activarla en el catalogo inicial.
- Los entrenadores aportaran ejercicios al catalogo si el flujo de propuesta es simple y saben que quedaran pendientes de revision.
- Los motivos de seleccion por ejercicio aumentaran la confianza del entrenador en el borrador generado.
- Los alumnos pueden reportar molestias con campos simples de zona, intensidad, momento y ejercicio asociado sin aumentar demasiado la friccion.
- El comentario libre aporta contexto, pero no debe reemplazar los campos estructurados de molestia.
- Los objetivos definidos cubren la mayoria de alumnos iniciales.
- Los entrenadores revisarian alertas de restricciones antes de aprobar rutinas.
- La existencia de alternativas a la aplicacion mejora la adopcion inicial.

## 13. Puntos ambiguos o decisiones a resolver

### 13.1 Nivel de detalle del historial

Decision tomada: el historial del MVP debe ser una linea de tiempo con eventos tipificados y datos suficientes para analisis longitudinal de molestias.

El historial no sera solo texto libre. Debe permitir que la IA diferencie:

- Molestias aisladas.
- Molestias en observacion.
- Molestias recurrentes.
- Molestias desestimadas porque dejaron de aparecer en feedback posteriores.

Regla de producto:

- Si una molestia aparece una vez, no se considera cronica ni restriccion automatica.
- Si una molestia desaparece en feedback posteriores, la IA puede desestimarla como evento aislado.
- Si una molestia se mantiene o reaparece a lo largo del tiempo, la IA debe usarla como referencia para aconsejar cambios.
- Todo cambio sugerido requiere aprobacion del entrenador.

### 13.2 Gestion de imagenes y videos

Decision tomada: en el MVP las imagenes y videos se referencian mediante URL externa.

No se implementara almacenamiento propio de archivos, imagenes o videos en el MVP. Esto evita costos adicionales de infraestructura, como almacenamiento tipo S3, CDN, procesamiento de archivos, backups y control de cuotas.

Regla de producto:

- Cada ejercicio puede tener `imagen_url` y `video_url`.
- Las URLs deben ser editables desde el catalogo.
- El sistema debe tolerar ejercicios sin imagen o sin video.
- Si una URL falla, el ejercicio no debe quedar inutilizable.
- La carga propia de archivos queda para V2 o V3 si se valida que aporta valor suficiente.

### 13.3 Alcance de disponibilidad semanal

Decision tomada: en el MVP, disponibilidad semanal significa cantidad de dias de entrenamiento por semana.

No se modelara duracion por sesion como dato obligatorio en el MVP.

Regla de producto:

- El entrenador define cuantos dias por semana puede entrenar el alumno.
- La IA usa ese numero para distribuir volumen, grupos musculares y descanso.
- El campo recomendado es `disponibilidad_semanal_dias`.
- Si en una version futura se requiere mas precision, se podra agregar duracion estimada por sesion o disponibilidad por calendario.

### 13.4 Seguridad del enlace web

Decision tomada: el enlace web de rutina usa un token solo para el primer acceso.

El objetivo es evitar que el alumno tenga que autenticarse o ingresar un token cada vez que quiera ver la rutina.

Regla de producto:

- El sistema genera un enlace web con token no adivinable.
- El token valida la primera apertura de la rutina.
- Luego del primer acceso, el sistema mantiene un acceso persistente para ese navegador o dispositivo.
- El alumno puede volver a abrir la rutina desde ese mismo contexto sin ingresar token nuevamente.
- El entrenador puede revocar el acceso si lo necesita.
- Si el alumno cambia de dispositivo, navegador o borra los datos locales, puede requerir un nuevo enlace o token.

### 13.5 Responsabilidad sobre molestias

Decision tomada: cuando el alumno reporta una molestia, el sistema debe notificar al entrenador.

La IA puede personalizar la notificacion cuando detecta recurrencia o persistencia en el tiempo, pero no debe diagnosticar, indicar tratamiento ni modificar automaticamente la rutina.

Decision de lenguaje: el producto debe hablar de molestias reportadas o sensaciones reportadas. No debe usar "sintomas" como entidad funcional ni como etiqueta principal de interfaz, porque ese termino acerca el producto a una interpretacion medica.

Regla de producto:

- Toda molestia reportada genera una notificacion basica al entrenador.
- Si el alumno reporta una molestia, debe registrar zona, intensidad percibida, momento de aparicion y ejercicio asociado cuando pueda identificarlo.
- El comentario libre complementa la informacion, pero la clasificacion no debe depender solo de texto libre.
- La intensidad se clasifica como Leve, Moderada o Alta.
- El momento se clasifica como Antes de entrenar, Durante el ejercicio, Despues de entrenar o Al dia siguiente.
- El alumno no clasifica recurrencia; el sistema la calcula.
- Si la molestia es aislada, la notificacion informa el feedback recibido y queda registrada en historial.
- Si la molestia se repite o se mantiene durante varios entrenamientos, la IA genera una notificacion enriquecida con contexto historico.
- La notificacion puede sugerir revisar, ajustar o reemplazar ejercicios.
- La decision final siempre queda en manos del entrenador.

Ejemplo:

```text
Alumno: Juan Perez
Alerta: molestia recurrente en rodilla
Contexto: reporto dolor de rodilla en los ultimos 3 dias de entrenamiento.
Sugerencia IA: revisar ejercicios de tren inferior asociados y considerar una variante con menor demanda de rodilla.
Accion requerida: el entrenador debe revisar y decidir si modifica la rutina.
```

### 13.6 Vigencia y formato del codigo de vinculacion

Decision tomada: el codigo debe ser alfanumerico corto, no adivinable, con expiracion de 7 dias, revocable por el entrenador y con hasta 2 usos controlados.

El codigo puede servir para:

- Vincular la cuenta del alumno en la aplicacion.
- Habilitar el primer acceso a la vista web de la rutina.

Regla de producto:

- El codigo puede generarse al crear, aprobar o entregar una rutina.
- El sistema puede enviarlo por email al alumno.
- El entrenador tambien puede copiarlo y enviarlo por otro canal si lo necesita.
- El codigo tiene expiracion de 7 dias.
- El codigo permite como maximo 2 usos, uno por canal: aplicacion y web.
- Cada uso debe quedar registrado.
- El entrenador puede revocar el codigo.

### 13.7 Confirmacion de identidad antes de vincular

Decision tomada: antes de confirmar una vinculacion o primer acceso web, el sistema debe mostrar informacion minima para que el alumno confirme que el codigo corresponde a su entrenador.

Regla de producto:

- Mostrar nombre y apellido del entrenador.
- Mostrar, como maximo, iniciales o nombre y apellido del alumno.
- No mostrar rutina completa ni historial antes de confirmar la vinculacion o acceso.
- Si el codigo llego por email, el contenido del email debe evitar exponer informacion sensible.
- Luego de confirmar, el alumno puede acceder por la app o por la vista web segun el canal usado.

### 13.8 Generacion y curado del catalogo con IA

Decision tomada: el sistema debe contar con una base de ejercicios cargada en base de datos y puede permitir que administradores o responsables internos generen y enriquezcan ejercicios con asistencia de IA.

La IA puede asistir la generacion y enriquecimiento de ese catalogo como feature administrativa del MVP. Durante ese flujo puede consultar fuentes externas o internet para proponer ejercicios y completar atributos.

La consulta a internet no aplica a la generacion de rutinas en tiempo real. Una vez habilitada la IA para usuarios, la IA solo puede seleccionar ejercicios aprobados y activos ya persistidos en base de datos.

Regla de producto:

- La IA puede consultar fuentes disponibles en internet solo durante el flujo administrativo de carga y curado del catalogo.
- El catalogo inicial debe persistirse en base de datos antes de habilitar la generacion de rutinas con IA.
- Cada ejercicio debe incluir los campos definidos para el MVP: nombre, descripcion, imagen, video, grupo muscular, equipamiento requerido, nivel de dificultad, objetivos recomendados, patrones de movimiento, beneficios, precauciones, fuentes, estado de validacion y observaciones.
- Toda propuesta debe quedar en estado Pendiente de validacion.
- El administrador o responsable interno debe revisar, editar, aprobar o rechazar la propuesta.
- Ningun ejercicio obtenido desde internet queda activo automaticamente.
- La IA debe devolver fuentes o referencias usadas.
- El sistema debe registrar las fuentes junto con la propuesta.
- Solo ejercicios aprobados y activos pueden usarse luego para generar rutinas.
- La generacion de rutinas con IA no puede consultar internet ni crear ejercicios nuevos.

### 13.9 Formato de respuesta estructurada de IA

Decision tomada: las respuestas de IA deben ser estructuradas y alineadas con los campos del modelo de datos para facilitar validacion, persistencia e inserts.

La IA no debe devolver texto libre como unica salida cuando el resultado vaya a persistirse en base de datos.

Regla de producto:

- La IA debe responder en JSON estructurado.
- Las claves deben corresponder a campos del modelo conceptual.
- El backend debe validar tipos, campos requeridos, ids existentes y enums antes de guardar.
- Los registros generados por IA deben quedar en estado borrador o pendiente de validacion.
- El texto explicativo debe guardarse en campos especificos como `motivo_seleccion`, `observaciones`, `beneficios`, `precauciones` o `recomendacion_ia`.

#### Formato para generar catalogo inicial de ejercicios

```json
{
  "ejercicios": [
    {
      "nombre": "Sentadilla goblet",
      "descripcion": "Ejercicio de tren inferior realizado sosteniendo una carga frente al pecho.",
      "imagen_url": "https://ejemplo.com/imagen.jpg",
      "video_url": "https://ejemplo.com/video",
      "grupo_muscular": "piernas",
      "equipamiento": "mancuerna o kettlebell",
      "nivel_dificultad": "principiante",
      "objetivos_recomendados": ["hipertrofia", "acondicionamiento_fisico"],
      "patrones_movimiento": ["sentadilla"],
      "beneficios": ["trabajo de cuadriceps y gluteos", "facil de aprender frente a variantes con barra"],
      "precauciones": ["revisar tolerancia si hay molestia de rodilla"],
      "fuentes_referencia": [
        {
          "titulo": "Referencia consultada",
          "url": "https://ejemplo.com",
          "fecha_consulta": "2026-06-04"
        }
      ],
      "estado_validacion": "pendiente",
      "observaciones": "Propuesta generada por IA pendiente de revision del administrador",
      "activo": false
    }
  ]
}
```

#### Formato para generar rutina

```json
{
  "rutina": {
    "alumno_id": "uuid-alumno",
    "entrenador_id": "uuid-entrenador",
    "estado": "borrador_ia",
    "objetivo": "hipertrofia",
    "disponibilidad_semanal_dias": 3,
    "fuente_generacion": "ia",
    "dias": [
      {
        "nombre": "Dia 1 - Tren inferior",
        "orden": 1,
        "descripcion": "Sesion enfocada en tren inferior",
        "ejercicios": [
          {
            "ejercicio_id": "uuid-ejercicio-catalogo",
            "orden": 1,
            "series": 3,
            "repeticiones": "10-12",
            "descanso": "90 segundos",
            "observaciones": "Controlar tecnica y rango de movimiento",
            "motivo_seleccion": "Seleccionado por objetivo de hipertrofia, nivel principiante y disponibilidad de 3 dias. No contradice restricciones actuales.",
            "alertas_restricciones": []
          }
        ]
      }
    ]
  }
}
```

#### Formato para recomendacion por molestia recurrente

```json
{
  "analisis_molestia": {
    "alumno_id": "uuid-alumno",
    "descripcion_normalizada": "dolor de rodilla",
    "zona_molestia": "rodilla",
    "ejercicio_id": "uuid-ejercicio-relacionado",
    "grupo_muscular": "piernas",
    "patron_movimiento": "sentadilla",
    "cantidad_reportes": 3,
    "estado": "recurrente",
    "recomendacion_ia": "Revisar ejercicios de tren inferior asociados y considerar una variante con menor demanda de rodilla.",
    "requiere_revision_entrenador": true
  }
}
```

## 14. Criterios de aceptacion generales

- El sistema debe permitir crear el primer administrador mediante seed, consola interna o proceso operativo controlado.
- Un entrenador puede registrarse desde signup publico y queda en estado pendiente de aprobacion.
- Un administrador puede ver entrenadores pendientes y aprobarlos o rechazarlos.
- Un entrenador aprobado pasa a estado activo y puede iniciar sesion operativa.
- Un entrenador rechazado no puede acceder al sistema.
- El MVP no permite registro publico de administradores.
- Un entrenador puede crear un alumno con nombre, apellido, email, datos basicos, objetivo, experiencia y restricciones.
- Un entrenador puede crear y consultar ejercicios del catalogo.
- Un entrenador puede proponer ejercicios para nutrir el catalogo.
- Todo ejercicio propuesto por entrenador queda pendiente de revision.
- Solo un administrador o responsable interno puede aprobar y activar ejercicios.
- Un ejercicio pendiente no puede usarse en rutinas ni ser seleccionado por la IA.
- Un ejercicio puede guardar URL externa de imagen y URL externa de video.
- El sistema no requiere almacenamiento propio de archivos multimedia para operar el MVP.
- Un ejercicio puede existir aunque no tenga imagen o video cargado.
- Antes de habilitar la generacion de rutinas con IA al publico, debe existir un catalogo inicial de ejercicios persistido en base de datos.
- Un administrador o responsable interno autorizado puede solicitar a la IA propuestas para generar o enriquecer el catalogo.
- Una propuesta obtenida desde internet o fuentes externas queda pendiente de validacion.
- La IA puede consultar internet solo durante el flujo administrativo de generacion/curado del catalogo, no para generar rutinas en tiempo real.
- Una propuesta de ejercicio obtenida con IA solo puede activarse si la aprueba un administrador o responsable interno.
- Un administrador puede definir cobertura minima esperada del catalogo por grupo muscular, objetivo, nivel de dificultad, equipamiento y patron de movimiento.
- El sistema puede mostrar un reporte de cobertura del catalogo aprobado.
- El reporte de cobertura debe distinguir al menos cobertura suficiente, bajo minimo y sin cobertura.
- La IA debe devolver propuestas persistibles en JSON estructurado alineado con campos de base de datos.
- El backend debe validar el JSON de IA contra esquema antes de insertar o actualizar registros.
- Un ejercicio pendiente no puede ser usado para generar rutinas.
- Solo ejercicios aprobados y activos pueden ser seleccionados por la IA al generar rutinas.
- La IA solo puede proponer ejercicios existentes en el catalogo.
- La IA no puede crear ejercicios nuevos durante la generacion de una rutina.
- Si no existen ejercicios aprobados suficientes para una rutina solicitada, la IA debe devolver un resultado incompleto controlado o un error funcional explicando la falta de cobertura del catalogo.
- Entrenadores deben tener disponible la opcion de solicitar un borrador de rutina con IA.
- La IA solo genera borradores cuando el entrenador solicita explicitamente esa accion.
- La IA debe incluir motivo de seleccion para cada ejercicio propuesto en una rutina.
- La generacion de rutina debe usar `disponibilidad_semanal_dias` como cantidad de dias de entrenamiento por semana.
- Toda rutina generada por IA queda en estado borrador.
- El entrenador puede modificar una rutina antes de aprobarla.
- Al aprobar o publicar una rutina, el sistema guarda snapshot de los datos relevantes de cada ejercicio usado.
- Una rutina aprobada, publicada, exportada o historica no cambia visualmente si luego se edita el ejercicio original del catalogo.
- Una rutina no puede entregarse si no esta aprobada.
- El sistema puede generar PDF, Excel y enlace web de una rutina aprobada.
- PDF y Excel deben generarse desde la rutina aprobada y sus snapshots de ejercicios cuando existan.
- El enlace web de rutina debe usar un token no adivinable para el primer acceso.
- Despues del primer acceso valido, el alumno puede volver a ver la rutina desde el mismo navegador o dispositivo sin ingresar token nuevamente.
- El entrenador puede revocar el acceso web a una rutina.
- El enlace web de rutina debe visualizarse correctamente en celular.
- La vista web del alumno debe permitir leer la rutina y enviar feedback sin zoom manual ni desplazamiento horizontal.
- En Fase 1 no se requiere aplicacion mobile del alumno.
- La vista web debe quedar disenada para reutilizar su estructura funcional en una futura aplicacion mobile.
- El entrenador puede generar un enlace o codigo de acceso web desde el perfil del alumno o rutina aprobada.
- El sistema puede enviar por email el codigo de vinculacion/acceso al alumno al crear, aprobar o entregar una rutina.
- El envio por email debe usar el email guardado en el perfil `Alumno` cuando todavia no exista cuenta de aplicacion vinculada.
- El codigo o token debe permitir acceso web controlado.
- El sistema registra cada uso del codigo y el canal utilizado.
- Un codigo expirado o revocado no permite acceder a la rutina web.
- El alumno puede enviar feedback desde la aplicacion o desde un enlace web.
- El feedback queda asociado al alumno y visible en su historial.
- Si el alumno reporta una molestia, el sistema solicita zona, intensidad percibida, momento de aparicion y ejercicio asociado cuando pueda identificarlo.
- El sistema debe usar "molestias reportadas" o "sensaciones reportadas" y evitar "sintomas" como etiqueta funcional.
- La descripcion libre de molestia es opcional salvo cuando el alumno selecciona zona Otra.
- El sistema puede clasificar molestias como aisladas, en observacion, recurrentes o desestimadas segun feedback posteriores.
- Toda molestia reportada por el alumno debe generar una notificacion al entrenador.
- Una molestia recurrente debe generar una notificacion personalizada por IA con contexto historico y sugerencia de revision.
- La IA puede sugerir cambios si detecta molestias recurrentes, pero no puede aplicar esos cambios sin aprobacion del entrenador.
- Una molestia reportada una sola vez no debe convertirse automaticamente en restriccion permanente.
- El sistema no presenta la informacion como diagnostico medico.

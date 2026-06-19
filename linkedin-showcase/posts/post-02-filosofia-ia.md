**La filosofía de IA que elegí para el producto**
Cuando diseñé la IA del producto, tomé una decisión de producto antes de escribir una línea de código: **"La IA propone, el entrenador decide."**  No es un slogan. Es una regla técnica que atraviesa todo el sistema.

**Por qué importa**
Los entrenadores son profesionales. Conocen a sus alumnos, sus historias, sus limitaciones, su contexto. La IA no. La IA tiene acceso a datos estructurados: objetivo del alumno, experiencia, disponibilidad semanal, estricciones declaradas, historial de molestias, catálogo de ejercicios curado. Con eso puede generar una propuesta útil. Pero no puede reemplazar el juicio profesional. Entonces la IA genera un borrador. El entrenador lo revisa, lo edita, lo aprueba. Solo después se entrega.

**Cómo se implementó esta filosofía**
1. Toda rutina generada por IA nace como borrador. No se puede entregar sin aprobación explícita del entrenador.
2. La IA solo puede seleccionar ejercicios aprobados y activos del catálogo. Nunca inventa ejercicios. Nunca consulta internet en tiempo real.
3. Cuando el sistema detecta molestias recurrentes en un alumno, genera una alerta. No modifica la rutina automáticamente. El entrenador decide qué hacer.
4. La IA devuelve JSON estructurado. El backend valida schema, IDs, enums y estados antes de persistir. Si la respuesta no es válida, se rechaza.
5. Las recomendaciones de IA son entidades revisables. El entrenador puede descartarlas, aplicarlas manualmente o ignorarlas.

**La decisión de no construir IA médica**
El producto registra lesiones anteriores, restricciones físicas y molestias reportadas. Pero no es una plataforma kinesiológica. No realiza diagnósticos. No prescribe tratamientos. Usamos intencionalmente el término "molestias reportadas" en lugar de "síntomas". Esa distinción de lenguaje es una decisión de producto que aleja el sistema de cualquier interpretación médica.

**Lo que la IA NO decide en este sistema**
- Diagnósticos
- Tratamientos
- Aprobar ejercicios del catálogo
- Aprobar, publicar o entregar rutinas
- Modificar rutinas sin acción humana
- Evaluar recurrencia sin base estructurada de datos
- Permisos o acceso a datos

Todo eso lo decide una persona.
Esta filosofía tiene un costo: la IA es menos autónoma de lo que podría ser.
El beneficio: el entrenador confía en el sistema porque nunca le pasa por encima.
Y en un producto donde la confianza del profesional es todo, ese trade-off vale.

#IA #ProductDesign #SaaS #AIFirst #PersonalTrainer #Fitness

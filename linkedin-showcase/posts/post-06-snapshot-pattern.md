El patrón que garantiza trazabilidad real en el producto

Hay una decisión de arquitectura que tomé en este proyecto que parece obvia en retrospectiva, pero que en la práctica muy pocos la implementan en un MVP: **El snapshot pattern para rutinas publicadas.**

**El problema**
Una rutina tiene ejercicios. Esos ejercicios vienen de un catálogo.
Si después de publicar la rutina alguien edita la descripción de un ejercicio, o le cambia el grupo muscular, o lo desactiva... ¿qué le mostrás al alumno que tiene esa rutina?
Sin snapshot: la rutina cambia retroactivamente. El historial miente.
Con snapshot: la rutina publicada es inmutable. El historial es real.

**Cómo funciona en el código**
Al publicar una rutina, el backend genera un `RoutineSnapshot`:
- Copia de todos los datos de cada ejercicio en ese momento
- Nombre, descripción, grupo muscular, equipamiento, instrucciones
- Asociado a la rutina y a la versión publicada

El link público del alumno, el PDF, el Excel... todos se generan desde el snapshot. Nunca desde el catálogo vivo.
Si el catálogo cambia después: no importa. La rutina publicada sigue siendo igual.

**El beneficio real**
Un entrenador puede abrir la rutina que le dio a un alumno hace 8 meses y ver exactamente qué le prescribió.
No "aproximadamente qué le dio". Exactamente qué le dio.
Eso es trazabilidad. Eso es profesionalismo.

**Por qué no lo hace todo el mundo**
Porque parece sobrecosto para un MVP.
En realidad el sobrecosto es mínimo: un modelo extra en la DB y la lógica de generación del snapshot al publicar.
El beneficio es enorme: nunca tenés inconsistencias entre "la rutina que el alumno vio" y "el catálogo actual".

Este tipo de decisiones son las que separan un proyecto de hobby de un producto que podría usarse en producción.

#Arquitectura #SaaS #Backend #PostgreSQL #Prisma #PatronesDeDiseño

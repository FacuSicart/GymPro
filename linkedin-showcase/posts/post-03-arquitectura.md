Construir un MVP no es solo elegir el stack. Es elegir qué problemas resolver en la arquitectura antes de que sean costosos de cambiar.
Estas son las 4 decisiones que más impactaron en el proyecto:

**1. Snapshot pattern para rutinas publicadas**
Cuando un entrenador publica una rutina, el sistema guarda una copia inmutable de todos los ejercicios tal como estaban en ese momento.
Si después edito o desactivo un ejercicio del catálogo, las rutinas ya publicadas no cambian.
El PDF, el Excel y el link público del alumno se generan siempre desde esa copia, nunca desde el catálogo vivo.
¿Por qué importa? La trazabilidad. Un entrenador puede ver exactamente qué le prescribió a su alumno hace 6 meses. Eso es profesionalismo.

**2. Catálogo de ejercicios con doble estado**
Cada ejercicio tiene dos estados independientes:
- **ApprovalStatus:** PENDING / APPROVED / REJECTED
- **OperationalStatus:** ACTIVE / INACTIVE

Solo los ejercicios `APPROVED + ACTIVE` pueden usarse en rutinas.
Los trainers pueden proponer ejercicios. Solo el admin los aprueba y activa.
La IA de rutinas solo puede seleccionar del catálogo aprobado. Nunca inventa ejercicios. Nunca busca en internet en tiempo real.
¿Por qué importa? Porque el catálogo curado es la única fuente de verdad. El sistema no puede generar rutinas con ejercicios que nadie validó.

**3. Multi-tenant desde el primer módulo**
Todos los modelos llevan `tenantId`. Todas las guards verifican que el recurso pertenezca al tenant del usuario autenticado.
Arrancar con esto desde el módulo 1 (auth/usuarios) en lugar de agregarlo después evita una refactorización enorme.
¿Por qué importa? Porque si en algún momento un gimnasio quiere usar la plataforma con varios trainers, el modelo ya lo soporta.

**4. Historial tipificado, no texto libre**
`StudentHistoryEvent` tiene 19 tipos distintos de eventos definidos en un enum. Cada evento automático (rutina creada, feedback enviado, molestia reportada, sesión completada) se registra con tipo, referencia de entidad, resumen y metadata.
No es un log de texto libre. Es un timeline estructurado.
¿Por qué importa? Porque la IA y el entrenador pueden leer ese historial para tomar decisiones. Un texto libre no se puede analizar. Un evento tipificado sí.

**Stack técnico:**

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS 4
- **Backend:** NestJS + TypeScript (API REST modular)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Auth:** JWT propio, hashing scrypt
- **Monorepo:** npm workspaces (`apps/api` + `apps/web`)
- **Docs:** OpenAPI / Swagger en `/api/docs`
- **Tests:** Jest con spec por servicio
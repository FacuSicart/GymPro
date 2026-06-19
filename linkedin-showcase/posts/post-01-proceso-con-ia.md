El proyecto arrancó con una idea de negocio cruda: los entrenadores personales gestionan alumnos con WhatsApp, Excel y memoria. Eso genera pérdida de información, rutinas inconsistentes y horas de trabajo administrativo.
La pregunta era: ¿es posible construir un producto real usando IA no solo para el código, sino para **todo el proceso** de descubrimiento, diseño, arquitectura e implementación?
La respuesta es sí. Y hay evidencia concreta.

Etapa 1 — De idea a PRD completo

Se le pidió a la ia que actuara como un equipo senior compuesto por:
- Product Manager
- Business Analyst / Analista Funcional
- UX Designer
- Software Architect

Con ese único prompt se generó un PRD completo que incluye:
- Resumen ejecutivo del producto
- Alcance del MVP (incluido y excluido)
- Casos de uso detallados
- User Stories por rol
- Flujos funcionales completos
- Modelo conceptual de datos
- Arquitectura de alto nivel con componentes
- Wireframes textuales de cada pantalla
- Riesgos del producto con mitigación
- Roadmap MVP → V2 → V3
- Métricas de éxito
- Supuestos a validar con usuarios reales

**Lo que tomó:** un prompt bien estructurado.  
**Lo que hubiera tomado sin IA:** semanas de discovery, workshops y documentación.

Etapa 2 — Revisión arquitectónica por CTO

Con el PRD como entrada, se ejecutó una revisión crítica del producto desde el rol de CTO/Arquitecto. El objetivo no era rediseñar el producto, sino:
- Validar decisiones técnicas
- Identificar riesgos de implementación
- Detectar contradicciones internas en el PRD
- Proponer simplificaciones para un equipo de una sola persona

Etapa 3 — Technical Foundation

Se le pidió a la ia que actuara como Principal Engineer / Staff Engineer y produjera el documento de Technical Foundation, que cierra la Fase 0 antes de escribir una sola línea de código.

El documento define:
- **Stack tecnológico definitivo** con justificación por componente: Frontend (Next.js), Backend (NestJS), Base de datos (PostgreSQL), ORM (Prisma), Auth (JWT propio), Hosting, PDF, Excel, IA, Monitoreo
- **Modelo de datos completo** a nivel arquitectura (no SQL), con 15+ entidades y sus relaciones
- **Convenciones de estados** para rutinas, ejercicios, tokens, usuarios y recomendaciones IA
- **Modelo de permisos** ADMIN / TRAINER con matriz completa
- **Reglas de negocio fundamentales**
- **Estrategia de IA** — qué recibe, qué devuelve, qué valida, qué NO puede hacer
- **Estrategia de historial** tipificado (no texto libre)
- **Estrategia de exportaciones** PDF, Excel, enlace web
- **Tabla de riesgos técnicos** clasificados por impacto con mitigación
Esto permitió que la ia implementara módulo a módulo sin reinterpretar decisiones fundamentales.

Etapa 4 — Plan de implementación ejecutable

Se le pidió a la ia que actuara como Lead Engineer Senior y generara un plan de construcción ejecutable, dividido en fases con entregables, dependencias y criterios de finalización. El plan incluye backlog priorizado (P0/P1/P2), diseño de base de datos, estrategia de IA, orden ideal de prompts para la ia, plan de testing y definición de "MVP terminado".

Etapa 5 — Implementación con la ia Code

Con toda la documentación como contexto (PRD + TF + Plan + spec de estado actual), la ia implementó los módulos del sistema:

**En cada módulo, el proceso fue:**
1. Leer documentación para no romper lo existente
2. Revisar el código antes de escribir
3. Detectar y señalar contradicciones antes de implementar
4. Implementar backend (NestJS + Prisma) y frontend (Next.js) en una misma sesión
5. Correr tests antes de cerrar

Lo que la IA **no reemplazó**
- Las decisiones de producto: qué construir, para quién, qué dejar afuera
- La revisión crítica antes de cada cambio
- La validación de que cada módulo no rompe los anteriores
- El criterio de cuándo una funcionalidad está lista vs cuándo necesita más trabajo
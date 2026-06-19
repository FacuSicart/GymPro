# LinkedIn Showcase — FitCoach Platform

Este folder contiene el material para mostrar el proyecto en LinkedIn.
Cubre cuatro ejes: **proceso con IA**, **arquitectura**, **funcionalidades** y **beneficios y diferenciales**.

## Estructura

| Archivo | Contenido |
|---|---|
| `01-proceso-con-ia.md` | Cómo se usó IA en cada etapa: de idea a producto |
| `02-arquitectura.md` | Stack técnico y decisiones de diseño |
| `03-funcionalidades.md` | Los 9 módulos implementados |
| `04-beneficios-y-diferenciales.md` | Propuesta de valor y diferencias vs alternativas |
| `posts/` | Borradores de posts listos para publicar |

## El proyecto en una línea

Plataforma SaaS B2B para entrenadores personales y gimnasios que centraliza alumnos, historial deportivo, rutinas y feedback, con generación asistida por IA.

**Filosofía:** _La IA propone, el entrenador decide._

## Stack resumido

- **Frontend:** Next.js 16 + React 19 + Tailwind CSS
- **Backend:** NestJS + TypeScript (REST API modular)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Auth:** JWT propio con hashing scrypt
- **Monorepo:** npm workspaces (`apps/api` + `apps/web`)

# Proyecto Gym

Base tecnica para el MVP de plataforma fitness para entrenadores y gimnasios.

## Stack

- Frontend: Next.js + TypeScript + Tailwind CSS.
- Backend: NestJS + TypeScript como API REST modular.
- Base de datos: PostgreSQL.
- ORM: Prisma.
- Auth: local en base de datos mediante email/password y JWT emitido por la API.
- API contract: Swagger/OpenAPI en `/api/docs`.

## Estructura

```text
apps/
  api/        NestJS REST API
  web/        Next.js frontend
docs/         Decisiones tecnicas
spec/         Documentacion de producto y arquitectura
```

## Configuracion local

Para una guia paso a paso de arranque despues de apagar o reiniciar la PC, ver [docs/inicio-local.md](docs/inicio-local.md).

1. Copiar variables de entorno:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

2. Levantar PostgreSQL:

```bash
npm run db:up
```

3. Generar Prisma Client:

```bash
npm run prisma:generate
```

4. Ejecutar backend:

```bash
npm run dev:api
```

5. Ejecutar frontend en otra terminal:

```bash
npm run dev:web
```

## URLs locales

- Frontend: `http://localhost:3000`
- API health: `http://localhost:3001/api/health`
- Swagger: `http://localhost:3001/api/docs`
- PostgreSQL: `localhost:5432`

## Primer modulo: auth, usuarios y onboarding

Implementado:

- Signup publico de entrenadores en `/signup`, con email/password propios de la plataforma.
- Login en `/login`.
- Estado de cuenta en `/access-status`.
- Dashboard interno en `/dashboard`, bloqueado para usuarios no activos.
- Panel admin de solicitudes en `/admin/pending-trainers`.
- API de perfil/sesion en `/api/auth/me` y `/api/auth/session`.
- API admin para listar, aprobar y rechazar entrenadores pendientes.

### Crear el primer administrador

Completar estas variables en `apps/api/.env`:

```env
FIRST_ADMIN_EMAIL=admin@example.com
FIRST_ADMIN_PASSWORD=password-seguro
FIRST_ADMIN_FIRST_NAME=Admin
FIRST_ADMIN_LAST_NAME=Principal
FIRST_ADMIN_TENANT_NAME=Proyecto Gym
```

Ejecutar:

```powershell
npm.cmd run seed:first-admin --workspace api
```

El seed crea el admin si no existe ningun usuario con rol `ADMIN`. Si ya existe, actualiza su password y lo deja `ACTIVE`.

### Probar el flujo manualmente

1. Aplicar migraciones:

```powershell
npm.cmd run prisma:migrate --workspace api
```

2. Crear el primer admin con el seed anterior.
3. Entrar como admin en `/login`.
4. Registrar un entrenador desde `/signup`.
5. Iniciar sesion como entrenador con el email/password registrado: debe ir a `/access-status` y no al dashboard.
6. Entrar como admin a `/admin/pending-trainers`.
7. Aprobar el entrenador.
8. Iniciar sesion como entrenador: ahora debe acceder a `/dashboard`.
9. Repetir con otro entrenador y rechazarlo: debe quedar bloqueado en `/access-status`.

Decision tecnica documentada para este modulo: la autenticacion queda en base de datos local para evitar duplicacion de perfil con proveedores externos y preparar el mismo enfoque para alumnos cuando exista ese rol. Los entrenadores registrados publicamente nacen con su propio tenant, pero el listado de pendientes es global para administradores. Esto prioriza el requerimiento confirmado de aprobacion admin. Las reglas finas de tenant/ownership se aplicaran en los modulos de negocio siguientes.

## Alcance de esta base

Esta preparacion ya incluye el primer modulo de autenticacion, usuarios y onboarding de entrenadores. No incluye modulos de alumnos, ejercicios, rutinas, feedback, IA ni exportaciones.

## Decisiones documentadas

Ver [docs/technical-decisions.md](docs/technical-decisions.md).

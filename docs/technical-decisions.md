# Technical Decisions

## Decisions Adopted

- Frontend: Next.js with TypeScript in `apps/web`.
- Backend: NestJS with TypeScript as an independent REST API in `apps/api`.
- API contract: OpenAPI/Swagger enabled at `/api/docs`.
- Database: PostgreSQL via Docker Compose for local development.
- ORM: Prisma, configured against PostgreSQL.
- Authentication: local database auth for this MVP module. Users authenticate with platform-owned email/password credentials stored as salted `scrypt` hashes, and the API issues its own signed JWT. This replaces the earlier Supabase Auth direction because the product flow should not require duplicate name/profile capture between an external auth provider and the application database, and the same ownership model will later support student accounts if that role is introduced.
- Trainer onboarding: public signup is allowed for the operational trainer role. Personal trainers and gym professors are the same product role and are both modeled as `trainer`. Signup creates a pending approval account/request; trainers cannot access the system until an active administrator approves them. Rejected trainers remain blocked. Admins still have no public signup path.
- Pending trainer review: public trainer signup creates an independent tenant for the trainer account, but active admins can review the global pending trainer queue in this first module. This intentionally prioritizes the confirmed onboarding requirement. Business-data tenant and ownership restrictions remain mandatory for later modules.
- Project layout: npm workspaces with separate frontend and backend apps.
- Business modules beyond auth/users/onboarding are intentionally not created yet.

## Deferred Decisions

- Final production hosting provider for the backend: Render, Fly.io or Railway.
- Final production Postgres provider: Supabase Postgres or equivalent managed PostgreSQL.
- Final AI provider and concrete models.
- Numeric coverage threshold for the initial exercise catalog.
- Exact tenant convention for independent trainer versus gym.

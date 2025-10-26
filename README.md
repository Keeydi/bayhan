# E-Bayanihan Monorepo

E-Bayanihan is a disaster response and community support platform. This monorepo contains the Next.js web app, Express API, and shared packages.

## Structure

```
apps/
  api/   # Express.js API (Better Auth, Prisma, S3/MinIO)
  web/   # Next.js 15 + React 19 frontend
packages/
  auth/              # Authentication utilities
  database/          # Prisma client and schema
  schemas/           # Zod validation schemas
  ui/                # Shared UI components
  eslint-config/     # Shared ESLint configs
  typescript-config/ # Shared TS configs
```

## Getting Started

```bash
# Install dependencies
yarn install

# Setup database (Prisma)
cd packages/database
yarn prisma generate
yarn prisma db push
cd ../..

# Environment variables
cp apps/.env.example apps/.env
cp apps/web/.env.example apps/web/.env.local

# Development (starts API on 8000 and Web on 3000)
yarn dev
```

## Common Scripts

```bash
yarn dev         # Start all apps
yarn build       # Build all apps and packages
yarn start       # Start built apps
yarn lint        # Lint all packages
yarn check-types # Type-check all packages
```

## Documentation

- API README: `apps/api/README.md`
- Web README: `apps/web/README.md`
- Deployment Guide: `DEPLOYMENT.md`

## Services (local)

`docker-compose.yml` provides PostgreSQL, PgAdmin, and MinIO:

- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050`
- MinIO S3 API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## Tech Stack

- Backend: Express 5, TypeScript, Prisma, Better Auth
- Frontend: Next.js 15, React 19, Tailwind CSS, Radix UI
- Database: PostgreSQL (Prisma)
- Storage: MinIO/S3
- Monorepo: Turborepo, Yarn Workspaces

## License

MIT

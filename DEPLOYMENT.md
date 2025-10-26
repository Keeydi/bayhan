## E-Bayanihan Deployment Guide

This guide walks you through deploying the platform with PostgreSQL, MinIO (S3-compatible storage), the API, and the frontend.

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- Yarn 1.22+

### Architecture Overview

- PostgreSQL (port 5432)
- MinIO server (S3 API on 9000, Console on 9001)
- API service (port 8000)
- Web frontend (port 3000)

### 1) Infrastructure: PostgreSQL and MinIO

This repo contains a `docker-compose.yml` with PostgreSQL and MinIO services. Start them:

```bash
docker compose up -d database minio pgadmin
```

Services started:
- PostgreSQL: `localhost:5432`
- PgAdmin: `http://localhost:5050`
- MinIO S3 API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001` (login with `minioadmin/minioadmin` by default)

Create a bucket in MinIO (via Console or mc). Example using mc:

```bash
# Install mc if needed: https://min.io/docs/minio/linux/reference/minio-mc.html
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/e-bayanihan
mc anonymous set download local/e-bayanihan
```

Note: Adjust bucket name and access policy to your needs.

### 2) Environment Variables

The API uses a single env file under `apps/.env`. Create it if missing:

```bash
cp apps/.env.example apps/.env
```

Then edit `apps/.env` with your values. Example for local MinIO + PostgreSQL:

```env
# Server
NODE_ENV=production
PORT=8000

# Database (PostgreSQL)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/e_bayanihan?schema=public"

# Auth
BETTER_AUTH_SECRET=replace-me
BETTER_AUTH_URL=http://localhost:8000

# MinIO (S3-compatible)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
S3_ENDPOINT=http://localhost:9000
S3_FORCE_PATH_STYLE=true
AWS_S3_BUCKET=e-bayanihan

# Google Maps
GOOGLE_MAPS_API_KEY=replace-me

# Email (Resend)
RESEND_API_KEY=replace-me

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:3000
```

Frontend env under `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=replace-me
```

### 3) Database Setup (Prisma)

From the repo root:

```bash
yarn install
cd packages/database
yarn prisma generate
yarn prisma db push
cd ../..
```

### 4) Run the API

Development:

```bash
yarn dev    # starts all apps (web + api)

# or only the API
cd apps
yarn dev
```

Production (Docker):

```bash
# Build the API image (uses apps/api/Dockerfile)
docker build -t e-bayanihan-api ./apps/api

# Run with env file at apps/.env and expose 8000
docker run -d --name e-bayanihan-api \
  --env-file apps/.env \
  -p 8000:8000 \
  e-bayanihan-api
```

Health check:
- API: `http://localhost:8000/health` (or root as configured)

### 5) Run the Web Frontend

Development:

```bash
cd apps/web
yarn dev
# http://localhost:3000
```

Production:

```bash
cd apps/web
yarn build
yarn start
# http://localhost:3000
```

If you prefer Docker for the web app, add a simple Dockerfile in `apps/web/` and map `apps/web/.env.local` accordingly.

### 6) MinIO Notes

When using MinIO with AWS SDK v3:
- Set `S3_ENDPOINT` to your MinIO endpoint (e.g., `http://localhost:9000`)
- Set `S3_FORCE_PATH_STYLE=true` to force path-style URLs
- Set a valid `AWS_REGION` (e.g., `us-east-1`)
- Ensure your bucket exists and the API has access credentials

### 7) Common URLs

- Web: `http://localhost:3000`
- API: `http://localhost:8000`
- MinIO Console: `http://localhost:9001`
- PgAdmin: `http://localhost:5050`

### 8) Troubleshooting

- CORS: Ensure `FRONTEND_URL` matches your web origin in `apps/.env`
- MinIO: Verify bucket existence and credentials; check `S3_ENDPOINT` and `S3_FORCE_PATH_STYLE`
- Database: Confirm `DATABASE_URL` points to a reachable PostgreSQL and schema exists
- Ports: Make sure 3000 (web), 8000 (api), 5432 (db), 9000/9001 (minio) are free



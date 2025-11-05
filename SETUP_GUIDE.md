# How to Run E-Bayanihan System 🚀

This guide will help you get the E-Bayanihan monorepo up and running on your local machine.

## Prerequisites

Before you begin, ensure you have:

- **Node.js**: Version 18.0 or higher
- **Yarn**: Version 1.22.22 or higher
- **PostgreSQL**: Database server (or use Docker Compose)
- **Git**: For version control

## Quick Start

### Step 1: Install Dependencies

From the root directory, install all dependencies:

```bash
yarn install
```

This will install dependencies for all packages in the monorepo (API, Web, and shared packages).

### Step 2: Set Up Database

You have two options:

#### Option A: Using Docker Compose (Recommended for Development)

Start PostgreSQL and other services:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port `5432`
- pgAdmin on port `5050`
- MinIO (S3-compatible storage) on ports `9000` and `9001`

**Database credentials** (from docker-compose.yml):
- User: `postgres`
- Password: `postgres`
- Database: `postgres`
- Port: `5432`

#### Option B: Using Local PostgreSQL

If you have PostgreSQL installed locally, make sure it's running and create a database named `e_bayanihan` (or use any name you prefer).

### Step 3: Configure Database

Navigate to the database package and set up Prisma:

```bash
cd packages/database

# Generate Prisma client
yarn prisma generate

# Run database migrations
yarn prisma db push

# (Optional) Seed the database with initial data
yarn prisma db seed

# Return to root
cd ../..
```

### Step 4: Configure Environment Variables

You need to create environment files for both the API and Web apps.

#### For the API (`apps/api/.env`):

Create `apps/api/.env` file with:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-auth-key-here-change-this
BETTER_AUTH_URL=http://localhost:3001

# AWS S3 Configuration (or use MinIO from Docker)
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ENDPOINT=http://localhost:9000

# Google Maps Configuration
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Email Configuration (Resend)
RESEND_API_KEY=your-resend-api-key

# Frontend URL (for CORS and redirects)
FRONTEND_URL=http://localhost:3000

# Twilio Configuration (for SMS alerts - optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
```

#### For the Web App (`apps/web/.env.local`):

Create `apps/web/.env.local` file with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Better Auth Configuration
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3001
NEXT_PUBLIC_BETTER_AUTH_SECRET=your-super-secret-auth-key-here-change-this

# Google Maps Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Socket.io Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

**Important Notes:**
- Replace placeholder values with your actual API keys
- Make sure `BETTER_AUTH_SECRET` and `NEXT_PUBLIC_BETTER_AUTH_SECRET` match
- For local development, you can use MinIO (from Docker) instead of AWS S3

### Step 5: Run the System

From the root directory, start all applications in development mode:

```bash
yarn dev
```

This will start:
- **API Server** at `http://localhost:3001`
- **Web Application** at `http://localhost:3000`

The `yarn dev` command uses Turborepo to run both apps simultaneously with hot-reloading.

## Available Commands

From the root directory:

| Command | Description |
|---------|-------------|
| `yarn dev` | Start all apps in development mode |
| `yarn build` | Build all apps for production |
| `yarn start` | Start all apps in production mode |
| `yarn lint` | Run linting for all packages |
| `yarn format` | Format code with Prettier |
| `yarn check-types` | Check TypeScript types |

### Running Individual Apps

#### API Only:

```bash
cd apps/api
yarn dev
```

#### Web Only:

```bash
cd apps/web
yarn dev
```

## Accessing Services

Once running, you can access:

- **Web Application**: http://localhost:3000
- **API Server**: http://localhost:3001
- **pgAdmin** (if using Docker): http://localhost:5050
  - Email: `pgadmin@test.com`
  - Password: `pgadmin`
- **MinIO Console** (if using Docker): http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin`

## Troubleshooting

### Database Connection Issues

1. Make sure PostgreSQL is running:
   - If using Docker: `docker-compose ps` to check status
   - If using local PostgreSQL: Check if the service is running

2. Verify your `DATABASE_URL` in `apps/api/.env` matches your database credentials

3. Check if the database exists:
   ```bash
   cd packages/database
   yarn prisma db push
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

- **For API**: Change `PORT` in `apps/api/.env`
- **For Web**: Use `yarn dev -- -p 3002` (or modify the dev script)

### Module Not Found Errors

1. Make sure all dependencies are installed: `yarn install`
2. Generate Prisma client: `cd packages/database && yarn prisma generate`
3. Rebuild packages: `yarn build`

### TypeScript Errors

Run type checking:
```bash
yarn check-types
```

## Production Build

To build and run in production mode:

```bash
# Build all applications
yarn build

# Start all applications
yarn start
```

## Next Steps

1. Check the API documentation at `apps/api/README.md`
2. Check the Web documentation at `apps/web/README.md`
3. Explore the API endpoints at `http://localhost:3001`
4. Access the web interface at `http://localhost:3000`

## Support

For issues or questions, refer to:
- API README: `apps/api/README.md`
- Web README: `apps/web/README.md`
- GitHub Repository: https://github.com/dev-laww/e-bayanihan

---

**Happy coding! 🎉**


# Step-by-Step: How to Run E-Bayanihan 🚀

Follow these steps in order to get the system running:

## Prerequisites Check ✅

Before starting, make sure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ Yarn installed (`yarn --version`)
- ✅ Docker Desktop installed and running (for database)

---

## Step 1: Install Dependencies

Open your terminal in the project root and run:

```bash
yarn install
```

**What this does:** Installs all dependencies for the monorepo (API, Web, and shared packages).

**Expected time:** 2-5 minutes

---

## Step 2: Start Database with Docker

Start PostgreSQL and other services:

```bash
docker-compose up -d
```

**What this does:** Starts PostgreSQL, pgAdmin, and MinIO in the background.

**Verify it's running:**
```bash
docker-compose ps
```

You should see 3 services running: `database`, `pgadmin`, and `minio`.

---

## Step 3: Set Up Database Schema

Navigate to the database package and initialize Prisma:

```bash
cd packages/database
yarn prisma generate
yarn prisma db push
cd ../..
```

**What this does:**
- `prisma generate`: Creates the Prisma client
- `prisma db push`: Creates all database tables

**Note:** If you see errors, make sure Docker Compose is running (Step 2).

---

## Step 4: Create API Environment File

Create the environment file for the API:

```bash
# Create the file
New-Item -Path "apps/api/.env" -ItemType File
```

Then open `apps/api/.env` and add this content:

```env
NODE_ENV=development
PORT=8000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
BETTER_AUTH_SECRET=change-this-to-a-random-secret-key
BETTER_AUTH_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
AWS_S3_ENDPOINT=http://localhost:9000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=minioadmin
AWS_SECRET_ACCESS_KEY=minioadmin
AWS_S3_IMAGES_BUCKET=images
AWS_S3_CREDENTIALS_BUCKET=credentials
GOOGLE_MAPS_API_KEY=your-google-maps-key-here
RESEND_API_KEY=your-resend-key-here
COOKIE_DOMAIN=localhost
```

**Important:** Replace `BETTER_AUTH_SECRET` with a random string (you can generate one online or use any random string).

**Note:** For local development, you can leave API keys empty if you're not using those features yet.

---

## Step 5: Create Web Environment File

Create the environment file for the web app:

```bash
# Create the file
New-Item -Path "apps/web/.env.local" -ItemType File
```

Then open `apps/web/.env.local` and add this content:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_SECRET=change-this-to-a-random-secret-key
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key-here
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG=false
```

**Important:** Use the **same** `BETTER_AUTH_SECRET` value as in Step 4!

---

## Step 6: Run the System

From the root directory, start everything:

```bash
yarn dev
```

**What this does:** Starts both the API server and Web application simultaneously.

**You should see:**
- API server starting on `http://localhost:8000`
- Web app starting on `http://localhost:3000`

**Wait for:** Both servers to show "ready" or "compiled successfully"

---

## Step 7: Access the Application

Open your browser and navigate to:

- 🌐 **Web Application:** http://localhost:3000
- 🔌 **API Server:** http://localhost:8000

**Additional Services (if using Docker):**
- 📊 **pgAdmin:** http://localhost:5050
  - Email: `pgadmin@test.com`
  - Password: `pgadmin`
- 🗄️ **MinIO Console:** http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin`

---

## Troubleshooting 🔧

### Issue: "Cannot find module" errors
**Solution:** Make sure you ran `yarn install` (Step 1) and `yarn prisma generate` (Step 3).

### Issue: Database connection errors
**Solution:** 
1. Check Docker is running: `docker-compose ps`
2. Verify DATABASE_URL in `apps/api/.env` matches docker-compose.yml
3. Restart Docker: `docker-compose restart database`

### Issue: Port already in use
**Solution:** 
- Stop other applications using ports 3000 or 8000
- Or change the PORT in `apps/api/.env`

### Issue: Environment variables not loading
**Solution:** 
- Make sure files are named exactly `.env` (API) and `.env.local` (Web)
- Restart the dev server after creating environment files

---

## Quick Command Reference

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# View database logs
docker-compose logs database

# Reset database
cd packages/database
yarn prisma db push --force-reset
cd ../..

# Run only API
cd apps/api && yarn dev

# Run only Web
cd apps/web && yarn dev
```

---

## Success Checklist ✅

- [ ] Dependencies installed
- [ ] Docker services running
- [ ] Database schema created
- [ ] API `.env` file created
- [ ] Web `.env.local` file created
- [ ] Both servers running (`yarn dev`)
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:8000

---

**You're all set! 🎉**

If you encounter any issues, check the troubleshooting section or refer to the detailed `SETUP_GUIDE.md`.







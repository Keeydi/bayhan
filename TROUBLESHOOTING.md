# Troubleshooting: Database Connection Issues 🔧

## Issue: "Can't reach database server"

### Solution 1: Start Docker Desktop (Recommended)

1. **Open Docker Desktop**
   - Search for "Docker Desktop" in Windows Start menu
   - Click to open it
   - Wait for the Docker icon in system tray to show "Docker Desktop is running"

2. **Verify Docker is running:**
   ```powershell
   docker ps
   ```
   Should return containers or an empty list (not an error)

3. **Start the services:**
   ```powershell
   docker-compose up -d
   ```

4. **Wait 10-15 seconds** for PostgreSQL to fully start

5. **Check services are running:**
   ```powershell
   docker-compose ps
   ```
   You should see 3 services: `database`, `pgadmin`, `minio`

6. **Setup database:**
   ```powershell
   cd packages/database
   yarn prisma db push
   cd ../..
   ```

### Solution 2: Use Cloud Database (Alternative)

If Docker isn't working, you can use a free cloud PostgreSQL database:

#### Option A: Supabase (Recommended)
1. Go to https://supabase.com
2. Create a free account
3. Create a new project
4. Copy the connection string from Settings > Database
5. Update `apps/api/.env`:
   ```env
   DATABASE_URL="your-supabase-connection-string-here"
   ```

#### Option B: Neon
1. Go to https://neon.tech
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Update `apps/api/.env` with the connection string

### Solution 3: Install PostgreSQL Locally

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Create a database:
   ```sql
   CREATE DATABASE e_bayanihan;
   ```
4. Update `apps/api/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/e_bayanihan"
   ```

## Quick Fix Script

Run this PowerShell script to automatically check and start everything:

```powershell
.\start-system.ps1
```

## Verify Environment Files

Make sure these files exist:
- ✅ `apps/api/.env` 
- ✅ `apps/web/.env.local`

## Common Errors

### Error: "P1001: Can't reach database server"
**Cause:** Database service is not running
**Fix:** Start Docker Desktop or use a cloud database

### Error: "Connection refused"
**Cause:** Docker services haven't fully started
**Fix:** Wait 10-15 seconds after `docker-compose up -d`

### Error: "Authentication failed"
**Cause:** Wrong database credentials
**Fix:** Check `DATABASE_URL` in `apps/api/.env` matches your database

### Error: "Module not found"
**Cause:** Dependencies not installed
**Fix:** Run `yarn install` from root directory

## Getting Help

1. Check Docker Desktop is running: `docker ps`
2. Check services: `docker-compose ps`
3. Check database logs: `docker-compose logs database`
4. Verify environment files exist and have correct values






# E-Bayanihan System Startup Script
Write-Host "🚀 Starting E-Bayanihan System..." -ForegroundColor Cyan

# Step 1: Check Docker
Write-Host "`n📦 Checking Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker ps 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker Desktop is not running!" -ForegroundColor Red
        Write-Host "   Please start Docker Desktop and wait for it to be ready, then run this script again." -ForegroundColor Yellow
        Write-Host "   Or run: docker-compose up -d" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed or not running!" -ForegroundColor Red
    exit 1
}

# Step 2: Start Docker Services
Write-Host "`n🐳 Starting Docker services (PostgreSQL, pgAdmin, MinIO)..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker services!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker services started" -ForegroundColor Green

# Wait a bit for services to be ready
Write-Host "`n⏳ Waiting for database to be ready (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Step 3: Setup Database
Write-Host "`n🗄️  Setting up database schema..." -ForegroundColor Yellow
Set-Location packages/database
yarn prisma db push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to setup database!" -ForegroundColor Red
    Set-Location ../..
    exit 1
}
Write-Host "✅ Database schema created" -ForegroundColor Green
Set-Location ../..

# Step 4: Start the System
Write-Host "`n🎉 Starting E-Bayanihan system..." -ForegroundColor Cyan
Write-Host "   API will run on: http://localhost:8000" -ForegroundColor White
Write-Host "   Web will run on: http://localhost:3000" -ForegroundColor White
Write-Host "`n📝 Press Ctrl+C to stop the servers`n" -ForegroundColor Yellow

yarn dev






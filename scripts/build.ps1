# Build Syntora Todo Desktop Application
param(
    [switch]$Release,
    [switch]$Dev
)

Write-Host "🚀 Building Syntora Todo Desktop Application..." -ForegroundColor Green

if ($Dev) {
    Write-Host "Starting development mode..." -ForegroundColor Yellow
    npm run tauri:dev
} elseif ($Release) {
    Write-Host "Building production release..." -ForegroundColor Yellow
    
    # Clean previous builds
    if (Test-Path "out") {
        Remove-Item -Recurse -Force "out"
    }
    
    # Build Next.js
    Write-Host "Building Next.js frontend..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Next.js build failed!" -ForegroundColor Red
        exit 1
    }
    
    # Build Tauri
    Write-Host "Building Tauri desktop app..." -ForegroundColor Cyan
    npm run tauri:build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tauri build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host "📦 Executable location: src-tauri/target/release/app.exe" -ForegroundColor Yellow
    Write-Host "📦 Installer location: src-tauri/target/release/bundle/" -ForegroundColor Yellow
    
} else {
    Write-Host "Usage:" -ForegroundColor Cyan
    Write-Host "  .\build.ps1 -Dev      # Run in development mode" -ForegroundColor White
    Write-Host "  .\build.ps1 -Release  # Build for production" -ForegroundColor White
} 
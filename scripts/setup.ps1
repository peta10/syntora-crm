# Syntora Todo Desktop Setup Script
Write-Host "Setting up Syntora Todo Desktop Application..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if Rust is installed
try {
    $rustVersion = rustc --version
    Write-Host "✓ Rust found: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Rust not found. Installing Rust..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "rustup-init.exe"
    .\rustup-init.exe -y
    Remove-Item "rustup-init.exe"
    $env:PATH += ";$env:USERPROFILE\.cargo\bin"
    Write-Host "✓ Rust installed successfully" -ForegroundColor Green
}

# Install npm dependencies
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install

# Install Tauri CLI if not already installed
Write-Host "Installing Tauri CLI..." -ForegroundColor Yellow
npm install -g @tauri-apps/cli

# Build the Next.js app first
Write-Host "Building Next.js application..." -ForegroundColor Yellow
npm run build

# Build the Tauri desktop app
Write-Host "Building Tauri desktop application..." -ForegroundColor Yellow
npm run tauri:build

Write-Host "Setup complete! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Cyan
Write-Host "  npm run tauri:dev    - Run in development mode" -ForegroundColor White
Write-Host "  npm run tauri:build  - Build for production" -ForegroundColor White
Write-Host "  npm run build        - Build Next.js only" -ForegroundColor White
Write-Host ""
Write-Host "Your desktop app will be in src-tauri/target/release/" -ForegroundColor Yellow 
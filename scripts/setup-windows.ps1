# Protogen Windows Development Setup Script
# Run this script in PowerShell as Administrator

param(
    [switch]$SkipDns
)

Write-Host "🚀 Protogen Windows Development Environment Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if running as Administrator
function Check-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
        Write-Error "This script must be run as Administrator"
        Write-Error "Please right-click PowerShell and select 'Run as Administrator'"
        exit 1
    }
}

# Check prerequisites
function Check-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Docker Desktop
    try {
        docker --version | Out-Null
        Write-Success "Docker is installed"
    }
    catch {
        Write-Error "Docker is not installed or not running"
        Write-Error "Please install Docker Desktop and ensure it's running"
        exit 1
    }
    
    # Check if Docker is running
    try {
        docker info | Out-Null
        Write-Success "Docker is running"
    }
    catch {
        Write-Error "Docker is not running"
        Write-Error "Please start Docker Desktop"
        exit 1
    }
    
    # Check Docker Compose
    try {
        docker-compose --version | Out-Null
        Write-Success "Docker Compose is available"
    }
    catch {
        Write-Error "Docker Compose is not available"
        Write-Error "Please ensure Docker Compose is installed with Docker Desktop"
        exit 1
    }
    
    # Check WSL2
    try {
        wsl --status | Out-Null
        Write-Success "WSL2 is available"
    }
    catch {
        Write-Warning "WSL2 may not be available - this is required for the development environment"
    }
}

# Setup DNS configuration
function Setup-Dns {
    if ($SkipDns) {
        Write-Warning "Skipping DNS setup as requested"
        return
    }
    
    Write-Status "Setting up DNS configuration..."
    
    $hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    
    # Check if progress.local is already in hosts file
    $hostsContent = Get-Content $hostsPath
    if ($hostsContent -match "progress\.local") {
        Write-Warning "progress.local already exists in hosts file"
    } else {
        Write-Status "Adding progress.local to hosts file..."
        Add-Content $hostsPath "`n127.0.0.1 progress.local"
        Write-Success "Added progress.local to hosts file"
    }
    
    # Test DNS resolution
    try {
        $result = Resolve-DnsName "progress.local" -ErrorAction Stop
        Write-Success "DNS resolution working for progress.local"
    }
    catch {
        Write-Warning "DNS resolution may not be working yet (this is normal)"
    }
}

# Setup environment files
function Setup-Environment {
    Write-Status "Setting up environment files..."
    
    # Create API .env if it doesn't exist
    if (-not (Test-Path "api\.env")) {
        Write-Status "Creating api\.env file..."
        Copy-Item "env.template" "api\.env"
        Write-Success "Created api\.env file"
    } else {
        Write-Warning "api\.env already exists, skipping creation"
    }
}

# Build and start containers
function Start-Containers {
    Write-Status "Building and starting Docker containers..."
    
    # Build images
    Write-Status "Building Docker images..."
    docker-compose build
    
    # Start containers
    Write-Status "Starting containers..."
    docker-compose up -d
    
    # Wait for containers to be ready
    Write-Status "Waiting for containers to be ready..."
    Start-Sleep -Seconds 10
    
    Write-Success "Containers started successfully"
}

# Setup database
function Setup-Database {
    Write-Status "Setting up database..."
    
    # Wait for PostgreSQL to be ready
    Write-Status "Waiting for PostgreSQL to be ready..."
    do {
        Start-Sleep -Seconds 2
        $ready = docker-compose exec -T postgres pg_isready -U protogen 2>$null
    } while ($LASTEXITCODE -ne 0)
    
    # Run migrations
    Write-Status "Running database migrations..."
    docker-compose exec -T api php artisan migrate --force
    
    # Run seeders
    Write-Status "Running database seeders..."
    docker-compose exec -T api php artisan db:seed --force
    
    # Create admin user if it doesn't exist
    Write-Status "Creating admin user..."
    docker-compose exec -T api php artisan tinker --execute="
    if (!App\Models\User::where('email', 'admin@example.com')->exists()) {
        \$user = new App\Models\User();
        \$user->name = 'Admin User';
        \$user->email = 'admin@example.com';
        \$user->password = Hash::make('password');
        \$user->email_verified_at = now();
        \$user->is_admin = true;
        \$user->save();
        echo 'Created admin user: ' . \$user->email . PHP_EOL;
    } else {
        echo 'Admin user already exists' . PHP_EOL;
    }
    "
    
    Write-Success "Database setup completed"
}

# Build frontend assets
function Build-Frontend {
    Write-Status "Building frontend assets..."
    
    # Install dependencies and build CSS
    Write-Status "Installing npm dependencies and building CSS..."
    npm install
    npm run build:css:prod
    
    Write-Success "Frontend assets built successfully"
}

# Verify setup
function Verify-Setup {
    Write-Status "Verifying setup..."
    
    # Check if containers are running
    $running = docker-compose ps | Select-String "Up"
    if ($running) {
        Write-Success "All containers are running"
    } else {
        Write-Error "Some containers are not running"
        docker-compose ps
        exit 1
    }
    
    # Test API endpoint
    Write-Status "Testing API endpoint..."
    try {
        $response = Invoke-WebRequest -Uri "http://progress.local:8080/api/graph/nodes" -UseBasicParsing
        if ($response.Content -match "Unauthenticated") {
            Write-Success "API is responding correctly"
        } else {
            Write-Warning "API may not be responding correctly"
        }
    }
    catch {
        Write-Warning "Could not test API endpoint: $($_.Exception.Message)"
    }
    
    Write-Success "Setup verification completed"
}

# Display access information
function Show-AccessInfo {
    Write-Host ""
    Write-Host "🎉 Setup Complete! 🎉" -ForegroundColor Green
    Write-Host "======================" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Access your applications:" -ForegroundColor Cyan
    Write-Host "   • Admin Panel: http://progress.local:3001"
    Write-Host "   • UI Frontend: http://progress.local:3000"
    Write-Host "   • API: http://progress.local:8080"
    Write-Host "   • PostgreSQL: progress.local:5432"
    Write-Host "   • pgAdmin: http://progress.local:5050"
    Write-Host ""
    Write-Host "🔑 Admin Login Credentials:" -ForegroundColor Cyan
    Write-Host "   • Email: admin@example.com"
    Write-Host "   • Password: password"
    Write-Host ""
    Write-Host "📁 Useful Commands:" -ForegroundColor Cyan
    Write-Host "   • View logs: docker-compose logs -f"
    Write-Host "   • Stop services: docker-compose down"
    Write-Host "   • Restart services: docker-compose restart"
    Write-Host "   • Rebuild: docker-compose build --no-cache"
    Write-Host ""
    Write-Host "🚀 Happy coding!" -ForegroundColor Green
}

# Main execution
function Main {
    Write-Host "Starting complete setup..." -ForegroundColor Yellow
    
    Check-Administrator
    Check-Prerequisites
    Setup-Dns
    Setup-Environment
    Start-Containers
    Setup-Database
    Build-Frontend
    Verify-Setup
    Show-AccessInfo
}

# Run main function
Main

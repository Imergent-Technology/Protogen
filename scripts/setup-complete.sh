#!/bin/bash

# Protogen Complete Development Setup Script
# This script sets up the entire development environment from scratch

set -e  # Exit on any error

echo "🚀 Protogen Development Environment Setup"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root (needed for hosts file modification)
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        print_error "Please run as a regular user with sudo access"
        exit 1
    fi
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup DNS configuration
setup_dns() {
    print_status "Setting up DNS configuration..."
    
    # Check if progress.local is already in hosts file
    if grep -q "progress.local" /etc/hosts; then
        print_warning "progress.local already exists in /etc/hosts"
    else
        print_status "Adding progress.local to /etc/hosts..."
        echo "127.0.0.1 progress.local" | sudo tee -a /etc/hosts
        print_success "Added progress.local to /etc/hosts"
    fi
    
    # Check if we can resolve the domain
    if ping -c 1 progress.local &> /dev/null; then
        print_success "DNS resolution working for progress.local"
    else
        print_warning "DNS resolution may not be working yet (this is normal)"
    fi
}

# Setup environment files
setup_env() {
    print_status "Setting up environment files..."
    
    # Create API .env if it doesn't exist
    if [ ! -f "api/.env" ]; then
        print_status "Creating api/.env file..."
        cp env.template api/.env
        
        # Generate Laravel app key
        print_status "Generating Laravel application key..."
        docker-compose run --rm api php artisan key:generate
        
        print_success "Created api/.env with generated app key"
    else
        print_warning "api/.env already exists, skipping creation"
    fi
}

# Build and start containers
start_containers() {
    print_status "Building and starting Docker containers..."
    
    # Build images
    print_status "Building Docker images..."
    docker-compose build
    
    # Start containers
    print_status "Starting containers..."
    docker-compose up -d
    
    # Wait for containers to be ready
    print_status "Waiting for containers to be ready..."
    sleep 10
    
    print_success "Containers started successfully"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    until docker-compose exec -T postgres pg_isready -U protogen; do
        sleep 2
    done
    
    # Run migrations
    print_status "Running database migrations..."
    docker-compose exec -T api php artisan migrate --force
    
    # Run seeders
    print_status "Running database seeders..."
    docker-compose exec -T api php artisan db:seed --force
    
    # Create admin user if it doesn't exist
    print_status "Creating admin user..."
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
    
    print_success "Database setup completed"
}

# Build frontend assets
build_frontend() {
    print_status "Building frontend assets..."
    
    # Install dependencies and build CSS
    print_status "Installing npm dependencies and building CSS..."
    npm install
    npm run build:css:prod
    
    print_success "Frontend assets built successfully"
}

# Verify setup
verify_setup() {
    print_status "Verifying setup..."
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        print_success "All containers are running"
    else
        print_error "Some containers are not running"
        docker-compose ps
        exit 1
    fi
    
    # Test API endpoint
    print_status "Testing API endpoint..."
    if curl -s http://progress.local:8080/api/graph/nodes | grep -q "Unauthenticated"; then
        print_success "API is responding correctly"
    else
        print_warning "API may not be responding correctly"
    fi
    
    print_success "Setup verification completed"
}

# Display access information
show_access_info() {
    echo ""
    echo "🎉 Setup Complete! 🎉"
    echo "======================"
    echo ""
    echo "🌐 Access your applications:"
    echo "   • Admin Panel: http://progress.local:3001"
    echo "   • UI Frontend: http://progress.local:3000"
    echo "   • API: http://progress.local:8080"
    echo "   • PostgreSQL: progress.local:5432"
    echo "   • pgAdmin: http://progress.local:5050"
    echo ""
    echo "🔑 Admin Login Credentials:"
    echo "   • Email: admin@example.com"
    echo "   • Password: password"
    echo ""
    echo "📁 Useful Commands:"
    echo "   • View logs: docker-compose logs -f"
    echo "   • Stop services: docker-compose down"
    echo "   • Restart services: docker-compose restart"
    echo "   • Rebuild: docker-compose build --no-cache"
    echo ""
    echo "🚀 Happy coding!"
}

# Main execution
main() {
    echo "Starting complete setup..."
    
    check_root
    check_prerequisites
    setup_dns
    setup_env
    start_containers
    setup_database
    build_frontend
    verify_setup
    show_access_info
}

# Run main function
main "$@"

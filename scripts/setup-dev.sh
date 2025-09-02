#!/bin/bash

# Protogen Development Setup Script
echo "🚀 Setting up Protogen development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env file for development
echo "📝 Creating development environment file..."
cat > api/.env << EOF
APP_NAME=Protogen
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://progress.local:8080

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=protogen_dev
DB_USERNAME=protogen
DB_PASSWORD=your_secure_dev_password_here

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

MEMCACHED_HOST=127.0.0.1

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="\${APP_NAME}"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=mt1

VITE_APP_NAME="\${APP_NAME}"
VITE_PUSHER_APP_KEY="\${PUSHER_APP_KEY}"
VITE_PUSHER_HOST="\${PUSHER_HOST}"
VITE_PUSHER_PORT="\${PUSHER_PORT}"
VITE_PUSHER_SCHEME="\${PUSHER_SCHEME}"
VITE_PUSHER_APP_CLUSTER="\${PUSHER_APP_CLUSTER}"
EOF

echo "✅ Development environment file created!"
echo "⚠️  IMPORTANT: Update the DB_PASSWORD in api/.env with a secure password before continuing!"

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
cd api
composer install

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Run migrations
echo "🗄️ Running database migrations..."
php artisan migrate

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

echo "✅ Development environment setup complete!"
echo ""
echo "🎉 Next steps:"
echo "1. Update the DB_PASSWORD in api/.env with a secure password"
echo "2. Start the development server: docker-compose up (from base directory)"
echo "3. Access the application at: http://progress.local:8080"
echo "4. Access the UI at: http://progress.local:3000"
echo ""
echo "📝 For production deployment, update api/.env with your production database credentials" 
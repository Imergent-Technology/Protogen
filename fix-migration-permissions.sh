#!/bin/bash

# Fix permissions for Laravel migration files created in Docker
# This prevents WSL permission issues when editing files created by artisan commands

echo "🔧 Fixing migration file permissions..."

# Get current user info
USER_ID=$(id -u)
GROUP_ID=$(id -g)
USER_NAME=$(id -un)

echo "Setting ownership to $USER_NAME ($USER_ID:$GROUP_ID)..."

# Fix permissions for all migration files
docker-compose exec api find /var/www/database/migrations -name "*.php" -exec chown $USER_ID:$GROUP_ID {} \;

# Also fix permissions for any other files that might have been created
docker-compose exec api find /var/www -name "*.php" -user root -exec chown $USER_ID:$GROUP_ID {} \; 2>/dev/null || true

echo "✅ Migration file permissions fixed!"
echo "You should now be able to edit migration files in your IDE."

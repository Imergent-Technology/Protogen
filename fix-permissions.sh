#!/bin/bash

# Fix WSL/Docker permission issues for migration files
# This script changes ownership of files created in Docker containers to the WSL user

echo "Fixing permissions for migration files..."

# Get the current user ID
USER_ID=$(id -u)
GROUP_ID=$(id -g)

# Fix permissions for all migration files
docker-compose exec api find /var/www/database/migrations -name "*.php" -exec chown $USER_ID:$GROUP_ID {} \;

echo "Permissions fixed for migration files."
echo "Files are now owned by user $USER_ID:$GROUP_ID"

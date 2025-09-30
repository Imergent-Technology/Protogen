#!/bin/bash

# Restart Docker containers with proper user permissions
# This prevents WSL permission issues when creating files in Docker containers

echo "🔄 Restarting Docker containers with proper permissions..."

# Set environment variables for user ID
export UID=$(id -u)
export GID=$(id -g)

echo "Using user ID: $UID, group ID: $GID"

# Stop containers
echo "Stopping containers..."
docker-compose down

# Start containers with proper user permissions
echo "Starting containers with user permissions..."
docker-compose up -d

echo "✅ Containers restarted with proper permissions!"
echo "New files created in Docker containers will now be owned by your WSL user."

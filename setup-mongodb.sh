#!/bin/bash

# MongoDB Container Setup with Volume Persistence

# Create volumes explicitly (optional, but recommended)
docker volume create mongodb_data
docker volume create mongodb_config
docker volume create mongodb_logs

# Run MongoDB with full persistence setup
docker run -d \
  --name mongodb \
  --restart always \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=changeme \
  -v mongodb_data:/data/db \
  -v mongodb_config:/data/configdb \
  -v mongodb_logs:/var/log/mongodb \
  mongo:latest

# Verify container is running
sleep 5
docker ps | grep mongodb

# Display volume information
echo ""
echo "MongoDB volumes created:"
docker volume ls | grep mongodb

# Display connection information
echo ""
echo "✓ MongoDB is running with full persistence"
echo "Connection string: mongodb://admin:changeme@localhost:27017"
echo "Volumes:"
echo "  - mongodb_data:   Database files"
echo "  - mongodb_config: Configuration files"
echo "  - mongodb_logs:   Log files"

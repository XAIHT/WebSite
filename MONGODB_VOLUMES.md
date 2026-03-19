# MongoDB Docker Setup - Volume Reference

## Three Essential Volumes for MongoDB Persistence

| Volume | Path | Purpose | Persistence |
|--------|------|---------|-------------|
| `mongodb_data` | `/data/db` | Stores all database files (.wt files, journal) | **CRITICAL** - Contains actual data |
| `mongodb_config` | `/data/configdb` | Stores configuration and initialization scripts | Important for cluster setup |
| `mongodb_logs` | `/var/log/mongodb` | Stores MongoDB logs | Useful for debugging |

## Quick Start Options

### Option 1: Using Docker Compose (Recommended)
```bash
docker compose up -d
```
All volumes are auto-created and managed by Docker. Data persists across restarts.

### Option 2: Using Docker Run
```bash
# Create volumes
docker volume create mongodb_data
docker volume create mongodb_config
docker volume create mongodb_logs

# Run container
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
```

## Restart Resilience

The setup includes:
- ✅ **`--restart always`** - Container auto-restarts on Docker daemon restart
- ✅ **Named volumes** - Data persists even if container is deleted
- ✅ **Health checks** - Monitors container status
- ✅ **Proper permissions** - MongoDB ownership of directories

## Verify Data Persistence

```bash
# Check volumes exist
docker volume ls | grep mongodb

# Inspect volume location
docker volume inspect mongodb_data

# Connect to MongoDB
docker exec -it mongodb mongosh -u admin -p changeme

# Test persistence
docker container stop mongodb
docker container start mongodb
# Data will still be there
```

## Backup Volumes

```bash
# Create backup
docker run --rm -v mongodb_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mongodb_backup.tar.gz -C /data .

# Restore backup
docker run --rm -v mongodb_data:/data -v $(pwd):/backup \
  alpine tar xzf /backup/mongodb_backup.tar.gz -C /data
```

## Clean Up (WARNING: Destructive)

```bash
# Stop container
docker compose down

# Remove volumes (deletes data!)
docker volume rm mongodb_data mongodb_config mongodb_logs
```

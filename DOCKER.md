# Docker Deployment Guide

This guide covers how to containerize and deploy the Health Progress Tracker application using Docker.

## Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system
- [Docker Hub](https://hub.docker.com/) account (for publishing)
- Git (for version metadata)

## Quick Start

### 1. Build the Docker Image

```bash
# Build the image
npm run docker:build

# Build and test the image
npm run docker:build:test
```

### 2. Run the Application

```bash
# Using npm script
npm run docker:run

# Or using Docker directly
docker run -p 3000:3000 health-progress-tracker:latest

# Using Docker Compose
npm run docker:up
```

### 3. Publish to Docker Hub

```bash
# Set your Docker Hub username
export DOCKER_USERNAME=your-dockerhub-username  # Linux/Mac
set DOCKER_USERNAME=your-dockerhub-username     # Windows

# Login to Docker Hub
docker login

# Publish the image
npm run docker:publish
```

## Available Docker Commands

| Command | Description |
|---------|-------------|
| `npm run docker:build` | Build Docker image |
| `npm run docker:build:test` | Build and test Docker image |
| `npm run docker:publish` | Publish image to Docker Hub |
| `npm run docker:run` | Run the containerized application |
| `npm run docker:up` | Start application with Docker Compose |
| `npm run docker:down` | Stop Docker Compose services |
| `npm run docker:logs` | View application logs |

## Environment Variables

You can customize the Docker build and publish process using these environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCKER_USERNAME` | - | Your Docker Hub username (required for publishing) |
| `DOCKER_IMAGE_NAME` | `health-progress-tracker` | Name of the Docker image |
| `DOCKER_TAG` | `latest` | Tag for the Docker image |
| `DOCKER_REPO` | `$DOCKER_USERNAME/$DOCKER_IMAGE_NAME` | Full repository name |

### Example with Custom Settings

```bash
# Linux/Mac
export DOCKER_IMAGE_NAME=my-health-app
export DOCKER_TAG=v1.0.0
npm run docker:build

# Windows
set DOCKER_IMAGE_NAME=my-health-app
set DOCKER_TAG=v1.0.0
npm run docker:build
```

## Docker Compose

The included `docker-compose.yml` provides a complete setup with:

- Application container
- Persistent data volume for SQLite database
- Health checks
- Automatic restart policy

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

## Production Deployment

### Docker Swarm

```bash
# Deploy to Docker Swarm
docker stack deploy -c docker-compose.yml health-tracker
```

### Kubernetes

Create a deployment file `k8s-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: health-progress-tracker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: health-progress-tracker
  template:
    metadata:
      labels:
        app: health-progress-tracker
    spec:
      containers:
      - name: health-tracker
        image: your-username/health-progress-tracker:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
---
apiVersion: v1
kind: Service
metadata:
  name: health-tracker-service
spec:
  selector:
    app: health-progress-tracker
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

Deploy with:
```bash
kubectl apply -f k8s-deployment.yaml
```

## Image Details

### Multi-stage Build

The Dockerfile uses a multi-stage build process:

1. **Builder stage**: Installs all dependencies and builds the application
2. **Production stage**: Creates a minimal runtime image with only production dependencies

### Security Features

- Non-root user execution
- Minimal Alpine Linux base image
- Only production dependencies in final image
- Health check endpoint

### Image Size Optimization

- Multi-stage build reduces final image size
- `.dockerignore` excludes unnecessary files
- Alpine Linux base image for smaller footprint

## Troubleshooting

### Build Issues

1. **Permission denied on scripts**: The npm commands automatically handle script permissions
2. **Out of disk space**: Clean up unused Docker resources:
   ```bash
   docker system prune -a
   ```

### Runtime Issues

1. **Port already in use**: Change the port mapping:
   ```bash
   docker run -p 8080:3000 health-progress-tracker:latest
   ```

2. **Database permission issues**: Ensure the data volume has proper permissions:
   ```bash
   docker volume inspect health-progress-tracker_health-data
   ```

### Publishing Issues

1. **Authentication required**: Make sure you're logged in:
   ```bash
   docker login
   ```

2. **Repository doesn't exist**: Create the repository on Docker Hub first, or use:
   ```bash
   docker push --help
   ```

## Health Checks

The application includes built-in health checks:

- Docker health check pings the root endpoint
- 30-second interval with 3 retries
- 40-second startup period for initialization

View health status:
```bash
docker ps  # Shows health status
docker inspect container-name | grep Health -A 10
```

## Data Persistence

SQLite database data is persisted using Docker volumes:

- **Development**: Local volume `health-progress-tracker_health-data`
- **Production**: Configure external volume or database

### Backup Database

```bash
# Create backup
docker run --rm -v health-progress-tracker_health-data:/data -v $(pwd):/backup alpine tar czf /backup/db-backup.tar.gz -C /data .

# Restore backup
docker run --rm -v health-progress-tracker_health-data:/data -v $(pwd):/backup alpine tar xzf /backup/db-backup.tar.gz -C /data
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Publish Docker Image
on:
  push:
    tags: ['v*']
    
jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
        
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_TOKEN }}
          
      - name: Build and push
        run: |
          export DOCKER_USERNAME=${{ secrets.DOCKER_USERNAME }}
          export DOCKER_TAG=${GITHUB_REF#refs/tags/}
          npm run docker:build
          npm run docker:publish
```
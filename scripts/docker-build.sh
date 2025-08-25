#!/bin/bash

# Docker build script for Health Progress Tracker
set -e

# Configuration
IMAGE_NAME="${DOCKER_IMAGE_NAME:-health-progress-tracker}"
TAG="${DOCKER_TAG:-latest}"
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Building Docker image: $FULL_IMAGE_NAME${NC}"

# Build the Docker image
docker build \
  --tag "$FULL_IMAGE_NAME" \
  --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
  --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" \
  .

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Docker image built successfully: $FULL_IMAGE_NAME${NC}"
  
  # Display image information
  echo -e "${YELLOW}📊 Image information:${NC}"
  docker images "$IMAGE_NAME" | head -2
  
  # Optional: Test the image
  if [ "$1" == "--test" ]; then
    echo -e "${BLUE}🧪 Testing the built image...${NC}"
    docker run --rm -d -p 3001:3000 --name health-tracker-test "$FULL_IMAGE_NAME"
    
    # Wait for container to start
    sleep 5
    
    # Test health endpoint
    if curl -f http://localhost:3001/ > /dev/null 2>&1; then
      echo -e "${GREEN}✅ Image test successful${NC}"
    else
      echo -e "${RED}❌ Image test failed${NC}"
    fi
    
    # Clean up test container
    docker stop health-tracker-test > /dev/null 2>&1
  fi
else
  echo -e "${RED}❌ Docker image build failed${NC}"
  exit 1
fi
#!/bin/bash

# Docker publish script for Health Progress Tracker
set -e

# Configuration
DOCKER_USERNAME="${DOCKER_USERNAME:-}"
IMAGE_NAME="${DOCKER_IMAGE_NAME:-health-progress-tracker}"
TAG="${DOCKER_TAG:-latest}"
DOCKER_REPO="${DOCKER_REPO:-$DOCKER_USERNAME/$IMAGE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation
if [ -z "$DOCKER_USERNAME" ]; then
  echo -e "${RED}❌ Error: DOCKER_USERNAME environment variable is required${NC}"
  echo -e "${YELLOW}💡 Set it with: export DOCKER_USERNAME=your-dockerhub-username${NC}"
  exit 1
fi

# Check if user is logged in to Docker Hub
if ! docker info | grep -q "Username: $DOCKER_USERNAME"; then
  echo -e "${YELLOW}🔐 Please log in to Docker Hub first:${NC}"
  echo "docker login"
  exit 1
fi

LOCAL_IMAGE="$IMAGE_NAME:$TAG"
REMOTE_IMAGE="$DOCKER_REPO:$TAG"

echo -e "${BLUE}📤 Publishing Docker image to Docker Hub${NC}"
echo -e "${BLUE}   Local image: $LOCAL_IMAGE${NC}"
echo -e "${BLUE}   Remote image: $REMOTE_IMAGE${NC}"

# Check if local image exists
if ! docker images "$IMAGE_NAME" | grep -q "$TAG"; then
  echo -e "${RED}❌ Local image $LOCAL_IMAGE not found${NC}"
  echo -e "${YELLOW}💡 Build the image first with: npm run docker:build${NC}"
  exit 1
fi

# Tag image for Docker Hub
echo -e "${BLUE}🏷️  Tagging image for Docker Hub...${NC}"
docker tag "$LOCAL_IMAGE" "$REMOTE_IMAGE"

# Push to Docker Hub
echo -e "${BLUE}🚀 Pushing image to Docker Hub...${NC}"
docker push "$REMOTE_IMAGE"

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Image successfully published to Docker Hub!${NC}"
  echo -e "${GREEN}   Image URL: https://hub.docker.com/r/$DOCKER_REPO${NC}"
  echo -e "${YELLOW}📋 To pull this image, run:${NC}"
  echo "   docker pull $REMOTE_IMAGE"
  echo ""
  echo -e "${YELLOW}📋 To run this image, run:${NC}"
  echo "   docker run -p 3000:3000 $REMOTE_IMAGE"
else
  echo -e "${RED}❌ Failed to publish image to Docker Hub${NC}"
  exit 1
fi

# Optional: Create additional tags
if [ "$TAG" != "latest" ]; then
  read -p "$(echo -e ${YELLOW}🏷️  Also tag as 'latest'? [y/N]: ${NC})" -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    LATEST_REMOTE="$DOCKER_REPO:latest"
    echo -e "${BLUE}🏷️  Tagging and pushing as latest...${NC}"
    docker tag "$LOCAL_IMAGE" "$LATEST_REMOTE"
    docker push "$LATEST_REMOTE"
    echo -e "${GREEN}✅ Also published as: $LATEST_REMOTE${NC}"
  fi
fi
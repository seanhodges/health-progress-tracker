@echo off
setlocal enabledelayedexpansion

REM Docker publish script for Health Progress Tracker (Windows)

REM Configuration
if "%DOCKER_IMAGE_NAME%"=="" set DOCKER_IMAGE_NAME=health-progress-tracker
if "%DOCKER_TAG%"=="" set DOCKER_TAG=latest
if "%DOCKER_REPO%"=="" set DOCKER_REPO=%DOCKER_USERNAME%/%DOCKER_IMAGE_NAME%

REM Validation
if "%DOCKER_USERNAME%"=="" (
    echo [91m❌ Error: DOCKER_USERNAME environment variable is required[0m
    echo [93m💡 Set it with: set DOCKER_USERNAME=your-dockerhub-username[0m
    exit /b 1
)

set LOCAL_IMAGE=%DOCKER_IMAGE_NAME%:%DOCKER_TAG%
set REMOTE_IMAGE=%DOCKER_REPO%:%DOCKER_TAG%

echo [94m📤 Publishing Docker image to Docker Hub[0m
echo [94m   Local image: %LOCAL_IMAGE%[0m
echo [94m   Remote image: %REMOTE_IMAGE%[0m

REM Check if local image exists
docker images "%DOCKER_IMAGE_NAME%" | findstr "%DOCKER_TAG%" > nul
if %errorlevel% neq 0 (
    echo [91m❌ Local image %LOCAL_IMAGE% not found[0m
    echo [93m💡 Build the image first with: npm run docker:build[0m
    exit /b 1
)

REM Tag image for Docker Hub
echo [94m🏷️  Tagging image for Docker Hub...[0m
docker tag "%LOCAL_IMAGE%" "%REMOTE_IMAGE%"

REM Push to Docker Hub
echo [94m🚀 Pushing image to Docker Hub...[0m
docker push "%REMOTE_IMAGE%"

if %errorlevel% equ 0 (
    echo [92m✅ Image successfully published to Docker Hub![0m
    echo [92m   Image URL: https://hub.docker.com/r/%DOCKER_REPO%[0m
    echo [93m📋 To pull this image, run:[0m
    echo    docker pull %REMOTE_IMAGE%
    echo.
    echo [93m📋 To run this image, run:[0m
    echo    docker run -p 3000:3000 %REMOTE_IMAGE%
) else (
    echo [91m❌ Failed to publish image to Docker Hub[0m
    exit /b 1
)

endlocal
@echo off
setlocal enabledelayedexpansion

REM Docker build script for Health Progress Tracker (Windows)

REM Configuration
if "%DOCKER_IMAGE_NAME%"=="" set DOCKER_IMAGE_NAME=health-progress-tracker
if "%DOCKER_TAG%"=="" set DOCKER_TAG=latest
set FULL_IMAGE_NAME=%DOCKER_IMAGE_NAME%:%DOCKER_TAG%

echo [94m🐳 Building Docker image: %FULL_IMAGE_NAME%[0m

REM Get git commit hash for build metadata
for /f "tokens=*" %%a in ('git rev-parse --short HEAD 2^>nul') do set GIT_HASH=%%a
if "%GIT_HASH%"=="" set GIT_HASH=unknown

REM Get current date/time for build metadata
for /f "tokens=*" %%a in ('powershell -command "Get-Date -UFormat '%%Y-%%m-%%dT%%H:%%M:%%SZ'"') do set BUILD_DATE=%%a

REM Build the Docker image
docker build --tag "%FULL_IMAGE_NAME%" --build-arg BUILD_DATE="%BUILD_DATE%" --build-arg VCS_REF="%GIT_HASH%" .

if %errorlevel% equ 0 (
    echo [92m✅ Docker image built successfully: %FULL_IMAGE_NAME%[0m
    
    echo [93m📊 Image information:[0m
    docker images "%DOCKER_IMAGE_NAME%"
    
    REM Optional: Test the image
    if "%1"=="--test" (
        echo [94m🧪 Testing the built image...[0m
        docker run --rm -d -p 3001:3000 --name health-tracker-test "%FULL_IMAGE_NAME%"
        
        REM Wait for container to start
        timeout /t 5 /nobreak > nul
        
        REM Test health endpoint (using curl if available)
        curl -f http://localhost:3001/ > nul 2>&1
        if !errorlevel! equ 0 (
            echo [92m✅ Image test successful[0m
        ) else (
            echo [91m❌ Image test failed[0m
        )
        
        REM Clean up test container
        docker stop health-tracker-test > nul 2>&1
    )
) else (
    echo [91m❌ Docker image build failed[0m
    exit /b 1
)

endlocal
# buildDockerImages.ps1

# Stop script execution on errors
$ErrorActionPreference = "Stop"

# Get current date and time for unique filenames
$datetime = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "Running mvn clean package..."
# Build the Java application using Maven Wrapper
.\mvnw clean package

Write-Host "Setting up Docker buildx builder..."
try {
    # Create and use a multi-architecture Docker builder (if not already exists)
    docker buildx create --use --name multiarch-builder
}
catch {
    Write-Host "Builder probably already exists, continuing..."
}
docker buildx use multiarch-builder
docker buildx inspect --bootstrap

Write-Host "Building amd64 image..."
# Build Docker image for amd64 architecture and save it as a tar file
docker buildx build --platform linux/amd64 -t easykitchen:amd64 --load .
docker save easykitchen:amd64 -o "$env:USERPROFILE\Downloads\easykitchen_amd64_$datetime.tar"

Write-Host "Building arm64 image..."
# Build Docker image for arm64 architecture and save it as a tar file
docker buildx build --platform linux/arm64 -t easykitchen:arm64 --load .
docker save easykitchen:arm64 -o "$env:USERPROFILE\Downloads\easykitchen_arm64_$datetime.tar"

Write-Host "Builds and saves done."

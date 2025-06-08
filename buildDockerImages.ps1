# buildDockerImages.ps1

# Stoppt das Skript bei Fehlern
$ErrorActionPreference = "Stop"

# Datum + Uhrzeit für Dateinamen
$datetime = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "Running mvn clean package..."
.\mvnw clean package

Write-Host "Setting up Docker buildx builder..."
try {
    docker buildx create --use --name multiarch-builder
} catch {
    Write-Host "Builder probably already exists, continuing..."
}
docker buildx use multiarch-builder
docker buildx inspect --bootstrap

Write-Host "Building amd64 image..."
docker buildx build --platform linux/amd64 -t easykitchen:amd64 --load .
docker save easykitchen:amd64 -o "$env:USERPROFILE\Downloads\easykitchen_amd64_$datetime.tar"

Write-Host "Building arm64 image..."
docker buildx build --platform linux/arm64 -t easykitchen:arm64 --load .
docker save easykitchen:arm64 -o "$env:USERPROFILE\Downloads\easykitchen_arm64_$datetime.tar"

Write-Host "Builds and saves done."

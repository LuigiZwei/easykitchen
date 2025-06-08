# buildDockerImages.ps1

# Konfiguration
$BuilderName = "multiarch-builder"
$ImageBaseName = "easykitchen"
$DockerfilePath = "."

# Schritt 1: Erstelle und verwende den Buildx-Builder
Write-Host "Erstelle Buildx-Builder '$BuilderName'..." -ForegroundColor Cyan
docker buildx create --use --name $BuilderName 2>$null
docker buildx use $BuilderName

# Schritt 2: Build für AMD64
Write-Host "Baue Image für linux/amd64..." -ForegroundColor Cyan
docker buildx build --platform linux/amd64 -t "$ImageBaseName:amd64" --load $DockerfilePath
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Bauen des AMD64-Images!" -ForegroundColor Red
    exit 1
}
docker save "$ImageBaseName:amd64" -o "${ImageBaseName}_amd64.tar"
Write-Host "AMD64-Image gespeichert als ${ImageBaseName}_amd64.tar" -ForegroundColor Green

# Schritt 3: Build für ARM64
Write-Host "Baue Image für linux/arm64..." -ForegroundColor Cyan
docker buildx build --platform linux/arm64 -t "$ImageBaseName:arm64" --load $DockerfilePath
if ($LASTEXITCODE -ne 0) {
    Write-Host "Fehler beim Bauen des ARM64-Images!" -ForegroundColor Red
    exit 1
}
docker save "$ImageBaseName:arm64" -o "${ImageBaseName}_arm64.tar"
Write-Host "ARM64-Image gespeichert als ${ImageBaseName}_arm64.tar" -ForegroundColor Green

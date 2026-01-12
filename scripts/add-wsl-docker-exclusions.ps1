#Requires -RunAsAdministrator

# View all exclusions
# Get-MpPreference | Select-Object -ExpandProperty ExclusionPath
# Get-MpPreference | Select-Object -ExpandProperty ExclusionProcess

# # Or view in a formatted list
# Write-Host "Folder Exclusions:" -ForegroundColor Cyan
# (Get-MpPreference).ExclusionPath | ForEach-Object { Write-Host "  $_" }

# Write-Host "`nProcess Exclusions:" -ForegroundColor Cyan
# (Get-MpPreference).ExclusionProcess | ForEach-Object { Write-Host "  $_" }

Write-Host "Adding Windows Defender exclusions for Docker and WSL2..." -ForegroundColor Cyan

# Folder exclusions
$folderExclusions = @(
    "$env:USERPROFILE\AppData\Local\Docker",
    "$env:LOCALAPPDATA\Docker",
    "$env:PROGRAMDATA\Docker",
    "C:\Program Files\Docker"
)

# Find all WSL distributions
$wslPackages = Get-ChildItem "$env:LOCALAPPDATA\Packages" -Filter "*Linux*" -ErrorAction SilentlyContinue
$wslPackages += Get-ChildItem "$env:LOCALAPPDATA\Packages" -Filter "CanonicalGroupLimited*" -ErrorAction SilentlyContinue

foreach ($pkg in $wslPackages) {
    $folderExclusions += $pkg.FullName
}

# Add folder exclusions
foreach ($path in $folderExclusions) {
    if (Test-Path $path -ErrorAction SilentlyContinue) {
        Add-MpPreference -ExclusionPath $path -ErrorAction SilentlyContinue
        Write-Host "  [OK] Added folder: $path" -ForegroundColor Green
    } else {
        Write-Host "  [SKIP] Path not found: $path" -ForegroundColor Yellow
    }
}

# Process exclusions
$processExclusions = @(
    "Docker Desktop.exe",
    "com.docker.backend.exe",
    "com.docker.proxy.exe",
    "vpnkit.exe",
    "dockerd.exe",
    "docker.exe",
    "wsl.exe",
    "wslhost.exe",
    "wslservice.exe"
)

foreach ($proc in $processExclusions) {
    Add-MpPreference -ExclusionProcess $proc -ErrorAction SilentlyContinue
    Write-Host "  [OK] Added process: $proc" -ForegroundColor Green
}

Write-Host "`nExclusions added successfully!" -ForegroundColor Cyan
Write-Host "Restart Docker Desktop for changes to take effect." -ForegroundColor Yellow

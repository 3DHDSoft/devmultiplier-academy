# WSL2 Development Container Setup Guide

This guide covers setting up the DevMultiplier Academy development environment using WSL2 (Windows Subsystem for Linux 2) with VS Code Dev Containers.

## Prerequisites

- Windows 10 version 2004+ or Windows 11
- Administrator access
- At least 8GB RAM (16GB recommended)
- 20GB+ free disk space

## Step 1: Install WSL2

### Option A: Using PowerShell (Recommended)

Open PowerShell as Administrator and run:

```powershell
wsl --install
```

This command will:
- Enable WSL and Virtual Machine Platform features
- Download and install the Linux kernel
- Set WSL 2 as the default version
- Install Ubuntu as the default distribution

Restart your computer when prompted.

### Option B: Manual Installation

If `wsl --install` doesn't work, follow these steps:

1. Enable WSL feature:
   ```powershell
   dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
   ```

2. Enable Virtual Machine Platform:
   ```powershell
   dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
   ```

3. Restart your computer.

4. Download and install the [WSL2 Linux kernel update](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi).

5. Set WSL 2 as default:
   ```powershell
   wsl --set-default-version 2
   ```

6. Install Ubuntu from Microsoft Store or via:
   ```powershell
   wsl --install -d Ubuntu
   ```

## Step 2: Configure WSL2

### Verify Installation

```powershell
wsl --list --verbose
```

You should see Ubuntu running with VERSION 2.

### Configure Memory and CPU (Optional)

Create or edit `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
memory=8GB
processors=4
swap=2GB
localhostForwarding=true
```

Restart WSL after changes:
```powershell
wsl --shutdown
```

## Step 3: Install Docker Desktop

1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/).

2. During installation, ensure "Use WSL 2 based engine" is selected.

3. After installation, open Docker Desktop Settings:
   - Go to **Resources > WSL Integration**
   - Enable integration with your Ubuntu distribution
   - Click "Apply & Restart"

### Verify Docker in WSL2

Open Ubuntu terminal and run:
```bash
docker --version
docker compose version
```

## Step 4: Install VS Code and Extensions

1. Install [Visual Studio Code](https://code.visualstudio.com/).

2. Install required extensions:
   - **Dev Containers** (`ms-vscode-remote.remote-containers`)
   - **WSL** (`ms-vscode-remote.remote-wsl`)

   Or install from command line:
   ```powershell
   code --install-extension ms-vscode-remote.remote-containers
   code --install-extension ms-vscode-remote.remote-wsl
   ```

## Step 5: Clone the Repository

### Option A: Clone Inside WSL2 (Recommended for Performance)

Open Ubuntu terminal:

```bash
# Navigate to your preferred directory
cd ~

# Clone the repository
git clone https://github.com/your-org/devmultiplier-academy.git

# Enter the directory
cd devmultiplier-academy
```

### Option B: Clone on Windows (Simpler but Slower)

Clone using Git for Windows, then access from WSL2.

> **Performance Note**: Storing the project inside WSL2's filesystem (`/home/username/`) provides significantly better I/O performance than accessing Windows drives (`/mnt/c/`).

## Step 6: Open in Dev Container

### From WSL2 Terminal

```bash
cd ~/devmultiplier-academy
code .
```

### From VS Code

1. Press `F1` or `Ctrl+Shift+P`
2. Type "Dev Containers: Reopen in Container"
3. Select it and wait for the container to build

The first build will take 5-10 minutes as it downloads and builds the container image.

## Step 7: Verify Setup

Once the container is running, open a terminal in VS Code and verify:

```bash
# Check shell
echo $SHELL
# Should output: /bin/zsh

# Check Oh My Zsh
omz version

# Check Node.js
node --version

# Check Bun
bun --version

# Check database connection
pg_isready -h postgres -U admin
```

## Troubleshooting

### Container Fails to Start

**Symptom**: Dev container hangs or fails during startup.

**Cause**: The `common-utils` feature's Oh My Zsh installation can break on WSL2.

**Solution**: This project installs Oh My Zsh directly in the Dockerfile (not via features) to avoid this issue. Ensure you have the latest `.devcontainer/Dockerfile`.

### Slow File System Performance

**Symptom**: Commands are slow, especially `bun install` or `git status`.

**Solutions**:
1. Move project to WSL2 filesystem:
   ```bash
   # From WSL2
   mv /mnt/c/Users/YourName/project ~/project
   ```

2. Add to `.wslconfig`:
   ```ini
   [wsl2]
   localhostForwarding=true
   ```

### Port Forwarding Not Working

**Symptom**: Cannot access `localhost:3000` from Windows browser.

**Solutions**:
1. Check Docker Desktop settings for WSL integration
2. In VS Code, check the "Ports" panel (View > Ports)
3. Manually forward: `Ctrl+Shift+P` > "Forward a Port"

### Docker Desktop Not Starting

**Symptom**: Docker fails to start or shows "Docker Desktop stopped".

**Solutions**:
1. Restart WSL:
   ```powershell
   wsl --shutdown
   ```
2. Restart Docker Desktop
3. Check Windows Services for "Docker Desktop Service"

### "Cannot connect to Docker daemon"

**Symptom**: Docker commands fail with connection errors.

**Solution**: Enable Docker integration in WSL:
1. Docker Desktop > Settings > Resources > WSL Integration
2. Enable your Ubuntu distribution
3. Apply & Restart

### Oh My Zsh Not Working

**Symptom**: Plain bash prompt instead of Powerlevel10k.

**Solutions**:
1. Rebuild the container: `Ctrl+Shift+P` > "Dev Containers: Rebuild Container"
2. Check the default shell:
   ```bash
   chsh -s /bin/zsh
   ```

### Powerlevel10k Font Issues

**Symptom**: Broken characters/symbols in the prompt.

**Solution**: Install a Nerd Font:
1. Download [MesloLGS NF](https://github.com/romkatv/powerlevel10k#meslo-nerd-font-patched-for-powerlevel10k)
2. Install on Windows
3. Configure VS Code:
   ```json
   {
     "terminal.integrated.fontFamily": "MesloLGS NF"
   }
   ```

## Performance Tips

### Store Projects in WSL2 Filesystem

```bash
# Bad - Windows filesystem (slow)
/mnt/c/Users/YourName/projects/devmultiplier-academy

# Good - WSL2 filesystem (fast)
/home/username/projects/devmultiplier-academy
```

### Allocate More Resources

Edit `%USERPROFILE%\.wslconfig`:
```ini
[wsl2]
memory=12GB
processors=6
```

### Exclude from Windows Defender Antivirus

Adding exclusions for Docker and WSL2 paths significantly improves performance by preventing real-time scanning of container operations and Linux filesystem access.

#### Method 1: Using Windows Security GUI

1. Open **Windows Security** (search "Windows Security" in Start menu)
2. Click **Virus & threat protection**
3. Scroll down and click **Manage settings** under "Virus & threat protection settings"
4. Scroll down to **Exclusions** and click **Add or remove exclusions**
5. Click **Add an exclusion** and select the appropriate type

**Add these folder exclusions:**

| Exclusion Type | Path |
|----------------|------|
| Folder | `%USERPROFILE%\AppData\Local\Docker` |
| Folder | `%LOCALAPPDATA%\Packages\CanonicalGroupLimited.Ubuntu*` |
| Folder | `%LOCALAPPDATA%\Docker` |
| Folder | `%PROGRAMDATA%\Docker` |
| Folder | `C:\Program Files\Docker` |

**Add WSL virtual disk location:**

The WSL2 virtual disk is typically located at:
```
%LOCALAPPDATA%\Packages\CanonicalGroupLimited.Ubuntu*\LocalState\ext4.vhdx
```

To find the exact path:
1. Open PowerShell
2. Run: `(Get-ChildItem "$env:LOCALAPPDATA\Packages" -Filter "CanonicalGroupLimited.Ubuntu*").FullName`
3. Add the returned path as a folder exclusion

**Add process exclusions:**

| Exclusion Type | Process |
|----------------|---------|
| Process | `%PROGRAMFILES%\Docker\Docker\Docker Desktop.exe` |
| Process | `%PROGRAMFILES%\Docker\Docker\resources\com.docker.backend.exe` |
| Process | `%PROGRAMFILES%\Docker\Docker\resources\vpnkit.exe` |
| Process | `%PROGRAMFILES%\Docker\Docker\resources\dockerd.exe` |
| Process | `wsl.exe` |
| Process | `wslhost.exe` |

#### Method 2: Using PowerShell (Recommended)

Open PowerShell as Administrator and run these commands:

```powershell
# Docker folder exclusions
Add-MpPreference -ExclusionPath "$env:USERPROFILE\AppData\Local\Docker"
Add-MpPreference -ExclusionPath "$env:LOCALAPPDATA\Docker"
Add-MpPreference -ExclusionPath "$env:PROGRAMDATA\Docker"
Add-MpPreference -ExclusionPath "C:\Program Files\Docker"

# WSL2 Ubuntu package folder (finds and adds automatically)
$ubuntuPath = (Get-ChildItem "$env:LOCALAPPDATA\Packages" -Filter "CanonicalGroupLimited.Ubuntu*" -ErrorAction SilentlyContinue).FullName
if ($ubuntuPath) {
    Add-MpPreference -ExclusionPath $ubuntuPath
    Write-Host "Added exclusion: $ubuntuPath" -ForegroundColor Green
} else {
    Write-Host "Ubuntu package not found - install WSL Ubuntu first" -ForegroundColor Yellow
}

# Docker process exclusions
Add-MpPreference -ExclusionProcess "Docker Desktop.exe"
Add-MpPreference -ExclusionProcess "com.docker.backend.exe"
Add-MpPreference -ExclusionProcess "vpnkit.exe"
Add-MpPreference -ExclusionProcess "dockerd.exe"

# WSL process exclusions
Add-MpPreference -ExclusionProcess "wsl.exe"
Add-MpPreference -ExclusionProcess "wslhost.exe"

# Verify exclusions were added
Write-Host "`nCurrent folder exclusions:" -ForegroundColor Cyan
(Get-MpPreference).ExclusionPath

Write-Host "`nCurrent process exclusions:" -ForegroundColor Cyan
(Get-MpPreference).ExclusionProcess
```

#### Method 3: Complete PowerShell Script

A ready-to-use script is available at `scripts/add-wsl-docker-exclusions.ps1`.

> **Important**: Run this script on **Windows PowerShell** (not WSL). The script uses Windows-specific commands to configure Windows Defender.

**How to run:**

1. Open **PowerShell as Administrator** (right-click PowerShell → "Run as administrator")
2. If you get an execution policy error, run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Navigate to the script and run it:
   ```powershell
   cd C:\Users\YourUsername\projects\devmultiplier-academy\scripts
   .\add-wsl-docker-exclusions.ps1
   ```

**Script contents:**

```powershell
#Requires -RunAsAdministrator

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
```

#### Verify Exclusions

To verify your exclusions are set correctly:

```powershell
# View all exclusions
Get-MpPreference | Select-Object -ExpandProperty ExclusionPath
Get-MpPreference | Select-Object -ExpandProperty ExclusionProcess

# Or view in a formatted list
Write-Host "Folder Exclusions:" -ForegroundColor Cyan
(Get-MpPreference).ExclusionPath | ForEach-Object { Write-Host "  $_" }

Write-Host "`nProcess Exclusions:" -ForegroundColor Cyan
(Get-MpPreference).ExclusionProcess | ForEach-Object { Write-Host "  $_" }
```

#### Remove Exclusions (If Needed)

```powershell
# Remove a specific folder exclusion
Remove-MpPreference -ExclusionPath "C:\Path\To\Remove"

# Remove a specific process exclusion
Remove-MpPreference -ExclusionProcess "processname.exe"
```

#### Security Considerations

> **Warning**: Adding antivirus exclusions reduces security scanning coverage. Only exclude paths that are necessary for performance and ensure you trust the software running in these locations.

- Docker and WSL are trusted Microsoft/Docker Inc. software
- The exclusions prevent scanning of container layers and Linux filesystem operations
- Files downloaded or created inside containers are still scanned when accessed from Windows
- Consider periodic manual scans of excluded folders

## Useful Commands

```bash
# List WSL distributions
wsl --list --verbose

# Set default distribution
wsl --set-default Ubuntu

# Shutdown all WSL instances
wsl --shutdown

# Update WSL
wsl --update

# Check WSL version
wsl --version
```

## Additional Resources

- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Docker Desktop WSL 2 Backend](https://docs.docker.com/desktop/wsl/)
- [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
- [Powerlevel10k Configuration](https://github.com/romkatv/powerlevel10k#configuration-wizard)

# ============================================================================
# SCRIPT DE DESPLIEGUE PARA API NAXINE - WINDOWS POWERSHELL
# ============================================================================

param(
    [switch]$Clean,
    [switch]$Build,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Logs,
    [switch]$Status
)

# Colores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Cyan = "Cyan"

# Función para imprimir mensajes con color
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Función para verificar Docker
function Test-Docker {
    try {
        $null = docker --version
        $null = docker-compose --version
        return $true
    }
    catch {
        Write-Error "Docker o Docker Compose no están instalados."
        Write-Info "Por favor instala Docker Desktop desde: https://docs.docker.com/desktop/windows/install/"
        return $false
    }
}

# Función para crear archivo .env
function Initialize-Environment {
    if (-not (Test-Path ".env")) {
        Write-Warning "Archivo .env no encontrado. Creando desde env.example..."
        Copy-Item "env.example" ".env"
        Write-Warning "Por favor edita el archivo .env con tus configuraciones antes de continuar."
        $response = Read-Host "¿Has editado el archivo .env? (y/n)"
        if ($response -ne "y" -and $response -ne "Y") {
            Write-Error "Despliegue cancelado. Edita el archivo .env y vuelve a ejecutar el script."
            exit 1
        }
    }
}

# Función para crear directorios necesarios
function Initialize-Directories {
    Write-Info "Creando directorios necesarios..."
    $directories = @("data", "logs", "ssl")
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
}

# Función para limpiar contenedores e imágenes
function Clear-Docker {
    Write-Info "Limpiando contenedores e imágenes antiguas..."
    docker-compose down --remove-orphans
    docker system prune -f
}

# Función para construir y levantar servicios
function Start-Services {
    Write-Info "Construyendo y levantando servicios..."
    docker-compose up --build -d
    
    Write-Info "Esperando a que los servicios estén listos..."
    Start-Sleep -Seconds 10
    
    # Verificar health check
    Write-Info "Verificando health check..."
    for ($i = 1; $i -le 30; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Success "API está funcionando correctamente!"
                break
            }
        }
        catch {
            if ($i -eq 30) {
                Write-Error "La API no responde después de 30 intentos."
                Write-Info "Revisando logs..."
                docker-compose logs naxine-api
                exit 1
            }
            Write-Info "Esperando... ($i/30)"
            Start-Sleep -Seconds 2
        }
    }
}

# Función para mostrar información del despliegue
function Show-DeploymentInfo {
    Write-Success "🎉 Despliegue completado exitosamente!"
    Write-Host ""
    Write-Host "📋 Información del despliegue:" -ForegroundColor $Cyan
    Write-Host "  • API: http://localhost:3000" -ForegroundColor White
    Write-Host "  • Documentación: http://localhost:3000/docs" -ForegroundColor White
    Write-Host "  • Health Check: http://localhost:3000/health" -ForegroundColor White
    Write-Host "  • Nginx (si está habilitado): http://localhost:80" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Comandos útiles:" -ForegroundColor $Cyan
    Write-Host "  • Ver logs: docker-compose logs -f naxine-api" -ForegroundColor White
    Write-Host "  • Detener servicios: docker-compose down" -ForegroundColor White
    Write-Host "  • Reiniciar servicios: docker-compose restart" -ForegroundColor White
    Write-Host "  • Ver estado: docker-compose ps" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Monitoreo:" -ForegroundColor $Cyan
    Write-Host "  • docker stats" -ForegroundColor White
    Write-Host "  • docker-compose logs -f" -ForegroundColor White
    Write-Host ""
    Write-Success "¡API Naxine está lista para usar! 🚀"
}

# Función principal de despliegue
function Deploy-Naxine {
    Write-Host "🚀 Iniciando despliegue de API Naxine..." -ForegroundColor $Cyan
    
    if (-not (Test-Docker)) {
        exit 1
    }
    
    Initialize-Environment
    Initialize-Directories
    
    if ($Clean) {
        Clear-Docker
    }
    
    Start-Services
    Show-DeploymentInfo
}

# Manejo de parámetros
if ($Build) {
    Write-Info "Construyendo imagen Docker..."
    docker build -t naxine-api .
    exit 0
}

if ($Start) {
    Write-Info "Iniciando servicios..."
    docker-compose up -d
    exit 0
}

if ($Stop) {
    Write-Info "Deteniendo servicios..."
    docker-compose down
    exit 0
}

if ($Restart) {
    Write-Info "Reiniciando servicios..."
    docker-compose restart
    exit 0
}

if ($Logs) {
    Write-Info "Mostrando logs..."
    docker-compose logs -f
    exit 0
}

if ($Status) {
    Write-Info "Estado de los servicios:"
    docker-compose ps
    exit 0
}

# Si no se especificó ningún parámetro, ejecutar despliegue completo
Deploy-Naxine

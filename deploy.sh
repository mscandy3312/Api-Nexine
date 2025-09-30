#!/bin/bash

# ============================================================================
# SCRIPT DE DESPLIEGUE PARA API NAXINE
# ============================================================================

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue de API Naxine..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes con color
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando desde env.example..."
    cp env.example .env
    print_warning "Por favor edita el archivo .env con tus configuraciones antes de continuar."
    read -p "¿Has editado el archivo .env? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Despliegue cancelado. Edita el archivo .env y vuelve a ejecutar el script."
        exit 1
    fi
fi

# Crear directorios necesarios
print_message "Creando directorios necesarios..."
mkdir -p data logs ssl

# Detener contenedores existentes
print_message "Deteniendo contenedores existentes..."
docker-compose down --remove-orphans

# Limpiar imágenes antiguas (opcional)
read -p "¿Deseas limpiar imágenes Docker antiguas? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_message "Limpiando imágenes antiguas..."
    docker system prune -f
fi

# Construir y levantar los servicios
print_message "Construyendo y levantando servicios..."
docker-compose up --build -d

# Esperar a que los servicios estén listos
print_message "Esperando a que los servicios estén listos..."
sleep 10

# Verificar el estado de los servicios
print_message "Verificando estado de los servicios..."
docker-compose ps

# Verificar health check
print_message "Verificando health check..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "API está funcionando correctamente!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "La API no responde después de 30 intentos."
        print_message "Revisando logs..."
        docker-compose logs naxine-api
        exit 1
    fi
    print_message "Esperando... ($i/30)"
    sleep 2
done

# Mostrar información del despliegue
print_success "🎉 Despliegue completado exitosamente!"
echo
echo "📋 Información del despliegue:"
echo "  • API: http://localhost:3000"
echo "  • Documentación: http://localhost:3000/docs"
echo "  • Health Check: http://localhost:3000/health"
echo "  • Nginx (si está habilitado): http://localhost:80"
echo
echo "🔧 Comandos útiles:"
echo "  • Ver logs: docker-compose logs -f naxine-api"
echo "  • Detener servicios: docker-compose down"
echo "  • Reiniciar servicios: docker-compose restart"
echo "  • Ver estado: docker-compose ps"
echo
echo "📊 Monitoreo:"
echo "  • docker stats"
echo "  • docker-compose logs -f"
echo

print_success "¡API Naxine está lista para usar! 🚀"

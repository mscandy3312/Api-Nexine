# 🐳 Docker - API Naxine

Este documento explica cómo dockerizar y desplegar la API de Naxine usando Docker y Docker Compose.

## 📋 Prerrequisitos

- [Docker](https://docs.docker.com/get-docker/) (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versión 2.0 o superior)
- Git (para clonar el repositorio)

## 🚀 Despliegue Rápido

### 1. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar con tus configuraciones
nano .env  # o tu editor preferido
```

### 2. Desplegar con Docker Compose

```bash
# Construir y levantar todos los servicios
docker-compose up --build -d

# Verificar que esté funcionando
curl http://localhost:3000/health
```

### 3. Usar Script de Despliegue (Linux/Mac)

```bash
# Hacer ejecutable y ejecutar
chmod +x deploy.sh
./deploy.sh
```

## 🏗️ Arquitectura de Servicios

### Servicios Incluidos

1. **naxine-api**: API principal de Node.js
2. **db**: Base de datos PostgreSQL (opcional)
3. **nginx**: Proxy reverso con Nginx (opcional)

### Puertos Expuestos

- `3000`: API principal
- `80`: Nginx (proxy reverso)
- `443`: Nginx HTTPS (si está configurado)
- `5432`: PostgreSQL (solo para desarrollo)

## 🔧 Configuración Detallada

### Variables de Entorno Importantes

```env
# Configuración del servidor
NODE_ENV=production
PORT=3000

# Base de datos
DB_DIALECT=sqlite  # o postgres para producción
DB_STORAGE=./data/database.sqlite

# Seguridad
JWT_SECRET=your-super-secret-jwt-key
TOKEN_CONFIRMATION_SECRET=your-token-confirmation-secret

# Email (opcional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Configuración de Base de Datos

#### SQLite (Desarrollo/Testing)
```env
DB_DIALECT=sqlite
DB_STORAGE=./data/database.sqlite
```

#### PostgreSQL (Producción)
```env
DB_DIALECT=postgres
DB_HOST=db
DB_PORT=5432
DB_NAME=naxine_prod
DB_USER=naxine_user
DB_PASS=naxine_password
```

## 📊 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f naxine-api

# Reiniciar un servicio
docker-compose restart naxine-api

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Monitoreo y Debugging

```bash
# Ver uso de recursos
docker stats

# Entrar al contenedor
docker-compose exec naxine-api sh

# Ver logs de un servicio específico
docker-compose logs naxine-api

# Verificar health check
curl http://localhost:3000/health
```

### Mantenimiento

```bash
# Limpiar imágenes no utilizadas
docker system prune -f

# Reconstruir solo la API
docker-compose build naxine-api

# Actualizar y reiniciar
docker-compose pull && docker-compose up -d
```

## 🔒 Configuración de Seguridad

### SSL/HTTPS

1. Coloca tus certificados SSL en la carpeta `ssl/`:
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. Descomenta la configuración HTTPS en `nginx.conf`

3. Reinicia los servicios:
   ```bash
   docker-compose restart nginx
   ```

### Variables de Entorno Seguras

- **NUNCA** uses las claves por defecto en producción
- Genera claves JWT seguras y únicas
- Usa contraseñas fuertes para la base de datos
- Configura CORS apropiadamente

## 📈 Escalabilidad

### Escalar la API

```bash
# Escalar a 3 instancias
docker-compose up --scale naxine-api=3 -d
```

### Load Balancer

El archivo `nginx.conf` ya incluye configuración para balancear carga entre múltiples instancias.

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Ver qué proceso usa el puerto
netstat -tulpn | grep :3000

# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambiar 3000 por 3001
```

#### 2. Base de datos no conecta
```bash
# Verificar logs de la base de datos
docker-compose logs db

# Verificar variables de entorno
docker-compose exec naxine-api env | grep DB_
```

#### 3. API no responde
```bash
# Verificar logs de la API
docker-compose logs naxine-api

# Verificar health check
curl -v http://localhost:3000/health

# Reiniciar la API
docker-compose restart naxine-api
```

### Logs Importantes

```bash
# Logs de la API
docker-compose logs naxine-api

# Logs de Nginx
docker-compose logs nginx

# Logs de la base de datos
docker-compose logs db

# Todos los logs
docker-compose logs
```

## 🔄 Actualizaciones

### Actualizar la Aplicación

```bash
# 1. Hacer pull de cambios
git pull origin main

# 2. Reconstruir y reiniciar
docker-compose up --build -d

# 3. Verificar que funcione
curl http://localhost:3000/health
```

### Backup de Datos

```bash
# Backup de la base de datos SQLite
docker-compose exec naxine-api cp /usr/src/app/data/database.sqlite /usr/src/app/backup-$(date +%Y%m%d).sqlite

# Backup de volúmenes
docker run --rm -v naxine_data:/data -v $(pwd):/backup alpine tar czf /backup/naxine-data-$(date +%Y%m%d).tar.gz -C /data .
```

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la configuración: `docker-compose config`
3. Consulta este README
4. Revisa la documentación de la API: `http://localhost:3000/docs`

---

**¡API Naxine dockerizada y lista para producción! 🚀**

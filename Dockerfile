# ============================================================================
# DOCKERFILE PARA API NAXINE - PRODUCCIÓN
# ============================================================================
# Imagen base optimizada de Node.js 20 Alpine
FROM node:20-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S naxine -u 1001

# Crear directorio de la aplicación
WORKDIR /usr/src/app

# Copiar archivos de dependencias primero (para cache de Docker)
COPY package*.json ./

# Instalar dependencias de producción únicamente
RUN npm ci --only=production && npm cache clean --force

# Copiar el código fuente de la aplicación
COPY . .

# Crear directorio para la base de datos SQLite
RUN mkdir -p /usr/src/app/data && chown -R naxine:nodejs /usr/src/app

# Cambiar al usuario no-root para seguridad
USER naxine

# Exponer el puerto de la aplicación
EXPOSE 3000

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Health check para verificar que la aplicación esté funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Usar dumb-init para manejar señales correctamente
ENTRYPOINT ["dumb-init", "--"]

# Comando para iniciar la aplicación
CMD ["node", "app.js"]

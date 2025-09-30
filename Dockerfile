# Imagen base
FROM node:18

# Crear carpeta dentro del contenedor
WORKDIR /usr/src/app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiar el resto del proyecto
COPY . .

# Exponer el puerto de la API
EXPOSE 3000

# Comando de inicio
CMD ["npm", "start"]

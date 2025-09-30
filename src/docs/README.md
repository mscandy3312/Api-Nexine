# Naxine - Sistema de Gestión de Profesionales de la Salud

## Descripción

Naxine es una plataforma que conecta pacientes con profesionales de la salud, facilitando la búsqueda, contratación y gestión de servicios médicos de manera eficiente y segura.

## Características Principales

- 🔐 **Autenticación OAuth** con JWT
- 👥 **Gestión de usuarios** con roles diferenciados
- 🏥 **Directorio de profesionales** con especialidades
- 📅 **Sistema de citas** y sesiones
- ⭐ **Sistema de valoraciones** y comentarios
- 💳 **Gestión de pagos** integrada
- 📧 **Notificaciones por email**
- 🔒 **Seguridad robusta** con validación de roles

## Arquitectura

- **Backend**: Node.js + Express
- **Base de datos**: MySQL/SQLite con Sequelize ORM
- **Autenticación**: JWT + Passport.js
- **Email**: Nodemailer
- **Validación**: Middleware personalizado

## Estructura del Proyecto

```
naxine/
├── routes/                 # Rutas de la API
│   ├── auth.js            # Autenticación
│   ├── usuarios.js        # Gestión de usuarios
│   ├── clientes.js        # Gestión de clientes
│   ├── profesionales.js   # Gestión de profesionales
│   ├── sesiones.js        # Gestión de sesiones
│   ├── valoraciones.js    # Sistema de valoraciones
│   ├── pagos.js          # Gestión de pagos
│   └── precios.js        # Gestión de precios
├── models.js              # Modelos de base de datos
├── oauthConfig.js         # Configuración OAuth
├── config.js              # Configuración general
├── app.js                 # Aplicación principal
├── package.json           # Dependencias
└── API_DOCUMENTATION.md   # Documentación completa
```

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd naxine
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=naxine
DB_USER=usuario
DB_PASS=contraseña

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
TOKEN_CONFIRMATION_SECRET=tu_token_confirmation_secret

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Servidor
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://naxine.com
```

4. **Ejecutar la aplicación**

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm start
```

## Uso

### Endpoints Principales

- **Autenticación**: `/auth`
- **Usuarios**: `/api/usuarios`
- **Clientes**: `/api/clientes`
- **Profesionales**: `/api/profesionales`
- **Sesiones**: `/api/sesiones`
- **Valoraciones**: `/api/valoraciones`
- **Pagos**: `/api/pagos`
- **Precios**: `/api/precios`

### Autenticación

La API utiliza autenticación JWT. Incluye el token en el header:

```
Authorization: Bearer <tu_jwt_token>
```

### Roles de Usuario

- **usuario**: Puede buscar profesionales y crear valoraciones
- **profesionista**: Puede gestionar sesiones y ver pagos
- **administrador**: Acceso completo al sistema

## Documentación

Para documentación completa de la API, consulta [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

## Desarrollo

### Estructura de Base de Datos

La aplicación utiliza Sequelize ORM con los siguientes modelos principales:

- **Usuario**: Información de usuarios del sistema
- **Cliente**: Información de pacientes
- **Profesional**: Información de profesionales de la salud
- **Sesion**: Citas y sesiones médicas
- **Valoracion**: Calificaciones y comentarios
- **Pago**: Transacciones de pago
- **Precio**: Tarifas por especialidad

### Agregar Nuevas Funcionalidades

1. Crear el modelo en `models.js`
2. Crear las rutas en `routes/`
3. Implementar validaciones y middleware
4. Actualizar la documentación

## Despliegue

### Docker

```bash
docker build -t naxine-api .
docker run -p 3000:3000 --env-file .env naxine-api
```

### Variables de Entorno de Producción

Asegúrate de configurar:
- `NODE_ENV=production`
- `JWT_SECRET` seguro
- `DB_*` para tu base de datos de producción
- `EMAIL_*` para notificaciones
- `FRONTEND_URL` para CORS

## Seguridad

- Tokens JWT con expiración de 24 horas
- Validación de roles en endpoints sensibles
- Sanitización de inputs
- CORS configurado
- Headers de seguridad

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC.

## Soporte

Para soporte técnico o reportar bugs, contacta al equipo de desarrollo.

---

**Naxine** - Conectando salud con tecnología 🏥💻
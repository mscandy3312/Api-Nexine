# API de Naxine - Documentación Completa

## Descripción General

Naxine es un sistema de gestión de profesionales de la salud que permite a los usuarios buscar y contratar servicios médicos, y a los profesionales gestionar sus sesiones y pagos.

## Información de la API

- **Versión**: 1.0.0
- **Base URL**: `http://localhost:3000` (desarrollo) / `https://api.naxine.com` (producción)
- **Autenticación**: JWT Bearer Token
- **Formato de datos**: JSON

## Autenticación

La API utiliza autenticación JWT. Para acceder a los endpoints protegidos, incluye el token en el header:

```
Authorization: Bearer <tu_jwt_token>
```

### Roles de Usuario

- **usuario**: Usuarios regulares - pueden ver profesionales y crear valoraciones
- **profesionista**: Profesionales - pueden gestionar sesiones y ver sus pagos
- **administrador**: Administradores - acceso completo al sistema

## Endpoints

### 1. Autenticación (`/auth`)

#### POST `/auth/register`
Registra un nuevo usuario.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123",
  "nombre": "Juan Pérez",
  "rol": "usuario"
}
```

**Response:**
```json
{
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "id_usuario": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "usuario",
    "email_verificado": false
  }
}
```

#### POST `/auth/login`
Inicia sesión de usuario.

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id_usuario": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "usuario"
  }
}
```

#### POST `/auth/verify-email`
Verifica el email del usuario.

**Body:**
```json
{
  "token": "token_de_verificacion"
}
```

#### POST `/auth/forgot-password`
Solicita restablecimiento de contraseña.

**Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

#### POST `/auth/reset-password`
Restablece la contraseña.

**Body:**
```json
{
  "token": "token_de_reset",
  "newPassword": "nueva_contraseña123"
}
```

### 2. Usuarios (`/api/usuarios`)

#### GET `/api/usuarios`
Obtiene lista de usuarios (solo administradores).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id_usuario": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez",
    "rol": "usuario",
    "activo": true,
    "fecha_creacion": "2024-01-01T00:00:00.000Z"
  }
]
```

#### GET `/api/usuarios/:id`
Obtiene un usuario específico.

#### PUT `/api/usuarios/:id`
Actualiza un usuario.

**Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "telefono": "+1234567890"
}
```

#### DELETE `/api/usuarios/:id`
Elimina un usuario (solo administradores).

### 3. Clientes (`/api/clientes`)

#### GET `/api/clientes`
Obtiene lista de clientes.

#### POST `/api/clientes`
Crea un nuevo cliente.

**Body:**
```json
{
  "nombre": "María García",
  "email": "maria@ejemplo.com",
  "telefono": "+1234567890",
  "fecha_nacimiento": "1990-01-01"
}
```

#### GET `/api/clientes/:id`
Obtiene un cliente específico.

#### PUT `/api/clientes/:id`
Actualiza un cliente.

#### DELETE `/api/clientes/:id`
Elimina un cliente.

### 4. Profesionales (`/api/profesionales`)

#### GET `/api/profesionales`
Obtiene lista de profesionales con filtros opcionales.

**Query Parameters:**
- `especialidad`: Filtrar por especialidad
- `ubicacion`: Filtrar por ubicación
- `disponible`: Filtrar por disponibilidad

**Example:** `/api/profesionales?especialidad=cardiologia&disponible=true`

#### POST `/api/profesionales`
Crea un nuevo profesional (solo administradores).

**Body:**
```json
{
  "id_usuario": 2,
  "especialidad": "Cardiología",
  "cedula_profesional": "CARD123456",
  "experiencia_anos": 5,
  "ubicacion": "Ciudad de México",
  "precio_consulta": 500.00,
  "disponible": true
}
```

#### GET `/api/profesionales/:id`
Obtiene un profesional específico.

#### PUT `/api/profesionales/:id`
Actualiza un profesional.

#### DELETE `/api/profesionales/:id`
Elimina un profesional.

### 5. Sesiones (`/api/sesiones`)

#### GET `/api/sesiones`
Obtiene lista de sesiones.

**Query Parameters:**
- `profesional_id`: Filtrar por profesional
- `cliente_id`: Filtrar por cliente
- `estado`: Filtrar por estado

#### POST `/api/sesiones`
Crea una nueva sesión.

**Body:**
```json
{
  "profesional_id": 1,
  "cliente_id": 2,
  "fecha_sesion": "2024-01-15T10:00:00.000Z",
  "duracion_minutos": 60,
  "tipo_consulta": "presencial",
  "notas": "Consulta de seguimiento"
}
```

#### GET `/api/sesiones/:id`
Obtiene una sesión específica.

#### PUT `/api/sesiones/:id`
Actualiza una sesión.

#### DELETE `/api/sesiones/:id`
Cancela una sesión.

### 6. Valoraciones (`/api/valoraciones`)

#### GET `/api/valoraciones`
Obtiene lista de valoraciones.

**Query Parameters:**
- `profesional_id`: Filtrar por profesional
- `cliente_id`: Filtrar por cliente

#### POST `/api/valoraciones`
Crea una nueva valoración.

**Body:**
```json
{
  "profesional_id": 1,
  "cliente_id": 2,
  "calificacion": 5,
  "comentario": "Excelente atención médica",
  "sesion_id": 1
}
```

#### GET `/api/valoraciones/:id`
Obtiene una valoración específica.

#### PUT `/api/valoraciones/:id`
Actualiza una valoración.

#### DELETE `/api/valoraciones/:id`
Elimina una valoración.

### 7. Pagos (`/api/pagos`)

#### GET `/api/pagos`
Obtiene lista de pagos.

**Query Parameters:**
- `profesional_id`: Filtrar por profesional
- `cliente_id`: Filtrar por cliente
- `estado`: Filtrar por estado

#### POST `/api/pagos`
Crea un nuevo pago.

**Body:**
```json
{
  "sesion_id": 1,
  "monto": 500.00,
  "metodo_pago": "tarjeta",
  "estado": "pendiente"
}
```

#### GET `/api/pagos/:id`
Obtiene un pago específico.

#### PUT `/api/pagos/:id`
Actualiza un pago.

### 8. Precios (`/api/precios`)

#### GET `/api/precios`
Obtiene lista de precios por especialidad.

#### POST `/api/precios`
Crea un nuevo precio (solo administradores).

**Body:**
```json
{
  "especialidad": "Cardiología",
  "precio_base": 500.00,
  "precio_consulta": 600.00,
  "precio_seguimiento": 300.00
}
```

#### PUT `/api/precios/:id`
Actualiza un precio.

## Códigos de Estado HTTP

- `200` - OK
- `201` - Creado
- `400` - Bad Request
- `401` - No autorizado
- `403` - Acceso denegado
- `404` - No encontrado
- `500` - Error interno del servidor

## Manejo de Errores

La API devuelve errores en formato JSON:

```json
{
  "message": "Descripción del error",
  "error": "Detalles adicionales (solo en desarrollo)"
}
```

## Variables de Entorno

Crea un archivo `.env` con las siguientes variables:

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

## Instalación y Ejecución

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

3. Ejecutar en desarrollo:
```bash
npm run dev
```

4. Ejecutar en producción:
```bash
npm start
```

## Base de Datos

La API utiliza Sequelize ORM con soporte para MySQL y SQLite. Las migraciones se ejecutan automáticamente al iniciar el servidor.

## Seguridad

- Autenticación JWT con tokens que expiran en 24 horas
- Validación de roles para endpoints sensibles
- Sanitización de inputs
- CORS configurado para dominios específicos
- Headers de seguridad recomendados

## Soporte

Para soporte técnico o reportar bugs, contacta al equipo de desarrollo.

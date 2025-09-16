# API de Naxine - Sistema de Autenticación con 3 Niveles de Usuario

Esta API implementa un sistema completo de autenticación con 3 niveles de usuario (usuario, administrador, profesionista) utilizando AWS Cognito y verificación por email.

## Características

- ✅ **3 Niveles de Usuario**: usuario, administrador, profesionista
- ✅ **AWS Cognito**: Autenticación robusta y escalable con AWS
- ✅ **Verificación por Email**: Tokens JWT enviados por correo
- ✅ **Autenticación JWT**: Tokens seguros para API
- ✅ **Control de Acceso Basado en Roles**: Middleware para diferentes permisos
- ✅ **Base de Datos SQLite**: Fácil configuración y desarrollo
- ✅ **API RESTful**: Endpoints organizados por recursos
- ✅ **Sincronización Automática**: Usuarios sincronizados entre BD local y Cognito

## Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
Copia `config.example.js` como `config.js` y configura las variables:

```javascript
module.exports = {
  NODE_ENV: 'development',
  PORT: 3000,
  JWT_SECRET: 'tu_clave_secreta_super_segura',
  TOKEN_CONFIRMATION_SECRET: 'token_confirm_secret',
  SESSION_SECRET: 'tu_session_secret',
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'tu_aws_access_key_id',
  AWS_SECRET_ACCESS_KEY: 'tu_aws_secret_access_key',
  COGNITO_USER_POOL_ID: 'us-east-1_XXXXXXXXX',
  COGNITO_CLIENT_ID: 'tu_cognito_client_id',
  EMAIL_USER: 'tu_correo@gmail.com',
  EMAIL_PASS: 'tu_contraseña_de_app',
  FRONTEND_URL: 'http://localhost:3000'
};
```

3. **Configurar AWS Cognito**:
   - Ve a [AWS Console](https://console.aws.amazon.com/)
   - Navega a Cognito en el servicio de Identity and Access Management
   - Crea un nuevo User Pool
   - Configura los atributos personalizados:
     - `custom:role` (String) - Para almacenar el rol del usuario
   - Crea un App Client
   - Configura las políticas de contraseña según tus necesidades
   - Anota el User Pool ID y Client ID

4. **Configurar Gmail para emails**:
   - Habilita la verificación en 2 pasos en tu cuenta de Google
   - Genera una contraseña de aplicación
   - Usa esa contraseña en `EMAIL_PASS`

5. **Ejecutar la aplicación**:
```bash
npm start
```

## Estructura de la API

### Endpoints de Autenticación (`/auth`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/auth/register` | Registro de usuario | Público |
| POST | `/auth/login` | Login con email/contraseña | Público |
| GET | `/auth/google` | Iniciar OAuth Google | Público |
| GET | `/auth/google/callback` | Callback OAuth Google | Público |
| GET | `/auth/verify-email/:token` | Verificar email | Público |
| POST | `/auth/resend-verification` | Reenviar verificación | Público |
| GET | `/auth/profile` | Obtener perfil | Autenticado |
| PUT | `/auth/profile` | Actualizar perfil | Autenticado |
| PUT | `/auth/change-password` | Cambiar contraseña | Autenticado |
| GET | `/auth/users` | Listar usuarios | Administrador |
| PUT | `/auth/users/:id/role` | Cambiar rol | Administrador |
| PUT | `/auth/users/:id/status` | Activar/desactivar | Administrador |

### Endpoints de Recursos

| Recurso | Endpoint | Descripción | Roles |
|---------|----------|-------------|-------|
| Clientes | `/api/clientes` | CRUD de clientes | Ver permisos específicos |
| Profesionales | `/api/profesionales` | CRUD de profesionales | Ver permisos específicos |
| Sesiones | `/api/sesiones` | CRUD de sesiones | Ver permisos específicos |
| Valoraciones | `/api/valoraciones` | CRUD de valoraciones | Ver permisos específicos |
| Pagos | `/api/pagos` | CRUD de pagos | Ver permisos específicos |
| Precios | `/api/precios` | CRUD de precios | Ver permisos específicos |

## Niveles de Usuario

### 1. Usuario (`usuario`)
- Puede registrarse y hacer login
- Puede ver su propio perfil
- Puede crear valoraciones
- Puede ver profesionales activos
- Puede ver precios

### 2. Profesionista (`profesionista`)
- Todos los permisos de usuario
- Puede crear y gestionar sesiones
- Puede ver sus propios pagos
- Puede actualizar su perfil profesional
- Puede ver valoraciones de sus servicios

### 3. Administrador (`administrador`)
- Todos los permisos de profesionista
- Puede gestionar todos los usuarios
- Puede cambiar roles de usuarios
- Puede activar/desactivar usuarios
- Puede gestionar todos los recursos
- Acceso completo a la API

## Flujo de Autenticación

### Registro Tradicional
1. Usuario se registra con email/contraseña
2. Se envía email de verificación
3. Usuario hace clic en el enlace del email
4. Cuenta queda verificada y activa

### AWS Cognito
1. Usuario se registra o inicia sesión a través de Cognito
2. Cognito maneja la autenticación y verificación
3. Se sincroniza automáticamente con la base de datos local
4. Se genera JWT con información del usuario y rol
5. Se retorna token para usar en API

### Login
1. Usuario ingresa credenciales
2. Se verifica email y contraseña
3. Se genera JWT con información del usuario
4. Se retorna token para usar en API

## Uso de la API

### Headers Requeridos
```javascript
{
  "Authorization": "Bearer tu_jwt_token",
  "Content-Type": "application/json"
}
```

### Ejemplo de Login
```javascript
const response = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@example.com',
    password: 'contraseña123'
  })
});

const data = await response.json();
// data.token contiene el JWT
```

### Ejemplo de Uso con JWT
```javascript
const response = await fetch('/api/profesionales', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## Base de Datos

La aplicación usa SQLite con Sequelize ORM. Las tablas principales son:

- `usuarios`: Información de usuarios y autenticación
- `profesionales`: Perfiles de profesionales
- `clientes`: Perfiles de clientes
- `sesiones`: Sesiones de servicios
- `valoraciones`: Valoraciones de servicios
- `pagos`: Información de pagos
- `precios`: Precios de servicios

## Seguridad

- Contraseñas encriptadas con bcrypt
- JWT con expiración de 24 horas
- Tokens de verificación con expiración de 24 horas
- Middleware de autenticación en todas las rutas protegidas
- Control de acceso basado en roles
- Validación de datos de entrada

## Desarrollo

Para desarrollo local:

1. Instala las dependencias
2. Configura las variables de entorno
3. Ejecuta `npm start`
4. La API estará disponible en `http://localhost:3000`

## Producción

Para producción:

1. Configura variables de entorno del servidor
2. Usa una base de datos PostgreSQL o MySQL
3. Configura HTTPS
4. Usa claves secretas seguras
5. Configura el dominio del frontend

## Soporte

Para soporte o preguntas, contacta al equipo de desarrollo.

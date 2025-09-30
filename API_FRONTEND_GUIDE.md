# 🚀 Guía de Integración Frontend - API Naxine

## 📋 Información General

**Base URL:** `http://localhost:3000` (desarrollo) / `https://tu-dominio.com` (producción)  
**Versión:** 1.0.0  
**Autenticación:** JWT Bearer Token  
**Formato:** JSON  

---

## 🔐 Autenticación

### Headers Requeridos
```http
Authorization: Bearer <tu_jwt_token>
Content-Type: application/json
```

### Obtener Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "rol": "usuario"
  }
}
```

---

## 📚 Endpoints Disponibles

### 🔑 Autenticación (`/auth`)

#### POST `/auth/register` - Registro de Usuario
```http
POST /auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "contraseña123",
  "telefono": "+1234567890"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "usuario",
    "activo": true
  }
}
```

**Errores:**
- `400` - Datos faltantes o email ya existe
- `500` - Error interno del servidor

#### POST `/auth/login` - Inicio de Sesión
```http
POST /auth/login
Content-Type: application/json

{
  "email": "juan@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "rol": "usuario"
  }
}
```

**Errores:**
- `400` - Credenciales inválidas
- `401` - Usuario no encontrado

#### GET `/auth/profile` - Obtener Perfil
```http
GET /auth/profile
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id_usuario": 1,
    "nombre": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+1234567890",
    "rol": "usuario",
    "activo": true,
    "fecha_registro": "2024-01-15T10:30:00.000Z"
  }
}
```

#### PUT `/auth/profile` - Actualizar Perfil
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nombre": "Juan Carlos Pérez",
  "telefono": "+1234567891"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "user": {
    "id_usuario": 1,
    "nombre": "Juan Carlos Pérez",
    "email": "juan@ejemplo.com",
    "telefono": "+1234567891",
    "rol": "usuario"
  }
}
```

---

### 👥 Usuarios (`/api/usuarios`)

#### GET `/api/usuarios` - Listar Usuarios (Solo Admin)
```http
GET /api/usuarios?page=1&limit=10&search=juan
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `search` (opcional): Búsqueda por nombre o email
- `rol` (opcional): Filtrar por rol (usuario, profesionista, administrador)
- `activo` (opcional): Filtrar por estado (true/false)

**Response (200):**
```json
{
  "success": true,
  "usuarios": [
    {
      "id_usuario": 1,
      "nombre": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "telefono": "+1234567890",
      "rol": "usuario",
      "activo": true,
      "fecha_registro": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50,
    "items_per_page": 10
  }
}
```

#### GET `/api/usuarios/stats/overview` - Estadísticas de Usuarios
```http
GET /api/usuarios/stats/overview
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "total_usuarios": 150,
    "usuarios_activos": 142,
    "usuarios_inactivos": 8,
    "por_rol": {
      "usuario": 120,
      "profesionista": 25,
      "administrador": 5
    },
    "registros_este_mes": 15,
    "crecimiento_mensual": 12.5
  }
}
```

---

### 🏥 Profesionales (`/api/profesionales`)

#### GET `/api/profesionales` - Listar Profesionales
```http
GET /api/profesionales?especialidad=cardiologia&ubicacion=madrid&disponible=true
```

**Query Parameters:**
- `especialidad` (opcional): Filtrar por especialidad
- `ubicacion` (opcional): Filtrar por ubicación
- `disponible` (opcional): Solo profesionales disponibles (true/false)
- `page` (opcional): Número de página
- `limit` (opcional): Elementos por página

**Response (200):**
```json
{
  "success": true,
  "profesionales": [
    {
      "id_profesional": 1,
      "id_usuario": 2,
      "especialidad": "Cardiología",
      "cedula_profesional": "CARD123456",
      "experiencia_anos": 8,
      "ubicacion": "Madrid, España",
      "precio_consulta": 150.00,
      "disponible": true,
      "calificacion_promedio": 4.8,
      "total_valoraciones": 45,
      "usuario": {
        "nombre": "Dr. María García",
        "email": "maria@ejemplo.com",
        "telefono": "+1234567890"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 3,
    "total_items": 25,
    "items_per_page": 10
  }
}
```

#### GET `/api/profesionales/:id` - Obtener Profesional
```http
GET /api/profesionales/1
```

**Response (200):**
```json
{
  "success": true,
  "profesional": {
    "id_profesional": 1,
    "id_usuario": 2,
    "especialidad": "Cardiología",
    "cedula_profesional": "CARD123456",
    "experiencia_anos": 8,
    "ubicacion": "Madrid, España",
    "precio_consulta": 150.00,
    "disponible": true,
    "calificacion_promedio": 4.8,
    "total_valoraciones": 45,
    "descripcion": "Especialista en cardiología con 8 años de experiencia",
    "horarios_atencion": "Lunes a Viernes 9:00-18:00",
    "usuario": {
      "nombre": "Dr. María García",
      "email": "maria@ejemplo.com",
      "telefono": "+1234567890"
    }
  }
}
```

#### GET `/api/profesionales/especialidad/:especialidad` - Filtrar por Especialidad
```http
GET /api/profesionales/especialidad/cardiologia
```

#### GET `/api/profesionales/ubicacion/:ubicacion` - Filtrar por Ubicación
```http
GET /api/profesionales/ubicacion/madrid
```

#### GET `/api/profesionales/disponibles` - Solo Disponibles
```http
GET /api/profesionales/disponibles
```

---

### 👤 Clientes (`/api/clientes`)

#### GET `/api/clientes` - Listar Clientes (Solo Admin)
```http
GET /api/clientes?page=1&limit=10
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "clientes": [
    {
      "id_cliente": 1,
      "id_usuario": 3,
      "fecha_nacimiento": "1990-05-15",
      "genero": "M",
      "direccion": "Calle Principal 123, Madrid",
      "historial_medico": "Sin alergias conocidas",
      "usuario": {
        "nombre": "Carlos López",
        "email": "carlos@ejemplo.com",
        "telefono": "+1234567890"
      }
    }
  ]
}
```

#### GET `/api/clientes/:id/sesiones` - Sesiones del Cliente
```http
GET /api/clientes/1/sesiones
Authorization: Bearer <token>
```

#### GET `/api/clientes/:id/valoraciones` - Valoraciones del Cliente
```http
GET /api/clientes/1/valoraciones
Authorization: Bearer <token>
```

---

### 📅 Sesiones (`/api/sesiones`)

#### GET `/api/sesiones` - Listar Sesiones
```http
GET /api/sesiones?profesional_id=1&cliente_id=2&estado=programada
Authorization: Bearer <token>
```

**Query Parameters:**
- `profesional_id` (opcional): Filtrar por profesional
- `cliente_id` (opcional): Filtrar por cliente
- `estado` (opcional): programada, en_progreso, completada, cancelada
- `fecha_inicio` (opcional): Fecha de inicio (YYYY-MM-DD)
- `fecha_fin` (opcional): Fecha de fin (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "sesiones": [
    {
      "id_sesion": 1,
      "id_profesional": 1,
      "id_cliente": 2,
      "fecha_hora": "2024-02-15T10:00:00.000Z",
      "duracion_minutos": 60,
      "tipo_consulta": "Presencial",
      "estado": "programada",
      "motivo_consulta": "Revisión cardiológica",
      "profesional": {
        "nombre": "Dr. María García",
        "especialidad": "Cardiología"
      },
      "cliente": {
        "nombre": "Carlos López"
      }
    }
  ]
}
```

#### POST `/api/sesiones` - Crear Sesión
```http
POST /api/sesiones
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_profesional": 1,
  "id_cliente": 2,
  "fecha_hora": "2024-02-15T10:00:00.000Z",
  "duracion_minutos": 60,
  "tipo_consulta": "Presencial",
  "motivo_consulta": "Revisión cardiológica"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Sesión creada exitosamente",
  "sesion": {
    "id_sesion": 1,
    "id_profesional": 1,
    "id_cliente": 2,
    "fecha_hora": "2024-02-15T10:00:00.000Z",
    "duracion_minutos": 60,
    "tipo_consulta": "Presencial",
    "estado": "programada",
    "motivo_consulta": "Revisión cardiológica"
  }
}
```

#### PUT `/api/sesiones/:id` - Actualizar Sesión
```http
PUT /api/sesiones/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "completada",
  "notas_profesional": "Consulta completada exitosamente"
}
```

#### DELETE `/api/sesiones/:id` - Cancelar Sesión
```http
DELETE /api/sesiones/1
Authorization: Bearer <token>
```

---

### ⭐ Valoraciones (`/api/valoraciones`)

#### GET `/api/valoraciones` - Listar Valoraciones
```http
GET /api/valoraciones?profesional_id=1&calificacion=5
```

**Query Parameters:**
- `profesional_id` (opcional): Filtrar por profesional
- `cliente_id` (opcional): Filtrar por cliente
- `calificacion` (opcional): Filtrar por calificación (1-5)

**Response (200):**
```json
{
  "success": true,
  "valoraciones": [
    {
      "id_valoracion": 1,
      "id_profesional": 1,
      "id_cliente": 2,
      "calificacion": 5,
      "comentario": "Excelente profesional, muy recomendado",
      "fecha_valoracion": "2024-01-20T15:30:00.000Z",
      "profesional": {
        "nombre": "Dr. María García",
        "especialidad": "Cardiología"
      },
      "cliente": {
        "nombre": "Carlos López"
      }
    }
  ]
}
```

#### POST `/api/valoraciones` - Crear Valoración
```http
POST /api/valoraciones
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_profesional": 1,
  "id_cliente": 2,
  "calificacion": 5,
  "comentario": "Excelente profesional, muy recomendado"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Valoración creada exitosamente",
  "valoracion": {
    "id_valoracion": 1,
    "id_profesional": 1,
    "id_cliente": 2,
    "calificacion": 5,
    "comentario": "Excelente profesional, muy recomendado",
    "fecha_valoracion": "2024-01-20T15:30:00.000Z"
  }
}
```

---

### 💳 Pagos (`/api/pagos`)

#### GET `/api/pagos` - Listar Pagos
```http
GET /api/pagos?profesional_id=1&estado=completado
Authorization: Bearer <token>
```

**Query Parameters:**
- `profesional_id` (opcional): Filtrar por profesional
- `cliente_id` (opcional): Filtrar por cliente
- `estado` (opcional): pendiente, completado, fallido, reembolsado
- `metodo` (opcional): tarjeta, transferencia, efectivo
- `fecha_inicio` (opcional): Fecha de inicio (YYYY-MM-DD)
- `fecha_fin` (opcional): Fecha de fin (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "pagos": [
    {
      "id_pago": 1,
      "id_sesion": 1,
      "id_profesional": 1,
      "id_cliente": 2,
      "monto": 150.00,
      "metodo_pago": "tarjeta",
      "estado": "completado",
      "fecha_pago": "2024-01-20T16:00:00.000Z",
      "referencia_transaccion": "TXN123456789",
      "sesion": {
        "fecha_hora": "2024-01-20T10:00:00.000Z",
        "duracion_minutos": 60
      }
    }
  ]
}
```

#### POST `/api/pagos` - Crear Pago
```http
POST /api/pagos
Authorization: Bearer <token>
Content-Type: application/json

{
  "id_sesion": 1,
  "monto": 150.00,
  "metodo_pago": "tarjeta",
  "referencia_transaccion": "TXN123456789"
}
```

---

### 💰 Precios (`/api/precios`)

#### GET `/api/precios` - Listar Precios
```http
GET /api/precios?especialidad=cardiologia&precio_min=100&precio_max=200
```

**Query Parameters:**
- `especialidad` (opcional): Filtrar por especialidad
- `precio_min` (opcional): Precio mínimo
- `precio_max` (opcional): Precio máximo

**Response (200):**
```json
{
  "success": true,
  "precios": [
    {
      "id_precio": 1,
      "especialidad": "Cardiología",
      "precio_consulta": 150.00,
      "precio_seguimiento": 100.00,
      "precio_urgencia": 200.00,
      "moneda": "EUR",
      "activo": true
    }
  ]
}
```

---

### 📊 Estadísticas (`/api/estadisticas`)

#### GET `/api/estadisticas/overview` - Estadísticas Generales
```http
GET /api/estadisticas/overview
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "estadisticas": {
    "usuarios": {
      "total": 150,
      "activos": 142,
      "nuevos_este_mes": 15
    },
    "profesionales": {
      "total": 25,
      "activos": 23,
      "por_especialidad": {
        "Cardiología": 5,
        "Neurología": 4,
        "Dermatología": 3
      }
    },
    "sesiones": {
      "total": 500,
      "completadas": 450,
      "canceladas": 30,
      "pendientes": 20
    },
    "ingresos": {
      "total_mes": 15000.00,
      "crecimiento_mensual": 15.5
    }
  }
}
```

---

## 🚨 Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|-------------|-------------|
| `200` | OK | Solicitud exitosa |
| `201` | Created | Recurso creado exitosamente |
| `400` | Bad Request | Datos inválidos o faltantes |
| `401` | Unauthorized | Token inválido o faltante |
| `403` | Forbidden | Sin permisos para la acción |
| `404` | Not Found | Recurso no encontrado |
| `409` | Conflict | Conflicto (ej: email ya existe) |
| `422` | Unprocessable Entity | Datos válidos pero no procesables |
| `500` | Internal Server Error | Error interno del servidor |

---

## ⚠️ Validaciones y Restricciones

### Datos de Usuario
- **Nombre**: 2-50 caracteres, solo letras y espacios
- **Email**: Formato válido de email, único en el sistema
- **Teléfono**: 10-15 dígitos, formato internacional opcional
- **Contraseña**: Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número

### Datos de Profesional
- **Cédula Profesional**: 6-20 caracteres alfanuméricos
- **Experiencia**: 0-50 años
- **Precio Consulta**: 0.01-9999.99, máximo 2 decimales

### Sesiones
- **Duración**: 15-480 minutos
- **Fecha**: No puede ser en el pasado
- **Tipo Consulta**: "Presencial", "Virtual", "Domicilio"

### Valoraciones
- **Calificación**: 1-5 (entero)
- **Comentario**: Máximo 500 caracteres

### Archivos
- **Tamaño máximo**: 10MB por archivo
- **Formatos permitidos**: JPG, PNG, PDF, DOC, DOCX
- **Cantidad máxima**: 5 archivos por sesión

---

## 🔒 Seguridad

### Headers de Seguridad
La API incluye headers de seguridad automáticos:
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer-when-downgrade`

### Rate Limiting
- **Límite**: 100 requests por 15 minutos por IP
- **Headers de respuesta**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

### CORS
- **Orígenes permitidos**: Configurados en variables de entorno
- **Métodos**: GET, POST, PUT, DELETE, OPTIONS
- **Headers**: Authorization, Content-Type

---

## 📝 Ejemplos de Uso Completos

### Flujo de Registro y Login
```javascript
// 1. Registro
const registerResponse = await fetch('/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nombre: 'Juan Pérez',
    email: 'juan@ejemplo.com',
    password: 'Contraseña123',
    telefono: '+1234567890'
  })
});

const registerData = await registerResponse.json();
console.log(registerData); // { success: true, user: {...} }

// 2. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'juan@ejemplo.com',
    password: 'Contraseña123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.token; // Guardar para futuras peticiones

// 3. Usar token en peticiones autenticadas
const profileResponse = await fetch('/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const profileData = await profileResponse.json();
console.log(profileData); // { success: true, user: {...} }
```

### Búsqueda de Profesionales
```javascript
// Buscar cardiólogos en Madrid
const profesionalesResponse = await fetch('/api/profesionales?especialidad=cardiologia&ubicacion=madrid&disponible=true');
const profesionalesData = await profesionalesResponse.json();

console.log(profesionalesData.profesionales); // Array de profesionales
```

### Crear una Sesión
```javascript
const sesionResponse = await fetch('/api/sesiones', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id_profesional: 1,
    id_cliente: 2,
    fecha_hora: '2024-02-15T10:00:00.000Z',
    duracion_minutos: 60,
    tipo_consulta: 'Presencial',
    motivo_consulta: 'Revisión cardiológica'
  })
});

const sesionData = await sesionResponse.json();
console.log(sesionData); // { success: true, sesion: {...} }
```

---

## 🆘 Soporte y Contacto

Para soporte técnico o reportar bugs:
- **Email**: soporte@naxine.com
- **Documentación**: `/docs` endpoint
- **Health Check**: `/health` endpoint

---

**¡API Naxine lista para integrar con tu frontend! 🚀**

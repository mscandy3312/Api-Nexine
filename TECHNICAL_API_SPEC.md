# 🔧 Especificación Técnica de la API - Naxine

## 📋 Información Técnica

**Versión de la API:** 1.0.0  
**Base URL:** `http://localhost:3000` (desarrollo)  
**Protocolo:** HTTP/HTTPS  
**Formato de datos:** JSON  
**Autenticación:** JWT Bearer Token  
**Rate Limiting:** 100 requests/15min por IP  

---

## 🏗️ Arquitectura de la API

### Estructura de Respuestas

#### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "message": "Operación exitosa",
  "timestamp": "2024-01-20T15:30:00.000Z"
}
```

#### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "El email es requerido"
      }
    ]
  },
  "timestamp": "2024-01-20T15:30:00.000Z"
}
```

#### Respuesta Paginada
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "items_per_page": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## 🔐 Sistema de Autenticación

### JWT Token Structure
```json
{
  "sub": "user_id",
  "iat": 1642684800,
  "exp": 1642771200,
  "role": "usuario",
  "email": "user@example.com"
}
```

### Headers de Autenticación
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Códigos de Error de Autenticación
- `401` - Token faltante o inválido
- `403` - Permisos insuficientes
- `419` - Token expirado

---

## 📊 Modelos de Datos

### Usuario
```typescript
interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string;
  rol: 'usuario' | 'profesionista' | 'administrador';
  activo: boolean;
  fecha_registro: string;
  fecha_actualizacion: string;
}
```

### Profesional
```typescript
interface Profesional {
  id_profesional: number;
  id_usuario: number;
  especialidad: string;
  cedula_profesional: string;
  experiencia_anos: number;
  ubicacion: string;
  precio_consulta: number;
  disponible: boolean;
  calificacion_promedio?: number;
  total_valoraciones?: number;
  descripcion?: string;
  horarios_atencion?: string;
  usuario: Usuario;
}
```

### Cliente
```typescript
interface Cliente {
  id_cliente: number;
  id_usuario: number;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F' | 'O';
  direccion?: string;
  historial_medico?: string;
  usuario: Usuario;
}
```

### Sesión
```typescript
interface Sesion {
  id_sesion: number;
  id_profesional: number;
  id_cliente: number;
  fecha_hora: string;
  duracion_minutos: number;
  tipo_consulta: 'Presencial' | 'Virtual' | 'Domicilio';
  estado: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
  motivo_consulta: string;
  notas_profesional?: string;
  profesional: Profesional;
  cliente: Cliente;
}
```

### Valoración
```typescript
interface Valoracion {
  id_valoracion: number;
  id_profesional: number;
  id_cliente: number;
  calificacion: number; // 1-5
  comentario?: string;
  fecha_valoracion: string;
  profesional: Profesional;
  cliente: Cliente;
}
```

### Pago
```typescript
interface Pago {
  id_pago: number;
  id_sesion: number;
  id_profesional: number;
  id_cliente: number;
  monto: number;
  metodo_pago: 'tarjeta' | 'transferencia' | 'efectivo';
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  fecha_pago: string;
  referencia_transaccion?: string;
  sesion: Sesion;
}
```

---

## 🛠️ Endpoints Detallados

### Autenticación

#### POST `/auth/register`
**Descripción:** Registra un nuevo usuario en el sistema

**Body:**
```json
{
  "nombre": "string (2-50 chars)",
  "email": "string (email format)",
  "password": "string (min 8 chars)",
  "telefono": "string (optional, 10-15 digits)"
}
```

**Validaciones:**
- Nombre: Requerido, 2-50 caracteres
- Email: Requerido, formato válido, único
- Password: Requerido, mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número
- Teléfono: Opcional, 10-15 dígitos

**Response 201:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "user": Usuario
}
```

**Errores:**
- `400` - Datos inválidos
- `409` - Email ya existe
- `422` - Validación fallida

#### POST `/auth/login`
**Descripción:** Autentica un usuario y devuelve token JWT

**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "success": true,
  "token": "string (JWT)",
  "user": Usuario
}
```

**Errores:**
- `400` - Credenciales faltantes
- `401` - Credenciales inválidas
- `403` - Usuario inactivo

#### GET `/auth/profile`
**Descripción:** Obtiene el perfil del usuario autenticado

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "user": Usuario
}
```

**Errores:**
- `401` - Token inválido
- `404` - Usuario no encontrado

#### PUT `/auth/profile`
**Descripción:** Actualiza el perfil del usuario autenticado

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nombre": "string (optional)",
  "telefono": "string (optional)"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Perfil actualizado exitosamente",
  "user": Usuario
}
```

---

### Usuarios

#### GET `/api/usuarios`
**Descripción:** Lista usuarios (solo administradores)

**Headers:** `Authorization: Bearer <admin_token>`

**Query Parameters:**
- `page` (int, optional): Número de página (default: 1)
- `limit` (int, optional): Elementos por página (default: 10, max: 100)
- `search` (string, optional): Búsqueda por nombre o email
- `rol` (string, optional): Filtrar por rol
- `activo` (boolean, optional): Filtrar por estado

**Response 200:**
```json
{
  "success": true,
  "usuarios": Usuario[],
  "pagination": PaginationInfo
}
```

#### GET `/api/usuarios/stats/overview`
**Descripción:** Estadísticas generales de usuarios (solo administradores)

**Headers:** `Authorization: Bearer <admin_token>`

**Response 200:**
```json
{
  "success": true,
  "stats": {
    "total_usuarios": "number",
    "usuarios_activos": "number",
    "usuarios_inactivos": "number",
    "por_rol": "object",
    "registros_este_mes": "number",
    "crecimiento_mensual": "number"
  }
}
```

---

### Profesionales

#### GET `/api/profesionales`
**Descripción:** Lista profesionales con filtros

**Query Parameters:**
- `especialidad` (string, optional): Filtrar por especialidad
- `ubicacion` (string, optional): Filtrar por ubicación
- `disponible` (boolean, optional): Solo disponibles
- `page` (int, optional): Número de página
- `limit` (int, optional): Elementos por página

**Response 200:**
```json
{
  "success": true,
  "profesionales": Profesional[],
  "pagination": PaginationInfo
}
```

#### GET `/api/profesionales/:id`
**Descripción:** Obtiene un profesional específico

**Response 200:**
```json
{
  "success": true,
  "profesional": Profesional
}
```

**Errores:**
- `404` - Profesional no encontrado

#### GET `/api/profesionales/especialidad/:especialidad`
**Descripción:** Filtra profesionales por especialidad

**Response 200:**
```json
{
  "success": true,
  "profesionales": Profesional[]
}
```

#### GET `/api/profesionales/ubicacion/:ubicacion`
**Descripción:** Filtra profesionales por ubicación

#### GET `/api/profesionales/disponibles`
**Descripción:** Solo profesionales disponibles

#### GET `/api/profesionales/stats/overview`
**Descripción:** Estadísticas de profesionales

---

### Sesiones

#### GET `/api/sesiones`
**Descripción:** Lista sesiones con filtros

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `profesional_id` (int, optional): Filtrar por profesional
- `cliente_id` (int, optional): Filtrar por cliente
- `estado` (string, optional): programada, en_progreso, completada, cancelada
- `fecha_inicio` (string, optional): Fecha inicio (YYYY-MM-DD)
- `fecha_fin` (string, optional): Fecha fin (YYYY-MM-DD)

**Response 200:**
```json
{
  "success": true,
  "sesiones": Sesion[]
}
```

#### POST `/api/sesiones`
**Descripción:** Crea una nueva sesión

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "id_profesional": "number (required)",
  "id_cliente": "number (required)",
  "fecha_hora": "string (ISO 8601, required)",
  "duracion_minutos": "number (15-480, required)",
  "tipo_consulta": "string (required)",
  "motivo_consulta": "string (required)"
}
```

**Validaciones:**
- fecha_hora: No puede ser en el pasado
- duracion_minutos: 15-480 minutos
- tipo_consulta: Valores permitidos

**Response 201:**
```json
{
  "success": true,
  "message": "Sesión creada exitosamente",
  "sesion": Sesion
}
```

**Errores:**
- `400` - Datos inválidos
- `409` - Conflicto de horario
- `422` - Validación fallida

#### PUT `/api/sesiones/:id`
**Descripción:** Actualiza una sesión existente

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "estado": "string (optional)",
  "notas_profesional": "string (optional)"
}
```

#### DELETE `/api/sesiones/:id`
**Descripción:** Cancela una sesión

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "success": true,
  "message": "Sesión cancelada exitosamente"
}
```

---

### Valoraciones

#### GET `/api/valoraciones`
**Descripción:** Lista valoraciones con filtros

**Query Parameters:**
- `profesional_id` (int, optional): Filtrar por profesional
- `cliente_id` (int, optional): Filtrar por cliente
- `calificacion` (int, optional): Filtrar por calificación (1-5)

**Response 200:**
```json
{
  "success": true,
  "valoraciones": Valoracion[]
}
```

#### POST `/api/valoraciones`
**Descripción:** Crea una nueva valoración

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "id_profesional": "number (required)",
  "id_cliente": "number (required)",
  "calificacion": "number (1-5, required)",
  "comentario": "string (max 500 chars, optional)"
}
```

**Validaciones:**
- calificacion: 1-5 (entero)
- comentario: Máximo 500 caracteres

**Response 201:**
```json
{
  "success": true,
  "message": "Valoración creada exitosamente",
  "valoracion": Valoracion
}
```

---

### Pagos

#### GET `/api/pagos`
**Descripción:** Lista pagos con filtros

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `profesional_id` (int, optional): Filtrar por profesional
- `cliente_id` (int, optional): Filtrar por cliente
- `estado` (string, optional): pendiente, completado, fallido, reembolsado
- `metodo` (string, optional): tarjeta, transferencia, efectivo
- `fecha_inicio` (string, optional): Fecha inicio (YYYY-MM-DD)
- `fecha_fin` (string, optional): Fecha fin (YYYY-MM-DD)

**Response 200:**
```json
{
  "success": true,
  "pagos": Pago[]
}
```

#### POST `/api/pagos`
**Descripción:** Crea un nuevo pago

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "id_sesion": "number (required)",
  "monto": "number (required, > 0)",
  "metodo_pago": "string (required)",
  "referencia_transaccion": "string (optional)"
}
```

---

## 🔍 Búsqueda y Filtros

### Parámetros de Búsqueda Comunes
- `search`: Búsqueda de texto libre
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `sort`: Campo de ordenamiento
- `order`: Dirección de ordenamiento (asc/desc)

### Filtros de Fecha
- `fecha_inicio`: Fecha de inicio (YYYY-MM-DD)
- `fecha_fin`: Fecha de fin (YYYY-MM-DD)
- `fecha`: Fecha específica (YYYY-MM-DD)

### Filtros de Estado
- `activo`: true/false
- `estado`: Valores específicos según el endpoint

---

## 📈 Paginación

### Estructura de Paginación
```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 100,
    "items_per_page": 10,
    "has_next": true,
    "has_prev": false,
    "next_page": 2,
    "prev_page": null
  }
}
```

### Parámetros de Paginación
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)

---

## 🚨 Manejo de Errores

### Códigos de Error Comunes

#### 400 - Bad Request
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "El email es requerido"
      }
    ]
  }
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token de autenticación requerido"
  }
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Permisos insuficientes para esta acción"
  }
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Recurso no encontrado"
  }
}
```

#### 409 - Conflict
```json
{
  "success": false,
  "error": {
    "code": "CONFLICT",
    "message": "El email ya está registrado"
  }
}
```

#### 422 - Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos válidos pero no procesables",
    "details": [
      {
        "field": "password",
        "message": "La contraseña debe tener al menos 8 caracteres"
      }
    ]
  }
}
```

#### 429 - Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Demasiadas solicitudes. Intenta de nuevo más tarde"
  }
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Error interno del servidor"
  }
}
```

---

## 🔒 Seguridad

### Headers de Seguridad
```http
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
Content-Security-Policy: default-src 'self'
```

### Rate Limiting
- **Límite**: 100 requests por 15 minutos por IP
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite total
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

### CORS
```http
Access-Control-Allow-Origin: https://tu-dominio.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

---

## 📝 Ejemplos de Integración

### JavaScript/TypeScript
```typescript
class NaxineAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en la petición');
    }

    return response.json();
  }

  // Autenticación
  async login(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  // Profesionales
  async getProfesionales(filters: any = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`/api/profesionales?${params}`);
  }

  // Sesiones
  async createSesion(sesionData: any) {
    return this.request('/api/sesiones', {
      method: 'POST',
      body: JSON.stringify(sesionData),
    });
  }
}

// Uso
const api = new NaxineAPI('http://localhost:3000');

// Login
const loginResponse = await api.login('usuario@ejemplo.com', 'password123');

// Obtener profesionales
const profesionales = await api.getProfesionales({
  especialidad: 'cardiologia',
  disponible: true
});

// Crear sesión
const sesion = await api.createSesion({
  id_profesional: 1,
  id_cliente: 2,
  fecha_hora: '2024-02-15T10:00:00.000Z',
  duracion_minutos: 60,
  tipo_consulta: 'Presencial',
  motivo_consulta: 'Revisión cardiológica'
});
```

### React Hook
```typescript
import { useState, useEffect } from 'react';

export const useNaxineAPI = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = new NaxineAPI('http://localhost:3000');

  useEffect(() => {
    if (token) {
      api.setToken(token);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.login(email, password);
      setToken(response.token);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProfesionales = async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      return await api.getProfesionales(filters);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    getProfesionales,
    loading,
    error,
    isAuthenticated: !!token
  };
};
```

---

## 🧪 Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "message": "API funcionando correctamente",
  "timestamp": "2024-01-20T15:30:00.000Z"
}
```

### Endpoints de Testing
- `GET /docs` - Documentación interactiva
- `GET /health` - Estado de la API
- `GET /` - Información general de la API

---

**¡API Naxine lista para integración! 🚀**

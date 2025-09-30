/**
 * Naxine API - Sistema de Gestión de Profesionales de la Salud
 * 
 * Este archivo es el punto de entrada principal de la aplicación.
 * Configura Express, middleware, rutas y manejo de errores.
 * 
 * @author Naxine Team
 * @version 1.0.0
 */

// ============================================================================
// IMPORTS Y DEPENDENCIAS
// ============================================================================

const express = require('express');           // Framework web para Node.js
const bodyParser = require('body-parser');    // Middleware para parsear JSON
const cors = require('cors');                 // Middleware para CORS
const session = require('express-session');   // Middleware para manejo de sesiones
const passport = require('passport');         // Middleware de autenticación
const path = require('path');                 // Utilidades para manejo de rutas

// Importar modelos y configuración de base de datos
const { syncDatabase } = require('./src/models');

// Importar configuración de autenticación OAuth
const { passport: passportConfig } = require('./src/config/oauthConfig');

// Importar todas las rutas de la API
const authRoutes = require('./src/routes/auth');              // Rutas de autenticación
const usuariosRoutes = require('./src/routes/usuarios');      // Gestión de usuarios
const clientesRoutes = require('./src/routes/clientes');      // Gestión de clientes
const profesionalesRoutes = require('./src/routes/profesionales'); // Gestión de profesionales
const sesionesRoutes = require('./src/routes/sesiones');      // Gestión de sesiones médicas
const valoracionesRoutes = require('./src/routes/valoraciones'); // Sistema de valoraciones
const pagosRoutes = require('./src/routes/pagos');            // Gestión de pagos
const preciosRoutes = require('./src/routes/precios');        // Gestión de precios
const estadisticasRoutes = require('./src/routes/estadisticas'); // Estadísticas del sistema

// ============================================================================
// CONFIGURACIÓN DE EXPRESS
// ============================================================================

const app = express();

// ============================================================================
// MIDDLEWARE GLOBAL
// ============================================================================

// Middleware para parsear JSON en las peticiones
app.use(bodyParser.json());

// Middleware para parsear datos de formularios URL-encoded
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de CORS (Cross-Origin Resource Sharing)
// Permite que el frontend se conecte desde diferentes dominios
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // URL del frontend
  credentials: true // Permite enviar cookies y headers de autenticación
}));

// ============================================================================
// CONFIGURACIÓN DE SESIONES
// ============================================================================

// Middleware para manejo de sesiones de usuario
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_session_secret', // Clave secreta para firmar sesiones
  resave: false,        // No guardar sesión si no se modificó
  saveUninitialized: false, // No crear sesión hasta que se almacene algo
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    maxAge: 24 * 60 * 60 * 1000 // La sesión expira en 24 horas
  }
}));

// ============================================================================
// CONFIGURACIÓN DE PASSPORT (AUTENTICACIÓN)
// ============================================================================

// Inicializar Passport para autenticación
app.use(passport.initialize());

// Usar sesiones de Passport para mantener al usuario logueado
app.use(passport.session());

// ============================================================================
// CONFIGURACIÓN DE RUTAS
// ============================================================================

// Rutas de autenticación (públicas)
// Endpoints: /auth/register, /auth/login, /auth/verify-email, etc.
app.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación JWT)
// Todas estas rutas están protegidas por middleware de autenticación
app.use('/api/usuarios', usuariosRoutes);        // Gestión de usuarios del sistema
app.use('/api/clientes', clientesRoutes);        // Gestión de pacientes/clientes
app.use('/api/profesionales', profesionalesRoutes); // Gestión de profesionales de la salud
app.use('/api/sesiones', sesionesRoutes);        // Gestión de citas y sesiones médicas
app.use('/api/valoraciones', valoracionesRoutes); // Sistema de calificaciones y comentarios
app.use('/api/pagos', pagosRoutes);              // Gestión de transacciones de pago
app.use('/api/precios', preciosRoutes);          // Gestión de tarifas por especialidad
app.use('/api/estadisticas', estadisticasRoutes); // Estadísticas y reportes del sistema

// ============================================================================
// RUTAS PÚBLICAS
// ============================================================================

// Endpoint de salud - Verifica que la API esté funcionando
// Útil para monitoreo y health checks
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Endpoint de documentación - Proporciona información sobre la API
// Incluye todos los endpoints disponibles y su descripción
app.get('/docs', (req, res) => {
  res.json({
    message: 'Documentación de la API de Naxine',
    version: '1.0.0',
    documentation: {
      readme: 'Ver README.md para información general del proyecto',
      api_docs: 'Ver src/docs/API_DOCUMENTATION.md para documentación completa de endpoints',
      endpoints: {
        auth: {
          register: 'POST /auth/register - Registrar nuevo usuario',
          login: 'POST /auth/login - Iniciar sesión',
          verify_email: 'POST /auth/verify-email - Verificar email',
          forgot_password: 'POST /auth/forgot-password - Solicitar reset de contraseña',
          reset_password: 'POST /auth/reset-password - Restablecer contraseña'
        },
        usuarios: {
          list: 'GET /api/usuarios - Listar usuarios (admin)',
          get: 'GET /api/usuarios/:id - Obtener usuario',
          update: 'PUT /api/usuarios/:id - Actualizar usuario',
          delete: 'DELETE /api/usuarios/:id - Eliminar usuario (admin)'
        },
        clientes: {
          list: 'GET /api/clientes - Listar clientes',
          create: 'POST /api/clientes - Crear cliente',
          get: 'GET /api/clientes/:id - Obtener cliente',
          update: 'PUT /api/clientes/:id - Actualizar cliente',
          delete: 'DELETE /api/clientes/:id - Eliminar cliente'
        },
        profesionales: {
          list: 'GET /api/profesionales - Listar profesionales',
          create: 'POST /api/profesionales - Crear profesional (admin)',
          get: 'GET /api/profesionales/:id - Obtener profesional',
          update: 'PUT /api/profesionales/:id - Actualizar profesional',
          delete: 'DELETE /api/profesionales/:id - Eliminar profesional'
        },
        sesiones: {
          list: 'GET /api/sesiones - Listar sesiones',
          create: 'POST /api/sesiones - Crear sesión',
          get: 'GET /api/sesiones/:id - Obtener sesión',
          update: 'PUT /api/sesiones/:id - Actualizar sesión',
          delete: 'DELETE /api/sesiones/:id - Cancelar sesión'
        },
        valoraciones: {
          list: 'GET /api/valoraciones - Listar valoraciones',
          create: 'POST /api/valoraciones - Crear valoración',
          get: 'GET /api/valoraciones/:id - Obtener valoración',
          update: 'PUT /api/valoraciones/:id - Actualizar valoración',
          delete: 'DELETE /api/valoraciones/:id - Eliminar valoración'
        },
        pagos: {
          list: 'GET /api/pagos - Listar pagos',
          create: 'POST /api/pagos - Crear pago',
          get: 'GET /api/pagos/:id - Obtener pago',
          update: 'PUT /api/pagos/:id - Actualizar pago'
        },
        precios: {
          list: 'GET /api/precios - Listar precios',
          create: 'POST /api/precios - Crear precio (admin)',
          update: 'PUT /api/precios/:id - Actualizar precio',
          delete: 'DELETE /api/precios/:id - Eliminar precio (admin)',
          byEspecialidad: 'GET /api/precios/especialidad/:especialidad - Precios por especialidad',
          byRange: 'GET /api/precios/rango/:min/:max - Precios por rango',
          stats: 'GET /api/precios/stats/overview - Estadísticas de precios (admin)',
          search: 'GET /api/precios/search/:query - Buscar precios'
        },
        estadisticas: {
          overview: 'GET /api/estadisticas/overview - Estadísticas generales (admin)',
          rendimiento: 'GET /api/estadisticas/rendimiento - Estadísticas de rendimiento (admin)',
          profesional: 'GET /api/estadisticas/profesional/:id - Estadísticas de profesional'
        }
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        roles: {
          usuario: 'Usuarios regulares - pueden ver profesionales y crear valoraciones',
          profesionista: 'Profesionales - pueden gestionar sesiones y ver sus pagos',
          administrador: 'Administradores - acceso completo al sistema'
        }
      }
    }
  });
});

// Ruta raíz - Información general de la API
// Proporciona un resumen de la API y sus funcionalidades principales
app.get('/', (req, res) => {
  res.json({
    message: 'API de Naxine',
    version: '1.0.0',
    description: 'Sistema de gestión de profesionales de la salud con autenticación OAuth',
    endpoints: {
      auth: '/auth',                    // Autenticación y registro
      usuarios: '/api/usuarios',        // Gestión de usuarios
      clientes: '/api/clientes',        // Gestión de clientes
      profesionales: '/api/profesionales', // Gestión de profesionales
      sesiones: '/api/sesiones',        // Gestión de sesiones médicas
      valoraciones: '/api/valoraciones', // Sistema de valoraciones
      pagos: '/api/pagos',              // Gestión de pagos
      precios: '/api/precios',          // Gestión de precios
      estadisticas: '/api/estadisticas' // Estadísticas del sistema
    },
    roles: {
      usuario: 'Usuarios regulares - pueden ver profesionales y crear valoraciones',
      profesionista: 'Profesionales - pueden gestionar sesiones y ver sus pagos',
      administrador: 'Administradores - acceso completo al sistema'
    }
  });
});

// ============================================================================
// MANEJO DE ERRORES
// ============================================================================

// Middleware global para manejo de errores
// Captura cualquier error no manejado en las rutas
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    // En desarrollo muestra el error completo, en producción solo mensaje genérico
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Middleware para rutas no encontradas (404)
// Se ejecuta cuando ninguna ruta coincide con la petición
app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// ============================================================================
// CONFIGURACIÓN DEL SERVIDOR
// ============================================================================

// Puerto del servidor (por defecto 3000, configurable con variable de entorno)
const PORT = process.env.PORT || 3000;

// ============================================================================
// INICIALIZACIÓN DEL SERVIDOR
// ============================================================================

/**
 * Función para inicializar la base de datos y arrancar el servidor
 * Sincroniza los modelos de la base de datos y luego inicia el servidor Express
 */
const startServer = async () => {
  try {
    // Sincronizar modelos de la base de datos
    // Crea las tablas si no existen y actualiza la estructura
    await syncDatabase();
    
    // Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📧 Configura las variables de entorno para OAuth y email`);
      console.log(`🔐 Endpoints de autenticación disponibles en /auth`);
      console.log(`📚 Documentación de la API disponible en /docs`);
      console.log(`🏥 API de Naxine lista para recibir peticiones`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1); // Terminar el proceso si hay error crítico
  }
};

// Ejecutar la función de inicio del servidor
startServer();
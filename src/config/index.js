/**
 * Configuración Principal - Naxine API
 * 
 * Este archivo centraliza toda la configuración de la aplicación:
 * - Configuración del servidor
 * - Configuración de base de datos
 * - Configuración JWT y seguridad
 * - Configuración de email
 * - Configuración CORS
 * - Configuración de sesiones
 * 
 * @author Naxine Team
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURACIÓN PRINCIPAL DE LA APLICACIÓN
// ============================================================================

const config = {
  // ============================================================================
  // CONFIGURACIÓN DEL SERVIDOR
  // ============================================================================
  
  // Puerto donde correrá el servidor (configurable con variable de entorno)
  PORT: process.env.PORT || 3000,
  
  // Entorno de ejecución (development, production, test)
  NODE_ENV: process.env.NODE_ENV || 'production',
  
  // ============================================================================
  // CONFIGURACIÓN DE BASE DE DATOS
  // ============================================================================
  
  database: {
    host: process.env.DB_HOST || 'localhost',        // Host de la base de datos
    port: process.env.DB_PORT || 3306,               // Puerto de la base de datos
    name: process.env.DB_NAME || 'naxine',           // Nombre de la base de datos
    user: process.env.DB_USER || 'usuario',          // Usuario de la base de datos
    password: process.env.DB_PASS || 'contraseña',   // Contraseña de la base de datos
    dialect: 'mysql',                                // Tipo de base de datos (mysql, postgres, sqlite)
    logging: process.env.NODE_ENV === 'development', // Mostrar logs SQL solo en desarrollo
    
    // Configuración del pool de conexiones
    pool: {
      max: 5,        // Máximo número de conexiones
      min: 0,        // Mínimo número de conexiones
      acquire: 30000, // Tiempo máximo para obtener conexión (ms)
      idle: 10000    // Tiempo máximo que una conexión puede estar inactiva (ms)
    }
  },
  
  // ============================================================================
  // CONFIGURACIÓN JWT Y SEGURIDAD
  // ============================================================================
  
  // Clave secreta para firmar tokens JWT (DEBE ser cambiada en producción)
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  
  // Clave secreta para tokens de confirmación de email
  TOKEN_CONFIRMATION_SECRET: process.env.TOKEN_CONFIRMATION_SECRET || 'fallback_confirmation_secret',
  
  // Clave secreta para sesiones
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback_session_secret',
  
  // ============================================================================
  // CONFIGURACIÓN DE EMAIL
  // ============================================================================
  
  email: {
    user: process.env.EMAIL_USER || '',    // Email del remitente
    pass: process.env.EMAIL_PASS || '',    // Contraseña de aplicación
    service: 'gmail'                       // Servicio de email (gmail, outlook, etc.)
  },
  
  // ============================================================================
  // CONFIGURACIÓN CORS
  // ============================================================================
  
  cors: {
    origin: process.env.FRONTEND_URL || 'https://naxine.com', // URL del frontend
    credentials: true  // Permite enviar cookies y headers de autenticación
  },
  
  // ============================================================================
  // CONFIGURACIÓN DE SESIONES
  // ============================================================================
  
  session: {
    secret: process.env.SESSION_SECRET || 'fallback_session_secret', // Clave para firmar sesiones
    resave: false,        // No guardar sesión si no se modificó
    saveUninitialized: false, // No crear sesión hasta que se almacene algo
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      maxAge: 24 * 60 * 60 * 1000 // La sesión expira en 24 horas
    }
  },
  
  // ============================================================================
  // CONFIGURACIÓN DE SEGURIDAD
  // ============================================================================
  
  security: {
    bcryptRounds: 12,                    // Número de rondas para hashear contraseñas
    jwtExpiration: '24h',                // Tiempo de expiración de tokens JWT
    rateLimitWindow: 15 * 60 * 1000,     // Ventana de tiempo para rate limiting (15 minutos)
    rateLimitMax: 100                    // Máximo número de requests por ventana
  }
};

module.exports = config;

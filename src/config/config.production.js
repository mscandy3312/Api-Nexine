// Configuración de producción para Naxine
const config = {
  // Configuración del servidor
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'production',
  
  // Configuración de base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    name: process.env.DB_NAME || 'naxine',
    user: process.env.DB_USER || 'usuario',
    password: process.env.DB_PASS || 'contraseña',
    dialect: 'mysql',
    logging: false, // Desactivar logs de SQL en producción
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  },
  
  // Configuración JWT
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  TOKEN_CONFIRMATION_SECRET: process.env.TOKEN_CONFIRMATION_SECRET || 'fallback_confirmation_secret',
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback_session_secret',
  
  // Configuración de email
  email: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    service: 'gmail'
  },
  
  // Configuración CORS
  cors: {
    origin: process.env.FRONTEND_URL || 'https://naxine.com',
    credentials: true
  },
  
  // Configuración de sesiones
  session: {
    secret: process.env.SESSION_SECRET || 'fallback_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
  },
  
  // Configuración de seguridad
  security: {
    bcryptRounds: 12,
    jwtExpiration: '24h',
    rateLimitWindow: 15 * 60 * 1000, // 15 minutos
    rateLimitMax: 100 // máximo 100 requests por ventana
  }
};

module.exports = config;

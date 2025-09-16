const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const path = require('path');

// Importar modelos y configuración
const { syncDatabase } = require('./models');
const { passport: passportConfig } = require('./oauthConfig');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const clientesRoutes = require('./routes/clientes');
const profesionalesRoutes = require('./routes/profesionales');
const sesionesRoutes = require('./routes/sesiones');
const valoracionesRoutes = require('./routes/valoraciones');
const pagosRoutes = require('./routes/pagos');
const preciosRoutes = require('./routes/precios');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configuración de Passport
app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
app.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/profesionales', profesionalesRoutes);
app.use('/api/sesiones', sesionesRoutes);
app.use('/api/valoraciones', valoracionesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/precios', preciosRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Naxine',
    version: '1.0.0',
    description: 'Sistema de gestión de profesionales de la salud con autenticación AWS Cognito',
    endpoints: {
      auth: '/auth',
      usuarios: '/api/usuarios',
      clientes: '/api/clientes',
      profesionales: '/api/profesionales',
      sesiones: '/api/sesiones',
      valoraciones: '/api/valoraciones',
      pagos: '/api/pagos',
      precios: '/api/precios'
    },
    roles: {
      usuario: 'Usuarios regulares - pueden ver profesionales y crear valoraciones',
      profesionista: 'Profesionales - pueden gestionar sesiones y ver sus pagos',
      administrador: 'Administradores - acceso completo al sistema'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 3000;

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    await syncDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📧 Configura las variables de entorno para OAuth y email`);
      console.log(`🔐 Endpoints de autenticación disponibles en /auth`);
    });
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();
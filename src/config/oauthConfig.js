/**
 * Configuración OAuth - Naxine API
 * 
 * Este archivo maneja toda la configuración de autenticación OAuth:
 * - Configuración de Passport JWT
 * - Generación y verificación de tokens
 * - Envío de emails de verificación
 * - Middleware de autenticación y autorización
 * 
 * @author Naxine Team
 * @version 1.0.0
 */

const passport = require('passport');                    // Framework de autenticación
const JwtStrategy = require('passport-jwt').Strategy;    // Estrategia JWT para Passport
const ExtractJwt = require('passport-jwt').ExtractJwt;   // Para extraer JWT de headers
const { Usuario } = require('../models');                // Modelo de Usuario
const jwt = require('jsonwebtoken');                     // Para generar/verificar tokens JWT
const nodemailer = require('nodemailer');                // Para envío de emails

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

// Cargar configuración desde el archivo de configuración
const config = require('./index');

// Claves secretas para firmar tokens
const SECRET_KEY = config.JWT_SECRET;                    // Para tokens de autenticación
const TOKEN_CONFIRMATION_SECRET = config.TOKEN_CONFIRMATION_SECRET; // Para tokens de verificación

// ============================================================================
// CONFIGURACIÓN DE EMAIL
// ============================================================================

// Configuración de Nodemailer para envío de emails
// Usa Gmail como servicio de email
const transporter = nodemailer.createTransport({
  service: 'gmail',                    // Servicio de email (Gmail)
  auth: {
    user: config.EMAIL_USER,           // Email del remitente
    pass: config.EMAIL_PASS            // Contraseña de aplicación de Gmail
  }
});

// Configuración de Passport JWT
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: SECRET_KEY,
  algorithms: ['HS256']
};

// Estrategia JWT
passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Buscar usuario en la base de datos local
    const usuario = await Usuario.findOne({ 
      where: { email: payload.email } 
    });

    if (usuario) {
      // Actualizar último acceso
      await usuario.update({ ultimo_acceso: new Date() });
      return done(null, usuario);
    }

    return done(null, false);
  } catch (error) {
    console.error('Error en estrategia JWT:', error);
    return done(error, null);
  }
}));

// Serialización del usuario para la sesión
passport.serializeUser((usuario, done) => {
  done(null, usuario.id_usuario);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findByPk(id);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

// Función para enviar email de bienvenida
const enviarEmailBienvenida = async (email, nombre) => {
  try {
    await transporter.sendMail({
      from: '"Naxine" <no-reply@naxine.com>',
      to: email,
      subject: "¡Bienvenido a Naxine!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">¡Bienvenido a Naxine, ${nombre}!</h2>
          <p>Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a usar nuestros servicios.</p>
          <p>Tu rol actual es: <strong>Usuario</strong></p>
          <p>Si necesitas acceso como profesional, contacta a un administrador.</p>
          <br>
          <p style="color: #666; font-size: 12px;">
            Este es un mensaje automático, no respondas a este correo.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error enviando email de bienvenida:', error);
  }
};

// Función para enviar token de verificación por email
const enviarTokenVerificacion = async (email, nombre, token) => {
  try {
    const urlConfirm = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    
    await transporter.sendMail({
      from: '"Naxine" <no-reply@naxine.com>',
      to: email,
      subject: "Verifica tu correo electrónico",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Hola ${nombre},</h2>
          <p>Gracias por registrarte en Naxine. Para completar tu registro, por favor verifica tu correo electrónico haciendo clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlConfirm}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verificar Correo
            </a>
          </div>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no creaste una cuenta en Naxine, puedes ignorar este correo.</p>
          <br>
          <p style="color: #666; font-size: 12px;">
            Este es un mensaje automático, no respondas a este correo.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Error enviando token de verificación:', error);
  }
};

// Función para generar JWT token
const generarJWT = (usuario) => {
  return jwt.sign(
    { 
      id_usuario: usuario.id_usuario, 
      email: usuario.email, 
      rol: usuario.rol,
      nombre: usuario.nombre 
    }, 
    SECRET_KEY, 
    { expiresIn: '24h' }
  );
};

// Función para generar token de verificación
const generarTokenVerificacion = (email) => {
  return jwt.sign({ email }, TOKEN_CONFIRMATION_SECRET, { expiresIn: '24h' });
};

// Middleware para verificar JWT
const verificarJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

// Middleware para verificar roles
const verificarRol = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    next();
  };
};

module.exports = {
  passport,
  transporter,
  enviarTokenVerificacion,
  enviarEmailBienvenida,
  generarJWT,
  generarTokenVerificacion,
  verificarJWT,
  verificarRol,
  SECRET_KEY,
  TOKEN_CONFIRMATION_SECRET
};
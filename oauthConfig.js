const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const { Usuario } = require('./models');
const { 
  verifyCognitoJWT, 
  verifyRole,
  createCognitoUser,
  getCognitoUser,
  updateUserAttributes,
  COGNITO_CONFIG
} = require('./awsConfig');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Cargar configuración desde config.js
const config = require('./config');

const SECRET_KEY = config.JWT_SECRET;
const TOKEN_CONFIRMATION_SECRET = config.TOKEN_CONFIRMATION_SECRET;

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

// Configuración de Passport JWT para Cognito
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: COGNITO_CONFIG.JWKS_URI,
  issuer: `https://cognito-idp.${COGNITO_CONFIG.Region}.amazonaws.com/${COGNITO_CONFIG.UserPoolId}`,
  audience: COGNITO_CONFIG.ClientId,
  algorithms: ['RS256']
};

// Estrategia JWT para Cognito
passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    // Buscar usuario en la base de datos local
    let usuario = await Usuario.findOne({ 
      where: { email: payload.email } 
    });

    if (usuario) {
      // Actualizar último acceso
      await usuario.update({ ultimo_acceso: new Date() });
      return done(null, usuario);
    }

    // Si no existe en la BD local, crearlo
    const nuevoUsuario = await Usuario.create({
      email: payload.email,
      nombre: payload.name || payload.email,
      google_id: payload.sub, // Usar sub como identificador único
      email_verificado: payload.email_verified === 'true',
      rol: payload['custom:role'] || 'usuario',
      activo: true,
      fecha_creacion: new Date(),
      ultimo_acceso: new Date()
    });

    // Enviar email de bienvenida
    await enviarEmailBienvenida(nuevoUsuario.email, nuevoUsuario.nombre);

    return done(null, nuevoUsuario);
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

// Función para generar JWT token (para uso interno)
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

// Middleware para verificar JWT (usar el de AWS Cognito)
const verificarJWT = verifyCognitoJWT;

// Middleware para verificar roles (usar el de AWS Cognito)
const verificarRol = verifyRole;

// Función para sincronizar usuario con Cognito
const sincronizarConCognito = async (usuario, password = null) => {
  try {
    // Verificar si el usuario existe en Cognito
    const cognitoUser = await getCognitoUser(usuario.email);
    
    if (!cognitoUser) {
      // Crear usuario en Cognito
      await createCognitoUser(usuario.email, password || 'TempPassword123!', {
        'custom:role': usuario.rol,
        'name': usuario.nombre
      });
    } else {
      // Actualizar atributos en Cognito
      await updateUserAttributes(usuario.email, {
        'custom:role': usuario.rol,
        'name': usuario.nombre
      });
    }
  } catch (error) {
    console.error('Error sincronizando con Cognito:', error);
    throw error;
  }
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
  sincronizarConCognito,
  SECRET_KEY,
  TOKEN_CONFIRMATION_SECRET
};
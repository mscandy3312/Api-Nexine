/**
 * Rutas de Autenticación - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con la autenticación:
 * - Registro de usuarios
 * - Login/logout
 * - Verificación de email
 * - Recuperación de contraseña
 * - Gestión de perfiles
 * 
 * @author Naxine Team
 * @version 1.0.0
 */

const express = require('express');        // Framework web
const bcrypt = require('bcryptjs');        // Para hashear contraseñas
const jwt = require('jsonwebtoken');       // Para generar tokens JWT

// Importar modelos de la base de datos
const { Usuario, Profesional, Cliente } = require('../models');

// Importar funciones de configuración OAuth
const { 
  passport,                    // Configuración de Passport
  verificarJWT,               // Middleware para verificar tokens JWT
  verificarRol,               // Middleware para verificar roles
  generarJWT,                 // Función para generar tokens JWT
  generarTokenVerificacion,   // Función para generar tokens de verificación
  enviarTokenVerificacion,    // Función para enviar emails de verificación
  sincronizarConCognito,      // Función para sincronizar con Cognito (deprecated)
  TOKEN_CONFIRMATION_SECRET   // Secreto para tokens de confirmación
} = require('../config/oauthConfig');

const router = express.Router();

// ============================================================================
// RUTAS DE AUTENTICACIÓN
// ============================================================================

/**
 * POST /auth/register - Registro de nuevo usuario
 * 
 * Permite a un usuario registrarse en el sistema con email y contraseña.
 * Crea un nuevo usuario en la base de datos local.
 * 
 * Body requerido:
 * - nombre: string (nombre completo del usuario)
 * - email: string (email único)
 * - password: string (contraseña)
 * - rol: string (opcional, por defecto 'usuario')
 * 
 * Respuesta exitosa: 201 con datos del usuario creado
 * Errores: 400 si faltan datos o email ya existe
 */
// POST /register - auth
router.post('/register', async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    // Extraer datos del cuerpo de la petición
    const { nombre, email, password, rol = 'usuario' } = req.body;

    // Validar que se proporcionaron todos los datos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        message: 'Nombre, email y contraseña son requeridos' 
      });
    }

    // Verificar si ya existe un usuario con ese email
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ 
        message: 'El correo electrónico ya está registrado' 
      });
    }

    // Encriptar la contraseña usando bcrypt
    // Salt rounds: número de iteraciones para hacer el hash más seguro
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario en la base de datos local
    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: hashedPassword,
      rol,
      email_verificado: false,
      activo: true,
      fecha_creacion: new Date()
    });

    // Crear usuario en AWS Cognito
    try {
      await createCognitoUser(email, password, {
        'custom:role': rol,
        'name': nombre
      });
    } catch (cognitoError) {
      console.error('Error creando usuario en Cognito:', cognitoError);
      // Si falla Cognito, eliminar usuario local
      await nuevoUsuario.destroy();
      return res.status(500).json({ 
        message: 'Error creando usuario en el sistema de autenticación' 
      });
    }

    // Generar token de verificación
    const tokenVerificacion = generarTokenVerificacion(email);
    await nuevoUsuario.update({ token_verificacion: tokenVerificacion });

    // Enviar email de verificación
    await enviarTokenVerificacion(email, nombre, tokenVerificacion);

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Revisa tu correo para verificar tu cuenta.',
      usuario: {
        id: nuevoUsuario.id_usuario,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Login tradicional con email y contraseña
// POST /login - auth
router.post('/login', async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario en la base de datos local
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas' 
      });
    }

    // Verificar si el email está verificado
    if (!usuario.email_verificado) {
      return res.status(401).json({ 
        message: 'Por favor verifica tu correo electrónico antes de iniciar sesión' 
      });
    }

    // Verificar si la cuenta está activa
    if (!usuario.activo) {
      return res.status(401).json({ 
        message: 'Tu cuenta ha sido desactivada. Contacta al administrador.' 
      });
    }

    // Actualizar último acceso
    await usuario.update({ ultimo_acceso: new Date() });

    // Generar JWT
    const token = generarJWT(usuario);

    res.json({
      message: `Bienvenido ${usuario.nombre}`,
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Verificación de email
// GET /verify-email/:token - auth
router.get('/verify-email/:token', async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const { token } = req.params;

    // Verificar token
    const decoded = jwt.verify(token, TOKEN_CONFIRMATION_SECRET);
    const usuario = await Usuario.findOne({ where: { email: decoded.email } });

    if (!usuario) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar usuario como verificado
    await usuario.update({
      email_verificado: true,
      fecha_verificacion: new Date(),
      token_verificacion: null
    });

    // Actualizar en Cognito también
    try {
      await updateUserAttributes(usuario.email, {
        'email_verified': 'true'
      });
    } catch (cognitoError) {
      console.error('Error actualizando verificación en Cognito:', cognitoError);
    }

    res.json({ message: 'Email verificado exitosamente' });
  } catch (error) {
    console.error('Error verificando email:', error);
    res.status(400).json({ message: 'Token inválido o expirado' });
  }
});

// Reenviar email de verificación
// POST /resend-verification - auth
router.post('/resend-verification', async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (usuario.email_verificado) {
      return res.status(400).json({ message: 'El email ya está verificado' });
    }

    // Generar nuevo token
    const tokenVerificacion = generarTokenVerificacion(email);
    await usuario.update({ token_verificacion });

    // Enviar email
    await enviarTokenVerificacion(email, usuario.nombre, tokenVerificacion);

    res.json({ message: 'Email de verificación reenviado' });
  } catch (error) {
    console.error('Error reenviando verificación:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Obtener perfil del usuario autenticado
// GET /profile - auth
router.get('/profile', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const usuario = await Usuario.findByPk(req.user.id_usuario, {
      attributes: { exclude: ['password', 'token_verificacion'] }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ usuario });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar perfil del usuario
// PUT /profile - auth
router.put('/profile', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const { nombre, telefono } = req.body;
    const usuario = await Usuario.findByPk(req.user.id_usuario);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const updateData = {};
    if (nombre) updateData.nombre = nombre;

    await usuario.update(updateData);

    // Actualizar en Cognito también
    try {
      await updateUserAttributes(usuario.email, {
        'name': usuario.nombre
      });
    } catch (cognitoError) {
      console.error('Error actualizando perfil en Cognito:', cognitoError);
    }

    res.json({ 
      message: 'Perfil actualizado exitosamente',
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Cambiar contraseña
// PUT /change-password - auth
router.put('/change-password', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Contraseña actual y nueva contraseña son requeridas' 
      });
    }

    const usuario = await Usuario.findByPk(req.user.id_usuario);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(currentPassword, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Encriptar nueva contraseña
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña en la base de datos local
    await usuario.update({ password: hashedNewPassword });

    // Actualizar contraseña en Cognito
    try {
      const { setUserPassword } = require('../awsConfig');
      await setUserPassword(usuario.email, newPassword);
    } catch (cognitoError) {
      console.error('Error actualizando contraseña en Cognito:', cognitoError);
    }

    res.json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Rutas para administradores
// GET /users - auth
router.get('/users', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const usuarios = await Usuario.findAll({
      attributes: { exclude: ['password', 'token_verificacion'] },
      order: [['fecha_creacion', 'DESC']]
    });

    res.json({ usuarios });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Actualizar rol de usuario (solo administradores)
// PUT /users/:id/role - auth específico por ID
router.put('/users/:id/role', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!['usuario', 'administrador', 'profesionista'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await usuario.update({ rol });

    // Actualizar rol en Cognito
    try {
      await updateUserAttributes(usuario.email, {
        'custom:role': rol
      });
    } catch (cognitoError) {
      console.error('Error actualizando rol en Cognito:', cognitoError);
    }

    res.json({ 
      message: 'Rol actualizado exitosamente',
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error actualizando rol:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Activar/desactivar usuario (solo administradores)
// PUT /users/:id/status - auth específico por ID
router.put('/users/:id/status', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const { id } = req.params;
    const { activo } = req.body;

    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    await usuario.update({ activo });

    res.json({ 
      message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        email: usuario.email,
        activo: usuario.activo
      }
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// Sincronizar usuarios con Cognito (solo administradores)
// POST /sync-cognito - auth
router.post('/sync-cognito', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
  try {
    const usuarios = await Usuario.findAll();
    let sincronizados = 0;
    let errores = 0;

    for (const usuario of usuarios) {
      try {
        await sincronizarConCognito(usuario);
        sincronizados++;
      } catch (error) {
        console.error(`Error sincronizando usuario ${usuario.email}:`, error);
        errores++;
      }
    }

    res.json({
      message: 'Sincronización completada',
      sincronizados,
      errores,
      total: usuarios.length
    });
  } catch (error) {
    console.error('Error en sincronización:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
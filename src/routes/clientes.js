/**
 * Rutas de Clientes - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con clientes:
 * - CRUD básico (Create, Read, Update, Delete)
 * - Búsquedas y filtros
 * - Estadísticas y reportes
 * - Validaciones de permisos por rol
 * 
 * @author Naxine Team
 * @version 1.0.0
 */

const express = require('express');
const router = express.Router();
const { Cliente, Sesion, Valoracion, Pago } = require('../models');
const { verificarJWT, verificarRol } = require('../config/oauthConfig');

// Crear cliente (solo administradores y profesionales)
// POST / - Listar todos los clientes
router.post('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const cliente = await Cliente.create(req.body);
        res.json(cliente);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los clientes
// GET / - Listar todos los clientes
router.get('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const clientes = await Cliente.findAll({ 
            include: ['sesiones', 'valoraciones', 'pagos'] 
        });
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener cliente por id
// GET /:id - Obtener clientes por ID
router.get('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const cliente = await Cliente.findByPk(req.params.id, { 
            include: ['sesiones', 'valoraciones', 'pagos'] 
        });
        
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Si es un usuario normal, solo puede ver su propio perfil
        if (req.user.rol === 'usuario') {
            const clienteUsuario = await Cliente.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!clienteUsuario || clienteUsuario.id_cliente !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar cliente
// PUT /:id - Obtener clientes por ID
router.put('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Si es un usuario normal, solo puede actualizar su propio perfil
        if (req.user.rol === 'usuario') {
            const clienteUsuario = await Cliente.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!clienteUsuario || clienteUsuario.id_cliente !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        await cliente.update(req.body);
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar cliente (solo administradores)
// DELETE /:id - Obtener clientes por ID
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        await cliente.destroy();
        res.json({ message: 'Cliente eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener historial de sesiones de un cliente
// GET /:id/sesiones - clientes específico por ID
router.get('/:id/sesiones', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar permisos
        if (req.user.rol === 'usuario') {
            const clienteUsuario = await Cliente.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!clienteUsuario || clienteUsuario.id_cliente !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        const sesiones = await Sesion.findAll({
            where: { id_cliente: req.params.id },
            include: ['profesional', 'pago'],
            order: [['fecha_sesion', 'DESC']]
        });

        res.json(sesiones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener valoraciones de un cliente
// GET /:id/valoraciones - clientes específico por ID
router.get('/:id/valoraciones', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar permisos
        if (req.user.rol === 'usuario') {
            const clienteUsuario = await Cliente.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!clienteUsuario || clienteUsuario.id_cliente !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        const valoraciones = await Valoracion.findAll({
            where: { id_cliente: req.params.id },
            include: ['profesional'],
            order: [['fecha_creacion', 'DESC']]
        });

        res.json(valoraciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pagos de un cliente
// GET /:id/pagos - clientes específico por ID
router.get('/:id/pagos', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Verificar permisos
        if (req.user.rol === 'usuario') {
            const clienteUsuario = await Cliente.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!clienteUsuario || clienteUsuario.id_cliente !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        const pagos = await Pago.findAll({
            where: { id_cliente: req.params.id },
            include: ['sesion'],
            order: [['fecha_pago', 'DESC']]
        });

        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de clientes (solo administradores)
// GET /stats/overview - Estadísticas de clientes (solo administradores)
router.get('/stats/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const totalClientes = await Cliente.count();
        const clientesActivos = await Cliente.count({ where: { activo: true } });
        
        const clientesRecientes = await Cliente.findAll({
            order: [['fecha_creacion', 'DESC']],
            limit: 5
        });

        const clientesConSesiones = await Cliente.count({
            include: [{
                model: Sesion,
                required: true
            }]
        });

        res.json({
            total: totalClientes,
            activos: clientesActivos,
            conSesiones: clientesConSesiones,
            recientes: clientesRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar clientes
// GET /search/:query - Buscar clientes
router.get('/search/:query', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { query } = req.params;
        
        const clientes = await Cliente.findAll({
            where: {
                [Cliente.sequelize.Op.or]: [
                    { nombre: { [Cliente.sequelize.Op.like]: `%${query}%` } },
                    { email: { [Cliente.sequelize.Op.like]: `%${query}%` } },
                    { telefono: { [Cliente.sequelize.Op.like]: `%${query}%` } }
                ]
            },
            limit: 20
        });
        
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

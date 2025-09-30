/**
 * Rutas de Sesiones - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con sesiones:
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
const { Sesion, Cliente, Precio, Pago, Profesional } = require('../models');
const { verificarJWT, verificarRol } = require('../config/oauthConfig');

// Crear sesión (solo administradores y profesionales)
// POST / - Listar todos los sesiones
router.post('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const sesion = await Sesion.create(req.body);
        res.json(sesion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todas las sesiones
// GET / - Listar todos los sesiones
router.get('/', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        let whereClause = {};
        
        // Si es un usuario normal, solo puede ver sus propias sesiones
        if (req.user.rol === 'usuario') {
            const cliente = await Cliente.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (cliente) {
                whereClause.id_cliente = cliente.id_cliente;
            } else {
                return res.json([]);
            }
        }
        
        // Si es un profesional, solo puede ver sus propias sesiones
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const sesiones = await Sesion.findAll({ 
            where: whereClause,
            include: ['cliente', 'profesional'] 
        });
        res.json(sesiones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener sesión por id
// GET /:id - Obtener sesiones por ID
router.get('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const sesion = await Sesion.findByPk(req.params.id, { 
            include: ['cliente', 'profesional'] 
        });
        
        if (!sesion) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        
        // Verificar permisos de acceso
        if (req.user.rol === 'usuario') {
            const cliente = await Cliente.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (!cliente || sesion.id_cliente !== cliente.id_cliente) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }
        
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (!profesional || sesion.id_profesional !== profesional.id_profesional) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }
        
        res.json(sesion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar sesión
// PUT /:id - Obtener sesiones por ID
router.put('/:id', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const sesion = await Sesion.findByPk(req.params.id);
        if (!sesion) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        
        // Si es un profesional, solo puede actualizar sus propias sesiones
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (!profesional || sesion.id_profesional !== profesional.id_profesional) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }
        
        await sesion.update(req.body);
        res.json(sesion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar sesión (solo administradores)
// DELETE /:id - Obtener sesiones por ID
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const sesion = await Sesion.findByPk(req.params.id);
        if (!sesion) {
            return res.status(404).json({ error: 'Sesión no encontrada' });
        }
        await sesion.destroy();
        res.json({ message: 'Sesión eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener sesiones por profesional
// GET /profesional/:id - sesiones por profesional
router.get('/profesional/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const sesiones = await Sesion.findAll({
            where: { id_profesional: req.params.id },
            include: ['cliente', 'profesional', 'pago'],
            order: [['fecha_sesion', 'DESC']]
        });
        res.json(sesiones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener sesiones por cliente
// GET /cliente/:id - sesiones por cliente
router.get('/cliente/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const sesiones = await Sesion.findAll({
            where: { id_cliente: req.params.id },
            include: ['cliente', 'profesional', 'pago'],
            order: [['fecha_sesion', 'DESC']]
        });
        res.json(sesiones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener sesiones por estado
// GET /estado/:estado - sesiones por estado
router.get('/estado/:estado', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { estado } = req.params;
        let whereClause = { estado };
        
        // Aplicar filtros de rol
        if (req.user.rol === 'usuario') {
            const cliente = await Cliente.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (cliente) {
                whereClause.id_cliente = cliente.id_cliente;
            } else {
                return res.json([]);
            }
        }
        
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const sesiones = await Sesion.findAll({
            where: whereClause,
            include: ['cliente', 'profesional', 'pago'],
            order: [['fecha_sesion', 'DESC']]
        });
        res.json(sesiones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener sesiones por rango de fechas
// GET /fecha/:fechaInicio/:fechaFin - sesiones por rango de fechas
router.get('/fecha/:fechaInicio/:fechaFin', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { fechaInicio, fechaFin } = req.params;
        let whereClause = {
            fecha_sesion: {
                [Sesion.sequelize.Op.between]: [fechaInicio, fechaFin]
            }
        };
        
        // Aplicar filtros de rol
        if (req.user.rol === 'usuario') {
            const cliente = await Cliente.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (cliente) {
                whereClause.id_cliente = cliente.id_cliente;
            } else {
                return res.json([]);
            }
        }
        
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const sesiones = await Sesion.findAll({
            where: whereClause,
            include: ['cliente', 'profesional', 'pago'],
            order: [['fecha_sesion', 'ASC']]
        });
        res.json(sesiones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de sesiones (solo administradores)
// GET /stats/overview - Estadísticas de sesiones (solo administradores)
router.get('/stats/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const totalSesiones = await Sesion.count();
        const sesionesCompletadas = await Sesion.count({ where: { estado: 'completada' } });
        const sesionesPendientes = await Sesion.count({ where: { estado: 'pendiente' } });
        const sesionesCanceladas = await Sesion.count({ where: { estado: 'cancelada' } });
        
        const sesionesPorEstado = await Sesion.findAll({
            attributes: [
                'estado',
                [Sesion.sequelize.fn('COUNT', Sesion.sequelize.col('id_sesion')), 'count']
            ],
            group: ['estado']
        });
        
        const sesionesRecientes = await Sesion.findAll({
            include: ['cliente', 'profesional'],
            order: [['fecha_sesion', 'DESC']],
            limit: 5
        });
        
        res.json({
            total: totalSesiones,
            completadas: sesionesCompletadas,
            pendientes: sesionesPendientes,
            canceladas: sesionesCanceladas,
            porEstado: sesionesPorEstado,
            recientes: sesionesRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar sesiones
// GET /search/:query - Buscar sesiones
router.get('/search/:query', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { query } = req.params;
        let whereClause = {
            [Sesion.sequelize.Op.or]: [
                { notas: { [Sesion.sequelize.Op.like]: `%${query}%` } },
                { tipo_consulta: { [Sesion.sequelize.Op.like]: `%${query}%` } }
            ]
        };
        
        // Aplicar filtros de rol
        if (req.user.rol === 'usuario') {
            const cliente = await Cliente.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (cliente) {
                whereClause.id_cliente = cliente.id_cliente;
            } else {
                return res.json([]);
            }
        }
        
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const sesiones = await Sesion.findAll({
            where: whereClause,
            include: ['cliente', 'profesional', 'pago'],
            limit: 20
        });
        
        res.json(sesiones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

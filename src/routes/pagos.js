/**
 * Rutas de Pagos - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con pagos:
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
const { Pago, Profesional, Cliente, Sesion } = require('../models');
const { verificarJWT, verificarRol } = require('../config/oauthConfig');

// Crear pago (solo administradores)
// POST / - Listar todos los pagos
router.post('/', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const pago = await Pago.create(req.body);
        res.json(pago);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los pagos
// GET / - Listar todos los pagos
router.get('/', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        let whereClause = {};
        
        // Si es un profesional, solo puede ver sus propios pagos
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const pagos = await Pago.findAll({ 
            where: whereClause,
            include: ['profesional'] 
        });
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pago por id
// GET /:id - Obtener pagos por ID
router.get('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const pago = await Pago.findByPk(req.params.id, { 
            include: ['profesional'] 
        });
        
        if (!pago) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        
        // Verificar permisos de acceso
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (!profesional || pago.id_profesional !== profesional.id_profesional) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }
        
        res.json(pago);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar pago (solo administradores)
// PUT /:id - Obtener pagos por ID
router.put('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const pago = await Pago.findByPk(req.params.id);
        if (!pago) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        await pago.update(req.body);
        res.json(pago);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar pago (solo administradores)
// DELETE /:id - Obtener pagos por ID
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const pago = await Pago.findByPk(req.params.id);
        if (!pago) {
            return res.status(404).json({ error: 'Pago no encontrado' });
        }
        await pago.destroy();
        res.json({ message: 'Pago eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pagos por profesional
// GET /profesional/:id - pagos por profesional
router.get('/profesional/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const pagos = await Pago.findAll({
            where: { id_profesional: req.params.id },
            include: ['profesional', 'sesion'],
            order: [['fecha_pago', 'DESC']]
        });
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pagos por cliente
// GET /cliente/:id - pagos por cliente
router.get('/cliente/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const pagos = await Pago.findAll({
            where: { id_cliente: req.params.id },
            include: ['profesional', 'sesion'],
            order: [['fecha_pago', 'DESC']]
        });
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pagos por estado
// GET /estado/:estado - pagos por estado
router.get('/estado/:estado', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { estado } = req.params;
        let whereClause = { estado };
        
        // Aplicar filtros de rol
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const pagos = await Pago.findAll({
            where: whereClause,
            include: ['profesional', 'sesion'],
            order: [['fecha_pago', 'DESC']]
        });
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pagos por método de pago
// GET /metodo/:metodo - pagos por método
router.get('/metodo/:metodo', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { metodo } = req.params;
        let whereClause = { metodo_pago: metodo };
        
        // Aplicar filtros de rol
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const pagos = await Pago.findAll({
            where: whereClause,
            include: ['profesional', 'sesion'],
            order: [['fecha_pago', 'DESC']]
        });
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pagos por rango de fechas
// GET /fecha/:fechaInicio/:fechaFin - pagos por rango de fechas
router.get('/fecha/:fechaInicio/:fechaFin', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { fechaInicio, fechaFin } = req.params;
        let whereClause = {
            fecha_pago: {
                [Pago.sequelize.Op.between]: [fechaInicio, fechaFin]
            }
        };
        
        // Aplicar filtros de rol
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const pagos = await Pago.findAll({
            where: whereClause,
            include: ['profesional', 'sesion'],
            order: [['fecha_pago', 'ASC']]
        });
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de pagos (solo administradores)
// GET /stats/overview - Estadísticas de pagos (solo administradores)
router.get('/stats/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const totalPagos = await Pago.count();
        const pagosCompletados = await Pago.count({ where: { estado: 'completado' } });
        const pagosPendientes = await Pago.count({ where: { estado: 'pendiente' } });
        const pagosFallidos = await Pago.count({ where: { estado: 'fallido' } });
        
        const totalIngresos = await Pago.findAll({
            where: { estado: 'completado' },
            attributes: [
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ]
        });
        
        const pagosPorEstado = await Pago.findAll({
            attributes: [
                'estado',
                [Pago.sequelize.fn('COUNT', Pago.sequelize.col('id_pago')), 'count']
            ],
            group: ['estado']
        });
        
        const pagosPorMetodo = await Pago.findAll({
            where: { estado: 'completado' },
            attributes: [
                'metodo_pago',
                [Pago.sequelize.fn('COUNT', Pago.sequelize.col('id_pago')), 'count'],
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ],
            group: ['metodo_pago']
        });
        
        const pagosRecientes = await Pago.findAll({
            include: ['profesional', 'sesion'],
            order: [['fecha_pago', 'DESC']],
            limit: 5
        });
        
        res.json({
            total: totalPagos,
            completados: pagosCompletados,
            pendientes: pagosPendientes,
            fallidos: pagosFallidos,
            totalIngresos: totalIngresos[0]?.dataValues?.total || 0,
            porEstado: pagosPorEstado,
            porMetodo: pagosPorMetodo,
            recientes: pagosRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de un profesional específico
// GET /profesional/:id/stats - pagos por profesional
router.get('/profesional/:id/stats', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { id } = req.params;
        
        const totalPagos = await Pago.count({ where: { id_profesional: id } });
        const pagosCompletados = await Pago.count({ 
            where: { 
                id_profesional: id, 
                estado: 'completado' 
            } 
        });
        
        const totalIngresos = await Pago.findAll({
            where: { 
                id_profesional: id, 
                estado: 'completado' 
            },
            attributes: [
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ]
        });
        
        const pagosRecientes = await Pago.findAll({
            where: { id_profesional: id },
            include: ['sesion'],
            order: [['fecha_pago', 'DESC']],
            limit: 10
        });
        
        res.json({
            total: totalPagos,
            completados: pagosCompletados,
            totalIngresos: totalIngresos[0]?.dataValues?.total || 0,
            recientes: pagosRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar pagos
// GET /search/:query - Buscar pagos
router.get('/search/:query', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { query } = req.params;
        let whereClause = {
            [Pago.sequelize.Op.or]: [
                { referencia: { [Pago.sequelize.Op.like]: `%${query}%` } },
                { metodo_pago: { [Pago.sequelize.Op.like]: `%${query}%` } }
            ]
        };
        
        // Aplicar filtros de rol
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const pagos = await Pago.findAll({
            where: whereClause,
            include: ['profesional', 'sesion'],
            limit: 20
        });
        
        res.json(pagos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

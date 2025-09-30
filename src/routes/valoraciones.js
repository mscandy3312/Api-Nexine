/**
 * Rutas de Valoraciones - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con valoraciones:
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
const { Valoracion, Cliente, Profesional } = require('../models');
const { verificarJWT, verificarRol } = require('../config/oauthConfig');

// Crear valoración (usuarios autenticados)
// POST / - Listar todos los valoraciones
router.post('/', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        // Verificar que el usuario tenga un perfil de cliente
        const cliente = await Cliente.findOne({ where: { id_usuario: req.user.id_usuario } });
        if (!cliente) {
            return res.status(403).json({ error: 'Solo los clientes pueden crear valoraciones' });
        }
        
        const valoracion = await Valoracion.create({
            ...req.body,
            id_cliente: cliente.id_cliente
        });
        res.json(valoracion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todas las valoraciones
// GET / - Listar todos los valoraciones
router.get('/', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        let whereClause = {};
        
        // Si es un profesional, solo puede ver valoraciones de sus servicios
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (profesional) {
                whereClause.id_profesional = profesional.id_profesional;
            } else {
                return res.json([]);
            }
        }
        
        const valoraciones = await Valoracion.findAll({ 
            where: whereClause,
            include: ['cliente', 'profesional'] 
        });
        res.json(valoraciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener valoración por id
// GET /:id - Obtener valoraciones por ID
router.get('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const valoracion = await Valoracion.findByPk(req.params.id, { 
            include: ['cliente', 'profesional'] 
        });
        
        if (!valoracion) {
            return res.status(404).json({ error: 'Valoración no encontrada' });
        }
        
        // Verificar permisos de acceso
        if (req.user.rol === 'profesionista') {
            const profesional = await Profesional.findOne({ where: { id_usuario: req.user.id_usuario } });
            if (!profesional || valoracion.id_profesional !== profesional.id_profesional) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }
        
        res.json(valoracion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar valoración (solo administradores)
// PUT /:id - Obtener valoraciones por ID
router.put('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const valoracion = await Valoracion.findByPk(req.params.id);
        if (!valoracion) {
            return res.status(404).json({ error: 'Valoración no encontrada' });
        }
        await valoracion.update(req.body);
        res.json(valoracion);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar valoración (solo administradores)
// DELETE /:id - Obtener valoraciones por ID
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const valoracion = await Valoracion.findByPk(req.params.id);
        if (!valoracion) {
            return res.status(404).json({ error: 'Valoración no encontrada' });
        }
        await valoracion.destroy();
        res.json({ message: 'Valoración eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener valoraciones por profesional
// GET /profesional/:id - valoraciones por profesional
router.get('/profesional/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const valoraciones = await Valoracion.findAll({
            where: { id_profesional: req.params.id },
            include: ['cliente', 'profesional'],
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(valoraciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener valoraciones por cliente
// GET /cliente/:id - valoraciones por cliente
router.get('/cliente/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const valoraciones = await Valoracion.findAll({
            where: { id_cliente: req.params.id },
            include: ['cliente', 'profesional'],
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(valoraciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener valoraciones por calificación
// GET /calificacion/:calificacion - valoraciones por calificación
router.get('/calificacion/:calificacion', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { calificacion } = req.params;
        const valoraciones = await Valoracion.findAll({
            where: { calificacion: parseInt(calificacion) },
            include: ['cliente', 'profesional'],
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(valoraciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de valoraciones (solo administradores)
// GET /stats/overview - Estadísticas de valoraciones (solo administradores)
router.get('/stats/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const totalValoraciones = await Valoracion.count();
        const valoracionesPositivas = await Valoracion.count({ where: { calificacion: { [Valoracion.sequelize.Op.gte]: 4 } } });
        const valoracionesNegativas = await Valoracion.count({ where: { calificacion: { [Valoracion.sequelize.Op.lte]: 2 } } });
        
        const promedioCalificacion = await Valoracion.findAll({
            attributes: [
                [Valoracion.sequelize.fn('AVG', Valoracion.sequelize.col('calificacion')), 'promedio']
            ]
        });
        
        const valoracionesPorCalificacion = await Valoracion.findAll({
            attributes: [
                'calificacion',
                [Valoracion.sequelize.fn('COUNT', Valoracion.sequelize.col('id_valoracion')), 'count']
            ],
            group: ['calificacion']
        });
        
        const valoracionesRecientes = await Valoracion.findAll({
            include: ['cliente', 'profesional'],
            order: [['fecha_creacion', 'DESC']],
            limit: 5
        });
        
        res.json({
            total: totalValoraciones,
            positivas: valoracionesPositivas,
            negativas: valoracionesNegativas,
            promedio: promedioCalificacion[0]?.dataValues?.promedio || 0,
            porCalificacion: valoracionesPorCalificacion,
            recientes: valoracionesRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de un profesional específico
// GET /profesional/:id/stats - valoraciones por profesional
router.get('/profesional/:id/stats', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { id } = req.params;
        
        const totalValoraciones = await Valoracion.count({ where: { id_profesional: id } });
        const promedioCalificacion = await Valoracion.findAll({
            where: { id_profesional: id },
            attributes: [
                [Valoracion.sequelize.fn('AVG', Valoracion.sequelize.col('calificacion')), 'promedio']
            ]
        });
        
        const valoracionesPorCalificacion = await Valoracion.findAll({
            where: { id_profesional: id },
            attributes: [
                'calificacion',
                [Valoracion.sequelize.fn('COUNT', Valoracion.sequelize.col('id_valoracion')), 'count']
            ],
            group: ['calificacion']
        });
        
        const valoracionesRecientes = await Valoracion.findAll({
            where: { id_profesional: id },
            include: ['cliente'],
            order: [['fecha_creacion', 'DESC']],
            limit: 10
        });
        
        res.json({
            total: totalValoraciones,
            promedio: promedioCalificacion[0]?.dataValues?.promedio || 0,
            porCalificacion: valoracionesPorCalificacion,
            recientes: valoracionesRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar valoraciones
// GET /search/:query - Buscar valoraciones
router.get('/search/:query', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { query } = req.params;
        let whereClause = {
            [Valoracion.sequelize.Op.or]: [
                { comentario: { [Valoracion.sequelize.Op.like]: `%${query}%` } }
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
        
        const valoraciones = await Valoracion.findAll({
            where: whereClause,
            include: ['cliente', 'profesional'],
            limit: 20
        });
        
        res.json(valoraciones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

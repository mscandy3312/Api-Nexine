/**
 * Rutas de Precios - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con precios:
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
const { Precio, Profesional, Sesion } = require('../models');
const { verificarJWT, verificarRol } = require('../config/oauthConfig');

// Crear precio (solo administradores y profesionales)
// POST / - Listar todos los precios
router.post('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const precio = await Precio.create(req.body);
        res.json(precio);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los precios
// GET / - Listar todos los precios
router.get('/', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const precios = await Precio.findAll();
        res.json(precios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener precio por id
// GET /:id - Obtener precios por ID
router.get('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const precio = await Precio.findByPk(req.params.id);
        if (!precio) {
            return res.status(404).json({ error: 'Precio no encontrado' });
        }
        res.json(precio);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar precio (solo administradores y profesionales)
// PUT /:id - Obtener precios por ID
router.put('/:id', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const precio = await Precio.findByPk(req.params.id);
        if (!precio) {
            return res.status(404).json({ error: 'Precio no encontrado' });
        }
        await precio.update(req.body);
        res.json(precio);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar precio (solo administradores)
// DELETE /:id - Obtener precios por ID
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const precio = await Precio.findByPk(req.params.id);
        if (!precio) {
            return res.status(404).json({ error: 'Precio no encontrado' });
        }
        await precio.destroy();
        res.json({ message: 'Precio eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener precios por especialidad
// GET /especialidad/:especialidad - precios por especialidad
router.get('/especialidad/:especialidad', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { especialidad } = req.params;
        const precios = await Precio.findAll({
            where: { especialidad: especialidad }
        });
        res.json(precios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener precios por rango de precio
// GET /rango/:precioMin/:precioMax - precios por rango
router.get('/rango/:precioMin/:precioMax', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { precioMin, precioMax } = req.params;
        const precios = await Precio.findAll({
            where: {
                precio_base: {
                    [Precio.sequelize.Op.between]: [parseFloat(precioMin), parseFloat(precioMax)]
                }
            }
        });
        res.json(precios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de precios (solo administradores)
// GET /stats/overview - Estadísticas de precios (solo administradores)
router.get('/stats/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const totalPrecios = await Precio.count();
        
        const preciosPorEspecialidad = await Precio.findAll({
            attributes: [
                'especialidad',
                [Precio.sequelize.fn('COUNT', Precio.sequelize.col('id_precio')), 'count'],
                [Precio.sequelize.fn('AVG', Precio.sequelize.col('precio_base')), 'promedio']
            ],
            group: ['especialidad']
        });
        
        const precioPromedioGeneral = await Precio.findAll({
            attributes: [
                [Precio.sequelize.fn('AVG', Precio.sequelize.col('precio_base')), 'promedio']
            ]
        });
        
        const precioMinimo = await Precio.min('precio_base');
        const precioMaximo = await Precio.max('precio_base');
        
        const preciosRecientes = await Precio.findAll({
            order: [['fecha_creacion', 'DESC']],
            limit: 5
        });
        
        res.json({
            total: totalPrecios,
            promedioGeneral: precioPromedioGeneral[0]?.dataValues?.promedio || 0,
            minimo: precioMinimo,
            maximo: precioMaximo,
            porEspecialidad: preciosPorEspecialidad,
            recientes: preciosRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar precios
// GET /search/:query - Buscar precios
router.get('/search/:query', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { query } = req.params;
        
        const precios = await Precio.findAll({
            where: {
                [Precio.sequelize.Op.or]: [
                    { especialidad: { [Precio.sequelize.Op.like]: `%${query}%` } },
                    { descripcion: { [Precio.sequelize.Op.like]: `%${query}%` } }
                ]
            },
            limit: 20
        });
        
        res.json(precios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

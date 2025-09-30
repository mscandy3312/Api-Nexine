/**
 * Rutas de Profesionales - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con profesionales:
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
const { Profesional } = require('../models');
const { verificarJWT, verificarRol } = require('../config/oauthConfig');

// Crear profesional (solo administradores)
// POST / - Listar todos los profesionales
router.post('/', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const profesional = await Profesional.create(req.body);
        res.json(profesional);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los profesionales
// GET / - Listar todos los profesionales
router.get('/', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const profesionales = await Profesional.findAll({
            where: { activo: true }
        });
        res.json(profesionales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener profesional por id
// GET /:id - Obtener profesionales por ID
router.get('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const profesional = await Profesional.findByPk(req.params.id);
        if (!profesional) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }

        // Si es un usuario normal, solo puede ver profesionales activos
        if (req.user.rol === 'usuario' && !profesional.activo) {
            return res.status(403).json({ error: 'Acceso denegado' });
        }

        res.json(profesional);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar profesional
// PUT /:id - Obtener profesionales por ID
router.put('/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const profesional = await Profesional.findByPk(req.params.id);
        if (!profesional) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }

        // Si es un profesional, solo puede actualizar su propio perfil
        if (req.user.rol === 'profesionista') {
            const profesionalUsuario = await Profesional.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!profesionalUsuario || profesionalUsuario.id_profesional !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        await profesional.update(req.body);
        res.json(profesional);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar profesional (solo administradores)
// DELETE /:id - Obtener profesionales por ID
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const profesional = await Profesional.findByPk(req.params.id);
        if (!profesional) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }
        await profesional.destroy();
        res.json({ message: 'Profesional eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar profesionales por especialidad
// GET /especialidad/:especialidad - profesionales por especialidad
router.get('/especialidad/:especialidad', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { especialidad } = req.params;
        const profesionales = await Profesional.findAll({
            where: { 
                especialidad: especialidad,
                activo: true 
            }
        });
        res.json(profesionales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar profesionales por ubicación
// GET /ubicacion/:ubicacion - profesionales
router.get('/ubicacion/:ubicacion', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { ubicacion } = req.params;
        const profesionales = await Profesional.findAll({
            where: { 
                ubicacion: { [Profesional.sequelize.Op.like]: `%${ubicacion}%` },
                activo: true 
            }
        });
        res.json(profesionales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener profesionales disponibles
// GET /disponibles - profesionales disponibles
router.get('/disponibles', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const profesionales = await Profesional.findAll({
            where: { 
                disponible: true,
                activo: true 
            }
        });
        res.json(profesionales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de profesionales (solo administradores)
// GET /stats/overview - Estadísticas de profesionales (solo administradores)
router.get('/stats/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const totalProfesionales = await Profesional.count();
        const profesionalesActivos = await Profesional.count({ where: { activo: true } });
        const profesionalesDisponibles = await Profesional.count({ where: { disponible: true, activo: true } });
        
        const profesionalesPorEspecialidad = await Profesional.findAll({
            attributes: [
                'especialidad',
                [Profesional.sequelize.fn('COUNT', Profesional.sequelize.col('id_profesional')), 'count']
            ],
            where: { activo: true },
            group: ['especialidad']
        });
        
        const profesionalesRecientes = await Profesional.findAll({
            order: [['fecha_creacion', 'DESC']],
            limit: 5
        });
        
        res.json({
            total: totalProfesionales,
            activos: profesionalesActivos,
            disponibles: profesionalesDisponibles,
            porEspecialidad: profesionalesPorEspecialidad,
            recientes: profesionalesRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar profesionales (búsqueda general)
// GET /search/:query - Buscar profesionales
router.get('/search/:query', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { query } = req.params;
        
        const profesionales = await Profesional.findAll({
            where: {
                [Profesional.sequelize.Op.and]: [
                    { activo: true },
                    {
                        [Profesional.sequelize.Op.or]: [
                            { especialidad: { [Profesional.sequelize.Op.like]: `%${query}%` } },
                            { ubicacion: { [Profesional.sequelize.Op.like]: `%${query}%` } },
                            { cedula_profesional: { [Profesional.sequelize.Op.like]: `%${query}%` } }
                        ]
                    }
                ]
            },
            limit: 20
        });
        
        res.json(profesionales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { Valoracion, Cliente, Profesional } = require('../models');
const { verificarJWT, verificarRol } = require('../oauthConfig');

// Crear valoración (usuarios autenticados)
router.post('/', verificarJWT, async (req, res) => {
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
router.get('/', verificarJWT, async (req, res) => {
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
router.get('/:id', verificarJWT, async (req, res) => {
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
router.put('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
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
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
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

module.exports = router;

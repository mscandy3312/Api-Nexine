const express = require('express');
const router = express.Router();
const { Pago, Profesional, Cliente, Sesion } = require('../models');
const { verificarJWT, verificarRol } = require('../oauthConfig');

// Crear pago (solo administradores)
router.post('/', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const pago = await Pago.create(req.body);
        res.json(pago);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los pagos
router.get('/', verificarJWT, async (req, res) => {
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
router.get('/:id', verificarJWT, async (req, res) => {
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
router.put('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
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
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
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

module.exports = router;

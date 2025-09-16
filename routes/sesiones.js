const express = require('express');
const router = express.Router();
const { Sesion, Cliente, Precio, Pago } = require('../models');
const { verificarJWT, verificarRol } = require('../oauthConfig');

// Crear sesión (solo administradores y profesionales)
router.post('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    try {
        const sesion = await Sesion.create(req.body);
        res.json(sesion);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todas las sesiones
router.get('/', verificarJWT, async (req, res) => {
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
router.get('/:id', verificarJWT, async (req, res) => {
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
router.put('/:id', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
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
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
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

module.exports = router;

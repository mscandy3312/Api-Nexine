const express = require('express');
const router = express.Router();
const { Precio, Profesional, Sesion } = require('../models');
const { verificarJWT, verificarRol } = require('../oauthConfig');

// Crear precio (solo administradores y profesionales)
router.post('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    try {
        const precio = await Precio.create(req.body);
        res.json(precio);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los precios
router.get('/', verificarJWT, async (req, res) => {
    try {
        const precios = await Precio.findAll();
        res.json(precios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener precio por id
router.get('/:id', verificarJWT, async (req, res) => {
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
router.put('/:id', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
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
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
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

module.exports = router;

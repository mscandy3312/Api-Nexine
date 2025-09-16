const express = require('express');
const router = express.Router();
const { Profesional } = require('../models');
const { verificarJWT, verificarRol } = require('../oauthConfig');

// Crear profesional (solo administradores)
router.post('/', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const profesional = await Profesional.create(req.body);
        res.json(profesional);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los profesionales
router.get('/', verificarJWT, async (req, res) => {
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
router.get('/:id', verificarJWT, async (req, res) => {
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
router.put('/:id', verificarJWT, async (req, res) => {
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
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
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

module.exports = router;

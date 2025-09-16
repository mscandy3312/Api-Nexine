const express = require('express');
const router = express.Router();
const { Cliente, Sesion, Valoracion, Pago } = require('../models');
const { verificarJWT, verificarRol } = require('../oauthConfig');

// Crear cliente (solo administradores y profesionales)
router.post('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    try {
        const cliente = await Cliente.create(req.body);
        res.json(cliente);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Obtener todos los clientes
router.get('/', verificarJWT, verificarRol(['administrador', 'profesionista']), async (req, res) => {
    try {
        const clientes = await Cliente.findAll({ 
            include: ['sesiones', 'valoraciones', 'pagos'] 
        });
        res.json(clientes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener cliente por id
router.get('/:id', verificarJWT, async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id, { 
            include: ['sesiones', 'valoraciones', 'pagos'] 
        });
        
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Si es un usuario normal, solo puede ver su propio perfil
        if (req.user.rol === 'usuario') {
            const clienteUsuario = await Cliente.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!clienteUsuario || clienteUsuario.id_cliente !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar cliente
router.put('/:id', verificarJWT, async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }

        // Si es un usuario normal, solo puede actualizar su propio perfil
        if (req.user.rol === 'usuario') {
            const clienteUsuario = await Cliente.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!clienteUsuario || clienteUsuario.id_cliente !== parseInt(req.params.id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        await cliente.update(req.body);
        res.json(cliente);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar cliente (solo administradores)
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
            return res.status(404).json({ error: 'Cliente no encontrado' });
        }
        await cliente.destroy();
        res.json({ message: 'Cliente eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

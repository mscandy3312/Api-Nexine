const express = require('express');
const router = express.Router();
const { Usuario, Profesional, Cliente } = require('../models');
const { verificarJWT, verificarRol } = require('../oauthConfig');

// Obtener todos los usuarios (solo administradores)
router.get('/', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password', 'token_verificacion'] },
            include: [
                {
                    model: Profesional,
                    required: false
                },
                {
                    model: Cliente,
                    required: false
                }
            ],
            order: [['fecha_creacion', 'DESC']]
        });
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener usuario por id (solo administradores)
router.get('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id, {
            attributes: { exclude: ['password', 'token_verificacion'] },
            include: [
                {
                    model: Profesional,
                    required: false
                },
                {
                    model: Cliente,
                    required: false
                }
            ]
        });
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json(usuario);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar usuario (solo administradores)
router.put('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Excluir campos sensibles de la actualización
        const { password, token_verificacion, google_id, ...updateData } = req.body;
        
        await usuario.update(updateData);
        
        res.json({
            message: 'Usuario actualizado exitosamente',
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
                activo: usuario.activo
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar usuario (solo administradores)
router.delete('/:id', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Verificar que no sea el último administrador
        if (usuario.rol === 'administrador') {
            const adminCount = await Usuario.count({ where: { rol: 'administrador' } });
            if (adminCount <= 1) {
                return res.status(400).json({ 
                    error: 'No se puede eliminar el último administrador' 
                });
            }
        }
        
        await usuario.destroy();
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de usuarios (solo administradores)
router.get('/stats/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const totalUsuarios = await Usuario.count();
        const usuariosActivos = await Usuario.count({ where: { activo: true } });
        const usuariosVerificados = await Usuario.count({ where: { email_verificado: true } });
        
        const usuariosPorRol = await Usuario.findAll({
            attributes: [
                'rol',
                [Usuario.sequelize.fn('COUNT', Usuario.sequelize.col('id_usuario')), 'count']
            ],
            group: ['rol']
        });
        
        const usuariosRecientes = await Usuario.findAll({
            attributes: { exclude: ['password', 'token_verificacion'] },
            order: [['fecha_creacion', 'DESC']],
            limit: 5
        });
        
        res.json({
            total: totalUsuarios,
            activos: usuariosActivos,
            verificados: usuariosVerificados,
            porRol: usuariosPorRol,
            recientes: usuariosRecientes
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Buscar usuarios (solo administradores)
router.get('/search/:query', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    try {
        const { query } = req.params;
        
        const usuarios = await Usuario.findAll({
            where: {
                [Usuario.sequelize.Op.or]: [
                    { nombre: { [Usuario.sequelize.Op.like]: `%${query}%` } },
                    { email: { [Usuario.sequelize.Op.like]: `%${query}%` } }
                ]
            },
            attributes: { exclude: ['password', 'token_verificacion'] },
            limit: 20
        });
        
        res.json(usuarios);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

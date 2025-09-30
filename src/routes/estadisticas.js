/**
 * Rutas de Estadisticas - Naxine API
 * 
 * Este archivo maneja todas las rutas relacionadas con estadisticas:
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
const { Usuario, Cliente, Profesional, Sesion, Valoracion, Pago, Precio } = require('../models');
const { verificarJWT, verificarRol } = require('../config/oauthConfig');

// Obtener estadísticas generales del sistema (solo administradores)
// GET /overview - estadisticas
router.get('/overview', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        // Estadísticas de usuarios
        const totalUsuarios = await Usuario.count();
        const usuariosActivos = await Usuario.count({ where: { activo: true } });
        const usuariosPorRol = await Usuario.findAll({
            attributes: [
                'rol',
                [Usuario.sequelize.fn('COUNT', Usuario.sequelize.col('id_usuario')), 'count']
            ],
            group: ['rol']
        });

        // Estadísticas de clientes
        const totalClientes = await Cliente.count();
        const clientesActivos = await Cliente.count({ where: { activo: true } });

        // Estadísticas de profesionales
        const totalProfesionales = await Profesional.count();
        const profesionalesActivos = await Profesional.count({ where: { activo: true } });
        const profesionalesDisponibles = await Profesional.count({ 
            where: { disponible: true, activo: true } 
        });

        // Estadísticas de sesiones
        const totalSesiones = await Sesion.count();
        const sesionesCompletadas = await Sesion.count({ where: { estado: 'completada' } });
        const sesionesPendientes = await Sesion.count({ where: { estado: 'pendiente' } });
        const sesionesCanceladas = await Sesion.count({ where: { estado: 'cancelada' } });

        // Estadísticas de valoraciones
        const totalValoraciones = await Valoracion.count();
        const promedioValoraciones = await Valoracion.findAll({
            attributes: [
                [Valoracion.sequelize.fn('AVG', Valoracion.sequelize.col('calificacion')), 'promedio']
            ]
        });

        // Estadísticas de pagos
        const totalPagos = await Pago.count();
        const pagosCompletados = await Pago.count({ where: { estado: 'completado' } });
        const totalIngresos = await Pago.findAll({
            where: { estado: 'completado' },
            attributes: [
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ]
        });

        // Estadísticas de precios
        const totalPrecios = await Precio.count();
        const precioPromedio = await Precio.findAll({
            attributes: [
                [Precio.sequelize.fn('AVG', Precio.sequelize.col('precio_base')), 'promedio']
            ]
        });

        // Actividad reciente (últimos 30 días)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);

        const usuariosRecientes = await Usuario.count({
            where: {
                fecha_creacion: {
                    [Usuario.sequelize.Op.gte]: fechaLimite
                }
            }
        });

        const sesionesRecientes = await Sesion.count({
            where: {
                fecha_sesion: {
                    [Sesion.sequelize.Op.gte]: fechaLimite
                }
            }
        });

        const ingresosRecientes = await Pago.findAll({
            where: {
                estado: 'completado',
                fecha_pago: {
                    [Pago.sequelize.Op.gte]: fechaLimite
                }
            },
            attributes: [
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ]
        });

        res.json({
            usuarios: {
                total: totalUsuarios,
                activos: usuariosActivos,
                porRol: usuariosPorRol,
                recientes: usuariosRecientes
            },
            clientes: {
                total: totalClientes,
                activos: clientesActivos
            },
            profesionales: {
                total: totalProfesionales,
                activos: profesionalesActivos,
                disponibles: profesionalesDisponibles
            },
            sesiones: {
                total: totalSesiones,
                completadas: sesionesCompletadas,
                pendientes: sesionesPendientes,
                canceladas: sesionesCanceladas,
                recientes: sesionesRecientes
            },
            valoraciones: {
                total: totalValoraciones,
                promedio: promedioValoraciones[0]?.dataValues?.promedio || 0
            },
            pagos: {
                total: totalPagos,
                completados: pagosCompletados,
                totalIngresos: totalIngresos[0]?.dataValues?.total || 0,
                ingresosRecientes: ingresosRecientes[0]?.dataValues?.total || 0
            },
            precios: {
                total: totalPrecios,
                promedio: precioPromedio[0]?.dataValues?.promedio || 0
            },
            actividad: {
                usuariosRecientes,
                sesionesRecientes,
                ingresosRecientes: ingresosRecientes[0]?.dataValues?.total || 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de rendimiento (solo administradores)
// GET /rendimiento - estadisticas
router.get('/rendimiento', verificarJWT, verificarRol(['administrador']), async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { periodo = '30' } = req.query; // días por defecto
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - parseInt(periodo));

        // Sesiones por día
        const sesionesPorDia = await Sesion.findAll({
            where: {
                fecha_sesion: {
                    [Sesion.sequelize.Op.gte]: fechaInicio
                }
            },
            attributes: [
                [Sesion.sequelize.fn('DATE', Sesion.sequelize.col('fecha_sesion')), 'fecha'],
                [Sesion.sequelize.fn('COUNT', Sesion.sequelize.col('id_sesion')), 'count']
            ],
            group: [Sesion.sequelize.fn('DATE', Sesion.sequelize.col('fecha_sesion'))],
            order: [[Sesion.sequelize.fn('DATE', Sesion.sequelize.col('fecha_sesion')), 'ASC']]
        });

        // Ingresos por día
        const ingresosPorDia = await Pago.findAll({
            where: {
                estado: 'completado',
                fecha_pago: {
                    [Pago.sequelize.Op.gte]: fechaInicio
                }
            },
            attributes: [
                [Pago.sequelize.fn('DATE', Pago.sequelize.col('fecha_pago')), 'fecha'],
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ],
            group: [Pago.sequelize.fn('DATE', Pago.sequelize.col('fecha_pago'))],
            order: [[Pago.sequelize.fn('DATE', Pago.sequelize.col('fecha_pago')), 'ASC']]
        });

        // Profesionales más activos
        const profesionalesActivos = await Sesion.findAll({
            where: {
                fecha_sesion: {
                    [Sesion.sequelize.Op.gte]: fechaInicio
                }
            },
            include: ['profesional'],
            attributes: [
                'id_profesional',
                [Sesion.sequelize.fn('COUNT', Sesion.sequelize.col('id_sesion')), 'sesiones']
            ],
            group: ['id_profesional', 'profesional.id_profesional'],
            order: [[Sesion.sequelize.fn('COUNT', Sesion.sequelize.col('id_sesion')), 'DESC']],
            limit: 10
        });

        // Especialidades más populares
        const especialidadesPopulares = await Sesion.findAll({
            where: {
                fecha_sesion: {
                    [Sesion.sequelize.Op.gte]: fechaInicio
                }
            },
            include: [{
                model: Profesional,
                attributes: ['especialidad']
            }],
            attributes: [
                [Profesional.sequelize.fn('COUNT', Profesional.sequelize.col('id_sesion')), 'sesiones']
            ],
            group: ['profesional.especialidad'],
            order: [[Profesional.sequelize.fn('COUNT', Profesional.sequelize.col('id_sesion')), 'DESC']],
            limit: 10
        });

        res.json({
            periodo: `${periodo} días`,
            sesionesPorDia,
            ingresosPorDia,
            profesionalesActivos,
            especialidadesPopulares
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener estadísticas de un profesional específico
// GET /profesional/:id - estadisticas por profesional
router.get('/profesional/:id', verificarJWT, async (req, res) => {
    // Procesar petición y devolver respuesta
    try {
        const { id } = req.params;
        
        // Verificar que el profesional existe
        const profesional = await Profesional.findByPk(id);
        if (!profesional) {
            return res.status(404).json({ error: 'Profesional no encontrado' });
        }

        // Verificar permisos
        if (req.user.rol === 'profesionista') {
            const profesionalUsuario = await Profesional.findOne({ 
                where: { id_usuario: req.user.id_usuario } 
            });
            if (!profesionalUsuario || profesionalUsuario.id_profesional !== parseInt(id)) {
                return res.status(403).json({ error: 'Acceso denegado' });
            }
        }

        // Estadísticas del profesional
        const totalSesiones = await Sesion.count({ where: { id_profesional: id } });
        const sesionesCompletadas = await Sesion.count({ 
            where: { id_profesional: id, estado: 'completada' } 
        });
        const sesionesPendientes = await Sesion.count({ 
            where: { id_profesional: id, estado: 'pendiente' } 
        });

        const totalValoraciones = await Valoracion.count({ where: { id_profesional: id } });
        const promedioValoraciones = await Valoracion.findAll({
            where: { id_profesional: id },
            attributes: [
                [Valoracion.sequelize.fn('AVG', Valoracion.sequelize.col('calificacion')), 'promedio']
            ]
        });

        const totalPagos = await Pago.count({ where: { id_profesional: id } });
        const totalIngresos = await Pago.findAll({
            where: { 
                id_profesional: id, 
                estado: 'completado' 
            },
            attributes: [
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ]
        });

        // Actividad reciente (últimos 30 días)
        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - 30);

        const sesionesRecientes = await Sesion.count({
            where: {
                id_profesional: id,
                fecha_sesion: {
                    [Sesion.sequelize.Op.gte]: fechaLimite
                }
            }
        });

        const ingresosRecientes = await Pago.findAll({
            where: {
                id_profesional: id,
                estado: 'completado',
                fecha_pago: {
                    [Pago.sequelize.Op.gte]: fechaLimite
                }
            },
            attributes: [
                [Pago.sequelize.fn('SUM', Pago.sequelize.col('monto')), 'total']
            ]
        });

        res.json({
            profesional: {
                id: profesional.id_profesional,
                especialidad: profesional.especialidad,
                ubicacion: profesional.ubicacion,
                activo: profesional.activo,
                disponible: profesional.disponible
            },
            sesiones: {
                total: totalSesiones,
                completadas: sesionesCompletadas,
                pendientes: sesionesPendientes,
                recientes: sesionesRecientes
            },
            valoraciones: {
                total: totalValoraciones,
                promedio: promedioValoraciones[0]?.dataValues?.promedio || 0
            },
            pagos: {
                total: totalPagos,
                totalIngresos: totalIngresos[0]?.dataValues?.total || 0,
                ingresosRecientes: ingresosRecientes[0]?.dataValues?.total || 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

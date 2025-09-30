/**
 * Modelos de Base de Datos - Naxine API
 * 
 * Este archivo define todos los modelos de la base de datos usando Sequelize ORM.
 * Incluye las relaciones entre las entidades del sistema.
 * 
 * Entidades principales:
 * - Usuario: Usuarios del sistema (usuarios, profesionales, administradores)
 * - Cliente: Pacientes/clientes del sistema
 * - Profesional: Profesionales de la salud
 * - Sesion: Citas y sesiones médicas
 * - Valoracion: Calificaciones y comentarios
 * - Pago: Transacciones de pago
 * - Precio: Tarifas por especialidad
 * 
 * @author Naxine Team
 * @version 1.0.0
 */

const { Sequelize, DataTypes } = require('sequelize');

// ============================================================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// ============================================================================

// Configuración de Sequelize para SQLite
// En producción se puede cambiar a MySQL/PostgreSQL
const sequelize = new Sequelize({
  dialect: 'sqlite',           // Tipo de base de datos
  storage: './database.sqlite', // Archivo de la base de datos SQLite
  logging: false               // Desactivar logs de SQL en producción
});

// Modelo de Usuario con 3 niveles
const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true // Puede ser null para usuarios OAuth
  },
  rol: {
    type: DataTypes.ENUM('usuario', 'administrador', 'profesionista'),
    allowNull: false,
    defaultValue: 'usuario'
  },
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  token_verificacion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_verificacion: {
    type: DataTypes.DATE,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

// Modelo de Profesional
const Profesional = sequelize.define('Profesional', {
  id_profesional: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  id_stripe: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombre_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  correo_electronico: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  numero_colegiado: {
    type: DataTypes.STRING,
    allowNull: true
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.0
  },
  biografia: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  foto_perfil: {
    type: DataTypes.STRING,
    allowNull: true
  },
  certificaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'profesionales',
  timestamps: false
});

// Modelo de Cliente
const Cliente = sequelize.define('Cliente', {
  id_cliente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'id_usuario'
    }
  },
  nombre_completo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombre_usuario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING,
    allowNull: true
  },
  codigo_postal: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ingreso: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'suspendido'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'clientes',
  timestamps: false
});

// Modelo de Precio
const Precio = sequelize.define('Precio', {
  id_precio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_sesion: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre_paquete: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duracion: {
    type: DataTypes.STRING,
    allowNull: true
  },
  modalidad: {
    type: DataTypes.STRING,
    allowNull: true
  },
  horario: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ordenes_totales: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ingresos_totales: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.0
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dias_disponibles: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hora_desde: {
    type: DataTypes.TIME,
    allowNull: true
  },
  hora_hasta: {
    type: DataTypes.TIME,
    allowNull: true
  }
}, {
  tableName: 'precios',
  timestamps: false
});

// Modelo de Sesión
const Sesion = sequelize.define('Sesion', {
  id_sesion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'id_cliente'
    }
  },
  id_profesional: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Profesional,
      key: 'id_profesional'
    }
  },
  numero_pedido: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completada', 'cancelada'),
    defaultValue: 'pendiente'
  },
  acciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  producto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metodo_pago: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'sesiones',
  timestamps: false
});

// Modelo de Valoración
const Valoracion = sequelize.define('Valoracion', {
  id_valoracion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_cliente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Cliente,
      key: 'id_cliente'
    }
  },
  id_profesional: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Profesional,
      key: 'id_profesional'
    }
  },
  producto: {
    type: DataTypes.STRING,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  mensaje: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
    defaultValue: 'pendiente'
  }
}, {
  tableName: 'valoraciones',
  timestamps: false
});

// Modelo de Pago
const Pago = sequelize.define('Pago', {
  id_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_profesional: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Profesional,
      key: 'id_profesional'
    }
  },
  balance_general: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  ventas: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  comision: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'completado', 'cancelado'),
    defaultValue: 'pendiente'
  },
  accion: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'pagos',
  timestamps: false
});

// Definir relaciones
Usuario.hasOne(Profesional, { foreignKey: 'id_usuario' });
Profesional.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Usuario.hasOne(Cliente, { foreignKey: 'id_usuario' });
Cliente.belongsTo(Usuario, { foreignKey: 'id_usuario' });

Cliente.hasMany(Sesion, { foreignKey: 'id_cliente' });
Sesion.belongsTo(Cliente, { foreignKey: 'id_cliente' });

Profesional.hasMany(Sesion, { foreignKey: 'id_profesional' });
Sesion.belongsTo(Profesional, { foreignKey: 'id_profesional' });

Cliente.hasMany(Valoracion, { foreignKey: 'id_cliente' });
Valoracion.belongsTo(Cliente, { foreignKey: 'id_cliente' });

Profesional.hasMany(Valoracion, { foreignKey: 'id_profesional' });
Valoracion.belongsTo(Profesional, { foreignKey: 'id_profesional' });

Profesional.hasMany(Pago, { foreignKey: 'id_profesional' });
Pago.belongsTo(Profesional, { foreignKey: 'id_profesional' });

// Sincronizar la base de datos
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

module.exports = {
  sequelize,
  Usuario,
  Profesional,
  Cliente,
  Precio,
  Sesion,
  Valoracion,
  Pago,
  syncDatabase
};


const AWS = require('aws-sdk');
const { CognitoIdentityProviderClient, AdminGetUserCommand, AdminCreateUserCommand, AdminSetUserPasswordCommand, AdminUpdateUserAttributesCommand, AdminDeleteUserCommand, ListUsersCommand, AdminAddUserToGroupCommand, AdminRemoveUserFromGroupCommand, AdminListGroupsForUserCommand, ListGroupsCommand } = require('@aws-sdk/client-cognito-identity-provider');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

// Cargar configuración desde config.js
const config = require('./config');

// Configuración de AWS
AWS.config.update({
  region: config.AWS_REGION,
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
});

// Cliente de Cognito
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  }
});

// Configuración de Cognito
const COGNITO_CONFIG = {
  UserPoolId: config.COGNITO_USER_POOL_ID,
  ClientId: config.COGNITO_CLIENT_ID,
  Region: config.AWS_REGION,
  JWKS_URI: `https://cognito-idp.${config.AWS_REGION}.amazonaws.com/${config.COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
  Groups: {
    ADMIN: 'admin',
    PROFESIONISTAS: 'profesionistas', 
    USUARIOS: 'usuarios'
  }
};

// Cliente JWKS para verificar tokens
const client = jwksClient({
  jwksUri: COGNITO_CONFIG.JWKS_URI,
  cache: true,
  cacheMaxAge: 600000, // 10 minutos
  rateLimit: true,
  jwksRequestsPerMinute: 5
});

// Función para obtener la clave pública
function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// Función para verificar JWT de Cognito
const verifyCognitoToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, {
      algorithms: ['RS256'],
      issuer: `https://cognito-idp.${COGNITO_CONFIG.Region}.amazonaws.com/${COGNITO_CONFIG.UserPoolId}`,
      audience: COGNITO_CONFIG.ClientId
    }, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
};

// Función para crear usuario en Cognito
const createCognitoUser = async (email, password, attributes = {}) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' },
        ...Object.entries(attributes).map(([key, value]) => ({
          Name: key,
          Value: value
        }))
      ],
      TemporaryPassword: password,
      MessageAction: 'SUPPRESS' // No enviar email de bienvenida
    };

    const command = new AdminCreateUserCommand(params);
    const result = await cognitoClient.send(command);
    
    // Establecer contraseña permanente
    await setUserPassword(email, password);
    
    return result;
  } catch (error) {
    console.error('Error creando usuario en Cognito:', error);
    throw error;
  }
};

// Función para establecer contraseña de usuario
const setUserPassword = async (email, password) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email,
      Password: password,
      Permanent: true
    };

    const command = new AdminSetUserPasswordCommand(params);
    await cognitoClient.send(command);
  } catch (error) {
    console.error('Error estableciendo contraseña:', error);
    throw error;
  }
};

// Función para obtener usuario de Cognito
const getCognitoUser = async (email) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email
    };

    const command = new AdminGetUserCommand(params);
    const result = await cognitoClient.send(command);
    return result;
  } catch (error) {
    if (error.name === 'UserNotFoundException') {
      return null;
    }
    console.error('Error obteniendo usuario de Cognito:', error);
    throw error;
  }
};

// Función para actualizar atributos de usuario
const updateUserAttributes = async (email, attributes) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email,
      UserAttributes: Object.entries(attributes).map(([key, value]) => ({
        Name: key,
        Value: value
      }))
    };

    const command = new AdminUpdateUserAttributesCommand(params);
    await cognitoClient.send(command);
  } catch (error) {
    console.error('Error actualizando atributos:', error);
    throw error;
  }
};

// Función para eliminar usuario de Cognito
const deleteCognitoUser = async (email) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email
    };

    const command = new AdminDeleteUserCommand(params);
    await cognitoClient.send(command);
  } catch (error) {
    console.error('Error eliminando usuario de Cognito:', error);
    throw error;
  }
};

// Función para listar usuarios
const listCognitoUsers = async (limit = 60, paginationToken = null) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Limit: limit
    };

    if (paginationToken) {
      params.PaginationToken = paginationToken;
    }

    const command = new ListUsersCommand(params);
    const result = await cognitoClient.send(command);
    return result;
  } catch (error) {
    console.error('Error listando usuarios:', error);
    throw error;
  }
};

// Middleware para verificar JWT de Cognito
const verifyCognitoJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token de acceso requerido' });
    }

    const decoded = await verifyCognitoToken(token);
    req.user = {
      id_usuario: decoded.sub,
      email: decoded.email,
      nombre: decoded.name || decoded.email,
      rol: decoded['custom:role'] || 'usuario',
      email_verificado: decoded.email_verified === 'true'
    };
    
    next();
  } catch (error) {
    console.error('Error verificando token:', error);
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// Middleware para verificar roles
const verifyRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'Acceso denegado. Rol insuficiente.' });
    }

    next();
  };
};

// Función para agregar usuario a un grupo
const addUserToGroup = async (email, groupName) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email,
      GroupName: groupName
    };

    const command = new AdminAddUserToGroupCommand(params);
    await cognitoClient.send(command);
  } catch (error) {
    console.error('Error agregando usuario a grupo:', error);
    throw error;
  }
};

// Función para remover usuario de un grupo
const removeUserFromGroup = async (email, groupName) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email,
      GroupName: groupName
    };

    const command = new AdminRemoveUserFromGroupCommand(params);
    await cognitoClient.send(command);
  } catch (error) {
    console.error('Error removiendo usuario de grupo:', error);
    throw error;
  }
};

// Función para obtener grupos de un usuario
const getUserGroups = async (email) => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId,
      Username: email
    };

    const command = new AdminListGroupsForUserCommand(params);
    const result = await cognitoClient.send(command);
    return result.Groups || [];
  } catch (error) {
    console.error('Error obteniendo grupos de usuario:', error);
    throw error;
  }
};

// Función para listar todos los grupos
const listGroups = async () => {
  try {
    const params = {
      UserPoolId: COGNITO_CONFIG.UserPoolId
    };

    const command = new ListGroupsCommand(params);
    const result = await cognitoClient.send(command);
    return result.Groups || [];
  } catch (error) {
    console.error('Error listando grupos:', error);
    throw error;
  }
};

// Función para crear usuario con grupo
const createCognitoUserWithGroup = async (email, password, groupName, attributes = {}) => {
  try {
    // Crear usuario
    const user = await createCognitoUser(email, password, attributes);
    
    // Agregar a grupo
    await addUserToGroup(email, groupName);
    
    return user;
  } catch (error) {
    console.error('Error creando usuario con grupo:', error);
    throw error;
  }
};

module.exports = {
  COGNITO_CONFIG,
  cognitoClient,
  verifyCognitoToken,
  createCognitoUser,
  getCognitoUser,
  updateUserAttributes,
  deleteCognitoUser,
  listCognitoUsers,
  setUserPassword,
  verifyCognitoJWT,
  verifyRole,
  addUserToGroup,
  removeUserFromGroup,
  getUserGroups,
  listGroups,
  createCognitoUserWithGroup
};

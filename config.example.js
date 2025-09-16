// Archivo de configuración de ejemplo
// Copia este archivo como config.js y configura las variables

module.exports = {
  // Configuración de la base de datos
  NODE_ENV: 'development',
  PORT: 3000,

  // JWT Secrets
  JWT_SECRET: 'tu_clave_secreta_super_segura',
  TOKEN_CONFIRMATION_SECRET: 'token_confirm_secret',
  SESSION_SECRET: 'tu_session_secret',

  // AWS Configuration
  AWS_REGION: 'us-east-1',
  AWS_ACCESS_KEY_ID: 'tu_aws_access_key_id',
  AWS_SECRET_ACCESS_KEY: 'tu_aws_secret_access_key',

  // AWS Cognito Configuration
  COGNITO_USER_POOL_ID: 'us-east-1_XXXXXXXXX',
  COGNITO_CLIENT_ID: 'tu_cognito_client_id',

  // Email Configuration
  EMAIL_USER: 'tu_correo@gmail.com',
  EMAIL_PASS: 'tu_contraseña_de_app',

  // Frontend URL
  FRONTEND_URL: 'http://localhost:3000'
};

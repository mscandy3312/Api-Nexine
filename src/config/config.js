// Archivo de configuración para Naxine con AWS Cognito
// Reemplaza los valores con tus credenciales reales

module.exports = {
  // Configuración de la base de datos
  NODE_ENV: 'development',
  PORT: 3000,

  // JWT Secrets
  JWT_SECRET: 'tu_clave_secreta_super_segura_cambiar_en_produccion',
  TOKEN_CONFIRMATION_SECRET: 'token_confirm_secret_cambiar_en_produccion',
  SESSION_SECRET: 'tu_session_secret_cambiar_en_produccion',

  // AWS Configuration
  AWS_REGION: 'us-east-2', // Tu región actual
  AWS_ACCESS_KEY_ID: 'REPLACED_AWS_ACCESS_KEY', // Access Key de adminJCAH
  AWS_SECRET_ACCESS_KEY: 'REPLACED_AWS_SECRET_KEY', // Secret Key de adminJCAH

  // AWS Cognito Configuration
  COGNITO_USER_POOL_ID: 'us-east-2_iGkK0vOyb', // Tu User Pool ID correcto
  COGNITO_CLIENT_ID: '63h6lrig5qfk60mobqkfiescf1', // Tu Client ID correcto
  
  // AWS Account ID (para ARNs)
  AWS_ACCOUNT_ID: '597918492879',

  // Email Configuration
  EMAIL_USER: 'tu_correo@gmail.com', // Reemplazar con tu email de Gmail
  EMAIL_PASS: 'tu_contraseña_de_app', // Reemplazar con tu contraseña de aplicación de Gmail

  // Frontend URL
  FRONTEND_URL: 'http://localhost:3000'
};

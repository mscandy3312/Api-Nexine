// Script para probar que las credenciales se cargan correctamente
const config = require('./config');

console.log('🔍 Verificando configuración de credenciales...\n');

console.log('📋 Configuración cargada:');
console.log(`   AWS_REGION: ${config.AWS_REGION}`);
console.log(`   AWS_ACCESS_KEY_ID: ${config.AWS_ACCESS_KEY_ID ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   AWS_SECRET_ACCESS_KEY: ${config.AWS_SECRET_ACCESS_KEY ? '✅ Configurado' : '❌ Faltante'}`);
console.log(`   COGNITO_USER_POOL_ID: ${config.COGNITO_USER_POOL_ID}`);
console.log(`   COGNITO_CLIENT_ID: ${config.COGNITO_CLIENT_ID}`);
console.log(`   EMAIL_USER: ${config.EMAIL_USER}`);
console.log(`   EMAIL_PASS: ${config.EMAIL_PASS ? '✅ Configurado' : '❌ Faltante'}`);

// Verificar que las credenciales no sean las de ejemplo
if (config.AWS_ACCESS_KEY_ID === 'TU_ACCESS_KEY_ID_DE_ADMINJCAH') {
  console.log('\n⚠️  Las credenciales AWS aún son las de ejemplo');
  console.log('   Actualiza config.js con las credenciales reales');
}

if (config.EMAIL_USER === 'tu_correo@gmail.com') {
  console.log('\n⚠️  El email aún es el de ejemplo');
  console.log('   Actualiza config.js con tu email real');
}

if (config.EMAIL_PASS === 'tu_contraseña_de_app') {
  console.log('\n⚠️  La contraseña de email aún es la de ejemplo');
  console.log('   Actualiza config.js con tu contraseña de aplicación de Gmail');
}

console.log('\n🎯 Próximos pasos:');
console.log('   1. Actualiza las credenciales en config.js si es necesario');
console.log('   2. Ejecuta: npm run quick-test');
console.log('   3. Si funciona, ejecuta: npm start');

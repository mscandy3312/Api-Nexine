const { 
  COGNITO_CONFIG, 
  cognitoClient, 
  getCognitoUser, 
  createCognitoUser,
  listCognitoUsers 
} = require('./awsConfig');

// Función para probar la conexión con Cognito
async function testCognitoConnection() {
  console.log('🧪 Probando conexión con AWS Cognito...\n');
  
  try {
    // Mostrar configuración
    console.log('📋 Configuración actual:');
    console.log(`   User Pool ID: ${COGNITO_CONFIG.UserPoolId}`);
    console.log(`   Client ID: ${COGNITO_CONFIG.ClientId}`);
    console.log(`   Región: ${COGNITO_CONFIG.Region}\n`);

    // Probar listado de usuarios (esto verifica la conexión)
    console.log('1. Probando conexión con Cognito...');
    const users = await listCognitoUsers(5); // Solo los primeros 5 usuarios
    console.log(`✅ Conexión exitosa! Encontrados ${users.Users?.length || 0} usuarios\n`);

    // Probar creación de usuario de prueba
    console.log('2. Probando creación de usuario de prueba...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      await createCognitoUser(testEmail, 'TestPassword123!', {
        'custom:role': 'usuario',
        'name': 'Usuario de Prueba'
      });
      console.log(`✅ Usuario de prueba creado: ${testEmail}\n`);

      // Probar obtención del usuario
      console.log('3. Probando obtención de usuario...');
      const user = await getCognitoUser(testEmail);
      if (user) {
        console.log('✅ Usuario obtenido exitosamente');
        console.log(`   Email: ${user.Username}`);
        console.log(`   Estado: ${user.UserStatus}`);
        console.log(`   Fecha creación: ${user.UserCreateDate}\n`);
      }

    } catch (createError) {
      if (createError.name === 'UsernameExistsException') {
        console.log('⚠️  Usuario de prueba ya existe, continuando...\n');
      } else {
        throw createError;
      }
    }

    console.log('🎉 Todas las pruebas de Cognito pasaron!');
    console.log('\n📝 Próximos pasos:');
    console.log('1. Configura las credenciales AWS en config.js');
    console.log('2. Asegúrate de que el atributo custom:role esté configurado en tu User Pool');
    console.log('3. Ejecuta: npm start');
    console.log('4. Prueba los endpoints de autenticación');

  } catch (error) {
    console.error('❌ Error en las pruebas de Cognito:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Solución: Verifica tus credenciales AWS en config.js');
    } else if (error.name === 'ResourceNotFoundException') {
      console.log('\n💡 Solución: Verifica que el User Pool ID sea correcto');
    } else if (error.name === 'InvalidParameterException') {
      console.log('\n💡 Solución: Verifica que el Client ID sea correcto');
    } else {
      console.log('\n💡 Revisa la configuración en config.js y asegúrate de tener los permisos correctos');
    }
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testCognitoConnection();
}

module.exports = { testCognitoConnection };

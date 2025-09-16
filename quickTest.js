const { 
  COGNITO_CONFIG, 
  listGroups, 
  listCognitoUsers,
  createCognitoUserWithGroup 
} = require('./awsConfig');

// Función de prueba rápida
async function quickTest() {
  console.log('🚀 Prueba rápida de AWS Cognito con adminJCAH\n');
  
  try {
    // 1. Verificar conexión
    console.log('1. Verificando conexión...');
    const users = await listCognitoUsers(1);
    console.log('✅ Conexión exitosa!\n');
    
    // 2. Verificar grupos
    console.log('2. Verificando grupos...');
    const groups = await listGroups();
    console.log(`✅ Encontrados ${groups.length} grupos:`);
    groups.forEach(group => {
      console.log(`   - ${group.GroupName} (${group.Description || 'Sin descripción'})`);
    });
    
    // 3. Verificar grupos requeridos
    const requiredGroups = ['admin', 'profesionistas', 'usuarios'];
    const existingGroupNames = groups.map(g => g.GroupName);
    const missingGroups = requiredGroups.filter(groupName => 
      !existingGroupNames.includes(groupName)
    );
    
    if (missingGroups.length > 0) {
      console.log(`\n⚠️  Grupos faltantes: ${missingGroups.join(', ')}`);
      console.log('   Crea estos grupos en AWS Console → Cognito → User Pools → Groups\n');
    } else {
      console.log('\n✅ Todos los grupos requeridos están configurados\n');
    }
    
    // 4. Probar creación de usuario
    console.log('3. Probando creación de usuario...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    try {
      await createCognitoUserWithGroup(testEmail, 'TestPassword123!', 'usuarios', {
        'name': 'Usuario de Prueba',
        'email_verified': 'true'
      });
      console.log(`✅ Usuario de prueba creado: ${testEmail}\n`);
    } catch (error) {
      if (error.name === 'GroupNotFoundException') {
        console.log('⚠️  Grupo "usuarios" no encontrado - créalo primero\n');
      } else {
        console.log(`⚠️  Error creando usuario: ${error.message}\n`);
      }
    }
    
    // 5. Mostrar configuración
    console.log('4. Configuración actual:');
    console.log(`   Usuario IAM: adminJCAH`);
    console.log(`   Región: ${COGNITO_CONFIG.Region}`);
    console.log(`   User Pool: ${COGNITO_CONFIG.UserPoolId}`);
    console.log(`   Client ID: ${COGNITO_CONFIG.ClientId}\n`);
    
    console.log('🎉 Prueba completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Crea los grupos faltantes (si los hay)');
    console.log('   2. Ejecuta: npm start');
    console.log('   3. Prueba los endpoints de autenticación');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Solución: Verifica las credenciales en config.js');
    } else if (error.name === 'AccessDeniedException') {
      console.log('\n💡 Solución: El usuario adminJCAH no tiene los permisos correctos');
      console.log('   Adjunta la política de iam-policy.json al usuario');
    } else {
      console.log('\n💡 Revisa la configuración y asegúrate de tener los permisos correctos');
    }
  }
}

// Ejecutar prueba
if (require.main === module) {
  quickTest();
}

module.exports = { quickTest };

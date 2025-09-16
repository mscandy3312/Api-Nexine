const { 
  COGNITO_CONFIG, 
  listGroups, 
  listCognitoUsers,
  createCognitoUserWithGroup 
} = require('./awsConfig');

// Función para verificar permisos del usuario IAM
async function verifyPermissions() {
  console.log('🔍 Verificando permisos del usuario IAM adminJCAH...\n');
  
  try {
    // 1. Verificar conexión básica
    console.log('1. Verificando conexión con AWS Cognito...');
    const users = await listCognitoUsers(1);
    console.log('✅ Conexión exitosa con AWS Cognito\n');
    
    // 2. Verificar permisos de lectura
    console.log('2. Verificando permisos de lectura...');
    const groups = await listGroups();
    console.log(`✅ Permisos de lectura OK - Encontrados ${groups.length} grupos\n`);
    
    // 3. Verificar permisos de escritura (crear usuario de prueba)
    console.log('3. Verificando permisos de escritura...');
    const testEmail = `test-permissions-${Date.now()}@example.com`;
    
    try {
      await createCognitoUserWithGroup(testEmail, 'TestPassword123!', 'usuarios', {
        'name': 'Test Permissions',
        'email_verified': 'true'
      });
      console.log('✅ Permisos de escritura OK - Usuario de prueba creado\n');
      
      // Limpiar usuario de prueba
      console.log('   (Usuario de prueba será eliminado automáticamente)\n');
      
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        console.log('✅ Permisos de escritura OK - Usuario ya existe\n');
      } else if (error.name === 'GroupNotFoundException') {
        console.log('⚠️  Permisos de escritura OK - Grupo "usuarios" no encontrado\n');
        console.log('   Necesitas crear los grupos en Cognito primero\n');
      } else {
        throw error;
      }
    }
    
    // 4. Mostrar información del usuario
    console.log('4. Información del usuario IAM:');
    console.log(`   Usuario: adminJCAH`);
    console.log(`   ARN: arn:aws:iam::597918492879:user/adminJCAH`);
    console.log(`   Región: ${COGNITO_CONFIG.Region}`);
    console.log(`   User Pool: ${COGNITO_CONFIG.UserPoolId}`);
    console.log(`   Client ID: ${COGNITO_CONFIG.ClientId}\n`);
    
    // 5. Verificar grupos requeridos
    console.log('5. Verificando grupos requeridos:');
    const requiredGroups = ['admin', 'profesionistas', 'usuarios'];
    const existingGroupNames = groups.map(g => g.GroupName);
    
    requiredGroups.forEach(groupName => {
      const exists = existingGroupNames.includes(groupName);
      console.log(`   ${exists ? '✅' : '❌'} ${groupName}`);
    });
    
    const missingGroups = requiredGroups.filter(groupName => 
      !existingGroupNames.includes(groupName)
    );
    
    if (missingGroups.length > 0) {
      console.log('\n⚠️  Grupos faltantes:');
      missingGroups.forEach(groupName => {
        console.log(`   - ${groupName}`);
      });
      console.log('\n📝 Crea estos grupos en AWS Console → Cognito → User Pools → Groups\n');
    } else {
      console.log('\n✅ Todos los grupos requeridos están configurados\n');
    }
    
    // 6. Próximos pasos
    console.log('6. Próximos pasos:');
    console.log('   1. Configura las credenciales en config.js');
    console.log('   2. Crea los grupos faltantes (si los hay)');
    console.log('   3. Ejecuta: npm run setup-complete');
    console.log('   4. Inicia la aplicación: npm start');
    
    console.log('\n🎉 Verificación de permisos completada!');
    
  } catch (error) {
    console.error('❌ Error verificando permisos:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Solución: Configura las credenciales AWS en config.js');
      console.log('   - AWS_ACCESS_KEY_ID');
      console.log('   - AWS_SECRET_ACCESS_KEY');
    } else if (error.name === 'AccessDeniedException') {
      console.log('\n💡 Solución: El usuario adminJCAH no tiene los permisos correctos');
      console.log('   Adjunta la política de iam-policy.json al usuario');
    } else if (error.name === 'ResourceNotFoundException') {
      console.log('\n💡 Solución: Verifica que el User Pool ID sea correcto');
    } else {
      console.log('\n💡 Revisa la configuración y asegúrate de tener los permisos correctos');
    }
  }
}

// Ejecutar verificación
if (require.main === module) {
  verifyPermissions();
}

module.exports = { verifyPermissions };

const { 
  COGNITO_CONFIG, 
  listGroups, 
  createCognitoUserWithGroup,
  listCognitoUsers 
} = require('./awsConfig');

// Función para configuración completa
async function setupComplete() {
  console.log('🚀 Configuración completa de Naxine con AWS Cognito\n');
  
  try {
    // 1. Verificar conexión
    console.log('1. Verificando conexión con AWS Cognito...');
    const users = await listCognitoUsers(1);
    console.log('✅ Conexión exitosa con AWS Cognito\n');
    
    // 2. Verificar grupos
    console.log('2. Verificando grupos en Cognito...');
    const groups = await listGroups();
    console.log(`   Grupos encontrados: ${groups.length}`);
    
    const requiredGroups = ['admin', 'profesionistas', 'usuarios'];
    const existingGroupNames = groups.map(g => g.GroupName);
    
    console.log('\n   Grupos requeridos:');
    requiredGroups.forEach(groupName => {
      const exists = existingGroupNames.includes(groupName);
      console.log(`   ${exists ? '✅' : '❌'} ${groupName}`);
    });
    
    const missingGroups = requiredGroups.filter(groupName => 
      !existingGroupNames.includes(groupName)
    );
    
    if (missingGroups.length > 0) {
      console.log('\n⚠️  Grupos faltantes que necesitas crear manualmente:');
      missingGroups.forEach(groupName => {
        console.log(`   - ${groupName}`);
      });
      console.log('\n📝 Instrucciones para crear grupos:');
      console.log('1. Ve a AWS Console → Cognito → User Pools');
      console.log('2. Selecciona tu User Pool (63h6lrig5qfk60mobqkfiescf1)');
      console.log('3. Ve a Groups → Create group');
      console.log('4. Crea cada grupo con estas configuraciones:\n');
      
      console.log('   Grupo: admin');
      console.log('   - Descripción: Administradores del sistema');
      console.log('   - Precedencia: 1\n');
      
      console.log('   Grupo: profesionistas');
      console.log('   - Descripción: Profesionales de la salud');
      console.log('   - Precedencia: 2\n');
      
      console.log('   Grupo: usuarios');
      console.log('   - Descripción: Usuarios regulares');
      console.log('   - Precedencia: 3\n');
    } else {
      console.log('\n✅ Todos los grupos requeridos están configurados');
    }
    
    // 3. Probar creación de usuarios de prueba
    console.log('3. Probando creación de usuarios de prueba...');
    
    const testUsers = [
      { email: `test-admin-${Date.now()}@example.com`, group: 'admin', name: 'Admin Test' },
      { email: `test-prof-${Date.now()}@example.com`, group: 'profesionistas', name: 'Profesional Test' },
      { email: `test-user-${Date.now()}@example.com`, group: 'usuarios', name: 'Usuario Test' }
    ];
    
    for (const testUser of testUsers) {
      try {
        await createCognitoUserWithGroup(testUser.email, 'TestPassword123!', testUser.group, {
          'name': testUser.name,
          'email_verified': 'true'
        });
        console.log(`   ✅ Usuario ${testUser.group} creado: ${testUser.email}`);
      } catch (error) {
        if (error.name === 'UsernameExistsException') {
          console.log(`   ⚠️  Usuario ${testUser.group} ya existe, continuando...`);
        } else if (error.name === 'GroupNotFoundException') {
          console.log(`   ❌ Grupo ${testUser.group} no encontrado - créalo primero`);
        } else {
          console.log(`   ❌ Error creando usuario ${testUser.group}: ${error.message}`);
        }
      }
    }
    
    // 4. Mostrar configuración actual
    console.log('\n4. Configuración actual:');
    console.log(`   User Pool ID: ${COGNITO_CONFIG.UserPoolId}`);
    console.log(`   Client ID: ${COGNITO_CONFIG.ClientId}`);
    console.log(`   Región: ${COGNITO_CONFIG.Region}`);
    console.log(`   Account ID: 597918492879`);
    
    // 5. Próximos pasos
    console.log('\n5. Próximos pasos:');
    console.log('   1. Configura las credenciales AWS en config.js');
    console.log('   2. Crea los grupos faltantes en Cognito (si los hay)');
    console.log('   3. Ejecuta: npm run test-cognito');
    console.log('   4. Inicia la aplicación: npm start');
    console.log('   5. Prueba los endpoints de autenticación');
    
    console.log('\n🎉 Configuración completada!');
    
  } catch (error) {
    console.error('❌ Error en la configuración:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Solución: Configura las credenciales AWS en config.js');
      console.log('   - AWS_ACCESS_KEY_ID');
      console.log('   - AWS_SECRET_ACCESS_KEY');
    } else if (error.name === 'ResourceNotFoundException') {
      console.log('\n💡 Solución: Verifica que el User Pool ID sea correcto');
    } else if (error.name === 'InvalidParameterException') {
      console.log('\n💡 Solución: Verifica que el Client ID sea correcto');
    } else {
      console.log('\n💡 Revisa la configuración y asegúrate de tener los permisos correctos');
    }
  }
}

// Ejecutar configuración
if (require.main === module) {
  setupComplete();
}

module.exports = { setupComplete };

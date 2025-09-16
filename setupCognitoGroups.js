const { 
  COGNITO_CONFIG, 
  listGroups, 
  addUserToGroup,
  createCognitoUserWithGroup 
} = require('./awsConfig');

// Función para configurar grupos en Cognito
async function setupCognitoGroups() {
  console.log('🔧 Configurando grupos en AWS Cognito...\n');
  
  try {
    // Verificar grupos existentes
    console.log('1. Verificando grupos existentes...');
    const existingGroups = await listGroups();
    console.log(`   Grupos encontrados: ${existingGroups.length}`);
    
    existingGroups.forEach(group => {
      console.log(`   - ${group.GroupName} (${group.Description || 'Sin descripción'})`);
    });
    
    console.log('\n2. Grupos requeridos:');
    console.log('   - admin (Administradores del sistema)');
    console.log('   - profesionistas (Profesionales de la salud)');
    console.log('   - usuarios (Usuarios regulares)');
    
    // Verificar si los grupos requeridos existen
    const requiredGroups = ['admin', 'profesionistas', 'usuarios'];
    const existingGroupNames = existingGroups.map(g => g.GroupName);
    
    const missingGroups = requiredGroups.filter(groupName => 
      !existingGroupNames.includes(groupName)
    );
    
    if (missingGroups.length > 0) {
      console.log(`\n⚠️  Grupos faltantes: ${missingGroups.join(', ')}`);
      console.log('\n📝 Para crear los grupos faltantes:');
      console.log('1. Ve a AWS Console → Cognito → User Pools');
      console.log('2. Selecciona tu User Pool');
      console.log('3. Ve a Groups → Create group');
      console.log('4. Crea cada grupo con estas configuraciones:');
      
      console.log('\n   Grupo: admin');
      console.log('   - Descripción: Administradores del sistema');
      console.log('   - Precedencia: 1');
      
      console.log('\n   Grupo: profesionistas');
      console.log('   - Descripción: Profesionales de la salud');
      console.log('   - Precedencia: 2');
      
      console.log('\n   Grupo: usuarios');
      console.log('   - Descripción: Usuarios regulares');
      console.log('   - Precedencia: 3');
      
    } else {
      console.log('\n✅ Todos los grupos requeridos están configurados');
    }
    
    // Probar creación de usuario de prueba
    console.log('\n3. Probando creación de usuario de prueba...');
    const testEmail = `test-admin-${Date.now()}@example.com`;
    
    try {
      await createCognitoUserWithGroup(testEmail, 'TestPassword123!', 'admin', {
        'name': 'Admin de Prueba',
        'email_verified': 'true'
      });
      console.log(`✅ Usuario admin de prueba creado: ${testEmail}`);
      
      // Limpiar usuario de prueba
      console.log('   (Usuario de prueba será eliminado automáticamente)');
      
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        console.log('⚠️  Usuario de prueba ya existe, continuando...');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 Configuración de grupos completada!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Asegúrate de que todos los grupos estén creados en Cognito');
    console.log('2. Configura las credenciales AWS en config.js');
    console.log('3. Ejecuta: npm run test-cognito');
    console.log('4. Inicia la aplicación: npm start');
    
  } catch (error) {
    console.error('❌ Error configurando grupos:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Solución: Verifica tus credenciales AWS en config.js');
    } else if (error.name === 'ResourceNotFoundException') {
      console.log('\n💡 Solución: Verifica que el User Pool ID sea correcto');
    } else {
      console.log('\n💡 Revisa la configuración y asegúrate de tener los permisos correctos');
    }
  }
}

// Ejecutar configuración
if (require.main === module) {
  setupCognitoGroups();
}

module.exports = { setupCognitoGroups };

const { CognitoIdentityProviderClient, ListUserPoolsCommand } = require('@aws-sdk/client-cognito-identity-provider');
const config = require('./config');

// Cliente de Cognito
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  }
});

// Función para listar User Pools
async function listUserPools() {
  console.log('🔍 Listando User Pools en AWS Cognito...\n');
  
  try {
    const command = new ListUserPoolsCommand({
      MaxResults: 10
    });
    
    const result = await cognitoClient.send(command);
    
    console.log(`✅ Encontrados ${result.UserPools.length} User Pools:\n`);
    
    result.UserPools.forEach((pool, index) => {
      console.log(`${index + 1}. User Pool:`);
      console.log(`   ID: ${pool.Id}`);
      console.log(`   Nombre: ${pool.Name}`);
      console.log(`   Creación: ${pool.CreationDate}`);
      console.log(`   Estado: ${pool.Status}`);
      console.log('');
    });
    
    console.log('📝 Usa el ID completo (formato: us-east-2_XXXXXXXXX) en config.js');
    
  } catch (error) {
    console.error('❌ Error listando User Pools:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Solución: Verifica las credenciales AWS en config.js');
    } else if (error.name === 'AccessDeniedException') {
      console.log('\n💡 Solución: El usuario adminJCAH no tiene permisos para listar User Pools');
      console.log('   Agrega el permiso cognito-idp:ListUserPools a la política IAM');
    } else {
      console.log('\n💡 Revisa la configuración y asegúrate de tener los permisos correctos');
    }
  }
}

// Ejecutar
if (require.main === module) {
  listUserPools();
}

module.exports = { listUserPools };

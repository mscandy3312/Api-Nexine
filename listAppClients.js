const { CognitoIdentityProviderClient, ListUserPoolClientsCommand } = require('@aws-sdk/client-cognito-identity-provider');
const config = require('./config');

// Cliente de Cognito
const cognitoClient = new CognitoIdentityProviderClient({
  region: config.AWS_REGION,
  credentials: {
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_SECRET_ACCESS_KEY
  }
});

// Función para listar App Clients
async function listAppClients() {
  console.log('🔍 Listando App Clients del User Pool...\n');
  
  try {
    const command = new ListUserPoolClientsCommand({
      UserPoolId: config.COGNITO_USER_POOL_ID,
      MaxResults: 10
    });
    
    const result = await cognitoClient.send(command);
    
    console.log(`✅ Encontrados ${result.UserPoolClients.length} App Clients:\n`);
    
    result.UserPoolClients.forEach((client, index) => {
      console.log(`${index + 1}. App Client:`);
      console.log(`   Client ID: ${client.ClientId}`);
      console.log(`   Nombre: ${client.ClientName}`);
      console.log(`   Creación: ${client.CreationDate}`);
      console.log(`   Última modificación: ${client.LastModifiedDate}`);
      console.log('');
    });
    
    console.log('📝 Usa el Client ID correcto en config.js');
    
  } catch (error) {
    console.error('❌ Error listando App Clients:', error.message);
    
    if (error.name === 'NotAuthorizedException') {
      console.log('\n💡 Solución: Verifica las credenciales AWS en config.js');
    } else if (error.name === 'AccessDeniedException') {
      console.log('\n💡 Solución: El usuario adminJCAH no tiene permisos para listar App Clients');
      console.log('   Agrega el permiso cognito-idp:ListUserPoolClients a la política IAM');
    } else {
      console.log('\n💡 Revisa la configuración y asegúrate de tener los permisos correctos');
    }
  }
}

// Ejecutar
if (require.main === module) {
  listAppClients();
}

module.exports = { listAppClients };

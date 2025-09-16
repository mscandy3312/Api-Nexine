const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Función para probar el flujo de autenticación
async function testAuthFlow() {
  console.log('🧪 Iniciando pruebas de autenticación...\n');

  try {
    // 1. Probar registro de usuario
    console.log('1. Probando registro de usuario...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nombre: 'Usuario Test',
      email: 'test@example.com',
      password: 'password123',
      rol: 'usuario'
    });
    console.log('✅ Registro exitoso:', registerResponse.data.message);

    // 2. Probar login (debería fallar porque el email no está verificado)
    console.log('\n2. Probando login sin verificación...');
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'password123'
      });
    } catch (error) {
      console.log('✅ Login falló correctamente (email no verificado):', error.response.data.message);
    }

    // 3. Probar reenvío de verificación
    console.log('\n3. Probando reenvío de verificación...');
    const resendResponse = await axios.post(`${BASE_URL}/auth/resend-verification`, {
      email: 'test@example.com'
    });
    console.log('✅ Reenvío exitoso:', resendResponse.data.message);

    // 4. Probar endpoint de salud
    console.log('\n4. Probando endpoint de salud...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ API funcionando:', healthResponse.data.status);

    // 5. Probar endpoint raíz
    console.log('\n5. Probando endpoint raíz...');
    const rootResponse = await axios.get(`${BASE_URL}/`);
    console.log('✅ API disponible:', rootResponse.data.message);

    console.log('\n🎉 Todas las pruebas básicas pasaron!');
    console.log('\n📝 Notas:');
    console.log('- Para probar AWS Cognito, configura las credenciales en config.js');
    console.log('- Para probar verificación de email, revisa la consola del servidor');
    console.log('- Para probar rutas protegidas, necesitarás un token JWT válido');
    console.log('- Asegúrate de tener configurado AWS Cognito User Pool');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

// Función para probar rutas protegidas (requiere token)
async function testProtectedRoutes(token) {
  console.log('\n🔒 Probando rutas protegidas...');
  
  try {
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Probar perfil de usuario
    console.log('1. Probando perfil de usuario...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, { headers });
    console.log('✅ Perfil obtenido:', profileResponse.data.usuario.nombre);

    // Probar listado de profesionales
    console.log('\n2. Probando listado de profesionales...');
    const profesionalesResponse = await axios.get(`${BASE_URL}/api/profesionales`, { headers });
    console.log('✅ Profesionales obtenidos:', profesionalesResponse.data.length, 'registros');

    // Probar listado de precios
    console.log('\n3. Probando listado de precios...');
    const preciosResponse = await axios.get(`${BASE_URL}/api/precios`, { headers });
    console.log('✅ Precios obtenidos:', preciosResponse.data.length, 'registros');

    console.log('\n🎉 Rutas protegidas funcionando correctamente!');

  } catch (error) {
    console.error('❌ Error en rutas protegidas:', error.message);
    if (error.response) {
      console.error('Respuesta del servidor:', error.response.data);
    }
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testAuthFlow();
}

module.exports = { testAuthFlow, testProtectedRoutes };

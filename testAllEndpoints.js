const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Función para probar todos los endpoints
async function testAllEndpoints() {
  console.log('🧪 Probando todos los endpoints de la API Naxine...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Función auxiliar para ejecutar pruebas
  const runTest = async (testName, testFunction) => {
    totalTests++;
    try {
      await testFunction();
      console.log(`✅ ${testName}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${testName}: ${error.message}`);
    }
  };
  
  try {
    // 1. Probar endpoint de salud
    await runTest('Health Check', async () => {
      const response = await axios.get(`${BASE_URL}/health`);
      if (response.data.status !== 'OK') throw new Error('Health check failed');
    });
    
    // 2. Probar endpoint raíz
    await runTest('Root Endpoint', async () => {
      const response = await axios.get(`${BASE_URL}/`);
      if (!response.data.endpoints) throw new Error('Root endpoint missing endpoints info');
    });
    
    // 3. Probar registro de usuario
    await runTest('User Registration', async () => {
      const testUser = {
        nombre: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        rol: 'usuario'
      };
      
      const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
      if (!response.data.message) throw new Error('Registration failed');
    });
    
    // 4. Probar login (debería fallar sin verificación)
    await runTest('User Login (unverified)', async () => {
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          email: 'test@example.com',
          password: 'wrongpassword'
        });
        throw new Error('Login should have failed');
      } catch (error) {
        if (error.response.status !== 401) throw new Error('Expected 401 error');
      }
    });
    
    // 5. Probar endpoints protegidos sin token (deberían fallar)
    await runTest('Protected Endpoints (no token)', async () => {
      const protectedEndpoints = [
        '/api/usuarios',
        '/api/clientes',
        '/api/profesionales',
        '/api/sesiones',
        '/api/valoraciones',
        '/api/pagos',
        '/api/precios'
      ];
      
      for (const endpoint of protectedEndpoints) {
        try {
          await axios.get(`${BASE_URL}${endpoint}`);
          throw new Error(`Endpoint ${endpoint} should require authentication`);
        } catch (error) {
          if (error.response.status !== 401) {
            throw new Error(`Expected 401 for ${endpoint}, got ${error.response.status}`);
          }
        }
      }
    });
    
    // 6. Probar endpoints con token inválido
    await runTest('Protected Endpoints (invalid token)', async () => {
      try {
        await axios.get(`${BASE_URL}/api/usuarios`, {
          headers: { 'Authorization': 'Bearer invalid-token' }
        });
        throw new Error('Should have failed with invalid token');
      } catch (error) {
        if (error.response.status !== 403) throw new Error('Expected 403 error');
      }
    });
    
    console.log('\n📊 Resumen de Pruebas:');
    console.log(`   Pruebas pasadas: ${passedTests}/${totalTests}`);
    console.log(`   Porcentaje de éxito: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ¡Todas las pruebas pasaron! La API está funcionando correctamente.');
    } else {
      console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
    }
    
    console.log('\n📋 Endpoints disponibles:');
    console.log('   🔐 Autenticación: /auth/*');
    console.log('   👥 Usuarios: /api/usuarios/*');
    console.log('   👤 Clientes: /api/clientes/*');
    console.log('   👨‍⚕️ Profesionales: /api/profesionales/*');
    console.log('   📅 Sesiones: /api/sesiones/*');
    console.log('   ⭐ Valoraciones: /api/valoraciones/*');
    console.log('   💳 Pagos: /api/pagos/*');
    console.log('   💰 Precios: /api/precios/*');
    
    console.log('\n🎯 Para probar con autenticación:');
    console.log('   1. Registra un usuario: POST /auth/register');
    console.log('   2. Verifica el email (o usa el token del registro)');
    console.log('   3. Haz login: POST /auth/login');
    console.log('   4. Usa el token en el header: Authorization: Bearer <token>');
    
  } catch (error) {
    console.error('❌ Error general en las pruebas:', error.message);
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testAllEndpoints();
}

module.exports = { testAllEndpoints };

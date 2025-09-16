const axios = require('axios');

const API_BASE = 'http://localhost:3000'; // Tu servidor Express

async function runTests() {
    try {
        // -----------------------------
        // 1. Crear un profesional
        // -----------------------------
        const nuevoProfesional = {
            nombre_completo: "Dr. Ricardo Torres",
            correo_electronico: "ricardo.torres@ejemplo.com",
            telefono: "555-6666",
            especialidad: "Odontología",
            rating: 4.6
        };

        const { data: profesionalCreado } = await axios.post(`${API_BASE}/profesionales`, nuevoProfesional);
        console.log('Profesional creado:', profesionalCreado);

        // -----------------------------
        // 2. Obtener todos los profesionales
        // -----------------------------
        const { data: profesionales } = await axios.get(`${API_BASE}/profesionales`);
        console.log('Lista de profesionales:', profesionales);

        // -----------------------------
        // 3. Crear un precio para el profesional
        // -----------------------------
        const nuevoPrecio = {
            id_profesional: profesionalCreado.id_profesional,
            nombre_paquete: "Consulta Dental Inicial",
            duracion: "30 minutos",
            modalidad: "presencial"
        };

        const { data: precioCreado } = await axios.post(`${API_BASE}/precios`, nuevoPrecio);
        console.log('Precio creado:', precioCreado);

        // -----------------------------
        // 4. Crear un cliente
        // -----------------------------
        const nuevoCliente = {
            nombre_completo: "Laura Medina",
            telefono: "555-7777",
            ciudad: "Ciudad F"
        };

        const { data: clienteCreado } = await axios.post(`${API_BASE}/clientes`, nuevoCliente);
        console.log('Cliente creado:', clienteCreado);

        // -----------------------------
        // 5. Crear una sesión
        // -----------------------------
        const nuevaSesion = {
            numero_pedido: "ORD100",
            id_cliente: clienteCreado.id_cliente,
            id_precio: precioCreado.id_precio,
            estado: "pendiente"
        };

        const { data: sesionCreada } = await axios.post(`${API_BASE}/sesiones`, nuevaSesion);
        console.log('Sesión creada:', sesionCreada);

        // -----------------------------
        // 6. Crear una valoración
        // -----------------------------
        const nuevaValoracion = {
            id_cliente: clienteCreado.id_cliente,
            id_profesional: profesionalCreado.id_profesional,
            producto: precioCreado.nombre_paquete,
            rating: 5,
            mensaje: "Excelente atención"
        };

        const { data: valoracionCreada } = await axios.post(`${API_BASE}/valoraciones`, nuevaValoracion);
        console.log('Valoración creada:', valoracionCreada);

        // -----------------------------
        // 7. Crear un pago
        // -----------------------------
        const nuevoPago = {
            id_profesional: profesionalCreado.id_profesional,
            id_cliente: clienteCreado.id_cliente,
            id_sesion: sesionCreada.id_sesion,
            balance_general: 500,
            estado: "pagado"
        };

        const { data: pagoCreado } = await axios.post(`${API_BASE}/pagos`, nuevoPago);
        console.log('Pago creado:', pagoCreado);

        // -----------------------------
        // 8. Obtener todas las sesiones con relaciones
        // -----------------------------
        const { data: sesiones } = await axios.get(`${API_BASE}/sesiones`);
        console.log('Todas las sesiones:', sesiones);

    } catch (err) {
        console.error('Error en pruebas API:', err.response ? err.response.data : err.message);
    }
}

runTests();

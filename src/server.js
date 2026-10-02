require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
      console.log(`🌐 URL Base: http://localhost:${PORT}`);
      console.log(`📄 Documentación Swagger UI: http://localhost:${PORT}/api-docs`);
      console.log(`🔗 API Experiencias: http://localhost:${PORT}/api/experiencias`);
      console.log('====================================================');
    });

    // Cierre ordenado de la aplicación
    const shutdown = async (signal) => {
      console.log(`\n[Servidor] Recibida señal ${signal}. Cerrando servidor y base de datos...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[Servidor] Proceso terminado con éxito.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[Error Crítico] No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
};

startServer();

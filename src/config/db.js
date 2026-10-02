const mongoose = require('mongoose');
const os = require('os');
let memoryServer = null;

/**
 * Conecta la aplicación a la base de datos MongoDB.
 * Soporta conexión a MongoDB local/Atlas y fallback opcional a base de datos en memoria para pruebas directas.
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv_experiencias';
  const defaultOptions = {
    serverSelectionTimeoutMS: 2500, // Tiempo límite rápido para no congelar si local mongod no está arriba
    runtimeAdapters: { os }
  };

  try {
    // Intentar conectar a la URI configurada (local o Atlas)
    const conn = await mongoose.connect(uri, defaultOptions);

    console.log(`[MongoDB] Conectado exitosamente en: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB] No se pudo conectar a la base de datos configurada (${uri}): ${error.message}`);

    // Si está habilitado el fallback a memoria o estamos en test, iniciamos mongodb-memory-server
    const allowMemoryFallback = process.env.AUTO_FALLBACK_MEMORY_DB !== 'false';

    if (allowMemoryFallback) {
      try {
        console.log('[MongoDB] Iniciando servidor MongoDB en memoria (MongoMemoryServer) para pruebas...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();

        const conn = await mongoose.connect(memoryUri, defaultOptions);
        console.log(`[MongoDB] Conectado exitosamente a MongoDB en memoria: ${memoryUri}`);
        return conn;
      } catch (memError) {
        console.error('[MongoDB Error] Error al iniciar la base de datos en memoria:', memError.message);
        throw memError;
      }
    } else {
      throw error;
    }
  }
};

/**
 * Desconecta la base de datos y detiene la instancia en memoria si existe.
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    console.log('[MongoDB] Desconectado exitosamente');
  } catch (error) {
    console.error('[MongoDB Error] Error al desconectar:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};

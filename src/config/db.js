const mongoose = require('mongoose');
const os = require('os');

let memoryServer = null;

/**
 * Cache de conexión global para entornos serverless (Vercel / AWS Lambda).
 * Evita la creación recurrente de conexiones en cada invocación (cold start vs warm invocations)
 * y previene la saturación del pool de conexiones en MongoDB Atlas.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Conecta la aplicación a la base de datos MongoDB.
 * - Reutiliza conexiones existentes en entornos serverless (Vercel).
 * - Soporta MongoDB Atlas y MongoDB local.
 * - Dispone de fallback a MongoMemoryServer únicamente en entorno local/desarrollo (nunca en producción ni Vercel).
 */
const connectDB = async () => {
  // Si ya existe una conexión activa, retornarla inmediatamente
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (cached.conn && cached.conn.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv_experiencias';
  const isVercel = Boolean(process.env.VERCEL);
  const isProduction = process.env.NODE_ENV === 'production';

  // Si estamos en Vercel o Producción y no hay MONGODB_URI configurada (o sigue con localhost)
  if ((isVercel || isProduction) && (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('localhost'))) {
    const errorMsg =
      '[MongoDB Error Crítico] La variable MONGODB_URI no está configurada o apunta a localhost en Vercel / Producción. ' +
      'Debe configurar MONGODB_URI con la cadena de conexión de MongoDB Atlas en el panel de Vercel (Settings -> Environment Variables).';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const defaultOptions = {
    serverSelectionTimeoutMS: 5000, // 5 segundos para tolerar latencia de cold start
    maxPoolSize: 10, // Límite razonable para entornos serverless
    runtimeAdapters: { os }
  };

  // Si ya hay una promesa de conexión en curso, esperarla
  if (!cached.promise) {
    console.log('[MongoDB] Iniciando conexión a la base de datos...');
    cached.promise = mongoose.connect(uri, defaultOptions).then((m) => {
      console.log(`[MongoDB] Conectado exitosamente en: ${m.connection.host}/${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    cached.conn = null;
    console.warn(`[MongoDB] No se pudo conectar a la base de datos configurada (${uri}): ${error.message}`);

    // El fallback en memoria SOLO está permitido en entorno local / desarrollo, NUNCA en Vercel ni producción
    const allowMemoryFallback =
      process.env.AUTO_FALLBACK_MEMORY_DB !== 'false' && !isVercel && !isProduction;

    if (allowMemoryFallback) {
      try {
        console.log('[MongoDB] Iniciando servidor MongoDB en memoria (MongoMemoryServer) para desarrollo local...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memoryUri = memoryServer.getUri();

        cached.conn = await mongoose.connect(memoryUri, defaultOptions);
        console.log(`[MongoDB] Conectado exitosamente a MongoDB en memoria: ${memoryUri}`);
        return cached.conn;
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
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    cached.conn = null;
    cached.promise = null;
    console.log('[MongoDB] Desconectado exitosamente');
  } catch (error) {
    console.error('[MongoDB Error] Error al desconectar:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};

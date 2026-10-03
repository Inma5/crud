const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { connectDB } = require('./config/db');
const experienceRoutes = require('./routes/experienceRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger HTTP (deshabilitado en entorno de pruebas para mantener la salida limpia)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// URLs CDN para Swagger UI (garantiza carga completa de estilos y scripts en entornos Serverless / Vercel)
const SWAGGER_CSS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css';
const SWAGGER_JS_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js',
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js'
];

// Ruta para la documentación interactiva de Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'API CV - Documentación Swagger',
    customCss: '.swagger-ui .topbar { display: none }',
    customCssUrl: SWAGGER_CSS_URL,
    customJs: SWAGGER_JS_URLS,
    swaggerOptions: {
      docExpansion: 'list',
      filter: true
    }
  })
);

// Endpoint para obtener la especificación OpenAPI en formato JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Middleware para asegurar la conexión con MongoDB en entornos serverless (Vercel)
app.use(async (req, res, next) => {
  // Las rutas informativas, Swagger UI o health check público pueden pasar sin bloquearse
  if (req.path === '/' || req.path.startsWith('/api-docs') || req.path === '/api/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        'Error de conexión con la base de datos MongoDB. Verifique que la variable de entorno MONGODB_URI esté configurada en Vercel y que el clúster de MongoDB Atlas permita conexiones desde cualquier IP (0.0.0.0/0).',
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
});

// Endpoint de verificación de estado / salud (Health check)
app.get('/api/health', async (req, res) => {
  let dbStatus = 'Desconectado';
  try {
    await connectDB();
    dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';
  } catch (err) {
    dbStatus = 'Error de conexión';
  }

  const isHealthy = dbStatus === 'Conectado';
  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    entorno: process.env.NODE_ENV || 'development',
    plataforma: process.env.VERCEL ? 'Vercel Serverless' : 'Standalone Server',
    baseDeDatos: {
      estado: dbStatus,
      host: mongoose.connection.host || null,
      nombre: mongoose.connection.name || null
    }
  });
});

// Ruta raíz con información del servicio y accesos directos
app.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'API REST de Experiencias Profesionales (Hoja de Vida / CV)',
    version: '1.0.0',
    descripcion: 'CRUD desarrollado con Node.js, Express y MongoDB',
    plataforma: process.env.VERCEL ? 'Vercel Serverless' : 'Standalone Server',
    baseDeDatos: {
      estado: mongoose.connection.readyState === 1 ? 'Conectado' : 'Pendiente / Desconectado'
    },
    enlaces: {
      documentacionSwagger: '/api-docs',
      especificacionJson: '/api-docs.json',
      saludApi: '/api/health',
      experienciasApi: '/api/experiencias'
    },
    endpointsDisponibles: [
      { metodo: 'GET', ruta: '/api/health', descripcion: 'Estado del servicio y base de datos' },
      { metodo: 'POST', ruta: '/api/experiencias', descripcion: 'Crear una nueva experiencia' },
      { metodo: 'GET', ruta: '/api/experiencias', descripcion: 'Listar experiencias con filtros' },
      { metodo: 'GET', ruta: '/api/experiencias/:id', descripcion: 'Obtener experiencia por ID' },
      { metodo: 'PUT', ruta: '/api/experiencias/:id', descripcion: 'Actualizar experiencia completa' },
      { metodo: 'PATCH', ruta: '/api/experiencias/:id', descripcion: 'Actualizar campos específicos' },
      { metodo: 'DELETE', ruta: '/api/experiencias/:id', descripcion: 'Eliminar experiencia por ID' }
    ]
  });
});

// Rutas de la API
app.use('/api/experiencias', experienceRoutes);

// Manejador para rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}. Consulte la documentación en /api-docs`
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

module.exports = app;

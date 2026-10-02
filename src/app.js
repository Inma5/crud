const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
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

// Ruta para la documentación interactiva de Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'API CV - Documentación Swagger',
    customCss: '.swagger-ui .topbar { display: none }',
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

// Ruta raíz con información del servicio y accesos directos
app.get('/', (req, res) => {
  res.status(200).json({
    nombre: 'API REST de Experiencias Profesionales (Hoja de Vida / CV)',
    version: '1.0.0',
    descripcion: 'CRUD desarrollado con Node.js, Express y MongoDB',
    enlaces: {
      documentacionSwagger: '/api-docs',
      especificacionJson: '/api-docs.json',
      experienciasApi: '/api/experiencias'
    },
    endpointsDisponibles: [
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

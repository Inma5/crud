const swaggerJsdoc = require('swagger-jsdoc');

const port = process.env.PORT || 3000;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Experiencias Profesionales - Hoja de Vida (CV)',
      version: '1.0.0',
      description:
        'API RESTful desarrollada con Express.js y MongoDB para la gestión integral (CRUD) de experiencias profesionales para hojas de vida o currículums vítae. Permite registrar, consultar con filtros, actualizar y eliminar el historial laboral.',
      contact: {
        name: 'Soporte Técnico API CV',
        email: 'soporte@curriculum-api.local'
      }
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Servidor Local de Desarrollo'
      }
    ],
    components: {
      schemas: {
        ExperienciaInput: {
          type: 'object',
          required: ['puesto', 'empresa', 'fechaInicio'],
          properties: {
            puesto: {
              type: 'string',
              description: 'Cargo o posición desempeñada',
              example: 'Desarrollador Full Stack Senior'
            },
            empresa: {
              type: 'string',
              description: 'Nombre de la empresa o institución',
              example: 'Globex Corporation'
            },
            ubicacion: {
              type: 'string',
              description: 'Ciudad, país o modalidad de localización',
              example: 'Bogotá, Colombia'
            },
            modalidad: {
              type: 'string',
              enum: ['Remoto', 'Híbrido', 'Presencial'],
              default: 'Remoto',
              description: 'Modalidad de trabajo'
            },
            tipoEmpleo: {
              type: 'string',
              enum: ['Tiempo Completo', 'Medio Tiempo', 'Freelance', 'Pasantía', 'Por Contrato'],
              default: 'Tiempo Completo',
              description: 'Tipo de contrato o vinculación laboral'
            },
            fechaInicio: {
              type: 'string',
              format: 'date',
              description: 'Fecha de inicio de labores (YYYY-MM-DD)',
              example: '2022-01-15'
            },
            fechaFin: {
              type: 'string',
              format: 'date',
              nullable: true,
              description: 'Fecha de finalización de labores (dejar null si trabajoActual es true)',
              example: '2024-05-30'
            },
            trabajoActual: {
              type: 'boolean',
              default: false,
              description: 'Indica si actualmente se encuentra laborando en este puesto',
              example: false
            },
            descripcion: {
              type: 'string',
              description: 'Breve resumen de las responsabilidades principales y alcance del cargo',
              example: 'Liderazgo en el desarrollo y arquitectura de APIs RESTful usando Node.js, Express y MongoDB.'
            },
            responsabilidades: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Lista de funciones o responsabilidades específicas',
              example: [
                'Diseño e implementación de arquitectura de microservicios con Express.js',
                'Modelado y optimización de bases de datos NoSQL con MongoDB y Mongoose',
                'Documentación técnica y pruebas de endpoints con Swagger / OpenAPI'
              ]
            },
            logros: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Logros destacados alcanzados durante el periodo',
              example: [
                'Reducción del 35% en tiempos de respuesta de endpoints críticos',
                'Implementación de pruebas automatizadas con cobertura del 85%'
              ]
            },
            tecnologias: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Tecnologías, lenguajes o herramientas empleadas',
              example: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Docker', 'Swagger', 'Jest']
            }
          }
        },
        Experiencia: {
          allOf: [
            {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Identificador único generado por MongoDB',
                  example: '651e7a68e83f2a74c43f1a23'
                },
                _id: {
                  type: 'string',
                  description: 'Identificador nativo de MongoDB',
                  example: '651e7a68e83f2a74c43f1a23'
                }
              }
            },
            {
              $ref: '#/components/schemas/ExperienciaInput'
            },
            {
              type: 'object',
              properties: {
                createdAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Fecha y hora de creación del registro',
                  example: '2026-10-01T15:30:00.000Z'
                },
                updatedAt: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Fecha y hora de la última actualización',
                  example: '2026-10-01T15:45:00.000Z'
                }
              }
            }
          ]
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Mensaje descriptivo del error ocurrido'
            },
            errores: {
              type: 'array',
              items: {
                type: 'string'
              },
              example: ['El campo "puesto" es obligatorio']
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Experiencias Profesionales',
        description: 'Operaciones CRUD para la gestión de experiencia laboral en la hoja de vida'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

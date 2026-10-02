require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const Experiencia = require('../models/Experience');

const experienciasSemilla = [
  {
    puesto: 'Líder Técnico & Desarrollador Full Stack Senior',
    empresa: 'Innovaciones Cloud S.A.S.',
    ubicacion: 'Bogotá, Colombia',
    modalidad: 'Remoto',
    tipoEmpleo: 'Tiempo Completo',
    fechaInicio: new Date('2023-03-01'),
    fechaFin: null,
    trabajoActual: true,
    descripcion:
      'Liderazgo en el diseño y construcción de plataformas web de alto tráfico utilizando arquitecturas basadas en microservicios, Node.js y MongoDB.',
    responsabilidades: [
      'Definir la arquitectura de software y lineamientos de APIs RESTful seguras con Express.js',
      'Modelar bases de datos NoSQL en MongoDB y optimizar índices para consultas de baja latencia',
      'Coordinar equipos de desarrollo bajo metodologías ágiles (Scrum) y revisiones de código'
    ],
    logros: [
      'Migración exitosa del monolito a microservicios reduciendo costos de infraestructura en un 30%',
      'Implementación de documentación interactiva OpenAPI/Swagger para más de 25 endpoints'
    ],
    tecnologias: ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Docker', 'AWS', 'Swagger', 'Jest']
  },
  {
    puesto: 'Desarrollador Backend Node.js',
    empresa: 'Fintech Solutions Latam',
    ubicacion: 'Medellín, Colombia',
    modalidad: 'Híbrido',
    tipoEmpleo: 'Tiempo Completo',
    fechaInicio: new Date('2021-08-01'),
    fechaFin: new Date('2023-02-28'),
    trabajoActual: false,
    descripcion:
      'Desarrollo de servicios backend para procesamiento de transacciones financieras y pasarelas de pago seguras.',
    responsabilidades: [
      'Creación e integración de APIs RESTful consumidas por aplicaciones móviles y web',
      'Implementación de autenticación JWT y validación exhaustiva de datos de entrada',
      'Automatización de pruebas unitarias y de integración'
    ],
    logros: [
      'Procesamiento de más de 500,000 transacciones mensuales con 99.98% de disponibilidad',
      'Disminución del 45% en tiempos de respuesta de consulta de estados de cuenta'
    ],
    tecnologias: ['Node.js', 'Express', 'MongoDB', 'Redis', 'Postman', 'Git', 'Linux']
  },
  {
    puesto: 'Desarrollador Web Junior',
    empresa: 'Agencia Digital Creativa',
    ubicacion: 'Cali, Colombia',
    modalidad: 'Presencial',
    tipoEmpleo: 'Tiempo Completo',
    fechaInicio: new Date('2020-01-15'),
    fechaFin: new Date('2021-07-31'),
    trabajoActual: false,
    descripcion:
      'Desarrollo y soporte a sitios web corporativos y paneles administrativos interactivos.',
    responsabilidades: [
      'Maquetación responsiva e interactiva de interfaces con HTML5, CSS3 y JavaScript',
      'Conexión de formularios y componentes frontend con APIs REST backend',
      'Mantenimiento y corrección de bugs en sistemas en producción'
    ],
    logros: [
      'Entrega a tiempo de 12 proyectos web para clientes internacionales',
      'Reconocimiento al mejor desempeño de desarrollo junior en 2020'
    ],
    tecnologias: ['JavaScript', 'HTML5', 'CSS3', 'Node.js', 'MongoDB', 'Bootstrap']
  }
];

const poblarBaseDeDatos = async () => {
  try {
    console.log('[Seed] Conectando a la base de datos...');
    await connectDB();

    console.log('[Seed] Limpiando registros anteriores de experiencias...');
    await Experiencia.deleteMany({});

    console.log('[Seed] Insertando experiencias de ejemplo...');
    const registros = await Experiencia.insertMany(experienciasSemilla);

    console.log(`[Seed] ✅ Se insertaron ${registros.length} experiencias profesionales exitosamente.`);
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Error durante el proceso de siembra:', error.message);
    process.exit(1);
  }
};

poblarBaseDeDatos();

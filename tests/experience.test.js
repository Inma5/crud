const os = require('os');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Experiencia = require('../src/models/Experience');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, {
    runtimeAdapters: { os }
  });
}, 60000);

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

beforeEach(async () => {
  await Experiencia.deleteMany({});
});

describe('Documentación Swagger y Rutas Base', () => {
  test('GET / debe responder con información de la API y enlaces a Swagger', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.enlaces).toHaveProperty('documentacionSwagger', '/api-docs');
    expect(res.body).toHaveProperty('endpointsDisponibles');
  });

  test('GET /api-docs.json debe devolver la especificación OpenAPI válida', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toContain('Experiencias Profesionales');
    expect(res.body.paths).toHaveProperty('/api/experiencias');
    expect(res.body.paths).toHaveProperty('/api/experiencias/{id}');
  });

  test('GET /api/health debe responder con estado del servicio y base de datos', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'OK');
    expect(res.body.baseDeDatos).toHaveProperty('estado', 'Conectado');
  });
});

describe('CRUD de Experiencias Profesionales (/api/experiencias)', () => {
  const experienciaEjemplo = {
    puesto: 'Desarrollador Backend Node.js',
    empresa: 'Soluciones Digitales S.A.S.',
    ubicacion: 'Medellín, Colombia',
    modalidad: 'Remoto',
    tipoEmpleo: 'Tiempo Completo',
    fechaInicio: '2023-01-10',
    fechaFin: '2024-06-30',
    trabajoActual: false,
    descripcion: 'Diseño e implementación de microservicios con Express y MongoDB.',
    responsabilidades: [
      'Desarrollo de APIs RESTful con Node.js y Express',
      'Modelado de colecciones e indexación en MongoDB'
    ],
    logros: ['Optimización de consultas a la base de datos en un 40%'],
    tecnologias: ['Node.js', 'Express', 'MongoDB', 'Mongoose', 'Docker', 'Swagger']
  };

  describe('POST /api/experiencias (Crear)', () => {
    test('Debe crear una nueva experiencia profesional exitosamente (201)', async () => {
      const res = await request(app)
        .post('/api/experiencias')
        .send(experienciaEjemplo);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.puesto).toBe(experienciaEjemplo.puesto);
      expect(res.body.data.empresa).toBe(experienciaEjemplo.empresa);
      expect(res.body.data.tecnologias).toEqual(expect.arrayContaining(['Node.js', 'MongoDB']));
    });

    test('Debe fallar (400) si faltan campos obligatorios como puesto o empresa', async () => {
      const res = await request(app)
        .post('/api/experiencias')
        .send({
          puesto: '',
          fechaInicio: '2023-01-01'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body).toHaveProperty('errores');
    });

    test('Debe fallar (400) si la fechaFin es anterior a la fechaInicio', async () => {
      const res = await request(app)
        .post('/api/experiencias')
        .send({
          puesto: 'Ingeniero de Software',
          empresa: 'Acme Corp',
          fechaInicio: '2024-05-01',
          fechaFin: '2023-01-01',
          trabajoActual: false
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('fecha de fin no puede ser anterior');
    });
  });

  describe('GET /api/experiencias (Listar)', () => {
    test('Debe listar todas las experiencias ordenadas cronológicamente', async () => {
      // Insertar dos experiencias
      await Experiencia.create([
        {
          puesto: 'Junior Developer',
          empresa: 'Empresa A',
          fechaInicio: new Date('2021-01-01')
        },
        {
          puesto: 'Senior Developer',
          empresa: 'Empresa B',
          fechaInicio: new Date('2023-01-01')
        }
      ]);

      const res = await request(app).get('/api/experiencias');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].puesto).toBe('Senior Developer'); // más reciente primero por defecto
    });

    test('Debe filtrar experiencias por empresa y modalidad', async () => {
      await Experiencia.create([
        {
          puesto: 'Frontend Dev',
          empresa: 'Google',
          modalidad: 'Remoto',
          fechaInicio: new Date('2022-01-01')
        },
        {
          puesto: 'Backend Dev',
          empresa: 'Microsoft',
          modalidad: 'Presencial',
          fechaInicio: new Date('2023-01-01')
        }
      ]);

      const res = await request(app).get('/api/experiencias?empresa=Google');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].empresa).toBe('Google');
    });
  });

  describe('GET /api/experiencias/:id (Obtener por ID)', () => {
    test('Debe obtener la experiencia si el ID existe', async () => {
      const expCreada = await Experiencia.create(experienciaEjemplo);

      const res = await request(app).get(`/api/experiencias/${expCreada._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.puesto).toBe(experienciaEjemplo.puesto);
    });

    test('Debe responder 400 si el ID tiene formato inválido', async () => {
      const res = await request(app).get('/api/experiencias/id-invalido-123');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('no tiene un formato válido');
    });

    test('Debe responder 404 si el ID es válido pero no existe en la base de datos', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/experiencias/${idInexistente}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/experiencias/:id (Actualizar Completo)', () => {
    test('Debe actualizar completamente una experiencia', async () => {
      const expCreada = await Experiencia.create(experienciaEjemplo);

      const datosNuevos = {
        ...experienciaEjemplo,
        puesto: 'Líder Técnico de Arquitectura',
        trabajoActual: true
      };

      const res = await request(app)
        .put(`/api/experiencias/${expCreada._id}`)
        .send(datosNuevos);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.puesto).toBe('Líder Técnico de Arquitectura');
      expect(res.body.data.trabajoActual).toBe(true);
      expect(res.body.data.fechaFin).toBeNull();
    });

    test('Debe retornar 404 si se intenta actualizar un ID inexistente', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/experiencias/${idInexistente}`)
        .send(experienciaEjemplo);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/experiencias/:id (Actualizar Parcial)', () => {
    test('Debe actualizar solo los campos proporcionados', async () => {
      const expCreada = await Experiencia.create(experienciaEjemplo);

      const res = await request(app)
        .patch(`/api/experiencias/${expCreada._id}`)
        .send({
          ubicacion: 'Bogotá, Colombia (Híbrido)'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.ubicacion).toBe('Bogotá, Colombia (Híbrido)');
      expect(res.body.data.puesto).toBe(experienciaEjemplo.puesto);
    });
  });

  describe('DELETE /api/experiencias/:id (Eliminar)', () => {
    test('Debe eliminar una experiencia y luego devolver 404 al buscarla', async () => {
      const expCreada = await Experiencia.create(experienciaEjemplo);

      const resDelete = await request(app).delete(`/api/experiencias/${expCreada._id}`);
      expect(resDelete.status).toBe(200);
      expect(resDelete.body.success).toBe(true);
      expect(resDelete.body.message).toContain('eliminada exitosamente');

      const resGet = await request(app).get(`/api/experiencias/${expCreada._id}`);
      expect(resGet.status).toBe(404);
    });

    test('Debe responder 404 al intentar eliminar un ID inexistente', async () => {
      const idInexistente = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/experiencias/${idInexistente}`);
      expect(res.status).toBe(404);
    });
  });
});

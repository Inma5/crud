# 📄 API REST - CRUD de Experiencias Profesionales (Hoja de Vida / CV)

API RESTful desarrollada con **Node.js**, el framework **Express.js**, el sistema de gestión de base de datos NoSQL **MongoDB** (con **Mongoose**) y documentación interactiva mediante **Swagger (OpenAPI 3.0)** para la administración completa del historial laboral y experiencias profesionales de una hoja de vida / currículum vítae.

---

## 🚀 Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución en JavaScript para el backend.
- **Express.js (v5)**: Framework web rápido, flexible y minimalista para el diseño de APIs RESTful.
- **MongoDB & Mongoose**: Base de datos NoSQL basada en documentos JSON/BSON y ODM con validaciones y esquemas estructurados.
- **Swagger (OpenAPI 3.0)** (`swagger-ui-express` y `swagger-jsdoc`): Documentación interactiva de la API con consola "Try it out" para probar cada endpoint directamente desde el navegador.
- **Jest & Supertest**: Suite de pruebas unitarias y de integración automatizadas.
- **MongoMemoryServer**: Servidor NoSQL en memoria para fallback automático y pruebas autónomas sin requerir configuración externa previa.
- **Cors & Morgan**: Manejo de CORS y registro (logging) de solicitudes HTTP en tiempo real.

---

## 📂 Estructura del Proyecto

```text
crud-cv-maria/
├── src/
│   ├── config/
│   │   ├── db.js                 # Conexión a MongoDB (Local / Atlas / Fallback memoria)
│   │   └── swagger.js            # Configuración de OpenAPI 3.0 y esquemas Swagger
│   ├── controllers/
│   │   └── experienceController.js # Lógica de negocio para las operaciones CRUD
│   ├── middlewares/
│   │   ├── errorHandler.js       # Manejador centralizado de errores
│   │   └── validator.js          # Validación de ObjectId de MongoDB y campos
│   ├── models/
│   │   └── Experience.js         # Esquema Mongoose para Experiencia Profesional
│   ├── routes/
│   │   └── experienceRoutes.js   # Rutas del API y anotaciones Swagger JSDoc
│   ├── seeds/
│   │   └── seed.js               # Script para poblar la BD con datos de ejemplo
│   ├── app.js                    # Configuración de Express, middlewares y Swagger
│   └── server.js                 # Inicio del servidor HTTP y eventos de cierre
├── tests/
│   └── experience.test.js        # 15 Pruebas automatizadas (100% éxito)
├── .env.example                  # Plantilla de variables de entorno
├── .env                          # Variables de entorno locales
├── package.json
└── README.md
```

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Clonar o ingresar al directorio del proyecto:
```bash
git clone https://github.com/Inma5/crud

cd crud-cv-maria
```

### 2. Instalar dependencias (si es necesario):
```bash
npm install
```

### 3. Configurar variables de entorno (`.env`):
El archivo `.env` ya viene preconfigurado. Puede personalizar las variables según sus necesidades:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cv_experiencias
AUTO_FALLBACK_MEMORY_DB=true
```

> **Nota sobre MongoDB:** Si tiene un servicio local de MongoDB o una cadena de MongoDB Atlas, configúrela en `MONGODB_URI`. Si no tiene MongoDB instalado localmente, el sistema activa automáticamente un servidor MongoDB en memoria para que pueda probar la API y Swagger de forma inmediata sin configuraciones adicionales.

### 4. (Opcional) Cargar datos de prueba:
Para poblar la base de datos con experiencias profesionales de ejemplo:
```bash
npm run seed
```

### 5. Iniciar la aplicación:

- **Modo Desarrollo (con reinicio automático al cambiar código):**
  ```bash
  npm run dev
  ```

- **Modo Producción:**
  ```bash
  npm start
  ```

El servidor iniciará en: **`http://localhost:3000`**

---

## 📖 Documentación y Pruebas con Swagger UI

Abra su navegador web y visite:

👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

En la interfaz de **Swagger UI** podrá:
1. Inspeccionar visualmente todos los modelos de datos y esquemas de petición/respuesta.
2. Hacer clic en cualquier endpoint y pulsar el botón **"Try it out"**.
3. Enviar datos reales de prueba y ver las respuestas HTTP (200, 201, 400, 404, 500) en vivo.

También puede consultar la especificación en formato JSON en:
- `http://localhost:3000/api-docs.json`

---

## 📋 Endpoints del CRUD

Todos los endpoints tienen el prefijo `/api/experiencias`:

| Método | Endpoint | Descripción | Respuestas |
|---|---|---|---|
| **POST** | `/api/experiencias` | Registrar una nueva experiencia laboral en el CV | `201 Created`, `400 Bad Request` |
| **GET** | `/api/experiencias` | Listar todas las experiencias (con filtros y ordenación) | `200 OK` |
| **GET** | `/api/experiencias/:id` | Consultar el detalle de una experiencia por ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **PUT** | `/api/experiencias/:id` | Actualizar completamente una experiencia existente | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **PATCH** | `/api/experiencias/:id` | Actualizar parcialmente campos específicos | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/experiencias/:id` | Eliminar una experiencia laboral por ID | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

### 📝 Estructura del Objeto Experiencia Profesional

```json
{
  "puesto": "Desarrollador Full Stack Senior",
  "empresa": "Tech Solutions S.A.S.",
  "ubicacion": "Bogotá, Colombia",
  "modalidad": "Remoto",
  "tipoEmpleo": "Tiempo Completo",
  "fechaInicio": "2023-01-15",
  "fechaFin": null,
  "trabajoActual": true,
  "descripcion": "Liderazgo en el desarrollo y arquitectura de APIs RESTful con Node.js y MongoDB.",
  "responsabilidades": [
    "Diseño de arquitectura de microservicios con Express.js",
    "Modelado de datos NoSQL y consultas optimizadas en MongoDB",
    "Documentación y pruebas de endpoints con Swagger"
  ],
  "logros": [
    "Reducción del 35% en tiempos de respuesta de endpoints críticos",
    "Aumento de la cobertura de pruebas al 85%"
  ],
  "tecnologias": ["Node.js", "Express.js", "MongoDB", "Mongoose", "Docker", "Swagger"]
}
```

---

### 🔍 Parámetros de Consulta (Filtros en GET `/api/experiencias`)

- `empresa`: Búsqueda parcial por nombre de la empresa (ej: `?empresa=Tech`).
- `puesto`: Búsqueda parcial por nombre del cargo (ej: `?puesto=Backend`).
- `modalidad`: Filtrar por modalidad (`Remoto`, `Híbrido`, `Presencial`).
- `trabajoActual`: Filtrar solo trabajos actuales (`true`) o finalizados (`false`).
- `tecnologia`: Filtrar por tecnología empleada (ej: `?tecnologia=Node.js`).
- `sortBy`: Campo de ordenamiento (por defecto `fechaInicio`).
- `order`: Dirección del orden (`desc` o `asc`).

---

## 🧪 Pruebas Automatizadas

El proyecto cuenta con una batería de **15 pruebas automatizadas** que validan el 100% de los endpoints y escenarios límite (creación válida, errores de validación, fechas inválidas, IDs inexistentes e IDs malformados):

Para ejecutar la suite de pruebas:
```bash
npm test
```

Resultado de las pruebas:
```text
PASS tests/experience.test.js
  Documentación Swagger y Rutas Base
    ✓ GET / debe responder con información de la API y enlaces a Swagger
    ✓ GET /api-docs.json debe devolver la especificación OpenAPI válida
  CRUD de Experiencias Profesionales (/api/experiencias)
    POST /api/experiencias (Crear)
      ✓ Debe crear una nueva experiencia profesional exitosamente (201)
      ✓ Debe fallar (400) si faltan campos obligatorios como puesto o empresa
      ✓ Debe fallar (400) si la fechaFin es anterior a la fechaInicio
    GET /api/experiencias (Listar)
      ✓ Debe listar todas las experiencias ordenadas cronológicamente
      ✓ Debe filtrar experiencias por empresa y modalidad
    GET /api/experiencias/:id (Obtener por ID)
      ✓ Debe obtener la experiencia si el ID existe
      ✓ Debe responder 400 si el ID tiene formato inválido
      ✓ Debe responder 404 si el ID es válido pero no existe en la base de datos
    PUT /api/experiencias/:id (Actualizar Completo)
      ✓ Debe actualizar completamente una experiencia
      ✓ Debe retornar 404 si se intenta actualizar un ID inexistente
    PATCH /api/experiencias/:id (Actualizar Parcial)
      ✓ Debe actualizar solo los campos proporcionados
    DELETE /api/experiencias/:id (Eliminar)
      ✓ Debe eliminar una experiencia y luego devolver 404 al buscarla
      ✓ Debe responder 404 al intentar eliminar un ID inexistente

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

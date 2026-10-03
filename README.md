# 📄 API REST - CRUD de Experiencias Profesionales (Hoja de Vida / CV)

API RESTful desarrollada con **Node.js**, el framework **Express.js**, el sistema de gestión de base de datos NoSQL **MongoDB** (con **Mongoose**) y documentación interactiva mediante **Swagger (OpenAPI 3.0)** para la administración completa del historial laboral y experiencias profesionales de una hoja de vida / currículum vítae.

Totalmente optimizada y configurada para ser desplegada en **Vercel (Serverless Functions)** o servidores tradicionales (Node.js standalone / Docker).

---

## 🚀 Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución en JavaScript para el backend.
- **Express.js (v5)**: Framework web rápido, flexible y minimalista para el diseño de APIs RESTful.
- **MongoDB & Mongoose**: Base de datos NoSQL con ODM estructurado, validaciones y pool de conexiones en caché para entornos serverless.
- **Vercel Serverless**: Configuración con `vercel.json` y función serverless en `api/index.js`.
- **Swagger (OpenAPI 3.0)** (`swagger-ui-express` y `swagger-jsdoc`): Documentación interactiva con consola "Try it out", compatible con CDN para Vercel.
- **Jest & Supertest**: Suite de pruebas unitarias y de integración automatizadas.
- **MongoMemoryServer**: Servidor NoSQL en memoria para fallback automático en desarrollo local sin requerir instalación previa de MongoDB.
- **Cors & Morgan**: Manejo de CORS y registro (logging) de solicitudes HTTP en tiempo real.

---

## 📂 Estructura del Proyecto

```text
crud-cv-maria/
├── api/
│   └── index.js                  # Punto de entrada para la función Serverless de Vercel
├── src/
│   ├── config/
│   │   ├── db.js                 # Conexión a MongoDB (Pool en caché para Vercel / Atlas / Fallback memoria)
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
│   ├── app.js                    # Configuración de Express, middlewares, Swagger y Health check
│   └── server.js                 # Servidor HTTP para desarrollo local (standalone)
├── tests/
│   └── experience.test.js        # 16 Pruebas automatizadas (100% éxito)
├── .env.example                  # Plantilla de variables de entorno (Local y Atlas)
├── .env                          # Variables de entorno locales
├── .vercelignore                 # Exclusiones para optimizar el bundle en Vercel
├── vercel.json                   # Enrutamiento y configuración de despliegue en Vercel
├── package.json
└── README.md
```

---

## 🌐 Despliegue en Vercel y Configuración de Base de Datos

Vercel ejecuta el backend como **Serverless Functions** (funciones bajo demanda). Dado que Vercel no aloja bases de datos persistentes locales ni permite bases en memoria entre ejecuciones, la base de datos debe ser alojada en la nube mediante **MongoDB Atlas** (servicio oficial gratuito).

### Paso 1: Configurar la Base de Datos en MongoDB Atlas (Gratis)

1. Regístrate o inicia sesión en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Crea un clúster gratuito (**M0 Free Tier**).
3. En la sección **Security > Database Access**:
   - Crea un usuario (ej. `admin_cv`) y asigna una contraseña segura.
   - Asígnale el rol `Read and write to any database`.
4. En la sección **Security > Network Access** (**¡MUY IMPORTANTE!**):
   - Haz clic en **Add IP Address**.
   - Selecciona **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *¿Por qué?*: Las funciones de Vercel se ejecutan en IPs dinámicas de la nube. Si no agregas `0.0.0.0/0`, Vercel no podrá conectarse a la base de datos.
5. En la sección **Database > Clusters**, pulsa **Connect** > **Drivers** (Node.js) y copia tu cadena de conexión URI. Tendrá un formato similar a:
   ```text
   mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/cv_experiencias?retryWrites=true&w=majority
   ```
   *(Reemplaza `<usuario>` y `<password>` por tus credenciales reales)*.

---

### Paso 2: Poblar la Base de Datos Remota (Semilla Inicial)

Puedes ejecutar el script de seed directamente contra tu clúster de MongoDB Atlas desde tu terminal local:

```bash
MONGODB_URI="mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/cv_experiencias?retryWrites=true&w=majority" npm run seed
```

Esto creará automáticamente la colección `experiencias` e insertará los registros de prueba.

---

### Paso 3: Desplegar en Vercel

#### Opción A: Desde el panel web de Vercel (Recomendado)
1. Sube tu proyecto a un repositorio de **GitHub**, **GitLab** o **Bitbucket**.
2. Ve a [vercel.com/new](https://vercel.com/new) e importa tu repositorio.
3. En la pantalla de configuración:
   - **Framework Preset**: Vercel detectará `Other` o `Express`.
   - **Root Directory**: `./` (la raíz del proyecto).
   - Abre la pestaña **Environment Variables** y agrega:
     - **Key**: `MONGODB_URI`
     - **Value**: `mongodb+srv://<usuario>:<password>@cluster0.xxxxx.mongodb.net/cv_experiencias?retryWrites=true&w=majority`
     - **Key**: `NODE_ENV`
     - **Value**: `production`
4. Haz clic en **Deploy**.

#### Opción B: Usando Vercel CLI desde la terminal
```bash
# 1. Iniciar sesión en Vercel
npx vercel login

# 2. Desplegar (sigue las instrucciones en pantalla)
npx vercel

# 3. Configurar la variable de entorno de MongoDB Atlas
npx vercel env add MONGODB_URI production

# 4. Desplegar a producción
npx vercel --prod
```

---

### Paso 4: Verificar el Despliegue

Una vez completado el despliegue, Vercel te proporcionará una URL (ej. `https://mi-cv-api.vercel.app`):

1. **Estado general**: Visita `https://mi-cv-api.vercel.app/` para ver los metadatos y accesos directos.
2. **Chequeo de salud y conexión**: Visita `https://mi-cv-api.vercel.app/api/health` para comprobar en tiempo real que MongoDB Atlas está conectado (`"estado": "Conectado"`).
3. **Documentación interactiva**: Visita `https://mi-cv-api.vercel.app/api-docs` para interactuar con Swagger UI y probar endpoints.

---

## 🛠️ Instalación y Uso en Desarrollo Local

### 1. Clonar el repositorio e instalar dependencias:
```bash
git clone https://github.com/Inma5/crud
cd crud-cv-maria
npm install
```

### 2. Configurar variables de entorno (`.env`):
El archivo `.env` ya viene configurado para desarrollo local:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cv_experiencias
AUTO_FALLBACK_MEMORY_DB=true
```

> **Nota sobre MongoDB en local:** Si tienes MongoDB instalado localmente o configuras una URI de Atlas, la aplicación se conectará automáticamente. Si no tienes MongoDB instalado, el sistema activará automáticamente `MongoMemoryServer` en memoria para que puedas probar la aplicación de inmediato sin instalar nada extra.

### 3. Cargar datos de prueba locales:
```bash
npm run seed
```

### 4. Iniciar el servidor local:
```bash
# Modo desarrollo con recarga automática:
npm run dev

# Modo producción standalone:
npm start
```
El servidor iniciará en: **`http://localhost:3000`**

---

## 📖 Documentación Swagger UI

Visita en tu navegador:
👉 **`http://localhost:3000/api-docs`** (o tu dominio en Vercel `/api-docs`)

- Los estilos y scripts cargan vía CDN de Swagger UI para garantizar que funcione al 100% tanto en local como en Vercel.
- La consola "Try it out" utiliza rutas relativas, por lo que las peticiones se ejecutan siempre contra el servidor donde esté alojado.
- Especificación JSON disponible en: `/api-docs.json`.

---

## 📋 Endpoints de la API

| Método | Endpoint | Descripción | Respuestas |
|---|---|---|---|
| **GET** | `/` | Información del servicio, plataforma y enlaces rápidos | `200 OK` |
| **GET** | `/api/health` | Estado del servicio y conectividad con MongoDB | `200 OK`, `503 Service Unavailable` |
| **POST** | `/api/experiencias` | Registrar una nueva experiencia laboral en el CV | `201 Created`, `400 Bad Request`, `500 Internal Error` |
| **GET** | `/api/experiencias` | Listar todas las experiencias (con filtros y orden) | `200 OK`, `500 Internal Error` |
| **GET** | `/api/experiencias/:id` | Consultar el detalle de una experiencia por ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **PUT** | `/api/experiencias/:id` | Actualizar completamente una experiencia existente | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **PATCH** | `/api/experiencias/:id` | Actualizar parcialmente campos específicos | `200 OK`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/experiencias/:id` | Eliminar una experiencia laboral por ID | `200 OK`, `400 Bad Request`, `404 Not Found` |

---

### 🔍 Filtros Disponibles (GET `/api/experiencias`)

- `empresa`: Búsqueda por texto en nombre de la empresa (ej: `?empresa=Innovaciones`).
- `puesto`: Búsqueda por texto en cargo o título (ej: `?puesto=Backend`).
- `modalidad`: Filtrar por modalidad (`Remoto`, `Híbrido`, `Presencial`).
- `trabajoActual`: Filtrar trabajos actuales (`true`) o concluidos (`false`).
- `tecnologia`: Filtrar por tecnología empleada (ej: `?tecnologia=MongoDB`).
- `sortBy`: Campo de ordenamiento (por defecto `fechaInicio`).
- `order`: Dirección del orden (`desc` o `asc`).

---

## 🧪 Pruebas Automatizadas

El proyecto incluye **16 pruebas automatizadas** que cubren rutas base, health check, documentación OpenAPI y todas las operaciones CRUD:

```bash
npm test
```

---

## 🔒 Consideraciones de Seguridad y Buenas Prácticas en Vercel

1. **Reutilización de Conexiones (Connection Pooling)**: `src/config/db.js` almacena en caché la promesa y la conexión de Mongoose en `global.mongoose` para evitar agotar las conexiones máximas permitidas por MongoDB Atlas en arquitecturas serverless.
2. **Manejo de Errores Descriptivo**: Si la base de datos no está disponible o las credenciales no son válidas, la API responde con un JSON de error 500 explicativo en lugar de congelar la función serverless.
3. **Optimización del Bundle**: El archivo `.vercelignore` previene que archivos de prueba y documentación innecesaria aumenten el tamaño de la función desplegada.

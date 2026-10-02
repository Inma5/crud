const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const { validarIdMongo, validarCreacionExperiencia } = require('../middlewares/validator');

/**
 * @openapi
 * /api/experiencias:
 *   post:
 *     summary: Crear una nueva experiencia laboral
 *     description: Registra una nueva experiencia profesional para la hoja de vida / CV.
 *     tags:
 *       - Experiencias Profesionales
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExperienciaInput'
 *     responses:
 *       201:
 *         description: Experiencia profesional creada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Experiencia profesional registrada exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Experiencia'
 *       400:
 *         description: Datos inválidos o faltantes en el cuerpo de la petición.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   get:
 *     summary: Listar experiencias profesionales
 *     description: Retorna la lista de experiencias profesionales registradas, ordenadas cronológicamente por defecto y con filtros opcionales.
 *     tags:
 *       - Experiencias Profesionales
 *     parameters:
 *       - in: query
 *         name: empresa
 *         schema:
 *           type: string
 *         description: Filtrar por coincidencia en el nombre de la empresa
 *         example: Tech
 *       - in: query
 *         name: puesto
 *         schema:
 *           type: string
 *         description: Filtrar por coincidencia en el puesto o cargo
 *         example: Backend
 *       - in: query
 *         name: modalidad
 *         schema:
 *           type: string
 *           enum: [Remoto, Híbrido, Presencial]
 *         description: Filtrar por modalidad de trabajo
 *       - in: query
 *         name: trabajoActual
 *         schema:
 *           type: boolean
 *         description: Filtrar solo trabajos actuales (true) o concluidos (false)
 *       - in: query
 *         name: tecnologia
 *         schema:
 *           type: string
 *         description: Filtrar por tecnología o habilidad usada
 *         example: Node.js
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: fechaInicio
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Lista de experiencias obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Experiencia'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/')
  .post(validarCreacionExperiencia, experienceController.crearExperiencia)
  .get(experienceController.obtenerExperiencias);

/**
 * @openapi
 * /api/experiencias/{id}:
 *   get:
 *     summary: Obtener una experiencia profesional por ID
 *     description: Devuelve el detalle completo de una experiencia profesional específica mediante su identificador único de MongoDB.
 *     tags:
 *       - Experiencias Profesionales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la experiencia (24 caracteres hexadecimales)
 *         example: 651e7a68e83f2a74c43f1a23
 *     responses:
 *       200:
 *         description: Experiencia profesional encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Experiencia'
 *       400:
 *         description: ID proporcionado no válido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No se encontró la experiencia con el ID suministrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     summary: Actualizar completamente una experiencia profesional
 *     description: Reemplaza o actualiza todos los datos de la experiencia profesional indicada por su ID.
 *     tags:
 *       - Experiencias Profesionales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la experiencia
 *         example: 651e7a68e83f2a74c43f1a23
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExperienciaInput'
 *     responses:
 *       200:
 *         description: Experiencia profesional actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Experiencia profesional actualizada exitosamente
 *                 data:
 *                   $ref: '#/components/schemas/Experiencia'
 *       400:
 *         description: Error de validación en los datos o ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Experiencia no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     summary: Actualizar parcialmente una experiencia profesional
 *     description: Modifica solo los campos especificados en el cuerpo de la petición.
 *     tags:
 *       - Experiencias Profesionales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la experiencia
 *         example: 651e7a68e83f2a74c43f1a23
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               trabajoActual: true
 *               descripcion: "Liderazgo técnico del equipo de backend Node.js y arquitectura de microservicios."
 *     responses:
 *       200:
 *         description: Experiencia profesional actualizada parcialmente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Experiencia profesional actualizada parcialmente con éxito
 *                 data:
 *                   $ref: '#/components/schemas/Experiencia'
 *       400:
 *         description: Error de validación o ID inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Experiencia no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     summary: Eliminar una experiencia profesional
 *     description: Elimina de la base de datos la experiencia profesional correspondiente al ID suministrado.
 *     tags:
 *       - Experiencias Profesionales
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de MongoDB de la experiencia a eliminar
 *         example: 651e7a68e83f2a74c43f1a23
 *     responses:
 *       200:
 *         description: Experiencia profesional eliminada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Experiencia profesional eliminada exitosamente
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 651e7a68e83f2a74c43f1a23
 *                     puesto:
 *                       type: string
 *                       example: Ingeniero de Software Senior
 *                     empresa:
 *                       type: string
 *                       example: Tech Solutions Inc.
 *       400:
 *         description: ID de MongoDB inválido.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Experiencia no encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router
  .route('/:id')
  .get(validarIdMongo, experienceController.obtenerExperienciaPorId)
  .put(validarIdMongo, experienceController.actualizarExperiencia)
  .patch(validarIdMongo, experienceController.actualizarParcialExperiencia)
  .delete(validarIdMongo, experienceController.eliminarExperiencia);

module.exports = router;

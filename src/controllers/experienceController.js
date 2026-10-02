const Experiencia = require('../models/Experience');

/**
 * Controlador para la gestión de experiencias profesionales en la Hoja de Vida / CV.
 */

// @desc    Crear una nueva experiencia profesional
// @route   POST /api/experiencias
// @access  Público
const crearExperiencia = async (req, res, next) => {
  try {
    const {
      puesto,
      empresa,
      ubicacion,
      modalidad,
      tipoEmpleo,
      fechaInicio,
      fechaFin,
      trabajoActual,
      descripcion,
      responsabilidades,
      logros,
      tecnologias
    } = req.body;

    // Validación de coherencia de fechas
    if (fechaInicio && fechaFin && !trabajoActual) {
      if (new Date(fechaFin) < new Date(fechaInicio)) {
        return res.status(400).json({
          success: false,
          message: 'La fecha de fin no puede ser anterior a la fecha de inicio'
        });
      }
    }

    const nuevaExperiencia = await Experiencia.create({
      puesto,
      empresa,
      ubicacion,
      modalidad,
      tipoEmpleo,
      fechaInicio,
      fechaFin: trabajoActual ? null : fechaFin,
      trabajoActual: Boolean(trabajoActual),
      descripcion,
      responsabilidades: Array.isArray(responsabilidades) ? responsabilidades : [],
      logros: Array.isArray(logros) ? logros : [],
      tecnologias: Array.isArray(tecnologias) ? tecnologias : []
    });

    return res.status(201).json({
      success: true,
      message: 'Experiencia profesional registrada exitosamente',
      data: nuevaExperiencia
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Obtener todas las experiencias profesionales (con filtros y orden cronológico)
// @route   GET /api/experiencias
// @access  Público
const obtenerExperiencias = async (req, res, next) => {
  try {
    const { empresa, puesto, modalidad, trabajoActual, tecnologia, sortBy, order } = req.query;

    const filtro = {};

    if (empresa) {
      filtro.empresa = { $regex: empresa.trim(), $options: 'i' };
    }

    if (puesto) {
      filtro.puesto = { $regex: puesto.trim(), $options: 'i' };
    }

    if (modalidad) {
      filtro.modalidad = modalidad;
    }

    if (trabajoActual !== undefined) {
      filtro.trabajoActual = trabajoActual === 'true' || trabajoActual === true;
    }

    if (tecnologia) {
      filtro.tecnologias = { $in: [new RegExp(tecnologia.trim(), 'i')] };
    }

    // Configuración de orden (por defecto de la más reciente a la más antigua)
    const criterioOrden = {};
    const campoOrden = sortBy || 'fechaInicio';
    const direccionOrden = order === 'asc' ? 1 : -1;
    criterioOrden[campoOrden] = direccionOrden;

    const experiencias = await Experiencia.find(filtro).sort(criterioOrden);

    return res.status(200).json({
      success: true,
      count: experiencias.length,
      data: experiencias
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Obtener una experiencia profesional por su ID
// @route   GET /api/experiencias/:id
// @access  Público
const obtenerExperienciaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const experiencia = await Experiencia.findById(id);

    if (!experiencia) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna experiencia profesional con el ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      data: experiencia
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Actualizar completamente una experiencia profesional
// @route   PUT /api/experiencias/:id
// @access  Público
const actualizarExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datosActualizados = { ...req.body };

    const experienciaExistente = await Experiencia.findById(id);
    if (!experienciaExistente) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna experiencia profesional con el ID: ${id}`
      });
    }

    // Si marca trabajoActual como true, fechaFin debe ser nula
    if (datosActualizados.trabajoActual === true) {
      datosActualizados.fechaFin = null;
    }

    // Validar coherencia de fechas
    const fechaIni = datosActualizados.fechaInicio
      ? new Date(datosActualizados.fechaInicio)
      : experienciaExistente.fechaInicio;
    const fechaFin = datosActualizados.fechaFin !== undefined
      ? (datosActualizados.fechaFin ? new Date(datosActualizados.fechaFin) : null)
      : experienciaExistente.fechaFin;
    const esActual = datosActualizados.trabajoActual !== undefined
      ? datosActualizados.trabajoActual
      : experienciaExistente.trabajoActual;

    if (!esActual && fechaIni && fechaFin && fechaFin < fechaIni) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio'
      });
    }

    const experienciaActualizada = await Experiencia.findByIdAndUpdate(
      id,
      datosActualizados,
      { returnDocument: 'after', runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Experiencia profesional actualizada exitosamente',
      data: experienciaActualizada
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Actualizar parcialmente campos de una experiencia profesional
// @route   PATCH /api/experiencias/:id
// @access  Público
const actualizarParcialExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const camposActualizar = { ...req.body };

    const experienciaExistente = await Experiencia.findById(id);
    if (!experienciaExistente) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna experiencia profesional con el ID: ${id}`
      });
    }

    if (camposActualizar.trabajoActual === true) {
      camposActualizar.fechaFin = null;
    }

    // Validar fechas si alguna fue provista
    const fechaIni = camposActualizar.fechaInicio
      ? new Date(camposActualizar.fechaInicio)
      : experienciaExistente.fechaInicio;
    const fechaFin = camposActualizar.fechaFin !== undefined
      ? (camposActualizar.fechaFin ? new Date(camposActualizar.fechaFin) : null)
      : experienciaExistente.fechaFin;
    const esActual = camposActualizar.trabajoActual !== undefined
      ? camposActualizar.trabajoActual
      : experienciaExistente.trabajoActual;

    if (!esActual && fechaIni && fechaFin && fechaFin < fechaIni) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio'
      });
    }

    const experienciaActualizada = await Experiencia.findByIdAndUpdate(
      id,
      { $set: camposActualizar },
      { returnDocument: 'after', runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Experiencia profesional actualizada parcialmente con éxito',
      data: experienciaActualizada
    });
  } catch (error) {
    return next(error);
  }
};

// @desc    Eliminar una experiencia profesional por su ID
// @route   DELETE /api/experiencias/:id
// @access  Público
const eliminarExperiencia = async (req, res, next) => {
  try {
    const { id } = req.params;

    const experienciaEliminada = await Experiencia.findByIdAndDelete(id);

    if (!experienciaEliminada) {
      return res.status(404).json({
        success: false,
        message: `No se encontró ninguna experiencia profesional con el ID: ${id}`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Experiencia profesional eliminada exitosamente',
      data: {
        id: experienciaEliminada._id,
        puesto: experienciaEliminada.puesto,
        empresa: experienciaEliminada.empresa
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  crearExperiencia,
  obtenerExperiencias,
  obtenerExperienciaPorId,
  actualizarExperiencia,
  actualizarParcialExperiencia,
  eliminarExperiencia
};

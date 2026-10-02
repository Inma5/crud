const mongoose = require('mongoose');

/**
 * Middleware para validar que el parámetro :id sea un ObjectId válido de MongoDB.
 */
const validarIdMongo = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `El ID '${id}' proporcionado no tiene un formato válido de MongoDB`
    });
  }

  next();
};

/**
 * Middleware para validar campos mínimos requeridos en creación
 */
const validarCreacionExperiencia = (req, res, next) => {
  const { puesto, empresa, fechaInicio } = req.body;
  const errores = [];

  if (!puesto || typeof puesto !== 'string' || puesto.trim() === '') {
    errores.push('El campo "puesto" es obligatorio y debe ser un texto válido.');
  }

  if (!empresa || typeof empresa !== 'string' || empresa.trim() === '') {
    errores.push('El campo "empresa" es obligatorio y debe ser un texto válido.');
  }

  if (!fechaInicio) {
    errores.push('El campo "fechaInicio" es obligatorio.');
  } else if (isNaN(new Date(fechaInicio).getTime())) {
    errores.push('El campo "fechaInicio" debe ser una fecha válida (formato YYYY-MM-DD).');
  }

  if (errores.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados',
      errores
    });
  }

  next();
};

module.exports = {
  validarIdMongo,
  validarCreacionExperiencia
};

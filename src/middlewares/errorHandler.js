/**
 * Middleware centralizado para manejo de errores en Express.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${err.name}: ${err.message}`);

  // Error de sintaxis en JSON (body malformado)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'El formato JSON enviado en el cuerpo de la petición es inválido'
    });
  }

  // Error de casteo de Mongoose (por ejemplo, ObjectId inválido)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `El valor proporcionado '${err.value}' no es válido para el campo '${err.path}'`
    });
  }

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((errorItem) => errorItem.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación del esquema de datos',
      errores: mensajes
    });
  }

  // Error de clave duplicada en Mongo
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con los datos únicos proporcionados'
    });
  }

  // Error general no controlado
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  });
};

module.exports = errorHandler;

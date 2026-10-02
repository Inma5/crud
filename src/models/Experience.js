const mongoose = require('mongoose');

/**
 * Esquema de Mongoose para la entidad de Experiencia Profesional (Hoja de Vida / CV).
 */
const experienciaSchema = new mongoose.Schema(
  {
    puesto: {
      type: String,
      required: [true, 'El puesto o cargo es obligatorio'],
      trim: true,
      minlength: [2, 'El puesto debe contener al menos 2 caracteres'],
      maxlength: [120, 'El puesto no puede exceder los 120 caracteres']
    },
    empresa: {
      type: String,
      required: [true, 'El nombre de la empresa es obligatorio'],
      trim: true,
      minlength: [2, 'El nombre de la empresa debe tener al menos 2 caracteres'],
      maxlength: [120, 'El nombre de la empresa no puede exceder los 120 caracteres']
    },
    ubicacion: {
      type: String,
      trim: true,
      default: 'Remoto',
      maxlength: [100, 'La ubicación no puede exceder los 100 caracteres']
    },
    modalidad: {
      type: String,
      enum: {
        values: ['Remoto', 'Híbrido', 'Presencial'],
        message: '{VALUE} no es una modalidad válida. Permitidas: Remoto, Híbrido, Presencial'
      },
      default: 'Remoto'
    },
    tipoEmpleo: {
      type: String,
      enum: {
        values: ['Tiempo Completo', 'Medio Tiempo', 'Freelance', 'Pasantía', 'Por Contrato'],
        message: '{VALUE} no es un tipo de empleo válido'
      },
      default: 'Tiempo Completo'
    },
    fechaInicio: {
      type: Date,
      required: [true, 'La fecha de inicio es obligatoria']
    },
    fechaFin: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // Si no hay fecha de fin o es trabajo actual, la validación pasa
          if (!value || this.trabajoActual) return true;
          // Si hay fechaInicio, fechaFin debe ser igual o posterior
          return !this.fechaInicio || value >= this.fechaInicio;
        },
        message: 'La fecha de fin no puede ser anterior a la fecha de inicio'
      }
    },
    trabajoActual: {
      type: Boolean,
      default: false
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1500, 'La descripción no puede exceder los 1500 caracteres']
    },
    responsabilidades: {
      type: [String],
      default: []
    },
    logros: {
      type: [String],
      default: []
    },
    tecnologias: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Middleware pre-guardado para limpiar fechaFin si trabajoActual es verdadero
experienciaSchema.pre('save', function () {
  if (this.trabajoActual) {
    this.fechaFin = null;
  }
});

// Middleware pre-actualización para findOneAndUpdate
experienciaSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update && (update.trabajoActual === true || (update.$set && update.$set.trabajoActual === true))) {
    if (update.$set) {
      update.$set.fechaFin = null;
    } else {
      update.fechaFin = null;
    }
  }
});

module.exports = mongoose.model('Experiencia', experienciaSchema);

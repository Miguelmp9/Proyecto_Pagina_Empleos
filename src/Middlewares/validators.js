import { body, param, validationResult } from 'express-validator';

// Helper: runValidations
export const runValidations = (validations) => {
    return async (req, res, next) => {
        for (let validation of validations) {
            await validation.run(req);
        }

        const errors = validationResult(req);

        if (errors.isEmpty()) {
            return next();
        }

        return res.status(400).json({
            status: 'error',
            errors: errors.array()
        });
    }
}

// Validadores para crear usuario (POST)
export const createUserValidators = [
    body('nombre_completo')
        .trim()
        .notEmpty()
        .withMessage('El nombre completo es obligatorio'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('El email no es válido'),

    body('telefono')
        .optional()
        .isMobilePhone()
        .withMessage('El teléfono no es válido'),

    body('anios_experiencia')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Los años de experiencia deben ser un número positivo'),

    body('rango_salarial_esperado')
        .optional()
        .isDecimal()
        .withMessage('El rango salarial debe ser un número decimal'),

    body('perfil_publico')
        .optional()
        .isBoolean()
        .withMessage('El campo perfil_publico debe ser verdadero o falso'),

    body('mostrar_email')
        .optional()
        .isBoolean()
        .withMessage('El campo mostrar_email debe ser verdadero o falso'),

    body('recibir_notificaciones')
        .optional()
        .isBoolean()
        .withMessage('El campo recibir_notificaciones debe ser verdadero o falso'),

    body('tipo_empleo_deseado')
        .optional()
        .isIn(['tiempo_completo', 'medio_tiempo', 'freelance', 'remoto', 'hibrido'])
        .withMessage('El tipo de empleo no es válido'),

    body('estado')
        .optional()
        .isIn(['activo', 'inactivo', 'buscando', 'empleado'])
        .withMessage('El estado no es válido'),
];

// Validadores para actualizar usuario (PUT)
export const updateUserValidators = [
    param('id')
        .isInt()
        .withMessage('El ID debe ser un número entero'),

    body('email')
        .optional()
        .isEmail()
        .withMessage('El email no es válido'),

    body('anios_experiencia')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Los años de experiencia deben ser un número positivo'),

    body('rango_salarial_esperado')
        .optional()
        .isDecimal()
        .withMessage('El rango salarial debe ser un número decimal'),

    body('perfil_publico')
        .optional()
        .isBoolean()
        .withMessage('El campo perfil_publico debe ser verdadero o falso'),

    body('mostrar_email')
        .optional()
        .isBoolean()
        .withMessage('El campo mostrar_email debe ser verdadero o falso'),

    body('recibir_notificaciones')
        .optional()
        .isBoolean()
        .withMessage('El campo recibir_notificaciones debe ser verdadero o falso'),
];
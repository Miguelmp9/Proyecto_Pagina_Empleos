import * as postulacionServicios from '../services/PostulacionServicios.js';

// Crear postulacion
export const postCrearPostulacion = async (req, res) => {
    try {
        const { usuario_id, empleo_id, carta_presentacion } = req.body;

        if (!usuario_id || !empleo_id) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }

        // Verificar si ya se postuló
        const yaPostulado = await postulacionServicios.checkPostulacion(usuario_id, empleo_id);
        if (yaPostulado) {
            return res.status(400).json({ error: 'Ya te postulaste a este empleo' });
        }

        const result = await postulacionServicios.createPostulacion({ usuario_id, empleo_id, carta_presentacion });
        res.status(201).json({ mensaje: 'Postulación enviada correctamente', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al enviar la postulación' });
    }
};

// Obtener postulaciones por empleo
export const getPostulacionesPorEmpleo = async (req, res) => {
    try {
        const postulaciones = await postulacionServicios.getPostulacionesByEmpleo(req.params.empleo_id);
        res.json(postulaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las postulaciones' });
    }
};

// Obtener postulaciones por empresa
export const getPostulacionesPorEmpresa = async (req, res) => {
    try {
        const postulaciones = await postulacionServicios.getPostulacionesByEmpresa(req.params.empresa_id);
        res.json(postulaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las postulaciones' });
    }
};

// Actualizar estado
export const putActualizarEstado = async (req, res) => {
    try {
        const { estado } = req.body;
        const result = await postulacionServicios.updateEstadoPostulacion(req.params.id, estado);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Postulación no encontrada' });
        res.json({ mensaje: 'Estado actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el estado' });
    }
};
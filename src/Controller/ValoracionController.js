import * as ValoracionServicios from '../services/ValoracionServicios.js';

export const getValoracionesByUsuario = async (req, res) => {
    try {
        const data = await ValoracionServicios.getValoracionesByUsuario(req.params.usuario_id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postCrearValoracion = async (req, res) => {
    try {
        const { usuario_id, empresa_id, calificacion, comentario } = req.body;
        const result = await ValoracionServicios.createValoracion(usuario_id, empresa_id, calificacion, comentario);
        res.status(201).json({ message: 'Valoración creada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteValoracion = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        await ValoracionServicios.deleteValoracion(req.params.id, usuario_id);
        res.json({ message: 'Valoración eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
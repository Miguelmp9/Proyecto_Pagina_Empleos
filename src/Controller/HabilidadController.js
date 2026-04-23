import * as HabilidadServicios from '../services/HabilidadServicios.js';

export const getHabilidadesByUsuario = async (req, res) => {
    try {
        const data = await HabilidadServicios.getHabilidadesByUsuario(req.params.usuario_id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postAgregarHabilidad = async (req, res) => {
    try {
        const { usuario_id, nombre, nivel } = req.body;
        await HabilidadServicios.addHabilidadToUsuario(usuario_id, nombre, nivel);
        res.status(201).json({ message: 'Habilidad agregada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteHabilidad = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        await HabilidadServicios.deleteHabilidadFromUsuario(req.params.id, usuario_id);
        res.json({ message: 'Habilidad eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
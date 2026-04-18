import * as AlertaServicios from '../services/AlertaServicios.js';

export const getAlertasByUsuario = async (req, res) => {
    try {
        const data = await AlertaServicios.getAlertasByUsuario(req.params.usuario_id);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postCrearAlerta = async (req, res) => {
    try {
        const { usuario_id, palabras_clave, ubicacion, frecuencia } = req.body;
        const result = await AlertaServicios.createAlerta(usuario_id, palabras_clave, ubicacion, frecuencia);
        res.status(201).json({ message: 'Alerta creada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteAlerta = async (req, res) => {
    try {
        const { usuario_id } = req.body;
        await AlertaServicios.deleteAlerta(req.params.id, usuario_id);
        res.json({ message: 'Alerta eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleAlerta = async (req, res) => {
    try {
        const { usuario_id, activa } = req.body;
        await AlertaServicios.toggleAlerta(req.params.id, usuario_id, activa);
        res.json({ message: 'Alerta actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
import * as empleoServicios from '../services/EmpleoServicios.js';

export const getTodosLosEmpleos = async (req, res) => {
    try {
        const empleos = await empleoServicios.getAllEmpleos();
        res.json(empleos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los empleos' });
    }
};

export const getEmpleosPorEmpresa = async (req, res) => {
    try {
        const empleos = await empleoServicios.getEmpleosByEmpresa(req.params.empresa_id);
        res.json(empleos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los empleos' });
    }
};

export const getEmpleoPorId = async (req, res) => {
    try {
        const empleo = await empleoServicios.getEmpleoById(req.params.id);
        if (!empleo) return res.status(404).json({ error: 'Empleo no encontrado' });
        res.json(empleo);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el empleo' });
    }
};

export const postCrearEmpleo = async (req, res) => {
    try {
        const result = await empleoServicios.createEmpleo(req.body);
        res.status(201).json({ mensaje: 'Empleo publicado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al publicar el empleo' });
    }
};

export const putActualizarEmpleo = async (req, res) => {
    try {
        const result = await empleoServicios.updateEmpleo(req.params.id, req.body);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Empleo no encontrado' });
        res.json({ mensaje: 'Empleo actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el empleo' });
    }
};

export const deleteEliminarEmpleo = async (req, res) => {
    try {
        const result = await empleoServicios.deleteEmpleo(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Empleo no encontrado' });
        res.json({ mensaje: 'Empleo eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el empleo' });
    }
};

export const getStatsPorEmpresa = async (req, res) => {
    try {
        const stats = await empleoServicios.getStatsByEmpresa(req.params.empresa_id);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};
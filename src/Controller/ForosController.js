import * as forosServices from '../services/ForosServicios.js';

// ── CATEGORÍAS ────────────────────────────────────────────────

export const getCategorias = async (req, res) => {
    try {
        const categorias = await forosServices.getAllCategorias();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las categorías' });
    }
};

// ── DISCUSIONES ───────────────────────────────────────────────

export const getDiscusiones = async (req, res) => {
    try {
        const { categoria_id, orden } = req.query;
        const discusiones = await forosServices.getAllDiscusiones(categoria_id || null, orden || 'reciente');

        // Agregar etiquetas a cada discusión
        for (const d of discusiones) {
            d.etiquetas = await forosServices.getEtiquetasByDiscusion(d.id);
        }

        res.json(discusiones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las discusiones' });
    }
};

export const getDiscusion = async (req, res) => {
    try {
        const discusion = await forosServices.getDiscusionById(req.params.id);
        if (!discusion) return res.status(404).json({ error: 'Discusión no encontrada' });

        // Incrementar vistas
        await forosServices.incrementarVistas(req.params.id);

        // Agregar etiquetas
        discusion.etiquetas = await forosServices.getEtiquetasByDiscusion(discusion.id);

        // Agregar respuestas
        discusion.respuestas = await forosServices.getRespuestasByDiscusion(discusion.id);

        res.json(discusion);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la discusión' });
    }
};

export const postDiscusion = async (req, res) => {
    try {
        const { usuario_id, categoria_id, titulo, contenido, etiquetas } = req.body;

        if (!usuario_id || !categoria_id || !titulo || !contenido) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const result = await forosServices.createDiscusion({ usuario_id, categoria_id, titulo, contenido });
        const nuevaId = result.insertId;

        // Guardar etiquetas si vienen
        if (etiquetas && etiquetas.length > 0) {
            await forosServices.addEtiquetasToDiscusion(nuevaId, etiquetas);
        }

        res.status(201).json({ mensaje: 'Discusión creada', id: nuevaId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la discusión' });
    }
};

export const postLikeDiscusion = async (req, res) => {
    try {
        await forosServices.likeDiscusion(req.params.id);
        res.json({ mensaje: 'Like registrado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar like' });
    }
};

export const deleteDiscusion = async (req, res) => {
    try {
        const result = await forosServices.deleteDiscusion(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Discusión no encontrada' });
        res.json({ mensaje: 'Discusión eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la discusión' });
    }
};

// ── RESPUESTAS ────────────────────────────────────────────────

export const getRespuestas = async (req, res) => {
    try {
        const respuestas = await forosServices.getRespuestasByDiscusion(req.params.id);
        res.json(respuestas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las respuestas' });
    }
};

export const postRespuesta = async (req, res) => {
    try {
        const { usuario_id, contenido } = req.body;
        const discusion_id = req.params.id;

        if (!usuario_id || !contenido) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }

        const result = await forosServices.createRespuesta({ discusion_id, usuario_id, contenido });
        res.status(201).json({ mensaje: 'Respuesta publicada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al publicar la respuesta' });
    }
};

export const postLikeRespuesta = async (req, res) => {
    try {
        await forosServices.likeRespuesta(req.params.id);
        res.json({ mensaje: 'Like registrado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar like' });
    }
};

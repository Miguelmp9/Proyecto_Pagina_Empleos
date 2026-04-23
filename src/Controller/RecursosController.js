import * as recursoServicios from '../services/RecursosServicios.js';
import path   from 'path';
import { fileURLToPath } from 'url';
import fs     from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../../contenido_multimedia/recursos');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

export const getTodosLosRecursos = async (req, res) => {
    try {
        const estado  = req.query.estado || 'activo';
        const recursos = await recursoServicios.getAllRecursos(estado);
        res.json(recursos);
    } catch (error) {
        console.error('ERROR RECURSOS:', error.message);
        res.status(500).json({ error: error.message });  // ← muestra el error real
    }
};

export const getRecursoPorId = async (req, res) => {
    try {
        const recurso = await recursoServicios.getRecursoById(req.params.id);
        if (!recurso) return res.status(404).json({ error: 'Recurso no encontrado' });
        recursoServicios.incrementarVistas(req.params.id).catch(() => {});
        res.json(recurso);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el recurso' });
    }
};

export const postCrearRecurso = async (req, res) => {
    try {
        let archivo_url    = null;
        let tamano_archivo = null;
        let formato        = null;

        if (req.file) {
            archivo_url    = `contenido_multimedia/recursos/${req.file.filename}`;
            tamano_archivo = req.file.size;
            formato        = 'pdf';
        }

        const {
            titulo, tipo, categoria, contenido,
            autor_id, empresa_id,
            video_url, thumbnail_url,
            duracion_segundos, tiempo_lectura,
            es_premium, estado, sector
        } = req.body;

        if (!titulo) return res.status(400).json({ error: 'El título es obligatorio' });
        if (!archivo_url && !video_url)
            return res.status(400).json({ error: 'Debes proporcionar un archivo PDF o una URL' });

        const tipoFinal = tipo || (archivo_url ? 'documento' : 'video');

        const result = await recursoServicios.createRecurso({
            titulo,
            tipo:              tipoFinal,
            categoria:         categoria         || null,
            contenido:         contenido         || null,
            autor_id:          autor_id          || null,
            empresa_id:        empresa_id        || null,
            archivo_url,
            video_url:         video_url         || null,
            thumbnail_url:     thumbnail_url     || null,
            duracion_segundos: duracion_segundos || null,
            tamano_archivo,
            formato,
            tiempo_lectura:    tiempo_lectura    || null,
            es_premium:        es_premium === 'true' || es_premium === true,
            estado:            estado            || 'activo',
            sector:            sector            || null
        });

        res.status(201).json({ mensaje: 'Recurso publicado', id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al publicar el recurso' });
    }
};

export const putActualizarRecurso = async (req, res) => {
    try {
        const result = await recursoServicios.updateRecurso(req.params.id, req.body);
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Recurso no encontrado' });
        res.json({ mensaje: 'Recurso actualizado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el recurso' });
    }
};

export const deleteEliminarRecurso = async (req, res) => {
    try {
        const recurso = await recursoServicios.getRecursoById(req.params.id);
        if (!recurso) return res.status(404).json({ error: 'Recurso no encontrado' });

        if (recurso.archivo_url) {
            const rutaFisica = path.join(__dirname, '../../', recurso.archivo_url);
            fs.unlink(rutaFisica, () => {});
        }

        const result = await recursoServicios.deleteRecurso(req.params.id);
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Recurso no encontrado' });

        res.json({ mensaje: 'Recurso eliminado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el recurso' });
    }
};

export const patchIncrementarVistas = async (req, res) => {
    try {
        await recursoServicios.incrementarVistas(req.params.id);
        res.json({ mensaje: 'Vista registrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar vista' });
    }
};

export const patchIncrementarDescargas = async (req, res) => {
    try {
        await recursoServicios.incrementarDescargas(req.params.id);
        res.json({ mensaje: 'Descarga registrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar descarga' });
    }
};

export const patchToggleLike = async (req, res) => {
    try {
        const sumar = req.body.sumar !== false;
        await recursoServicios.toggleLike(req.params.id, sumar);
        res.json({ mensaje: sumar ? 'Like agregado' : 'Like removido' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar like' });
    }
};
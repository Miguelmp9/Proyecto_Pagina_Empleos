import { pool } from '../db.js';

export const getAllRecursos = async (estado = 'activo') => {
    const [rows] = await pool.query(`
        SELECT r.*,
               u.nombre_completo AS autor_nombre,
               e.nombre AS empresa_nombre
        FROM recursos r
        LEFT JOIN usuarios u ON r.autor_id  = u.id
        LEFT JOIN empresas e ON r.empresa_id = e.id
        WHERE r.estado = ?
        ORDER BY r.fecha_publicacion DESC
    `, [estado]);
    return rows;
};

export const getRecursoById = async (id) => {
    const [rows] = await pool.query(`
        SELECT r.*,
               u.nombre_completo AS autor_nombre,
               e.nombre AS empresa_nombre
        FROM recursos r
        LEFT JOIN usuarios u ON r.autor_id  = u.id
        LEFT JOIN empresas e ON r.empresa_id = e.id
        WHERE r.id = ?
    `, [id]);
    return rows[0];
};

export const createRecurso = async (recurso) => {
    const {
        titulo, tipo, categoria, contenido,
        autor_id, empresa_id,
        archivo_url, video_url, thumbnail_url,
        duracion_segundos, tamano_archivo, formato,
        tiempo_lectura, es_premium, estado, sector
    } = recurso;

    const [result] = await pool.query(
        `INSERT INTO recursos (
            titulo, tipo, categoria, contenido,
            autor_id, empresa_id,
            archivo_url, video_url, thumbnail_url,
            duracion_segundos, tamano_archivo, formato,
            tiempo_lectura, es_premium, estado, sector,
            total_vistas, total_descargas, total_likes,
            fecha_publicacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, NOW())`,
        [
            titulo,
            tipo,
            categoria         || null,
            contenido         || null,
            autor_id          || null,
            empresa_id        || null,
            archivo_url       || null,
            video_url         || null,
            thumbnail_url     || null,
            duracion_segundos || null,
            tamano_archivo    || null,
            formato           || null,
            tiempo_lectura    || null,
            es_premium        ? 1 : 0,
            estado            || 'activo',
            sector            || null
        ]
    );
    return result;
};

export const updateRecurso = async (id, recurso) => {
    const {
        titulo, tipo, categoria, contenido,
        archivo_url, video_url, thumbnail_url,
        duracion_segundos, tamano_archivo, formato,
        tiempo_lectura, es_premium, estado, sector
    } = recurso;

    const [result] = await pool.query(
        `UPDATE recursos SET
            titulo = ?, tipo = ?, categoria = ?, contenido = ?,
            archivo_url = ?, video_url = ?, thumbnail_url = ?,
            duracion_segundos = ?, tamano_archivo = ?, formato = ?,
            tiempo_lectura = ?, es_premium = ?, estado = ?, sector = ?
        WHERE id = ?`,
        [
            titulo,
            tipo,
            categoria         || null,
            contenido         || null,
            archivo_url       || null,
            video_url         || null,
            thumbnail_url     || null,
            duracion_segundos || null,
            tamano_archivo    || null,
            formato           || null,
            tiempo_lectura    || null,
            es_premium        ? 1 : 0,
            estado            || 'activo',
            sector            || null,
            id
        ]
    );
    return result;
};

export const deleteRecurso = async (id) => {
    const [result] = await pool.query('DELETE FROM recursos WHERE id = ?', [id]);
    return result;
};

export const incrementarVistas = async (id) => {
    await pool.query(
        'UPDATE recursos SET total_vistas = total_vistas + 1 WHERE id = ?', [id]
    );
};

export const incrementarDescargas = async (id) => {
    await pool.query(
        'UPDATE recursos SET total_descargas = total_descargas + 1 WHERE id = ?', [id]
    );
};

export const toggleLike = async (id, sumar = true) => {
    await pool.query(
        'UPDATE recursos SET total_likes = total_likes + ? WHERE id = ?',
        [sumar ? 1 : -1, id]
    );
};
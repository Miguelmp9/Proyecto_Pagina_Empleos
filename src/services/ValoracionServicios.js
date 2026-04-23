import { pool } from '../db.js';

export const getValoracionesByUsuario = async (usuario_id) => {
    const [rows] = await pool.query(
        `SELECT v.id, v.calificacion, v.comentario, v.fecha_valoracion, v.likes,
                emp.nombre AS empresa_nombre, emp.logo AS empresa_logo, emp.industria
         FROM valoraciones_empresas v
         JOIN empresas emp ON v.empresa_id = emp.id
         WHERE v.usuario_id = ?
         ORDER BY v.fecha_valoracion DESC`,
        [usuario_id]
    );
    return rows;
};

export const createValoracion = async (usuario_id, empresa_id, calificacion, comentario) => {
    const [result] = await pool.query(
        `INSERT INTO valoraciones_empresas (usuario_id, empresa_id, calificacion, comentario, fecha_valoracion)
         VALUES (?, ?, ?, ?, NOW())`,
        [usuario_id, empresa_id, calificacion, comentario]
    );
    return result;
};

export const deleteValoracion = async (id, usuario_id) => {
    const [result] = await pool.query(
        'DELETE FROM valoraciones_empresas WHERE id = ? AND usuario_id = ?',
        [id, usuario_id]
    );
    return result;
};
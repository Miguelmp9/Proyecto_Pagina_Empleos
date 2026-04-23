import { pool } from '../db.js';

export const getHabilidadesByUsuario = async (usuario_id) => {
    const [rows] = await pool.query(
        `SELECT uh.id, h.nombre, h.categoria, uh.nivel
         FROM usuario_habilidades uh
         JOIN habilidades h ON uh.habilidad_id = h.id
         WHERE uh.usuario_id = ?
         ORDER BY h.nombre ASC`,
        [usuario_id]
    );
    return rows;
};

export const addHabilidadToUsuario = async (usuario_id, nombre_habilidad, nivel) => {
    let [rows] = await pool.query(
        'SELECT id FROM habilidades WHERE nombre = ?', [nombre_habilidad]
    );

    let habilidad_id;
    if (rows.length > 0) {
        habilidad_id = rows[0].id;
    } else {
        const [result] = await pool.query(
            'INSERT INTO habilidades (nombre, categoria) VALUES (?, ?)',
            [nombre_habilidad, 'General']
        );
        habilidad_id = result.insertId;
    }

    const nivelNum = { 'Básico': 1, 'Intermedio': 2, 'Avanzado': 4, 'Experto': 5 }[nivel] || 2;

    const [result] = await pool.query(
        `INSERT INTO usuario_habilidades (usuario_id, habilidad_id, nivel)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE nivel = ?`,
        [usuario_id, habilidad_id, nivelNum, nivelNum]
    );
    return result;
};

export const deleteHabilidadFromUsuario = async (id, usuario_id) => {
    const [result] = await pool.query(
        'DELETE FROM usuario_habilidades WHERE id = ? AND usuario_id = ?',
        [id, usuario_id]
    );
    return result;
};
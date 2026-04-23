import { pool } from '../db.js';

export const getAlertasByUsuario = async (usuario_id) => {
    const [rows] = await pool.query(
        'SELECT * FROM alertas_empleo WHERE usuario_id = ? ORDER BY fecha_creacion DESC',
        [usuario_id]
    );
    return rows;
};

export const createAlerta = async (usuario_id, palabras_clave, ubicacion, frecuencia) => {
    const [result] = await pool.query(
        `INSERT INTO alertas_empleo (usuario_id, palabras_clave, ubicacion, frecuencia, activa, fecha_creacion)
         VALUES (?, ?, ?, ?, TRUE, NOW())`,
        [usuario_id, palabras_clave, ubicacion, frecuencia]
    );
    return result;
};

export const deleteAlerta = async (id, usuario_id) => {
    const [result] = await pool.query(
        'DELETE FROM alertas_empleo WHERE id = ? AND usuario_id = ?',
        [id, usuario_id]
    );
    return result;
};

export const toggleAlerta = async (id, usuario_id, activa) => {
    const [result] = await pool.query(
        'UPDATE alertas_empleo SET activa = ? WHERE id = ? AND usuario_id = ?',
        [activa, id, usuario_id]
    );
    return result;
};
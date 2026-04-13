import { pool } from '../db.js';

// Crear postulacion
export const createPostulacion = async (postulacion) => {
    const { usuario_id, empleo_id, carta_presentacion } = postulacion;
    const [result] = await pool.query(
        `INSERT INTO postulaciones (usuario_id, empleo_id, carta_presentacion)
         VALUES (?, ?, ?)`,
        [usuario_id, empleo_id, carta_presentacion]
    );
    await pool.query(
        'UPDATE empleos SET total_aplicaciones = total_aplicaciones + 1 WHERE id = ?',
        [empleo_id]
    );
    return result;
};

// Obtener postulaciones por empleo
export const getPostulacionesByEmpleo = async (empleo_id) => {
    const [rows] = await pool.query(`
        SELECT p.*, u.nombre_completo, u.email, u.telefono, u.titulo_profesional,
               u.anios_experiencia, u.ubicacion, u.linkedin_url, u.github_url
        FROM postulaciones p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.empleo_id = ?
        ORDER BY p.fecha_aplicacion DESC
    `, [empleo_id]);
    return rows;
};

// Obtener postulaciones por empresa
export const getPostulacionesByEmpresa = async (empresa_id) => {
    const [rows] = await pool.query(`
        SELECT p.*, u.nombre_completo, u.email, u.telefono, u.titulo_profesional,
               u.anios_experiencia, u.ubicacion, e.titulo AS empleo_titulo
        FROM postulaciones p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        INNER JOIN empleos e ON p.empleo_id = e.id
        WHERE e.empresa_id = ?
        ORDER BY p.fecha_aplicacion DESC
    `, [empresa_id]);
    return rows;
};

// Verificar si ya se postuló
export const checkPostulacion = async (usuario_id, empleo_id) => {
    const [rows] = await pool.query(
        'SELECT id FROM postulaciones WHERE usuario_id = ? AND empleo_id = ?',
        [usuario_id, empleo_id]
    );
    return rows[0];
};

// Actualizar estado de postulacion
export const updateEstadoPostulacion = async (id, estado) => {
    const [result] = await pool.query(
        'UPDATE postulaciones SET estado = ? WHERE id = ?',
        [estado, id]
    );
    return result;
};
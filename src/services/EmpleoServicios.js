import { pool } from '../db.js';

// Obtener todos los empleos
export const getAllEmpleos = async () => {
    const [rows] = await pool.query(`
        SELECT e.*, emp.nombre AS empresa_nombre
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        ORDER BY e.fecha_publicacion DESC
    `);
    return rows;
};

// Obtener empleos por empresa
export const getEmpleosByEmpresa = async (empresa_id) => {
    const [rows] = await pool.query(`
        SELECT * FROM empleos WHERE empresa_id = ?
        ORDER BY fecha_publicacion DESC
    `, [empresa_id]);
    return rows;
};

// Obtener empleo por ID
export const getEmpleoById = async (id) => {
    const [rows] = await pool.query(`
        SELECT e.*, emp.nombre AS empresa_nombre, emp.logo AS empresa_logo
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        WHERE e.id = ?
    `, [id]);
    return rows[0];
};

// Crear empleo
export const createEmpleo = async (empleo) => {
    const {
        empresa_id, titulo, descripcion, responsabilidades, requisitos,
        requisitos_deseables, beneficios, ubicacion, tipo_contrato,
        nivel_experiencia, sector, rango_salarial_min, rango_salarial_max,
        email_contacto, fecha_cierre
    } = empleo;

    const [result] = await pool.query(
        `INSERT INTO empleos (
            empresa_id, titulo, descripcion, responsabilidades, requisitos,
            requisitos_deseables, beneficios, ubicacion, tipo_contrato,
            nivel_experiencia, sector, rango_salarial_min, rango_salarial_max,
            email_contacto, estado, fecha_publicacion, fecha_cierre
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW(), ?)`,
        [
            empresa_id, titulo, descripcion, responsabilidades, requisitos,
            requisitos_deseables, beneficios, ubicacion, tipo_contrato,
            nivel_experiencia, sector, rango_salarial_min, rango_salarial_max,
            email_contacto, fecha_cierre
        ]
    );
    return result;
};

// Actualizar empleo
export const updateEmpleo = async (id, empleo) => {
    const {
        titulo, descripcion, responsabilidades, requisitos,
        requisitos_deseables, beneficios, ubicacion, tipo_contrato,
        nivel_experiencia, sector, rango_salarial_min, rango_salarial_max,
        email_contacto, estado, fecha_cierre
    } = empleo;

    const [result] = await pool.query(
        `UPDATE empleos SET
            titulo = ?, descripcion = ?, responsabilidades = ?, requisitos = ?,
            requisitos_deseables = ?, beneficios = ?, ubicacion = ?, tipo_contrato = ?,
            nivel_experiencia = ?, sector = ?, rango_salarial_min = ?, rango_salarial_max = ?,
            email_contacto = ?, estado = ?, fecha_cierre = ?
        WHERE id = ?`,
        [
            titulo, descripcion, responsabilidades, requisitos,
            requisitos_deseables, beneficios, ubicacion, tipo_contrato,
            nivel_experiencia, sector, rango_salarial_min, rango_salarial_max,
            email_contacto, estado, fecha_cierre, id
        ]
    );
    return result;
};

// Eliminar empleo
export const deleteEmpleo = async (id) => {
    const [result] = await pool.query('DELETE FROM empleos WHERE id = ?', [id]);
    return result;
};

// Stats de empresa
export const getStatsByEmpresa = async (empresa_id) => {
    const [[stats]] = await pool.query(`
        SELECT 
            COUNT(*) AS empleos_activos,
            SUM(total_aplicaciones) AS aplicaciones_totales,
            SUM(total_vistas) AS vistas_totales
        FROM empleos
        WHERE empresa_id = ? AND estado = 'activo'
    `, [empresa_id]);
    return stats;
};
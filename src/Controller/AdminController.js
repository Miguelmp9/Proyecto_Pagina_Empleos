import { pool } from '../db.js';

export const getStats = async (req, res) => {
    try {
        const [[{ total_usuarios }]] = await pool.query('SELECT COUNT(*) AS total_usuarios FROM usuarios');
        const [[{ total_empresas }]] = await pool.query('SELECT COUNT(*) AS total_empresas FROM empresas');
        const [[{ total_empleos }]] = await pool.query('SELECT COUNT(*) AS total_empleos FROM empleos');
        const [[{ total_postulaciones }]] = await pool.query('SELECT COUNT(*) AS total_postulaciones FROM postulaciones');

        res.json({ total_usuarios, total_empresas, total_empleos, total_postulaciones });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
};

export const getUsuariosRecientes = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, nombre_completo, email, fecha_registro, estado FROM usuarios ORDER BY fecha_registro DESC LIMIT 5'
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios recientes' });
    }
};

export const getEmpresasRecientes = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.id, e.nombre, e.industria, e.verificada,
                (SELECT COUNT(*) FROM empleos emp WHERE emp.empresa_id = e.id) AS total_empleos
            FROM empresas e
            ORDER BY e.fecha_registro DESC LIMIT 5
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empresas recientes' });
    }
};

export const getEmpleosPorCategoria = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT sector AS categoria, COUNT(*) AS total
            FROM empleos
            GROUP BY sector
            ORDER BY total DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empleos por categoría' });
    }
};

export const getCrecimiento = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                DATE_FORMAT(fecha_registro, '%Y-%m') AS mes,
                COUNT(*) AS total
            FROM usuarios
            GROUP BY mes
            ORDER BY mes ASC
            LIMIT 6
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener crecimiento' });
    }
};
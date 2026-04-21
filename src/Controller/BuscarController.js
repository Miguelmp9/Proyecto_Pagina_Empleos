import { pool } from '../db.js';

const index = async (req, res) => {
    try {
        const { q, ubicacion, nivel, sector, tipo } = req.query;

        let query = `
            SELECT e.*, emp.nombre AS empresa_nombre, emp.logo AS empresa_logo
            FROM empleos e
            INNER JOIN empresas emp ON e.empresa_id = emp.id
            WHERE e.estado = 'activo'
        `;
        const params = [];

        if (q) {
            query += ' AND (e.titulo LIKE ? OR e.descripcion LIKE ? OR e.requisitos LIKE ?)';
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }

        if (ubicacion) {
            query += ' AND e.ubicacion LIKE ?';
            params.push(`%${ubicacion}%`);
        }

        if (nivel) {
            query += ' AND e.nivel_experiencia = ?';
            params.push(nivel);
        }

        if (sector) {
            query += ' AND e.sector = ?';
            params.push(sector);
        }

        if (tipo) {
            query += ' AND e.tipo_contrato = ?';
            params.push(tipo);
        }

        query += ' ORDER BY e.fecha_publicacion DESC';

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar empleos' });
    }
};

const obtenerFiltros = async (req, res) => {
    try {
        const [niveles] = await pool.query('SELECT DISTINCT nivel_experiencia FROM empleos WHERE estado = "activo"');
        const [sectores] = await pool.query('SELECT DISTINCT sector FROM empleos WHERE estado = "activo"');
        const [tipos] = await pool.query('SELECT DISTINCT tipo_contrato FROM empleos WHERE estado = "activo"');
        const [ubicaciones] = await pool.query('SELECT DISTINCT ubicacion FROM empleos WHERE estado = "activo"');

        res.json({
            niveles: niveles.map(r => r.nivel_experiencia),
            sectores: sectores.map(r => r.sector),
            tipos: tipos.map(r => r.tipo_contrato),
            ubicaciones: ubicaciones.map(r => r.ubicacion)
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener filtros' });
    }
};

const sugerencias = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.length < 2) return res.json([]);

        const [rows] = await pool.query(`
            SELECT DISTINCT titulo AS sugerencia
            FROM empleos
            WHERE estado = 'activo' AND titulo LIKE ?
            LIMIT 10
        `, [`%${q}%`]);

        res.json(rows.map(r => r.sugerencia));
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener sugerencias' });
    }
};

const empleosGuardados = async (req, res) => {
    try {
        const usuario_id = req.session?.usuario_id || req.body.usuario_id; // Assuming session or body

        const [rows] = await pool.query(`
            SELECT e.*, emp.nombre AS empresa_nombre, emp.logo AS empresa_logo, eg.fecha_guardado
            FROM empleos_guardados eg
            INNER JOIN empleos e ON eg.empleo_id = e.id
            INNER JOIN empresas emp ON e.empresa_id = emp.id
            WHERE eg.usuario_id = ?
            ORDER BY eg.fecha_guardado DESC
        `, [usuario_id]);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener empleos guardados' });
    }
};

const detalle = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await pool.query(`
            SELECT e.*, emp.nombre AS empresa_nombre, emp.logo AS empresa_logo, emp.descripcion AS empresa_desc
            FROM empleos e
            INNER JOIN empresas emp ON e.empresa_id = emp.id
            WHERE e.id = ?
        `, [id]);

        if (rows.length === 0) return res.status(404).json({ error: 'Empleo no encontrado' });

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener detalle del empleo' });
    }
};

const guardarEmpleo = async (req, res) => {
    try {
        const { empleoId } = req.params;
        const { usuario_id } = req.body;

        // Check if already saved
        const [existing] = await pool.query(
            'SELECT id FROM empleos_guardados WHERE usuario_id = ? AND empleo_id = ?',
            [usuario_id, empleoId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Empleo ya guardado' });
        }

        await pool.query(
            'INSERT INTO empleos_guardados (usuario_id, empleo_id) VALUES (?, ?)',
            [usuario_id, empleoId]
        );

        res.json({ mensaje: 'Empleo guardado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el empleo' });
    }
};

module.exports = {
    index,
    obtenerFiltros,
    sugerencias,
    empleosGuardados,
    detalle,
    guardarEmpleo
};
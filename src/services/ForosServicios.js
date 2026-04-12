import { pool } from '../db.js';

// ── CATEGORÍAS ────────────────────────────────────────────────

export const getAllCategorias = async () => {
    const [rows] = await pool.query('SELECT * FROM foros_categorias ORDER BY nombre ASC');
    return rows;
};

// ── DISCUSIONES ───────────────────────────────────────────────

export const getAllDiscusiones = async (categoria_id = null, orden = 'reciente') => {
    let query = `
        SELECT 
            d.id,
            d.titulo,
            d.destacado,
            d.total_respuestas,
            d.total_likes,
            d.total_vistas,
            d.fecha_creacion,
            u.nombre_completo AS autor,
            u.titulo_profesional AS titulo_pro,
            c.nombre AS categoria,
            c.id AS categoria_id
        FROM discusiones d
        JOIN usuarios u ON d.usuario_id = u.id
        JOIN foros_categorias c ON d.categoria_id = c.id
    `;

    const params = [];
    if (categoria_id) {
        query += ' WHERE d.categoria_id = ?';
        params.push(categoria_id);
    }

    const ordenes = {
        reciente:  'd.fecha_creacion DESC',
        popular:   'd.total_likes DESC',
        comentado: 'd.total_respuestas DESC',
        visto:     'd.total_vistas DESC'
    };
    query += ` ORDER BY ${ordenes[orden] || ordenes.reciente}`;

    const [rows] = await pool.query(query, params);
    return rows;
};

export const getDiscusionById = async (id) => {
    const [rows] = await pool.query(`
        SELECT 
            d.id,
            d.titulo,
            d.contenido,
            d.destacado,
            d.total_respuestas,
            d.total_likes,
            d.total_vistas,
            d.fecha_creacion,
            u.id AS usuario_id,
            u.nombre_completo AS autor,
            u.titulo_profesional AS titulo_pro,
            c.nombre AS categoria,
            c.id AS categoria_id
        FROM discusiones d
        JOIN usuarios u ON d.usuario_id = u.id
        JOIN foros_categorias c ON d.categoria_id = c.id
        WHERE d.id = ?
    `, [id]);
    return rows[0] || null;
};

export const createDiscusion = async (datos) => {
    const { usuario_id, categoria_id, titulo, contenido } = datos;
    const [result] = await pool.query(`
        INSERT INTO discusiones (usuario_id, categoria_id, titulo, contenido)
        VALUES (?, ?, ?, ?)
    `, [usuario_id, categoria_id, titulo, contenido]);

    await pool.query(`
        UPDATE foros_categorias 
        SET total_discusiones = total_discusiones + 1 
        WHERE id = ?
    `, [categoria_id]);

    return result;
};

export const incrementarVistas = async (id) => {
    await pool.query(
        'UPDATE discusiones SET total_vistas = total_vistas + 1 WHERE id = ?',
        [id]
    );
};

export const likeDiscusion = async (id) => {
    const [result] = await pool.query(
        'UPDATE discusiones SET total_likes = total_likes + 1 WHERE id = ?',
        [id]
    );
    return result;
};

export const deleteDiscusion = async (id) => {
    const [result] = await pool.query('DELETE FROM discusiones WHERE id = ?', [id]);
    return result;
};

// ── ETIQUETAS ─────────────────────────────────────────────────

export const getEtiquetasByDiscusion = async (discusion_id) => {
    const [rows] = await pool.query(`
        SELECT e.id, e.nombre
        FROM discusion_etiquetas de
        JOIN etiquetas e ON de.etiqueta_id = e.id
        WHERE de.discusion_id = ?
    `, [discusion_id]);
    return rows;
};

export const addEtiquetasToDiscusion = async (discusion_id, etiquetas) => {
    for (const nombre of etiquetas) {
        let [rows] = await pool.query('SELECT id FROM etiquetas WHERE nombre = ?', [nombre]);
        let etiqueta_id;

        if (rows.length === 0) {
            const [result] = await pool.query('INSERT INTO etiquetas (nombre) VALUES (?)', [nombre]);
            etiqueta_id = result.insertId;
        } else {
            etiqueta_id = rows[0].id;
        }

        await pool.query(`
            INSERT IGNORE INTO discusion_etiquetas (discusion_id, etiqueta_id)
            VALUES (?, ?)
        `, [discusion_id, etiqueta_id]);
    }
};

// ── RESPUESTAS ────────────────────────────────────────────────

export const getRespuestasByDiscusion = async (discusion_id) => {
    const [rows] = await pool.query(`
        SELECT 
            r.id,
            r.contenido,
            r.total_likes,
            r.fecha_creacion,
            u.nombre_completo AS autor,
            u.titulo_profesional AS titulo_pro
        FROM respuestas_foro r
        JOIN usuarios u ON r.usuario_id = u.id
        WHERE r.discusion_id = ?
        ORDER BY r.fecha_creacion ASC
    `, [discusion_id]);
    return rows;
};

export const createRespuesta = async (datos) => {
    const { discusion_id, usuario_id, contenido } = datos;
    const [result] = await pool.query(`
        INSERT INTO respuestas_foro (discusion_id, usuario_id, contenido)
        VALUES (?, ?, ?)
    `, [discusion_id, usuario_id, contenido]);

    await pool.query(`
        UPDATE discusiones 
        SET total_respuestas = total_respuestas + 1 
        WHERE id = ?
    `, [discusion_id]);

    return result;
};

export const likeRespuesta = async (id) => {
    const [result] = await pool.query(
        'UPDATE respuestas_foro SET total_likes = total_likes + 1 WHERE id = ?',
        [id]
    );
    return result;
};

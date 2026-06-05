import { pool } from '../db.js';
 
// Obtener todas las empresas
export const getAllEmpresas = async () => {
    const [rows] = await pool.query(`
        SELECT e.*, 
            (SELECT COUNT(*) FROM empleos emp WHERE emp.empresa_id = e.id) AS total_empleos
        FROM empresas e
        ORDER BY e.fecha_registro DESC
    `);
    return rows;
};
 
// Obtener empresa por ID
export const getEmpresaById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM empresas WHERE id = ?', [id]);
    return rows[0];
};
 
// Obtener empresa por email
export const getEmpresaByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM empresas WHERE email = ?', [email]);
    return rows[0];
};
 
// Obtener empresa por usuario_id
export const getEmpresaByUsuarioId = async (usuario_id) => {
    const [rows] = await pool.query('SELECT * FROM empresas WHERE usuario_id = ?', [usuario_id]);
    return rows[0];
};
 
// Crear empresa
export const createEmpresa = async (empresa) => {
    const {
        nombre, email, contrasena, industria, tamano,
        ubicacion, descripcion, logo, sitio_web
    } = empresa;
 
    const [result] = await pool.query(
        `INSERT INTO empresas (
            nombre, email, contrasena, industria, tamano,
            ubicacion, descripcion, logo, sitio_web,
            verificada, calificacion_promedio, total_valoraciones, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, 0.00, 0, NOW())`,
        [nombre, email, contrasena, industria, tamano, ubicacion, descripcion, logo, sitio_web]
    );
    return result;
};
 
//  Actualizar empresa — solo actualiza los campos que existen en la tabla
export const updateEmpresa = async (id, datos) => {
    // Columnas disponibles en la tabla empresas
    const camposPermitidos = [
        'nombre', 'email', 'ubicacion', 'descripcion',
        'sitio_web', 'industria', 'tamano', 'logo',
        'telefono', 'linkedin_url', 'disponibilidad', 'sector_preferido'
    ];
 
    const setClauses = [];
    const valores = [];
 
    for (const campo of camposPermitidos) {
        if (datos[campo] !== undefined) {
            setClauses.push(`${campo} = ?`);
            valores.push(datos[campo]);
        }
    }
 
    // - Si viene contraseña nueva, también la actualizamos
    if (datos.contrasena) {
        setClauses.push('contrasena = ?');
        valores.push(datos.contrasena);
    }
 
    if (setClauses.length === 0) {
        return { affectedRows: 0 };
    }
 
    valores.push(id);
 
    const [result] = await pool.query(
        `UPDATE empresas SET ${setClauses.join(', ')} WHERE id = ?`,
        valores
    );
    return result;
};
 
//  - Eliminar empresa
export const deleteEmpresa = async (id) => {
    const [result] = await pool.query('DELETE FROM empresas WHERE id = ?', [id]);
    return result;
};
 
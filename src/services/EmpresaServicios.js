import { pool } from '../db.js';

// Obtener todas las empresas
export const getAllEmpresas = async () => {
    const [rows] = await pool.query('SELECT * FROM empresas');
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

// Actualizar empresa
export const updateEmpresa = async (id, empresa) => {
    const {
        nombre, email, contrasena, industria, tamano,
        ubicacion, descripcion, logo, sitio_web
    } = empresa;

    const [result] = await pool.query(
        `UPDATE empresas SET
            nombre = ?, email = ?, industria = ?, tamano = ?,
            ubicacion = ?, descripcion = ?, logo = ?, sitio_web = ?
            ${contrasena ? ', contrasena = ?' : ''}
        WHERE id = ?`,
        contrasena
            ? [nombre, email, industria, tamano, ubicacion, descripcion, logo, sitio_web, contrasena, id]
            : [nombre, email, industria, tamano, ubicacion, descripcion, logo, sitio_web, id]
    );
    return result;
};

// Eliminar empresa
export const deleteEmpresa = async (id) => {
    const [result] = await pool.query('DELETE FROM empresas WHERE id = ?', [id]);
    return result;
};
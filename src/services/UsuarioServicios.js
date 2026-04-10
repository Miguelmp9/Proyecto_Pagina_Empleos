import { pool } from '../db.js';

// Obtener todos los usuarios
export const getAllUsuarios = async () => {
    const [rows] = await pool.query('SELECT * FROM usuarios');
    return rows;
};

// Obtener usuario por ID
export const getUsuarioById = async (id) => {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    return rows[0];
};

// Obtener usuario por email
export const getUsuarioByEmail = async (email) => {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    return rows[0];
};

// Buscar por nombre
export const getUsuarioByNombre = async (nombre) => {
    const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE nombre_completo LIKE ?', [`%${nombre}%`]
    );
    return rows;
};

// Buscar por sector preferido
export const getUsuarioBySector = async (sector) => {
    const [rows] = await pool.query(
        'SELECT * FROM usuarios WHERE sector_preferido = ?', [sector]
    );
    return rows;
};

// Crear usuario
export const createUsuario = async (usuario) => {
    const {
        nombre_completo, contrasena, email, telefono, ubicacion, titulo_profesional,
        anios_experiencia, sobre_mi, foto_perfil, foto_portada, linkedin_url,
        github_url, sitio_web, tipo_empleo_deseado, rango_salarial_esperado,
        disponibilidad, sector_preferido, perfil_publico, mostrar_email,
        recibir_notificaciones, estado
    } = usuario;

    const [result] = await pool.query(
        `INSERT INTO usuarios (
            nombre_completo, contrasena, email, telefono, ubicacion, titulo_profesional,
            anios_experiencia, sobre_mi, foto_perfil, foto_portada, linkedin_url,
            github_url, sitio_web, tipo_empleo_deseado, rango_salarial_esperado,
            disponibilidad, sector_preferido, perfil_publico, mostrar_email,
            recibir_notificaciones, fecha_registro, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
        [
            nombre_completo, contrasena, email, telefono, ubicacion, titulo_profesional,
            anios_experiencia, sobre_mi, foto_perfil, foto_portada, linkedin_url,
            github_url, sitio_web, tipo_empleo_deseado, rango_salarial_esperado,
            disponibilidad, sector_preferido, perfil_publico, mostrar_email,
            recibir_notificaciones, estado
        ]
    );
    return result;
};

// Actualizar usuario
export const updateUsuario = async (id, usuario) => {
    const {
        nombre_completo, contrasena, email, telefono, ubicacion, titulo_profesional,
        anios_experiencia, sobre_mi, foto_perfil, foto_portada, linkedin_url,
        github_url, sitio_web, tipo_empleo_deseado, rango_salarial_esperado,
        disponibilidad, sector_preferido, perfil_publico, mostrar_email,
        recibir_notificaciones, estado
    } = usuario;

    const [result] = await pool.query(
        `UPDATE usuarios SET
            nombre_completo = ?, contrasena = ?, email = ?, telefono = ?, ubicacion = ?,
            titulo_profesional = ?, anios_experiencia = ?, sobre_mi = ?,
            foto_perfil = ?, foto_portada = ?, linkedin_url = ?, github_url = ?,
            sitio_web = ?, tipo_empleo_deseado = ?, rango_salarial_esperado = ?,
            disponibilidad = ?, sector_preferido = ?, perfil_publico = ?,
            mostrar_email = ?, recibir_notificaciones = ?, estado = ?
        WHERE id = ?`,
        [
            nombre_completo, contrasena, email, telefono, ubicacion, titulo_profesional,
            anios_experiencia, sobre_mi, foto_perfil, foto_portada, linkedin_url,
            github_url, sitio_web, tipo_empleo_deseado, rango_salarial_esperado,
            disponibilidad, sector_preferido, perfil_publico, mostrar_email,
            recibir_notificaciones, estado, id
        ]
    );
    return result;
};

// Eliminar usuario
export const deleteUsuario = async (id) => {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    return result;
};
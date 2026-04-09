import * as usuariosServices from '../services/UsuarioServicios.js';

// Obtener todos los usuarios
export const getTodosLosUsuarios = async (req, res) => {
    try {
        const usuarios = await usuariosServices.getAllUsuarios();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
};

// Obtener usuario por ID
export const getUsuarioPorId = async (req, res) => {
    try {
        const usuario = await usuariosServices.getUsuarioById(req.params.id);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

// Obtener usuario por email
export const getUsuarioPorEmail = async (req, res) => {
    try {
        const usuario = await usuariosServices.getUsuarioByEmail(req.params.email);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el usuario' });
    }
};

// Buscar por nombre
export const getUsuarioPorNombre = async (req, res) => {
    try {
        const usuarios = await usuariosServices.getUsuarioByNombre(req.params.nombre);
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar usuarios' });
    }
};

// Buscar por sector
export const getUsuarioPorSector = async (req, res) => {
    try {
        const usuarios = await usuariosServices.getUsuarioBySector(req.params.sector);
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar usuarios por sector' });
    }
};

// Crear usuario
export const postCrearUsuario = async (req, res) => {
    try {
        const result = await usuariosServices.createUsuario(req.body);
        res.status(201).json({ mensaje: 'Usuario creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

// Actualizar usuario
export const putActualizarUsuario = async (req, res) => {
    try {
        const result = await usuariosServices.updateUsuario(req.params.id, req.body);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el usuario' });
    }
};

// Eliminar usuario
export const deleteEliminarUsuario = async (req, res) => {
    try {
        const result = await usuariosServices.deleteUsuario(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el usuario' });
    }
};
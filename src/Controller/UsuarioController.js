import * as usuariosServices from '../services/UsuarioServicios.js';
import bcrypt from 'bcrypt';

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
        const { contrasena, ...resto } = req.body;

        // Encriptamos la contraseña antes de guardar
        const contrasenaHash = await bcrypt.hash(contrasena, 10);

        const result = await usuariosServices.createUsuario({ ...resto, contrasena: contrasenaHash });
        res.status(201).json({ mensaje: 'Usuario creado', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
};

// Actualizar usuario
export const putActualizarUsuario = async (req, res) => {
    try {
        const { contrasena, ...resto } = req.body;
        let datos = resto;

        // Si manda nueva contraseña la encriptamos
        if (contrasena) {
            const contrasenaHash = await bcrypt.hash(contrasena, 10);
            datos = { ...resto, contrasena: contrasenaHash };
        }

        const result = await usuariosServices.updateUsuario(req.params.id, datos);
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

// Login
export const postLogin = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        const usuario = await usuariosServices.getUsuarioByEmail(email);
        if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

        const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!contrasenaValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

        res.json({ 
            mensaje: 'Login exitoso', 
            usuario: { 
                id: usuario.id, 
                nombre_completo: usuario.nombre_completo, 
                email: usuario.email,
                rol: usuario.rol
            } 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};
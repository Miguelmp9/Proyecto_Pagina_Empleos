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
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuracion de multer para fotos
const storageFoto = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../contenido_multimedia'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `foto_${req.params.id}_${Date.now()}${ext}`);
    }
});

// Configuracion de multer para CV
const storageCV = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../contenido_multimedia'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `cv_${req.params.id}_${Date.now()}${ext}`);
    }
});

const uploadFoto = multer({ storage: storageFoto });
const uploadCV = multer({ storage: storageCV });

// Subir foto de perfil
export const postSubirFoto = [
    uploadFoto.single('foto'),
    async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
            const foto_perfil = req.file.filename;
            await usuariosServices.updateUsuario(req.params.id, { foto_perfil });
            res.json({ mensaje: 'Foto actualizada', foto_perfil });
        } catch (error) {
            res.status(500).json({ error: 'Error al subir la foto' });
        }
    }
];

// Subir CV
export const postSubirCV = [
    uploadCV.single('cv'),
    async (req, res) => {
        try {
            if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
            const cv_url = req.file.filename;
            res.json({ mensaje: 'CV actualizado', cv_url, nombre_archivo: req.file.originalname });
        } catch (error) {
            res.status(500).json({ error: 'Error al subir el CV' });
        }
    }
];
// Registrar visita al perfil
export const postRegistrarVisita = async (req, res) => {
    try {
        await usuariosServices.incrementarVisitas(req.params.id);
        res.json({ mensaje: 'Visita registrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar visita' });
    }
};
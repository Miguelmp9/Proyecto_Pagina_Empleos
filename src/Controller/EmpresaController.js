import * as empresaServicios from '../services/EmpresaServicios.js';
import bcrypt from 'bcrypt';

// Obtener todas las empresas
export const getTodasLasEmpresas = async (req, res) => {
    try {
        const empresas = await empresaServicios.getAllEmpresas();
        res.json(empresas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las empresas' });
    }
};

// Obtener empresa por ID
export const getEmpresaPorId = async (req, res) => {
    try {
        const empresa = await empresaServicios.getEmpresaById(req.params.id);
        if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la empresa' });
    }
};

// Obtener empresa por usuario_id
export const getEmpresaPorUsuario = async (req, res) => {
    try {
        const empresa = await empresaServicios.getEmpresaByUsuarioId(req.params.usuario_id);
        if (!empresa) return res.status(404).json({ error: 'No tiene empresa registrada' });
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener la empresa' });
    }
};

// Crear empresa
export const postCrearEmpresa = async (req, res) => {
    try {
        const { contrasena, ...resto } = req.body;
        const contrasenaHash = await bcrypt.hash(contrasena, 10);
        const result = await empresaServicios.createEmpresa({ ...resto, contrasena: contrasenaHash });
        res.status(201).json({ mensaje: 'Empresa creada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la empresa' });
    }
};

// Actualizar empresa
export const putActualizarEmpresa = async (req, res) => {
    try {
        const { contrasena, ...resto } = req.body;
        let datos = resto;

        if (contrasena) {
            const contrasenaHash = await bcrypt.hash(contrasena, 10);
            datos = { ...resto, contrasena: contrasenaHash };
        }

        const result = await empresaServicios.updateEmpresa(req.params.id, datos);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
        res.json({ mensaje: 'Empresa actualizada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la empresa' });
    }
};

// Eliminar empresa
export const deleteEliminarEmpresa = async (req, res) => {
    try {
        const result = await empresaServicios.deleteEmpresa(req.params.id);
        if (result.affectedRows === 0) return res.status(404).json({ error: 'Empresa no encontrada' });
        res.json({ mensaje: 'Empresa eliminada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la empresa' });
    }
};

// Login empresa
export const postLoginEmpresa = async (req, res) => {
    try {
        const { email, contrasena } = req.body;

        const empresa = await empresaServicios.getEmpresaByEmail(email);
        if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

        const contrasenaValida = await bcrypt.compare(contrasena, empresa.contrasena);
        if (!contrasenaValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

        res.json({
            mensaje: 'Login exitoso',
            empresa: {
                id: empresa.id,
                nombre: empresa.nombre,
                email: empresa.email,
                rol: 'empresa'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};
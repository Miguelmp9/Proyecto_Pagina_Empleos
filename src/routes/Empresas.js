import { Router } from 'express';
import * as empresaController from '../Controller/EmpresaController.js';

const router = Router();

// Buscar empresa por usuario_id (debe ir ANTES de /:id)
router.get('/por-usuario/:usuario_id', empresaController.getEmpresaPorUsuario);

// Obtener todas las empresas
router.get('/', empresaController.getTodasLasEmpresas);

// Obtener empresa por ID
router.get('/:id', empresaController.getEmpresaPorId);

// Login empresa
router.post('/login', empresaController.postLoginEmpresa);

// Crear empresa
router.post('/', empresaController.postCrearEmpresa);

// Actualizar empresa
router.put('/:id', empresaController.putActualizarEmpresa);

// Eliminar empresa
router.delete('/:id', empresaController.deleteEliminarEmpresa);

export default router;
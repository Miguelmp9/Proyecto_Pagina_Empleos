import { Router } from 'express';
import * as empresaController from '../Controller/EmpresaController.js';

const router = Router();

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
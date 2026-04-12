import { Router } from 'express';
import * as empleoController from '../Controller/EmpleoController.js';

const router = Router();

router.get('/', empleoController.getTodosLosEmpleos);
router.get('/empresa/:empresa_id', empleoController.getEmpleosPorEmpresa);
router.get('/stats/:empresa_id', empleoController.getStatsPorEmpresa);
router.get('/:id', empleoController.getEmpleoPorId);
router.post('/', empleoController.postCrearEmpleo);
router.put('/:id', empleoController.putActualizarEmpleo);
router.delete('/:id', empleoController.deleteEliminarEmpleo);

export default router;
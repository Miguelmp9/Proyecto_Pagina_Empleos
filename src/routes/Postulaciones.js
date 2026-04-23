import { Router } from 'express';
import * as postulacionController from '../Controller/PostulacionController.js';

const router = Router();

router.post('/', postulacionController.postCrearPostulacion);
router.get('/empleo/:empleo_id', postulacionController.getPostulacionesPorEmpleo);
router.get('/empresa/:empresa_id', postulacionController.getPostulacionesPorEmpresa);
router.put('/:id', postulacionController.putActualizarEstado);
router.get('/usuario/:usuario_id', postulacionController.getPostulacionesPorUsuario);
router.delete('/:id', postulacionController.deletePostulacion);

export default router;
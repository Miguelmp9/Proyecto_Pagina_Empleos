import { Router } from 'express';
import * as valoracionController from '../Controller/ValoracionController.js';

const router = Router();

router.get('/usuario/:usuario_id', valoracionController.getValoracionesByUsuario);
router.post('/', valoracionController.postCrearValoracion);
router.delete('/:id', valoracionController.deleteValoracion);

export default router;
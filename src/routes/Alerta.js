import { Router } from 'express';
import * as alertaController from '../Controller/AlertaController.js';

const router = Router();

router.get('/usuario/:usuario_id', alertaController.getAlertasByUsuario);
router.post('/', alertaController.postCrearAlerta);
router.delete('/:id', alertaController.deleteAlerta);
router.patch('/:id/toggle', alertaController.toggleAlerta);

export default router;
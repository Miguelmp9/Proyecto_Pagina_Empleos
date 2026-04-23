import { Router } from 'express';
import * as habilidadController from '../Controller/HabilidadController.js';

const router = Router();

router.get('/usuario/:usuario_id', habilidadController.getHabilidadesByUsuario);
router.post('/usuario', habilidadController.postAgregarHabilidad);
router.delete('/usuario/:id', habilidadController.deleteHabilidad);

export default router;
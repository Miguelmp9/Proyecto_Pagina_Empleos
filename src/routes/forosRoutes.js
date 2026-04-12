import { Router } from 'express';
import * as forosController from '../Controller/ForosController.js';

const router = Router();

// ── CATEGORÍAS ────────────────────────────────────────────────
// GET /foros/categorias
router.get('/categorias', forosController.getCategorias);

// ── DISCUSIONES ───────────────────────────────────────────────
// GET /foros?categoria_id=1&orden=reciente
router.get('/', forosController.getDiscusiones);

// GET /foros/:id
router.get('/:id', forosController.getDiscusion);

// POST /foros
router.post('/', forosController.postDiscusion);

// POST /foros/:id/like
router.post('/:id/like', forosController.postLikeDiscusion);

// DELETE /foros/:id
router.delete('/:id', forosController.deleteDiscusion);

// ── RESPUESTAS ────────────────────────────────────────────────
// GET /foros/:id/respuestas
router.get('/:id/respuestas', forosController.getRespuestas);

// POST /foros/:id/respuestas
router.post('/:id/respuestas', forosController.postRespuesta);

// POST /foros/respuestas/:id/like
router.post('/respuestas/:id/like', forosController.postLikeRespuesta);

export default router;

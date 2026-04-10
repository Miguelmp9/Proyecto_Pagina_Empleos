// src/routes/Buscar.js
import express from 'express';
import BuscarController from '../Controller/BuscarController.js';

const router = express.Router();

router.get('/', BuscarController.index);
router.get('/filtros', BuscarController.obtenerFiltros);
router.get('/sugerencias', BuscarController.sugerencias);
router.get('/empleo/:id', BuscarController.detalle);
router.get('/guardados', BuscarController.empleosGuardados);
router.post('/guardar/:empleoId', BuscarController.guardarEmpleo);

export default router;
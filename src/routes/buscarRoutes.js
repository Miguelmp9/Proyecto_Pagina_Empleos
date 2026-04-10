const express = require('express');
const router  = express.Router();
const BuscarController = require('../Controller/BuscarController');

// GET  /api/buscar?q=react&ubicacion=san+salvador&nivel=Senior
router.get('/',                   BuscarController.index);

// GET  /api/buscar/filtros
router.get('/filtros',            BuscarController.obtenerFiltros);

// GET  /api/buscar/sugerencias?q=react
router.get('/sugerencias',        BuscarController.sugerencias);

// GET  /api/buscar/guardados  (requiere sesión)
router.get('/guardados',          BuscarController.empleosGuardados);

// GET  /api/buscar/empleo/:id
router.get('/empleo/:id',         BuscarController.detalle);

// POST /api/buscar/guardar/:empleoId  (requiere sesión)
router.post('/guardar/:empleoId', BuscarController.guardarEmpleo);

module.exports = router;

import { Router } from 'express';
import * as adminController from '../Controller/AdminController.js';
 
const router = Router();
 
router.get('/stats', adminController.getStats);
router.get('/usuarios-recientes', adminController.getUsuariosRecientes);
router.get('/empresas-recientes', adminController.getEmpresasRecientes);
router.get('/empleos-por-categoria', adminController.getEmpleosPorCategoria);
router.get('/crecimiento', adminController.getCrecimiento);
export default router;
import { Router } from 'express';
import * as adminController from '../Controller/AdminController.js';
 
const router = Router();
 
router.get('/stats', adminController.getStats);
router.get('/usuarios-recientes', adminController.getUsuariosRecientes);
router.get('/empresas-recientes', adminController.getEmpresasRecientes);
 
export default router;
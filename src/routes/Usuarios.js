import { Router } from 'express';
import * as usuariosController from '../Controller/UsuarioController.js';

const router = Router();

// Obtener todos los usuarios
router.get('/', usuariosController.getTodosLosUsuarios);

// Obtener usuario por ID
router.get('/:id', usuariosController.getUsuarioPorId);

// Obtener usuario por email
router.get('/buscarPorEmail/:email', usuariosController.getUsuarioPorEmail);

// Buscar usuarios por nombre
router.get('/buscarPorNombre/:nombre', usuariosController.getUsuarioPorNombre);

// Buscar usuarios por sector preferido
router.get('/buscarPorSector/:sector', usuariosController.getUsuarioPorSector);

// Crear usuario
router.post('/', usuariosController.postCrearUsuario);

// Actualizar usuario
router.put('/:id', usuariosController.putActualizarUsuario);

// Eliminar usuario
router.delete('/:id', usuariosController.deleteEliminarUsuario);

export default router;
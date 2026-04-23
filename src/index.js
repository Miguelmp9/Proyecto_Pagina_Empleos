import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import UsuarioRoutes from './routes/Usuarios.js';
import ForosRoutes from './routes/forosRoutes.js';
import EmpresaRoutes from './routes/Empresas.js';
import EmpleoRoutes from './routes/Empleos.js';
import PostulacionRoutes from './routes/Postulaciones.js';
import ValoracionRoutes from './routes/Valoracion.js';
import AlertaRoutes from './routes/Alerta.js';
import HabilidadRoutes from './routes/Habilidades.js';
import AdminRoutes from './routes/admin.js';        // ← AGREGADO

import { errorHandler } from './Middlewares/errorhandler.js';
import RecursoRoutes from './routes/Recursos.js';

import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors());

// Servir archivos estaticos
app.use(express.static(path.join(__dirname, '../html')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/contenido_multimedia', express.static(path.join(__dirname, '../contenido_multimedia')));

// Rutas
app.use('/usuarios', UsuarioRoutes);
app.use('/foros', ForosRoutes);
app.use('/empresas', EmpresaRoutes);
app.use('/empleos', EmpleoRoutes);
app.use('/postulaciones', PostulacionRoutes);
app.use('/valoraciones', ValoracionRoutes);
app.use('/alertas', AlertaRoutes);
app.use('/habilidades', HabilidadRoutes);
app.use('/admin', AdminRoutes);  
app.use('/recursos', RecursoRoutes);                   // ← AGREGADO

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import UsuarioRoutes from './routes/Usuarios.js';
import ForosRoutes from './routes/forosRoutes.js';
import EmpresaRoutes from './routes/Empresas.js';
import EmpleoRoutes from './routes/Empleos.js';

import { errorHandler } from './Middlewares/errorhandler.js';

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

app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});
// importacion del express (manejo de rutas y pecticiones)
import express from 'express';

//importacion del router de usuarios
import UsuarioRoutes from './routes/Usuarios.js';

//Importacion del middleware de manejo de errores 
import { errorHandler } from './Middlewares/errorhandler.js';

//Importacion de la conexion a la base de datos
import { pool } from './db.js';
//Importacion de las variables de entorno desde el archivo .env
import dotenv from 'dotenv';
dotenv.config();

//instacia de express (el servidor que tenemos)
const app = express();

//Middleware para interpretar JSON en las peticiones
app.use(express.json());

//ruta get en la raiz del servidor
app.get('/', (req, res) => {
  res.send('A funcionado la conexion');
});

//Asociamos todas las rutas de usuarios al prefijo /api/usuarios
app.use('/usuarios', UsuarioRoutes);

//Agregamos el middleware de manejo de errores 
app.use(errorHandler);

//inicio del servidor en el puerto definido en la varibale de entorno
app.listen(process.env.PORT || 3000, () => {    
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT || 3000}`);
});
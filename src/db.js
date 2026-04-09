// Importamos el paquete 'pg'
import mysql from 'mysql2/promise';

//importamos dotenv para leer las variables 
import dotenv from 'dotenv';

//Cargamos las variables
dotenv.config();

// Desestructuramos Pool del paquete 'pg'


//creacion del pool y exportamos la conexion a la base de datos
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});
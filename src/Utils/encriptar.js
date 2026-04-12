// debido a que mysql no encrypta directamente las contraseñas, este js existe para encriptar las contraseñas rapidos xd
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const encriptarContrasenas = async () => {
    try {
        // Encriptar usuarios
        console.log(' Encriptando contraseñas de usuarios...');
        const [usuarios] = await pool.query('SELECT id, contrasena FROM usuarios');

        for (const usuario of usuarios) {
            if (!usuario.contrasena.startsWith('$2b$')) {
                const hash = await bcrypt.hash(usuario.contrasena, 10);
                await pool.query('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hash, usuario.id]);
                console.log(`✅ Usuario ${usuario.id} encriptado`);
            } else {
                console.log(`⏭ Usuario ${usuario.id} ya estaba encriptado`);
            }
        }

        // Encriptar empresas
        console.log('\n Encriptando contraseñas de empresas...');
        const [empresas] = await pool.query('SELECT id, contrasena FROM empresas');

        for (const empresa of empresas) {
            if (!empresa.contrasena || empresa.contrasena.startsWith('$2b$')) {
                console.log(`⏭ Empresa ${empresa.id} ya estaba encriptada o no tiene contraseña`);
                continue;
            }
            const hash = await bcrypt.hash(empresa.contrasena, 10);
            await pool.query('UPDATE empresas SET contrasena = ? WHERE id = ?', [hash, empresa.id]);
            console.log(`✅ Empresa ${empresa.id} encriptada`);
        }

        console.log('\n✅ Todas las contraseñas encriptadas correctamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

encriptarContrasenas();
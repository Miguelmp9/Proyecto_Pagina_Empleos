import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import buscarRoutes from './routes/Buscar.js';
import { pool } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

app.use(cors({ 
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'shovel_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, 
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  }
}));

app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/contenido_multimedia', express.static(path.join(__dirname, '../contenido_multimedia')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use(express.static(path.join(__dirname, '../html')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../html/buscar.html'));
});

app.use('/api/buscar', buscarRoutes);

app.use((req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not Found', path: req.path });
  } else {
    const filePath = path.join(__dirname, '../html', req.path);
    if (path.extname(req.path)) {
      res.status(404).send('Página no encontrada');
    }
  }
});

app.use(errorHandler);

process.on('SIGINT', async () => {
  console.log('\n🔄 Cerrando conexiones...');
  try {
    await pool.end();
    console.log('✅ Conexiones a MySQL cerradas');
  } catch (err) {
    console.error('❌ Error al cerrar pool:', err.message);
  }
  process.exit(0);
});

try {
  const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════╗
║  🚀 SERVIDOR SHOVEL INICIADO       ║
╠════════════════════════════════════╣
║  📡 Puerto: ${PORT}
║  🔗 URL: http://localhost:${PORT}
║  📁 Frontend: /html
║  🔌 API: /api/buscar
║  🔑 Sesión: configurada
╚════════════════════════════════════╝
    `);
    console.log('✅ Servidor corriendo... (presiona Ctrl+C para detener)\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ El puerto ${PORT} ya está en uso`);
      console.error('💡 Solución: Ejecuta "taskkill /F /IM node.exe" y reinicia');
    } else {
      console.error('❌ Error del servidor HTTP:', err.message);
    }
  });

} catch (error) {
  console.error('❌ Error fatal al iniciar servidor:', error);
  process.exit(1);
}
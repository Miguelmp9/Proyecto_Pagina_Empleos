// src/index.js
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Rutas
import buscarRoutes from './routes/Buscar.js';

// DB
import { pool } from './db.js';

// ========================================
// CONFIGURACIÓN DE RUTAS ABSOLUTAS (ES Modules)
// ========================================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MANEJO DE ERRORES GLOBALES
// ========================================
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

// ========================================
// Middlewares
// ========================================

// CORS - Permite peticiones desde cualquier origen (incluyendo file:// y Live Server)
app.use(cors({ 
  origin: '*', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesión
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

// ========================================
// SERVIR ARCHIVOS ESTÁTICOS (FRONTEND)
// ========================================

// CSS
app.use('/css', express.static(path.join(__dirname, '../css')));

// Imágenes y multimedia
app.use('/contenido_multimedia', express.static(path.join(__dirname, '../contenido_multimedia')));

// JS (si tienes archivos .js separados)
app.use('/js', express.static(path.join(__dirname, '../js')));

// HTML - Servir la carpeta completa
app.use(express.static(path.join(__dirname, '../html')));

// ========================================
// RUTAS DE LA API
// ========================================

// Ruta raíz → sirve el frontend (buscar.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../html/buscar.html'));
});

// Rutas de la API de búsqueda
app.use('/api/buscar', buscarRoutes);

// ========================================
// RUTAS 404 (DEBE IR DESPUÉS DE LAS RUTAS REALES)
// ========================================
app.use((req, res) => {
  // Si es una petición API, devolver JSON 404
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not Found', path: req.path });
  }
  // Si es una ruta del frontend, servir el archivo si existe, sino 404 HTML
  else {
    const filePath = path.join(__dirname, '../html', req.path);
    if (path.extname(req.path)) {
      res.status(404).send('Página no encontrada');
    }
  }
});

// ========================================
// Cierre graceful del servidor
// ========================================
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

// ========================================
// Iniciar servidor
// ========================================
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

  // Manejar errores del servidor HTTP
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
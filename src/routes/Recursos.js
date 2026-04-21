import { Router }        from 'express';
import multer            from 'multer';
import path              from 'path';
import { fileURLToPath } from 'url';
import fs                from 'fs';
import * as ctrl         from '../Controller/RecursosController.js';  // ← "Recursos" con s

const router     = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Carpeta de destino para PDFs ──────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, '../../contenido_multimedia/recursos');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// ── Configuración de Multer ───────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename:    (_req, file, cb) => {
        const ext      = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext)
                             .replace(/\s+/g, '_')
                             .replace(/[^a-zA-Z0-9_-]/g, '');
        cb(null, `${Date.now()}_${baseName}${ext}`);
    }
});

const fileFilter = (_req, file, cb) => {
    file.mimetype === 'application/pdf'
        ? cb(null, true)
        : cb(new Error('Solo se permiten archivos PDF'), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }   // 10 MB máximo
});

// ── Rutas ─────────────────────────────────────────────────────────────────────
router.get('/',                   ctrl.getTodosLosRecursos);
router.get('/:id',                ctrl.getRecursoPorId);
router.post('/', upload.single('archivo'), ctrl.postCrearRecurso);
router.put('/:id',                ctrl.putActualizarRecurso);
router.delete('/:id',             ctrl.deleteEliminarRecurso);
router.patch('/:id/vistas',       ctrl.patchIncrementarVistas);
router.patch('/:id/descargas',    ctrl.patchIncrementarDescargas);
router.patch('/:id/like',         ctrl.patchToggleLike);

export default router;
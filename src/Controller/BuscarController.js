// src/Controller/BuscarController.js
import { pool } from '../db.js';

const BuscarController = {

  // GET /api/buscar
  index: async (req, res) => {
    try {
      const { q = '', ubicacion = '', nivel = '', sector = '', contrato = '', salario = '', pagina = 1 } = req.query;
      const limite = 10;
      const offset = (parseInt(pagina) - 1) * limite;

      let condiciones = ["e.estado = 'activo'", "e.fecha_cierre > NOW()"];
      let params = [];

      if (q.trim()) {
        condiciones.push(`(e.titulo LIKE ? OR e.descripcion LIKE ? OR e.requisitos LIKE ? OR e.sector LIKE ? OR emp.nombre LIKE ?)`);
        const like = `%${q.trim()}%`;
        params.push(like, like, like, like, like);
      }
      if (ubicacion.trim()) { condiciones.push('e.ubicacion LIKE ?'); params.push(`%${ubicacion.trim()}%`); }
      if (nivel && nivel !== 'Todos los niveles') { condiciones.push('e.nivel_experiencia = ?'); params.push(nivel); }
      if (sector && sector !== 'Todos los sectores') { condiciones.push('e.sector = ?'); params.push(sector); }
      if (contrato && contrato !== 'Tipo de contrato') { condiciones.push('e.tipo_contrato = ?'); params.push(contrato); }
      
      if (salario && salario !== 'Salario') {
        const rangos = {
          '$0 - $30k': { min: 0, max: 30000 },
          '$30k - $60k': { min: 30000, max: 60000 },
          '$60k - $100k': { min: 60000, max: 100000 },
          '$100k+': { min: 100000, max: null }
        };
        const r = rangos[salario];
        if (r) {
          if (r.max !== null) {
            condiciones.push('e.rango_salarial_min >= ? AND e.rango_salarial_max <= ?');
            params.push(r.min, r.max);
          } else {
            condiciones.push('e.rango_salarial_min >= ?');
            params.push(r.min);
          }
        }
      }

      const where = `WHERE ${condiciones.join(' AND ')}`;

      const sql = `
        SELECT e.id, e.titulo, e.ubicacion, e.tipo_contrato, e.nivel_experiencia, e.sector,
               e.rango_salarial_min, e.rango_salarial_max, e.fecha_publicacion,
               emp.nombre AS empresa, emp.logo AS empresa_logo, emp.verificada AS empresa_verificada
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        ${where}
        ORDER BY e.fecha_publicacion DESC
        LIMIT ? OFFSET ?
      `;

      const [empleos] = await pool.query(sql, [...params, limite, offset]);
      const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM empleos e INNER JOIN empresas emp ON e.empresa_id = emp.id ${where}`, params);

      // ✅ CORREGIDO: data: { ... }
      res.json({
        exito: true,
        data: {
          empleos,
          paginacion: { 
            total, 
            pagina: parseInt(pagina), 
            totalPaginas: Math.ceil(total / limite), 
            limite 
          }
        }
      });
    } catch (error) {
      console.error('❌ index:', error);
      res.status(500).json({ exito: false, mensaje: error.message });
    }
  },

  // GET /api/buscar/empleo/:id
  detalle: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query('UPDATE empleos SET total_vistas = total_vistas + 1 WHERE id = ?', [id]);
      
      const [[empleo]] = await pool.query(`
        SELECT e.*, emp.nombre AS empresa, emp.logo, emp.descripcion AS empresa_desc
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        WHERE e.id = ? AND e.estado = 'activo'
      `, [id]);

      if (!empleo) return res.status(404).json({ exito: false, mensaje: 'No encontrado' });

      const [similares] = await pool.query(`
        SELECT e.id, e.titulo, e.ubicacion, emp.nombre AS empresa
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        WHERE e.sector = ? AND e.id != ? AND e.estado = 'activo'
        LIMIT 3
      `, [empleo.sector, id]);

      // ✅ CORREGIDO: data: { ... }
      res.json({ exito: true, data: { empleo, similares } });
    } catch (error) {
      console.error('❌ detalle:', error);
      res.status(500).json({ exito: false, mensaje: error.message });
    }
  },

  // GET /api/buscar/filtros
  obtenerFiltros: async (req, res) => {
    try {
      const [[niveles], [sectores], [contratos], [ubicaciones]] = await Promise.all([
        pool.query(`SELECT DISTINCT nivel_experiencia AS valor FROM empleos WHERE estado='activo' AND nivel_experiencia IS NOT NULL`),
        pool.query(`SELECT DISTINCT sector AS valor FROM empleos WHERE estado='activo' AND sector IS NOT NULL`),
        pool.query(`SELECT DISTINCT tipo_contrato AS valor FROM empleos WHERE estado='activo' AND tipo_contrato IS NOT NULL`),
        pool.query(`SELECT DISTINCT ubicacion AS valor FROM empleos WHERE estado='activo' AND ubicacion IS NOT NULL LIMIT 30`)
      ]);
      
      // ✅ CORREGIDO: data: { ... }
      res.json({
        exito: true,
        data: {
          niveles: niveles.map(r => r.valor),
          sectores: sectores.map(r => r.valor),
          contratos: contratos.map(r => r.valor),
          ubicaciones: ubicaciones.map(r => r.valor)
        }
      });
    } catch (error) {
      console.error('❌ filtros:', error);
      res.status(500).json({ exito: false, mensaje: error.message });
    }
  },

  // GET /api/buscar/sugerencias?q=react
  sugerencias: async (req, res) => {
    try {
      const { q = '' } = req.query;
      if (q.trim().length < 2) return res.json({ exito: true, data: [] });
      
      const like = `%${q.trim()}%`;
      const [[titulos], [empresas], [sectores]] = await Promise.all([
        pool.query(`SELECT DISTINCT titulo AS texto, 'empleo' AS tipo FROM empleos WHERE titulo LIKE ? AND estado='activo' LIMIT 5`, [like]),
        pool.query(`SELECT DISTINCT nombre AS texto, 'empresa' AS tipo FROM empresas WHERE nombre LIKE ? LIMIT 3`, [like]),
        pool.query(`SELECT DISTINCT sector AS texto, 'sector' AS tipo FROM empleos WHERE sector LIKE ? AND estado='activo' LIMIT 3`, [like])
      ]);
      
      // ✅ CORREGIDO: data: [...]
      res.json({ exito: true, data: [...titulos, ...empresas, ...sectores].slice(0, 8) });
    } catch (error) {
      console.error('❌ sugerencias:', error);
      res.status(500).json({ exito: false, mensaje: error.message });
    }
  },

  // POST /api/buscar/guardar/:empleoId
  guardarEmpleo: async (req, res) => {
    try {
      const { empleoId } = req.params;
      const usuarioId = req.session?.usuario?.id;
      
      if (!usuarioId) return res.status(401).json({ exito: false, mensaje: 'Debes iniciar sesión' });

      const [[existente]] = await pool.query(
        'SELECT id FROM empleos_guardados WHERE usuario_id = ? AND empleo_id = ?', 
        [usuarioId, empleoId]
      );
      
      if (existente) {
        await pool.query(
          'DELETE FROM empleos_guardados WHERE usuario_id = ? AND empleo_id = ?', 
          [usuarioId, empleoId]
        );
        return res.json({ exito: true, guardado: false, mensaje: 'Eliminado de guardados' });
      }
      
      await pool.query(
        'INSERT INTO empleos_guardados (usuario_id, empleo_id) VALUES (?, ?)', 
        [usuarioId, empleoId]
      );
      
      res.json({ exito: true, guardado: true, mensaje: 'Guardado correctamente' });
    } catch (error) {
      console.error('❌ guardar:', error);
      res.status(500).json({ exito: false, mensaje: error.message });
    }
  },

  // GET /api/buscar/guardados
  empleosGuardados: async (req, res) => {
    try {
      const usuarioId = req.session?.usuario?.id;
      if (!usuarioId) return res.status(401).json({ exito: false, mensaje: 'Debes iniciar sesión' });

      const [empleos] = await pool.query(`
        SELECT e.*, emp.nombre AS empresa, emp.logo, eg.fecha_guardado
        FROM empleos_guardados eg
        INNER JOIN empleos e ON eg.empleo_id = e.id
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        WHERE eg.usuario_id = ? AND e.estado = 'activo'
        ORDER BY eg.fecha_guardado DESC
      `, [usuarioId]);

      // ✅ CORREGIDO: data: empleos
      res.json({ exito: true, data: empleos });
    } catch (error) {
      console.error('❌ guardados:', error);
      res.status(500).json({ exito: false, mensaje: error.message });
    }
  }
};

export default BuscarController;
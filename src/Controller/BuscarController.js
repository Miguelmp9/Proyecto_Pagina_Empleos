const db = require('../db');

const BuscarController = {

  // GET /api/buscar
  index: async (req, res) => {
    try {
      const {
        q         = '',
        ubicacion = '',
        nivel     = '',
        sector    = '',
        contrato  = '',
        salario   = '',
        pagina    = 1
      } = req.query;

      const limite = 10;
      const offset = (parseInt(pagina) - 1) * limite;

      let condiciones = ["e.estado = 'activo'"];
      let params = [];

      if (q.trim()) {
        condiciones.push(`(
          e.titulo      LIKE ? OR
          e.descripcion LIKE ? OR
          e.requisitos  LIKE ? OR
          e.sector      LIKE ? OR
          emp.nombre    LIKE ?
        )`);
        const like = `%${q.trim()}%`;
        params.push(like, like, like, like, like);
      }

      if (ubicacion.trim()) {
        condiciones.push('e.ubicacion LIKE ?');
        params.push(`%${ubicacion.trim()}%`);
      }

      if (nivel && nivel !== 'Todos los niveles') {
        condiciones.push('e.nivel_experiencia = ?');
        params.push(nivel);
      }

      if (sector && sector !== 'Todos los sectores') {
        condiciones.push('e.sector = ?');
        params.push(sector);
      }

      if (contrato && contrato !== 'Tipo de contrato') {
        condiciones.push('e.tipo_contrato = ?');
        params.push(contrato);
      }

      if (salario && salario !== 'Salario') {
        const rangos = {
          '$0 - $30k':    { min: 0,      max: 30000  },
          '$30k - $60k':  { min: 30000,  max: 60000  },
          '$60k - $100k': { min: 60000,  max: 100000 },
          '$100k+':       { min: 100000, max: null   }
        };
        const rango = rangos[salario];
        if (rango) {
          if (rango.max !== null) {
            condiciones.push('e.rango_salarial_min >= ? AND e.rango_salarial_max <= ?');
            params.push(rango.min, rango.max);
          } else {
            condiciones.push('e.rango_salarial_min >= ?');
            params.push(rango.min);
          }
        }
      }

      const where = `WHERE ${condiciones.join(' AND ')}`;

      const sqlEmpleos = `
        SELECT
          e.id,
          e.titulo,
          e.ubicacion,
          e.tipo_contrato,
          e.nivel_experiencia,
          e.sector,
          e.rango_salarial_min,
          e.rango_salarial_max,
          e.total_vistas,
          e.total_aplicaciones,
          e.fecha_publicacion,
          emp.nombre      AS empresa,
          emp.logo        AS empresa_logo,
          emp.verificada  AS empresa_verificada,
          DATEDIFF(NOW(), e.fecha_publicacion) AS dias_publicado
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        ${where}
        ORDER BY e.fecha_publicacion DESC
        LIMIT ? OFFSET ?
      `;

      const sqlTotal = `
        SELECT COUNT(*) AS total
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        ${where}
      `;

      const [empleos]     = await db.query(sqlEmpleos, [...params, limite, offset]);
      const [[{ total }]] = await db.query(sqlTotal, params);

      return res.json({
        exito: true,
        data: {
          empleos,
          paginacion: {
            total,
            pagina:       parseInt(pagina),
            totalPaginas: Math.ceil(total / limite),
            limite
          },
          filtrosAplicados: { q, ubicacion, nivel, sector, contrato, salario }
        }
      });

    } catch (error) {
      console.error('BuscarController.index:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error al realizar la búsqueda', error: error.message });
    }
  },

  // GET /api/buscar/empleo/:id
  detalle: async (req, res) => {
    try {
      const { id } = req.params;

      await db.query('UPDATE empleos SET total_vistas = total_vistas + 1 WHERE id = ?', [id]);

      const [[empleo]] = await db.query(`
        SELECT
          e.*,
          emp.nombre              AS empresa,
          emp.logo                AS empresa_logo,
          emp.descripcion         AS empresa_descripcion,
          emp.sitio_web           AS empresa_web,
          emp.industria           AS empresa_industria,
          emp.tamano              AS empresa_tamano,
          emp.verificada          AS empresa_verificada,
          emp.calificacion_promedio,
          emp.total_valoraciones,
          DATEDIFF(NOW(), e.fecha_publicacion) AS dias_publicado
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        WHERE e.id = ? AND e.estado = 'activo'
      `, [id]);

      if (!empleo) {
        return res.status(404).json({ exito: false, mensaje: 'Empleo no encontrado' });
      }

      const [similares] = await db.query(`
        SELECT
          e.id,
          e.titulo,
          e.ubicacion,
          e.tipo_contrato,
          e.rango_salarial_min,
          e.rango_salarial_max,
          e.nivel_experiencia,
          emp.nombre AS empresa
        FROM empleos e
        INNER JOIN empresas emp ON e.empresa_id = emp.id
        WHERE e.sector = ? AND e.id != ? AND e.estado = 'activo'
        ORDER BY e.fecha_publicacion DESC
        LIMIT 3
      `, [empleo.sector, id]);

      return res.json({ exito: true, data: { empleo, similares } });

    } catch (error) {
      console.error('BuscarController.detalle:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error al obtener el empleo', error: error.message });
    }
  },

  // GET /api/buscar/filtros
  obtenerFiltros: async (req, res) => {
    try {
      const [[niveles], [sectores], [contratos], [ubicaciones]] = await Promise.all([
        db.query(`SELECT DISTINCT nivel_experiencia AS valor FROM empleos WHERE estado = 'activo' AND nivel_experiencia IS NOT NULL ORDER BY nivel_experiencia`),
        db.query(`SELECT DISTINCT sector AS valor FROM empleos WHERE estado = 'activo' AND sector IS NOT NULL ORDER BY sector`),
        db.query(`SELECT DISTINCT tipo_contrato AS valor FROM empleos WHERE estado = 'activo' AND tipo_contrato IS NOT NULL ORDER BY tipo_contrato`),
        db.query(`SELECT DISTINCT ubicacion AS valor FROM empleos WHERE estado = 'activo' AND ubicacion IS NOT NULL ORDER BY ubicacion LIMIT 30`)
      ]);

      return res.json({
        exito: true,
        data: {
          niveles:     niveles.map(r => r.valor),
          sectores:    sectores.map(r => r.valor),
          contratos:   contratos.map(r => r.valor),
          ubicaciones: ubicaciones.map(r => r.valor)
        }
      });

    } catch (error) {
      console.error('BuscarController.obtenerFiltros:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error al obtener filtros', error: error.message });
    }
  },

  // GET /api/buscar/sugerencias?q=react
  sugerencias: async (req, res) => {
    try {
      const { q = '' } = req.query;

      if (q.trim().length < 2) {
        return res.json({ exito: true, data: [] });
      }

      const like = `%${q.trim()}%`;

      const [[titulos], [empresas], [sectores]] = await Promise.all([
        db.query(`SELECT DISTINCT titulo AS texto, 'empleo' AS tipo FROM empleos WHERE titulo LIKE ? AND estado = 'activo' LIMIT 5`, [like]),
        db.query(`SELECT DISTINCT nombre AS texto, 'empresa' AS tipo FROM empresas WHERE nombre LIKE ? LIMIT 3`, [like]),
        db.query(`SELECT DISTINCT sector AS texto, 'sector' AS tipo FROM empleos WHERE sector LIKE ? AND estado = 'activo' LIMIT 3`, [like])
      ]);

      return res.json({
        exito: true,
        data: [...titulos, ...empresas, ...sectores].slice(0, 8)
      });

    } catch (error) {
      console.error('BuscarController.sugerencias:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error al obtener sugerencias', error: error.message });
    }
  },

  // POST /api/buscar/guardar/:empleoId
  guardarEmpleo: async (req, res) => {
    try {
      const { empleoId } = req.params;
      const usuarioId = req.session?.usuario?.id;

      if (!usuarioId) {
        return res.status(401).json({ exito: false, mensaje: 'Debes iniciar sesión' });
      }

      const [[existente]] = await db.query(
        'SELECT id FROM empleos_guardados WHERE usuario_id = ? AND empleo_id = ?',
        [usuarioId, empleoId]
      );

      if (existente) {
        await db.query(
          'DELETE FROM empleos_guardados WHERE usuario_id = ? AND empleo_id = ?',
          [usuarioId, empleoId]
        );
        return res.json({ exito: true, guardado: false, mensaje: 'Empleo eliminado de guardados' });
      }

      await db.query(
        'INSERT INTO empleos_guardados (usuario_id, empleo_id) VALUES (?, ?)',
        [usuarioId, empleoId]
      );

      return res.json({ exito: true, guardado: true, mensaje: 'Empleo guardado correctamente' });

    } catch (error) {
      console.error('BuscarController.guardarEmpleo:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error al guardar el empleo', error: error.message });
    }
  },

  // GET /api/buscar/guardados
  empleosGuardados: async (req, res) => {
    try {
      const usuarioId = req.session?.usuario?.id;

      if (!usuarioId) {
        return res.status(401).json({ exito: false, mensaje: 'Debes iniciar sesión' });
      }

      const [empleos] = await db.query(`
        SELECT
          e.id,
          e.titulo,
          e.ubicacion,
          e.tipo_contrato,
          e.nivel_experiencia,
          e.sector,
          e.rango_salarial_min,
          e.rango_salarial_max,
          e.fecha_publicacion,
          emp.nombre      AS empresa,
          emp.logo        AS empresa_logo,
          eg.fecha_guardado
        FROM empleos_guardados eg
        INNER JOIN empleos  e   ON eg.empleo_id = e.id
        INNER JOIN empresas emp ON e.empresa_id  = emp.id
        WHERE eg.usuario_id = ? AND e.estado = 'activo'
        ORDER BY eg.fecha_guardado DESC
      `, [usuarioId]);

      return res.json({ exito: true, data: empleos });

    } catch (error) {
      console.error('BuscarController.empleosGuardados:', error);
      return res.status(500).json({ exito: false, mensaje: 'Error al obtener empleos guardados', error: error.message });
    }
  }
};

module.exports = BuscarController;

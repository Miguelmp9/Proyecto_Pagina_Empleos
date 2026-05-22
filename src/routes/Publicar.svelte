<script>
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ── Sesión ────────────────────────────────────────────────
  let usuario = null;

  // ── Vista ─────────────────────────────────────────────────
  let vista = 'panel'; // 'panel' | 'formulario'
  let tab   = 'empleos'; // 'empleos' | 'candidatos'

  // ── Stats ─────────────────────────────────────────────────
  let statEmpleos      = 0;
  let statAplicaciones = 0;
  let statVistas       = 0;

  // ── Listas ────────────────────────────────────────────────
  let empleos      = [];
  let candidatos   = [];

  // ── Formulario ────────────────────────────────────────────
  let f = {
    titulo: '', ubicacion: '', tipo_contrato: 'Tiempo Completo',
    modalidad: 'Presencial', nivel_experiencia: 'Junior',
    sector: 'Tecnología', salario_min: '', salario_max: '',
    email_contacto: '', fecha_cierre: '',
    descripcion: '', responsabilidades: '',
    requisitos: '', requisitos_deseables: '', beneficios: ''
  };
  let publicando = false;

  const SECTORES   = ['Tecnología','Marketing','Diseño','Finanzas','Administración','Soporte','Salud','Educación','Logística'];
  const NIVELES    = ['Junior','Mid-Level','Senior','Ejecutivo'];
  const CONTRATOS  = ['Tiempo Completo','Medio Tiempo','Freelance'];
  const MODALIDADES= ['Presencial','Remoto','Híbrido'];

  // ─────────────────────────────────────────────────────────
  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario || usuario.rol !== 'empresa') { window.location.href = '/login'; return; }
    f.email_contacto = usuario.email || '';
    await cargarStats();
    await cargarEmpleos();
    await cargarCandidatos();
  });

  function logout() { localStorage.removeItem('usuario'); window.location.href = '/login'; }

  // ── Stats ─────────────────────────────────────────────────
  async function cargarStats() {
    try {
      const res  = await fetch(`${API}/empleos/stats/${usuario.id}`);
      const data = await res.json();
      statEmpleos      = data.empleos_activos      || 0;
      statAplicaciones = data.aplicaciones_totales  || 0;
      statVistas       = data.vistas_totales        || 0;
    } catch (e) {}
  }

  // ── Empleos ───────────────────────────────────────────────
  async function cargarEmpleos() {
    try {
      const res = await fetch(`${API}/empleos/empresa/${usuario.id}`);
      empleos = await res.json();
    } catch (e) { empleos = []; }
  }

  async function eliminarEmpleo(id) {
    if (!confirm('¿Seguro que quieres eliminar este empleo?')) return;
    try {
      const res = await fetch(`${API}/empleos/${id}`, { method:'DELETE' });
      if (res.ok) { await cargarEmpleos(); await cargarStats(); }
    } catch (e) { console.error(e); }
  }

  // ── Candidatos ────────────────────────────────────────────
  async function cargarCandidatos() {
    try {
      const res = await fetch(`${API}/postulaciones/empresa/${usuario.id}`);
      candidatos = await res.json();
    } catch (e) { candidatos = []; }
  }

  async function actualizarEstado(id, estado) {
    try {
      await fetch(`${API}/postulaciones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado })
      });
    } catch (e) { console.error(e); }
  }

  // ── Publicar ──────────────────────────────────────────────
  async function publicarEmpleo() {
    if (!f.titulo || !f.ubicacion || !f.descripcion) {
      alert('Por favor completa los campos obligatorios (*)'); return;
    }
    publicando = true;
    try {
      const res = await fetch(`${API}/empleos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id:          usuario.id,
          titulo:              f.titulo.trim(),
          ubicacion:           f.ubicacion.trim(),
          tipo_contrato:       `${f.tipo_contrato} - ${f.modalidad}`,
          nivel_experiencia:   f.nivel_experiencia,
          sector:              f.sector,
          rango_salarial_min:  parseFloat(f.salario_min) || 0,
          rango_salarial_max:  parseFloat(f.salario_max) || 0,
          email_contacto:      f.email_contacto.trim() || usuario.email,
          fecha_cierre:        f.fecha_cierre || null,
          descripcion:         f.descripcion.trim(),
          responsabilidades:   f.responsabilidades.trim(),
          requisitos:          f.requisitos.trim(),
          requisitos_deseables:f.requisitos_deseables.trim(),
          beneficios:          f.beneficios.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Error al publicar'); return; }
      alert('✅ Empleo publicado correctamente');
      // Reset form
      f = { titulo:'', ubicacion:'', tipo_contrato:'Tiempo Completo', modalidad:'Presencial',
            nivel_experiencia:'Junior', sector:'Tecnología', salario_min:'', salario_max:'',
            email_contacto: usuario.email || '', fecha_cierre:'',
            descripcion:'', responsabilidades:'', requisitos:'', requisitos_deseables:'', beneficios:'' };
      vista = 'panel';
      await cargarEmpleos();
      await cargarStats();
    } catch (e) {
      alert('No se pudo conectar con el servidor');
    } finally {
      publicando = false;
    }
  }

  function cambiarTab(t) {
    tab = t;
    if (t === 'candidatos') cargarCandidatos();
  }
</script>

<svelte:head><title>Shovel - Publicar Empleo</title></svelte:head>

<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">
    <img src="/contenido_multimedia/logo.png" alt="Shovel" style="width:36px;height:36px;border-radius:8px;object-fit:cover;">
    Shovel
  </a>
  <div class="nav-links">
    <a href="/buscar"   class="nav-link">Buscar Empleos</a>
    <a href="/publicar" class="nav-link activo">Publicar Empleo</a>
    <a href="/recursos" class="nav-link">Recursos</a>
    <a href="/foros"    class="nav-link">Foros</a>
    {#if usuario}<button class="nav-link btn-logout" on:click={logout}>Cerrar Sesión</button>{/if}
  </div>
</nav>

<div class="contenido">

  <!-- ══ PANEL ══ -->
  {#if vista === 'panel'}
    <div class="panel-cabecera">
      <h1>Panel de Empresa</h1>
      <button class="btn btn-primario" on:click={() => vista = 'formulario'}>+ Publicar Nuevo Empleo</button>
    </div>

    <div class="grid-stats">
      <div class="stat">
        <div class="stat-icono">📄</div>
        <div class="stat-num">{statEmpleos}</div>
        <div class="stat-label">Empleos Activos</div>
      </div>
      <div class="stat">
        <div class="stat-icono">👥</div>
        <div class="stat-num">{statAplicaciones}</div>
        <div class="stat-label">Aplicaciones Totales</div>
      </div>
      <div class="stat">
        <div class="stat-icono">👁</div>
        <div class="stat-num">{statVistas}</div>
        <div class="stat-label">Vistas Totales</div>
      </div>
      <div class="stat">
        <div class="stat-icono">📈</div>
        <div class="stat-num" style="color:var(--verde);">+18%</div>
        <div class="stat-label">Crecimiento Mensual</div>
      </div>
    </div>

    <div class="tarjeta">
      <div class="tabs">
        <div class="tab" class:activo={tab === 'empleos'}    on:click={() => cambiarTab('empleos')}>Empleos Publicados</div>
        <div class="tab" class:activo={tab === 'candidatos'} on:click={() => cambiarTab('candidatos')}>Candidatos</div>
      </div>

      <!-- Tab empleos -->
      {#if tab === 'empleos'}
        {#if empleos.length === 0}
          <p style="color:var(--texto2);text-align:center;padding:2rem;">No tienes empleos publicados aún.</p>
        {:else}
          {#each empleos as e}
            <div class="fila-empleo">
              <div>
                <div style="font-weight:600;">{e.titulo}</div>
                <div style="font-size:0.8rem;color:var(--texto2);margin-top:4px;">{e.ubicacion || '-'} • {e.tipo_contrato || '-'} • {e.estado}</div>
                <div style="font-size:0.8rem;color:var(--texto2);">👁 {e.total_vistas} vistas • 👥 {e.total_aplicaciones} aplicaciones</div>
              </div>
              <button class="btn btn-borde btn-pequeno" on:click={() => eliminarEmpleo(e.id)}>Eliminar</button>
            </div>
          {/each}
        {/if}
      {/if}

      <!-- Tab candidatos -->
      {#if tab === 'candidatos'}
        {#if candidatos.length === 0}
          <p style="color:var(--texto2);text-align:center;padding:2rem;">No tienes candidatos aún.</p>
        {:else}
          {#each candidatos as p}
            <div class="fila-empleo" style="align-items:flex-start;">
              <div>
                <div style="font-weight:600;">{p.nombre_completo}</div>
                <div style="font-size:0.8rem;color:var(--texto2);">{p.titulo_profesional || '-'} • {p.ubicacion || '-'}</div>
                <div style="font-size:0.8rem;color:var(--morado);margin-top:4px;">Aplicó a: {p.empleo_titulo}</div>
                <div style="font-size:0.8rem;color:var(--texto2);">📧 {p.email} • 📞 {p.telefono || '-'}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:0.5rem;align-items:flex-end;">
                <span style="font-size:0.75rem;background:var(--morado-claro);color:var(--morado);padding:2px 8px;border-radius:4px;">{p.estado}</span>
                <select
                  style="font-size:0.75rem;padding:4px 8px;border-radius:6px;background:var(--tarjeta);border:1px solid var(--borde);color:var(--texto);cursor:pointer;"
                  value={p.estado}
                  on:change={(e) => actualizarEstado(p.id, e.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="revisado">Revisado</option>
                  <option value="entrevista">Entrevista</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="aceptado">Aceptado</option>
                </select>
              </div>
            </div>
          {/each}
        {/if}
      {/if}
    </div>
  {/if}

  <!-- ══ FORMULARIO ══ -->
  {#if vista === 'formulario'}
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
      <button class="btn btn-borde btn-pequeno" on:click={() => vista = 'panel'}>← Volver</button>
      <h1 style="font-size:1.5rem;">Publicar Nuevo Empleo</h1>
    </div>

    <div class="tarjeta">

      <!-- Info básica -->
      <div class="seccion-form">
        <h4>📋 Información Básica</h4>
        <div class="form-grid">
          <div class="grupo"><label>Título del Puesto *</label><input class="input" placeholder="ej. Senior Frontend Developer" bind:value={f.titulo}></div>
          <div class="grupo"><label>Ubicación *</label><input class="input" placeholder="ej. San Salvador" bind:value={f.ubicacion}></div>
          <div class="grupo">
            <label>Tipo de Contrato</label>
            <select class="input" bind:value={f.tipo_contrato}>
              {#each CONTRATOS as c}<option>{c}</option>{/each}
            </select>
          </div>
          <div class="grupo">
            <label>Modalidad</label>
            <select class="input" bind:value={f.modalidad}>
              {#each MODALIDADES as m}<option>{m}</option>{/each}
            </select>
          </div>
          <div class="grupo">
            <label>Nivel de Experiencia</label>
            <select class="input" bind:value={f.nivel_experiencia}>
              {#each NIVELES as n}<option>{n}</option>{/each}
            </select>
          </div>
          <div class="grupo">
            <label>Sector</label>
            <select class="input" bind:value={f.sector}>
              {#each SECTORES as s}<option>{s}</option>{/each}
            </select>
          </div>
          <div class="grupo"><label>Salario Mínimo ($)</label><input class="input" type="number" placeholder="1000" bind:value={f.salario_min}></div>
          <div class="grupo"><label>Salario Máximo ($)</label><input class="input" type="number" placeholder="2000" bind:value={f.salario_max}></div>
          <div class="grupo"><label>Email de Contacto</label><input class="input" type="email" placeholder="rrhh@empresa.com" bind:value={f.email_contacto}></div>
          <div class="grupo"><label>Fecha de Cierre</label><input class="input" type="date" bind:value={f.fecha_cierre}></div>
        </div>
      </div>

      <!-- Descripción -->
      <div class="seccion-form">
        <h4>📝 Descripción del Puesto</h4>
        <div class="grupo"><label>Descripción General *</label><textarea class="input" rows="4" placeholder="Describe el rol y el contexto del puesto..." bind:value={f.descripcion}></textarea></div>
        <div class="grupo"><label>Responsabilidades</label><textarea class="input" rows="4" placeholder="Lista las principales responsabilidades..." bind:value={f.responsabilidades}></textarea></div>
      </div>

      <!-- Requisitos -->
      <div class="seccion-form">
        <h4>✅ Requisitos</h4>
        <div class="grupo"><label>Requisitos Obligatorios</label><textarea class="input" rows="4" placeholder="Lista los requisitos indispensables..." bind:value={f.requisitos}></textarea></div>
        <div class="grupo"><label>Requisitos Deseables</label><textarea class="input" rows="3" placeholder="Lista los requisitos opcionales..." bind:value={f.requisitos_deseables}></textarea></div>
      </div>

      <!-- Beneficios -->
      <div class="seccion-form">
        <h4>🎁 Beneficios</h4>
        <div class="grupo"><label>Beneficios que ofrece el puesto</label><textarea class="input" rows="3" placeholder="ej. Seguro médico, trabajo remoto, bonos..." bind:value={f.beneficios}></textarea></div>
      </div>

      <div style="display:flex;gap:0.75rem;justify-content:flex-end;margin-top:0.5rem;">
        <button class="btn btn-borde" on:click={() => vista = 'panel'}>Cancelar</button>
        <button class="btn btn-primario" on:click={publicarEmpleo} disabled={publicando}>
          {publicando ? 'Publicando...' : 'Publicar Empleo'}
        </button>
      </div>

    </div>
  {/if}

</div>

<footer>
  <div style="text-align:center;padding:1rem;font-size:0.8rem;color:var(--texto3);">© 2026 Shovel. Todos los derechos reservados.</div>
</footer>

<style>
  .contenido { max-width: 1200px; margin: 0 auto; padding: 2rem; flex: 1; }

  .panel-cabecera { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  .panel-cabecera h1 { font-size: 1.5rem; }

  /* ── Stats ── */
  .grid-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; margin-bottom: 1.5rem; }
  .stat { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio); padding: 1.25rem; }
  .stat-icono { width: 36px; height: 36px; background: var(--morado-claro); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; font-size: 1.1rem; }
  .stat-num   { font-size: 1.6rem; font-weight: 700; }
  .stat-label { font-size: 0.78rem; color: var(--texto2); }

  /* ── Tabs ── */
  .tabs { display: flex; border-bottom: 1px solid var(--borde); margin-bottom: 1.5rem; }
  .tab { padding: 10px 18px; cursor: pointer; font-size: 0.875rem; color: var(--texto2); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; }
  .tab.activo { color: var(--morado); border-color: var(--morado); }
  .tab:hover:not(.activo) { color: var(--texto); }

  /* ── Filas ── */
  .fila-empleo { background: var(--tarjeta2); border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; }

  /* ── Formulario ── */
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .grupo { margin-bottom: 1rem; }
  .grupo label { display: block; font-size: 0.85rem; color: var(--texto2); margin-bottom: 6px; }
  .grupo textarea { resize: vertical; }

  .seccion-form { border-bottom: 1px solid var(--borde); padding-bottom: 1.25rem; margin-bottom: 1.25rem; }
  .seccion-form h4 { font-size: 0.9rem; color: var(--morado); margin-bottom: 1rem; }

  /* ── Botones ── */
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: var(--radio); font-size: 0.875rem; font-weight: 600; font-family: inherit; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.15s; }
  .btn-primario { background: linear-gradient(135deg, var(--morado), #9b6ef5); color: #fff; }
  .btn-primario:hover:not(:disabled) { opacity: 0.88; }
  .btn-primario:disabled { opacity: 0.7; cursor: not-allowed; }
  .btn-borde { background: transparent; color: var(--texto2); border: 1px solid var(--borde); }
  .btn-borde:hover { background: var(--tarjeta2); color: var(--texto); }
  .btn-pequeno { padding: 6px 12px; font-size: 0.8rem; }
  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }
</style>
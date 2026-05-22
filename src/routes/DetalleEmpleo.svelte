<script>
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ── Sesión ────────────────────────────────────────────────
  let usuario = null;

  // ── Estado ────────────────────────────────────────────────
  let empleo        = null;
  let cargando      = true;
  let error         = '';
  let empleoId      = null;

  // ── Listas parseadas ──────────────────────────────────────
  let responsabilidades = [];
  let requisitos        = [];
  let requisitosDeseables = [];
  let beneficios        = [];

  // ─────────────────────────────────────────────────────────
  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    // Leer el id desde la URL: /detalle-empleo/123
    const partes = window.location.pathname.split('/');
    empleoId = partes[partes.length - 1];

    // Fallback: query param ?id=123
    if (!empleoId || isNaN(empleoId)) {
      const params = new URLSearchParams(window.location.search);
      empleoId = params.get('id');
    }

    if (!empleoId) { error = 'No se especificó un empleo.'; cargando = false; return; }

    await cargarEmpleo();
  });

  // ── Helpers ───────────────────────────────────────────────
  function calcularTiempo(fecha) {
    const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
    if (diff < 60)   return `Hace ${diff} minutos`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`;
    if (diff < 2880) return 'Hace 1 día';
    return `Hace ${Math.floor(diff / 1440)} días`;
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });
  }

  function parsearLista(texto) {
    if (!texto) return [];
    return texto.split('\n').map(t => t.trim()).filter(Boolean);
  }

  function formatSalario(e) {
    if (e?.rango_salarial_min && e?.rango_salarial_max)
      return `$${e.rango_salarial_min.toLocaleString()} - $${e.rango_salarial_max.toLocaleString()}`;
    return 'No especificado';
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ── Carga ─────────────────────────────────────────────────
  async function cargarEmpleo() {
    cargando = true;
    try {
      const res = await fetch(`${API}/empleos/${empleoId}`);
      if (!res.ok) { error = 'Empleo no encontrado.'; return; }
      empleo = await res.json();

      responsabilidades   = parsearLista(empleo.responsabilidades);
      requisitos          = parsearLista(empleo.requisitos);
      requisitosDeseables = parsearLista(empleo.requisitos_deseables);
      beneficios          = parsearLista(empleo.beneficios);
    } catch (e) {
      error = 'Error al cargar el empleo.';
    } finally {
      cargando = false;
    }
  }

  // ── Postulación ───────────────────────────────────────────
  async function postularse() {
    if (!usuario) {
      alert('Debes iniciar sesión para postularte.');
      window.location.href = '/login';
      return;
    }
    if (usuario.rol === 'empresa') {
      alert('Las empresas no pueden postularse a empleos.');
      return;
    }
    try {
      const res = await fetch(`${API}/postulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, empleo_id: empleoId, carta_presentacion: '' })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Error al postularse'); return; }
      alert('✅ ¡Postulación enviada correctamente!');
    } catch (e) {
      alert('No se pudo conectar con el servidor');
    }
  }
</script>

<svelte:head>
  <title>Shovel - {empleo?.titulo ?? 'Detalle del Empleo'}</title>
</svelte:head>

<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">
    <img src="/contenido_multimedia/logo.png" alt="Shovel" style="width:36px;height:36px;border-radius:8px;object-fit:cover;">
    Shovel
  </a>
  <div class="nav-links">
    <a href="/buscar"   class="nav-link activo">Buscar Empleos</a>
    {#if usuario?.rol === 'empresa'}
      <a href="/publicar" class="nav-link">Publicar Empleo</a>
    {/if}
    <a href="/recursos" class="nav-link">Recursos</a>
    <a href="/foros"    class="nav-link">Foros</a>
    {#if usuario?.rol !== 'admin'}
      <a href="/perfil" class="nav-link">Mi Perfil</a>
    {/if}
    {#if usuario?.rol === 'admin'}
      <a href="/admin" class="nav-link">Admin</a>
    {/if}
    {#if usuario}
      <button class="nav-link btn-logout" on:click={logout}>Cerrar Sesión</button>
    {/if}
  </div>
</nav>

<div class="contenedor-detalle">

  <a href="/buscar" class="boton-volver">← Volver a resultados</a>

  <!-- Estado de carga / error -->
  {#if cargando}
    <p style="color:var(--texto2); text-align:center; padding:2rem;">Cargando empleo...</p>

  {:else if error}
    <p style="color:var(--texto2); text-align:center; padding:2rem;">{error}</p>

  {:else if empleo}

    <!-- Header empleo -->
    <div class="empleo-header">
      <div class="empleo-header-izq">
        <h1>{empleo.titulo}</h1>
        <p class="empleo-header-empresa">{empleo.empresa_nombre || '-'}</p>
        <div class="empleo-header-meta">
          <span>📍 {empleo.ubicacion || '-'}</span>
          <span>🕐 {empleo.tipo_contrato || '-'}</span>
          <span>💰 {formatSalario(empleo)}</span>
        </div>
        <div class="empleo-header-tags">
          <span class="tag">{empleo.nivel_experiencia || '-'}</span>
          <span class="tag">{empleo.sector || '-'}</span>
        </div>
      </div>
      <div class="empleo-header-der">
        <span class="empleo-publicado">Publicado {calcularTiempo(empleo.fecha_publicacion)}</span>
      </div>
    </div>

    <!-- Layout dos columnas -->
    <div class="detalle-layout">

      <!-- Columna izquierda -->
      <div>
        <div class="seccion-descripcion">
          <h2>Descripción del Puesto</h2>
          <p>{empleo.descripcion || '-'}</p>
        </div>

        {#if responsabilidades.length > 0}
          <div class="seccion-descripcion">
            <h2>Responsabilidades</h2>
            <ul class="lista-requisitos">
              {#each responsabilidades as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if requisitos.length > 0}
          <div class="seccion-descripcion">
            <h2>Requisitos</h2>
            <ul class="lista-requisitos">
              {#each requisitos as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if requisitosDeseables.length > 0}
          <div class="seccion-descripcion">
            <h2>Requisitos Deseables</h2>
            <ul class="lista-requisitos">
              {#each requisitosDeseables as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        {/if}

        {#if beneficios.length > 0}
          <div class="seccion-descripcion">
            <h2>Lo que ofrecemos</h2>
            <ul class="lista-requisitos">
              {#each beneficios as item}
                <li>{item}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>

      <!-- Columna derecha -->
      <div class="sidebar-info">

        <div class="barra-postular">
          <button class="btn btn-primario" style="width:100%; font-size:1rem; padding:14px;" on:click={postularse}>
            Postularme Ahora
          </button>
          <p>Al postularte aceptas que tu perfil sea visible para la empresa</p>
        </div>

        <div class="tarjeta-info">
          <h3>Información del Empleo</h3>
          <div class="info-fila">
            <span class="info-etiqueta">Nivel</span>
            <span class="info-valor">{empleo.nivel_experiencia || '-'}</span>
          </div>
          <div class="info-fila">
            <span class="info-etiqueta">Tipo</span>
            <span class="info-valor">{empleo.tipo_contrato || '-'}</span>
          </div>
          <div class="info-fila">
            <span class="info-etiqueta">Ubicación</span>
            <span class="info-valor">{empleo.ubicacion || '-'}</span>
          </div>
          <div class="info-fila">
            <span class="info-etiqueta">Salario</span>
            <span class="info-valor" style="color:var(--verde);">{formatSalario(empleo)}</span>
          </div>
          <div class="info-fila">
            <span class="info-etiqueta">Sector</span>
            <span class="info-valor">{empleo.sector || '-'}</span>
          </div>
          <div class="info-fila">
            <span class="info-etiqueta">Contacto</span>
            <span class="info-valor">{empleo.email_contacto || '-'}</span>
          </div>
          <div class="info-fila">
            <span class="info-etiqueta">Publicado</span>
            <span class="info-valor">{calcularTiempo(empleo.fecha_publicacion)}</span>
          </div>
          <div class="info-fila">
            <span class="info-etiqueta">Cierre</span>
            <span class="info-valor">{formatearFecha(empleo.fecha_cierre)}</span>
          </div>
        </div>

        <div class="tarjeta-empresa">
          <h3>Sobre la Empresa</h3>
          <div class="empresa-logo">🏢</div>
          <div class="empresa-nombre">{empleo.empresa_nombre || '-'}</div>
          <div class="empresa-sector">{empleo.sector || '-'}</div>
          <p class="empresa-desc">{empleo.empresa_desc || 'Empresa comprometida con el desarrollo del talento humano.'}</p>
        </div>

      </div>
    </div>
  {/if}

</div>

<footer>
  <div class="footer-bottom">© 2026 Shovel. Todos los derechos reservados.</div>
</footer>

<style>
  .contenedor-detalle { max-width: 1000px; margin: 0 auto; padding: 2rem; }

  .boton-volver {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--texto2);
    text-decoration: none;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
    transition: color 0.15s;
  }
  .boton-volver:hover { color: var(--morado); }

  /* ── Header ── */
  .empleo-header {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 2rem;
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1.5rem;
  }
  .empleo-header-izq h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 6px; }
  .empleo-header-empresa { font-size: 1rem; color: var(--texto2); margin-bottom: 1rem; }
  .empleo-header-meta { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.875rem; color: var(--texto2); margin-bottom: 1rem; }
  .empleo-header-tags { display: flex; gap: 8px; flex-wrap: wrap; }
  .empleo-header-der { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; flex-shrink: 0; }
  .empleo-publicado { font-size: 0.8rem; color: var(--texto3); }

  .tag { display: inline-flex; align-items: center; padding: 3px 10px; background-color: var(--morado-claro); color: var(--morado); border-radius: 4px; font-size: 0.78rem; font-weight: 500; }

  /* ── Layout ── */
  .detalle-layout { display: grid; grid-template-columns: 1fr 320px; gap: 1.5rem; align-items: start; }

  /* ── Secciones ── */
  .seccion-descripcion {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }
  .seccion-descripcion h2 { font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--borde); }
  .seccion-descripcion p  { font-size: 0.9rem; color: var(--texto2); line-height: 1.8; margin-bottom: 0.75rem; }

  .lista-requisitos { list-style: none; padding: 0; }
  .lista-requisitos li { font-size: 0.9rem; color: var(--texto2); padding: 6px 0; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
  .lista-requisitos li::before { content: '✓'; color: var(--morado); font-weight: 700; flex-shrink: 0; margin-top: 1px; }

  /* ── Sidebar ── */
  .sidebar-info { display: flex; flex-direction: column; gap: 1rem; }

  .tarjeta-info, .tarjeta-empresa {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 1.5rem;
  }
  .tarjeta-info h3, .tarjeta-empresa h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem; }

  .info-fila { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--borde); font-size: 0.85rem; }
  .info-fila:last-child { border-bottom: none; }
  .info-etiqueta { color: var(--texto2); }
  .info-valor { font-weight: 500; color: var(--texto); }

  .empresa-logo { width: 56px; height: 56px; background-color: var(--morado-claro); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 0.75rem; }
  .empresa-nombre { font-weight: 600; font-size: 1rem; margin-bottom: 4px; }
  .empresa-sector { font-size: 0.85rem; color: var(--texto2); margin-bottom: 0.75rem; }
  .empresa-desc   { font-size: 0.85rem; color: var(--texto2); line-height: 1.6; }

  .barra-postular { background-color: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio-grande); padding: 1.25rem; }
  .barra-postular p { font-size: 0.82rem; color: var(--texto2); margin-top: 0.75rem; text-align: center; }

  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }
</style>
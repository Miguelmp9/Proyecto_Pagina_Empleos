<script>
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ── Sesión ────────────────────────────────────────────────
  let usuario = null;

  // ── Empleos ───────────────────────────────────────────────
  let todosLosEmpleos = [];
  let empleosFiltrados = [];
  let cargando = true;

  // ── Filtros texto / selects ───────────────────────────────
  let textoBusqueda = '';
  let textoCiudad   = '';
  let selectNivel   = '';
  let selectSector  = '';
  let selectContrato= '';
  let selectSalario = '';

  // ── Filtros sidebar (pills) ───────────────────────────────
  let filtroNivel   = '';
  let filtroSector  = '';
  let filtroContrato= '';

  const niveles    = ['Junior', 'Mid-Level', 'Senior', 'Ejecutivo'];
  const sectores   = ['Tecnología', 'Marketing', 'Diseño', 'Finanzas', 'Educación', 'Salud', 'Logística'];
  const contratos  = ['Tiempo Completo', 'Medio Tiempo', 'Remoto', 'Híbrido', 'Freelance'];

  // ─────────────────────────────────────────────────────────
  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    await cargarEmpleos();
  });

  // ── Carga inicial ─────────────────────────────────────────
  async function cargarEmpleos() {
    cargando = true;
    try {
      const res = await fetch(`${API}/empleos`);
      todosLosEmpleos = await res.json();
      empleosFiltrados = [...todosLosEmpleos];
    } catch (e) {
      todosLosEmpleos  = [];
      empleosFiltrados = [];
    } finally {
      cargando = false;
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  function calcularTiempo(fecha) {
    const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
    if (diff < 60)   return `Hace ${diff} minutos`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`;
    if (diff < 2880) return 'Hace 1 día';
    return `Hace ${Math.floor(diff / 1440)} días`;
  }

  function formatSalario(e) {
    if (e.rango_salarial_min && e.rango_salarial_max)
      return `$${e.rango_salarial_min.toLocaleString()} - $${e.rango_salarial_max.toLocaleString()}`;
    return 'Salario no especificado';
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ── Filtrado ──────────────────────────────────────────────
  function aplicarFiltros() {
    const texto    = textoBusqueda.toLowerCase();
    const ciudad   = textoCiudad.toLowerCase();
    const nivel    = selectNivel    || filtroNivel;
    const sector   = selectSector   || filtroSector;
    const contrato = selectContrato || filtroContrato;

    empleosFiltrados = todosLosEmpleos.filter(e => {
      const okTexto    = !texto  || e.titulo?.toLowerCase().includes(texto) || e.empresa_nombre?.toLowerCase().includes(texto) || e.sector?.toLowerCase().includes(texto);
      const okCiudad   = !ciudad || e.ubicacion?.toLowerCase().includes(ciudad);
      const okNivel    = !nivel  || e.nivel_experiencia === nivel;
      const okSector   = !sector || e.sector === sector;
      const okContrato = !contrato || e.tipo_contrato?.includes(contrato);

      let okSalario = true;
      if (selectSalario) {
        const min = e.rango_salarial_min || 0;
        const max = e.rango_salarial_max || 0;
        if      (selectSalario === '$0 - $30k')      okSalario = max <= 30000;
        else if (selectSalario === '$30k - $60k')    okSalario = min >= 30000  && max <= 60000;
        else if (selectSalario === '$60k - $100k')   okSalario = min >= 60000  && max <= 100000;
        else if (selectSalario === '$100k+')         okSalario = min >= 100000;
      }

      return okTexto && okCiudad && okNivel && okSector && okContrato && okSalario;
    });
  }

  // ── Pills sidebar ─────────────────────────────────────────
  function togglePill(tipo, valor) {
    if (tipo === 'nivel') {
      filtroNivel    = filtroNivel    === valor ? '' : valor;
      selectNivel    = filtroNivel;
    } else if (tipo === 'sector') {
      filtroSector   = filtroSector   === valor ? '' : valor;
      selectSector   = filtroSector;
    } else if (tipo === 'contrato') {
      filtroContrato = filtroContrato === valor ? '' : valor;
      selectContrato = filtroContrato;
    }
    aplicarFiltros();
  }

  function limpiarFiltros() {
    textoBusqueda  = '';
    textoCiudad    = '';
    selectNivel    = '';
    selectSector   = '';
    selectContrato = '';
    selectSalario  = '';
    filtroNivel    = '';
    filtroSector   = '';
    filtroContrato = '';
    empleosFiltrados = [...todosLosEmpleos];
  }
</script>

<svelte:head>
  <title>Shovel - Buscar Empleos</title>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
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

<!-- Encabezado -->
<div class="encabezado-pagina">
  <h1>Resultados de Búsqueda</h1>
  <p>
    {#if cargando}
      Cargando empleos...
    {:else}
      Se encontraron {empleosFiltrados.length} empleos que coinciden con tu búsqueda
    {/if}
  </p>
</div>

<div class="contenedor-busqueda">

  <!-- Sidebar filtros -->
  <div class="sidebar-filtros">
    <div class="tarjeta">
      <div class="titulo-filtros">🔍 Filtros</div>

      <div class="seccion-filtro">
        <h4>Nivel de Experiencia</h4>
        {#each niveles as n}
          <div
            class="opcion-filtro"
            class:activo={filtroNivel === n}
            on:click={() => togglePill('nivel', n)}
          >{n}</div>
        {/each}
      </div>

      <div class="seccion-filtro">
        <h4>Sector Laboral</h4>
        {#each sectores as s}
          <div
            class="opcion-filtro"
            class:activo={filtroSector === s}
            on:click={() => togglePill('sector', s)}
          >{s}</div>
        {/each}
      </div>

      <div class="seccion-filtro">
        <h4>Tipo de Contrato</h4>
        {#each contratos as c}
          <div
            class="opcion-filtro"
            class:activo={filtroContrato === c}
            on:click={() => togglePill('contrato', c)}
          >{c}</div>
        {/each}
      </div>

      <button class="btn btn-borde" style="width:100%; margin-top:0.5rem; font-size:0.8rem;" on:click={limpiarFiltros}>
        Limpiar Filtros
      </button>
    </div>
  </div>

  <!-- Resultados -->
  <div style="flex:1;">

    <!-- Barra búsqueda -->
    <div class="barra-busqueda">
      <div class="input-wrap">
        <input
          type="text"
          placeholder="Título del empleo o palabra clave"
          bind:value={textoBusqueda}
          on:input={aplicarFiltros}
        >
      </div>
      <div class="input-wrap" style="flex:0.7;">
        <input
          type="text"
          placeholder="Ubicación"
          bind:value={textoCiudad}
          on:input={aplicarFiltros}
        >
      </div>
      <button class="btn btn-primario" on:click={aplicarFiltros}>
        Buscar Empleos
      </button>
    </div>

    <!-- Selects -->
    <div class="filtros-select">
      <select bind:value={selectNivel}    on:change={aplicarFiltros}>
        <option value="">Todos los niveles</option>
        {#each niveles as n}<option>{n}</option>{/each}
      </select>
      <select bind:value={selectSector}   on:change={aplicarFiltros}>
        <option value="">Todos los sectores</option>
        {#each sectores as s}<option>{s}</option>{/each}
      </select>
      <select bind:value={selectContrato} on:change={aplicarFiltros}>
        <option value="">Tipo de contrato</option>
        {#each contratos as c}<option>{c}</option>{/each}
      </select>
      <select bind:value={selectSalario}  on:change={aplicarFiltros}>
        <option value="">Salario</option>
        <option>$0 - $30k</option>
        <option>$30k - $60k</option>
        <option>$60k - $100k</option>
        <option>$100k+</option>
      </select>
    </div>

    <!-- Lista empleos -->
    {#if cargando}
      <p style="color:var(--texto2); text-align:center; padding:2rem;">Cargando empleos...</p>
    {:else if empleosFiltrados.length === 0}
      <p style="color:var(--texto2); text-align:center; padding:2rem;">No se encontraron empleos con esos filtros.</p>
    {:else}
      {#each empleosFiltrados as e}
        <div class="tarjeta-empleo">
          <div class="empleo-cabecera">
            <div>
              <h3>{e.titulo}</h3>
              <p class="empleo-empresa">{e.empresa_nombre || 'Empresa'}</p>
            </div>
          </div>
          <div class="empleo-meta">
            <span>📍 {e.ubicacion || '-'}</span>
            <span>🕐 {e.tipo_contrato || '-'}</span>
            <span>💰 {formatSalario(e)}</span>
          </div>
          <div class="empleo-footer">
            <div class="empleo-tags">
              <span class="tag">{e.nivel_experiencia || '-'}</span>
              <span class="tag">{e.sector || '-'}</span>
            </div>
            <div class="empleo-acciones">
              {#if e.fecha_publicacion}
                <span class="empleo-tiempo">{calcularTiempo(e.fecha_publicacion)}</span>
              {/if}
              <a href="/detalle-empleo/{e.id}" class="btn btn-primario btn-pequeno">Ver Detalles</a>
            </div>
          </div>
        </div>
      {/each}
    {/if}

  </div>
</div>

<footer>
  <div class="footer-bottom">© 2026 Shovel. Todos los derechos reservados.</div>
</footer>

<style>
  /* ── Layout ── */
  .contenedor-busqueda {
    display: flex;
    gap: 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  /* ── Sidebar ── */
  .sidebar-filtros { width: 240px; flex-shrink: 0; }
  .sidebar-filtros .tarjeta { padding: 1.25rem; }

  .titulo-filtros { display: flex; align-items: center; gap: 6px; font-weight: 600; margin-bottom: 1rem; }

  .seccion-filtro { margin-bottom: 1.25rem; }
  .seccion-filtro h4 {
    font-size: 0.78rem;
    color: var(--texto2);
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .opcion-filtro {
    padding: 4px 0;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--texto2);
    transition: color 0.15s;
  }
  .opcion-filtro:hover,
  .opcion-filtro.activo { color: var(--morado); }

  /* ── Barra búsqueda ── */
  .barra-busqueda {
    display: flex;
    gap: 0.75rem;
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: 10px;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  .barra-busqueda .input-wrap { position: relative; flex: 1; }
  .barra-busqueda input {
    width: 100%;
    background-color: var(--tarjeta2);
    border: 1px solid var(--borde);
    border-radius: 8px;
    padding: 10px 14px;
    color: var(--texto);
    font-size: 0.9rem;
    outline: none;
    font-family: inherit;
    box-sizing: border-box;
  }
  .barra-busqueda input:focus { border-color: var(--morado); }

  /* ── Selects ── */
  .filtros-select { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
  .filtros-select select {
    flex: 1;
    background-color: var(--tarjeta2);
    border: 1px solid var(--borde);
    border-radius: 8px;
    padding: 8px 10px;
    color: var(--texto);
    font-size: 0.82rem;
    outline: none;
    font-family: inherit;
    cursor: pointer;
  }

  /* ── Tarjetas empleo ── */
  .tarjeta-empleo {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio);
    padding: 1.25rem;
    margin-bottom: 0.75rem;
    transition: border-color 0.15s;
  }
  .tarjeta-empleo:hover { border-color: var(--morado); }

  .empleo-cabecera { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
  .empleo-cabecera h3 { font-size: 1rem; font-weight: 600; margin-bottom: 2px; }
  .empleo-empresa { font-size: 0.85rem; color: var(--texto2); }

  .empleo-meta { display: flex; align-items: center; gap: 1rem; margin: 0.5rem 0; color: var(--texto2); font-size: 0.82rem; }

  .empleo-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; }
  .empleo-tags { display: flex; gap: 6px; }
  .tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background-color: var(--morado-claro);
    color: var(--morado);
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  .empleo-acciones { display: flex; align-items: center; gap: 0.75rem; }
  .empleo-tiempo { font-size: 0.82rem; color: var(--texto2); }

  /* ── Encabezado ── */
  .encabezado-pagina { max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 0; }
  .encabezado-pagina h1 { font-size: 1.5rem; margin-bottom: 4px; }
  .encabezado-pagina p  { font-size: 0.875rem; color: var(--texto2); }

  /* ── Nav logout ── */
  .btn-logout {
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    cursor: pointer;
    border-radius: 8px;
    padding: 6px 14px;
  }
</style>
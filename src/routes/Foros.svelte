<script>
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ── Sesión ────────────────────────────────────────────────
  let usuario = null;

  // ── Estado ────────────────────────────────────────────────
  let discusiones    = [];
  let categorias     = [];
  let cargando       = true;
  let error          = '';

  // ── Filtros ───────────────────────────────────────────────
  let categoriaActiva = '';   // '' = todas
  let orden           = 'reciente';
  let busqueda        = '';

  // ── Stats ─────────────────────────────────────────────────
  let statDiscusiones = 0;
  let statRespuestas  = 0;
  let statMiembros    = 0;
  let statCategorias  = 0;

  // ─────────────────────────────────────────────────────────
  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    await cargarDiscusiones('', 'reciente');
  });

  // ── Helpers ───────────────────────────────────────────────
  function getIniciales(nombre) {
    return nombre.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  function getColorAvatar(iniciales) {
    const colores = ['avatar-morado','avatar-verde','avatar-amarillo','avatar-rojo','avatar-azul'];
    return colores[iniciales.charCodeAt(0) % colores.length];
  }

  function timeAgo(fechaStr) {
    const diff = Math.floor((new Date() - new Date(fechaStr)) / 60000);
    if (diff < 60)   return `Hace ${diff} minutos`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`;
    if (diff < 2880) return 'Hace 1 día';
    return `Hace ${Math.floor(diff / 1440)} días`;
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ── Carga discusiones ─────────────────────────────────────
  async function cargarDiscusiones(cat_id, ord) {
    cargando = true;
    error = '';
    try {
      let url = `${API}/foros?orden=${ord || 'reciente'}`;
      if (cat_id) url += `&categoria_id=${cat_id}`;

      const res = await fetch(url);
      discusiones = await res.json();

      statDiscusiones = discusiones.length;
      statRespuestas  = discusiones.reduce((acc, d) => acc + d.total_respuestas, 0);

      // Stats de miembros
      try {
        const resU = await fetch(`${API}/usuarios`);
        const usuarios = await resU.json();
        statMiembros = usuarios.length;
      } catch (e) {}

      // Categorías solo la primera vez (sin filtro activo)
      if (!cat_id) await cargarCategorias(discusiones.length);

    } catch (e) {
      error = 'Error al conectar con el servidor. ¿Está corriendo Node.js?';
    } finally {
      cargando = false;
    }
  }

  // ── Carga categorías ──────────────────────────────────────
  async function cargarCategorias(total) {
    try {
      const res = await fetch(`${API}/foros/categorias`);
      categorias = await res.json();
      statCategorias = categorias.length;
    } catch (e) { categorias = []; }
  }

  // ── Cambiar categoría ─────────────────────────────────────
  function seleccionarCategoria(catId) {
    categoriaActiva = catId;
    cargarDiscusiones(catId, orden);
  }

  // ── Cambiar orden ─────────────────────────────────────────
  function cambiarOrden() {
    cargarDiscusiones(categoriaActiva, orden);
  }

  // ── Filtrado local por búsqueda ───────────────────────────
  $: discusionesFiltradas = busqueda
    ? discusiones.filter(d => d.titulo.toLowerCase().includes(busqueda.toLowerCase()))
    : discusiones;
</script>

<svelte:head>
  <title>Shovel - Foros</title>
</svelte:head>

<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">
    <img src="/contenido_multimedia/logo.png" alt="Shovel" style="width:36px;height:36px;border-radius:8px;object-fit:cover;">
    Shovel
  </a>
  <div class="nav-links">
    <a href="/buscar"   class="nav-link">Buscar Empleos</a>
    {#if usuario?.rol === 'empresa'}
      <a href="/publicar" class="nav-link">Publicar Empleo</a>
    {/if}
    <a href="/recursos" class="nav-link">Recursos</a>
    <a href="/foros"    class="nav-link activo">Foros</a>
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
<div class="encabezado-foros">
  <div>
    <h1>Foros de Discusión</h1>
    <p>Únete a la comunidad y comparte experiencias con otros profesionales</p>
  </div>
  <a href="/nueva-discusion" class="btn btn-primario">+ Nueva Discusión</a>
</div>

<!-- Barra búsqueda -->
<div class="barra-busqueda-foros">
  <input
    type="text"
    placeholder="Buscar en los foros..."
    bind:value={busqueda}
  >
</div>

<!-- Stats -->
<div class="grid-stats-foros">
  <div class="stat-foro">
    <div class="stat-icono-foro">💬</div>
    <div class="numero">{statDiscusiones}</div>
    <div class="etiqueta">Discusiones</div>
  </div>
  <div class="stat-foro">
    <div class="stat-icono-foro">👥</div>
    <div class="numero">{statMiembros}</div>
    <div class="etiqueta">Miembros</div>
  </div>
  <div class="stat-foro">
    <div class="stat-icono-foro">💭</div>
    <div class="numero">{statRespuestas}</div>
    <div class="etiqueta">Respuestas</div>
  </div>
  <div class="stat-foro">
    <div class="stat-icono-foro">📂</div>
    <div class="numero">{statCategorias}</div>
    <div class="etiqueta">Categorías</div>
  </div>
</div>

<!-- Contenido principal -->
<div class="contenido-foros">

  <!-- Sidebar categorías -->
  <div class="sidebar-categorias">
    <div class="tarjeta">
      <div class="titulo-categorias">🔍 Categorías</div>

      <!-- Todas -->
      <div
        class="categoria-item"
        class:activo={categoriaActiva === ''}
        on:click={() => seleccionarCategoria('')}
      >
        Todos <span class="badge badge-morado">{statDiscusiones}</span>
      </div>

      <!-- Lista dinámica -->
      {#each categorias as cat}
        <div
          class="categoria-item"
          class:activo={categoriaActiva === String(cat.id)}
          on:click={() => seleccionarCategoria(String(cat.id))}
        >
          {cat.nombre} <span class="cat-count">{cat.total_discusiones}</span>
        </div>
      {/each}
    </div>

    <!-- Ordenar -->
    <div class="tarjeta" style="margin-top:1rem;">
      <div class="titulo-categorias">↕ Ordenar Por</div>
      <select class="select-orden" bind:value={orden} on:change={cambiarOrden}>
        <option value="reciente">Más Reciente</option>
        <option value="popular">Más Popular</option>
        <option value="comentado">Más Comentado</option>
        <option value="visto">Más Visto</option>
      </select>
    </div>
  </div>

  <!-- Lista posts -->
  <div class="lista-posts">
    {#if cargando}
      <p style="text-align:center; color:#888;">Cargando discusiones...</p>

    {:else if error}
      <p style="text-align:center; color:#e53e3e;">{error}</p>

    {:else if discusionesFiltradas.length === 0}
      <p style="text-align:center; color:#888; padding:2rem;">No hay discusiones en esta categoría.</p>

    {:else}
      {#each discusionesFiltradas as d}
        <a href="/detalle-foro/{d.id}" class="tarjeta-post">
          <div class="post-cabecera">
            <div class="avatar {getColorAvatar(getIniciales(d.autor))}">{getIniciales(d.autor)}</div>
            <div class="post-contenido">
              <div class="post-badges">
                {#if d.destacado}
                  <span class="badge badge-morado">⭐ Destacado</span>
                {/if}
                <span class="badge badge-cat">{d.categoria}</span>
              </div>
              <p class="post-titulo">{d.titulo}</p>
              <div class="post-hashtags">
                {#each (d.etiquetas || []) as e}
                  <span class="post-hashtag">#{e.nombre}</span>
                {/each}
              </div>
              <div class="post-footer">
                <span class="post-autor">{d.autor} · {timeAgo(d.fecha_creacion)}</span>
                <div class="post-stats">
                  <span>👍 {d.total_likes}</span>
                  <span>💬 {d.total_respuestas}</span>
                  <span>👁 {d.total_vistas}</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      {/each}
    {/if}
  </div>

</div>

<!-- Footer -->
<footer>
  <div class="footer-grid">
    <div class="footer-col">
      <div class="footer-logo">
        <img src="/contenido_multimedia/logo.png" alt="">
        <span>Shovel</span>
      </div>
      <p>Tu plataforma confiable para encontrar el trabajo ideal</p>
    </div>
    <div class="footer-col">
      <h4>Para Candidatos</h4>
      <a href="/buscar">Buscar Empleos</a>
      <a href="/perfil">Crear Perfil</a>
      <a href="/recursos">Recursos</a>
    </div>
    <div class="footer-col">
      <h4>Para Empresas</h4>
      <a href="/publicar">Publicar Empleo</a>
    </div>
    <div class="footer-col">
      <h4>Soporte</h4>
      <a href="#">Centro de Ayuda</a>
      <a href="#">Contacto</a>
      <a href="#">Términos y Condiciones</a>
    </div>
  </div>
  <div class="footer-bottom">© 2026 Shovel. Todos los derechos reservados.</div>
</footer>

<style>
  /* ── Encabezado ── */
  .encabezado-foros { display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto; padding: 2rem 2rem 1rem; }
  .encabezado-foros h1 { font-size: 1.5rem; margin-bottom: 4px; }
  .encabezado-foros p  { font-size: 0.875rem; color: var(--texto2); }

  /* ── Búsqueda ── */
  .barra-busqueda-foros { position: relative; max-width: 1200px; margin: 0 auto; padding: 0 2rem 1.5rem; }
  .barra-busqueda-foros input { width: 100%; background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: 8px; padding: 10px 14px; color: var(--texto); font-size: 0.9rem; outline: none; font-family: inherit; transition: border-color 0.15s; box-sizing: border-box; }
  .barra-busqueda-foros input:focus { border-color: var(--morado); box-shadow: 0 0 0 3px rgba(124,111,239,0.15); }

  /* ── Stats ── */
  .grid-stats-foros { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-width: 1200px; margin: 0 auto; padding: 0 2rem 1.5rem; }
  .stat-foro { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio); padding: 1rem; display: flex; flex-direction: column; gap: 4px; }
  .stat-icono-foro { width: 32px; height: 32px; background: var(--morado-claro); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 6px; font-size: 1rem; }
  .stat-foro .numero   { font-size: 1.4rem; font-weight: 700; }
  .stat-foro .etiqueta { font-size: 0.8rem; color: var(--texto2); }

  /* ── Layout ── */
  .contenido-foros { display: flex; gap: 1.5rem; max-width: 1200px; margin: 0 auto; padding: 0 2rem 2rem; }

  /* ── Sidebar ── */
  .sidebar-categorias { width: 220px; flex-shrink: 0; }
  .sidebar-categorias .tarjeta { padding: 1rem; }
  .titulo-categorias { display: flex; align-items: center; gap: 6px; font-size: 0.875rem; font-weight: 600; margin-bottom: 1rem; }

  .categoria-item { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; border-radius: 6px; margin-bottom: 4px; cursor: pointer; font-size: 0.85rem; color: var(--texto2); transition: background 0.15s, color 0.15s; }
  .categoria-item:hover { background: var(--tarjeta2); color: var(--texto); }
  .categoria-item.activo { background: var(--morado-claro); color: var(--morado); }
  .cat-count { font-size: 0.78rem; color: var(--texto3); }

  .select-orden { width: 100%; font-family: inherit; font-size: 0.85rem; color: var(--texto); background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: 8px; padding: 8px 12px; outline: none; cursor: pointer; }

  /* ── Posts ── */
  .lista-posts { flex: 1; }

  .tarjeta-post { display: block; text-decoration: none; color: inherit; background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio); padding: 1.25rem; margin-bottom: 0.75rem; transition: border-color 0.15s, box-shadow 0.15s; }
  .tarjeta-post:hover { border-color: var(--morado); box-shadow: 0 4px 20px rgba(124,111,239,0.1); }

  .post-cabecera { display: flex; gap: 12px; }
  .post-contenido { flex: 1; }
  .post-badges { display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap; }
  .post-titulo { font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; color: var(--texto); transition: color 0.15s; }
  .tarjeta-post:hover .post-titulo { color: var(--morado); }
  .post-hashtags { display: flex; gap: 6px; margin-bottom: 8px; flex-wrap: wrap; }
  .post-hashtag  { font-size: 0.75rem; color: var(--morado); }
  .post-footer   { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
  .post-autor    { font-size: 0.82rem; color: var(--texto2); }
  .post-stats    { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--texto2); }

  /* ── Avatares ── */
  .avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; flex-shrink: 0; }
  :global(.avatar-morado)   { background: rgba(124,111,239,0.2); color: var(--morado); }
  :global(.avatar-verde)    { background: rgba(34,197,94,0.2);   color: var(--verde); }
  :global(.avatar-amarillo) { background: rgba(245,158,11,0.2);  color: #f59e0b; }
  :global(.avatar-rojo)     { background: rgba(239,68,68,0.2);   color: var(--rojo); }
  :global(.avatar-azul)     { background: rgba(59,130,246,0.2);  color: #3b82f6; }

  /* ── Badges ── */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 500; }
  .badge-morado { background: var(--morado-claro); color: var(--morado); }
  .badge-cat    { background: var(--tarjeta2); color: var(--texto2); border: 1px solid var(--borde); }

  /* ── Botones ── */
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: var(--radio); font-size: 0.875rem; font-weight: 600; font-family: inherit; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.15s; }
  .btn-primario { background: linear-gradient(135deg, var(--morado), #9b6ef5); color: #fff; }
  .btn-primario:hover { opacity: 0.88; }
  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }

  /* ── Footer ── */
  footer { background: var(--tarjeta); border-top: 1px solid var(--borde); padding: 2rem 2rem 1.5rem; margin-top: 3rem; }
  .footer-grid { max-width: 1200px; margin: 0 auto 1.5rem; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; }
  .footer-col p, .footer-col a { font-size: 0.82rem; color: var(--texto2); line-height: 1.8; display: block; text-decoration: none; }
  .footer-col h4 { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }
  .footer-col a:hover { color: var(--morado); }
  .footer-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
  .footer-logo img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
  .footer-logo span { font-weight: 700; color: var(--morado); font-size: 0.95rem; }
  .footer-bottom { max-width: 1200px; margin: 0 auto; text-align: center; font-size: 0.78rem; color: var(--texto3); border-top: 1px solid var(--borde); padding-top: 1.25rem; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .grid-stats-foros { grid-template-columns: repeat(2, 1fr); }
    .contenido-foros  { flex-direction: column; }
    .sidebar-categorias { width: 100%; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 480px) {
    .encabezado-foros { flex-direction: column; gap: 1rem; align-items: flex-start; }
  }
</style>
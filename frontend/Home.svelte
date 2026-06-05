<script>
  import '../css/home.css';
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ─ Sesión 
  let usuario = null;

  // ─ Stats
  let stats = {
    total_empresas:      '—',
    total_usuarios:      '—',
    total_empleos:       '—',
    total_postulaciones: '—',
  };

  let intervalo;

  
  onMount(() => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    renderStats();
    intervalo = setInterval(renderStats, 30000);
    return () => clearInterval(intervalo);
  });

  // ─ Stats
  async function renderStats() {
    try {
      const res  = await fetch(`${API}/admin/stats`);
      const data = await res.json();
      stats = {
        total_empresas:      data.total_empresas?.toLocaleString()      || '0',
        total_usuarios:      data.total_usuarios?.toLocaleString()      || '0',
        total_empleos:       data.total_empleos?.toLocaleString()       || '0',
        total_postulaciones: data.total_postulaciones?.toLocaleString() || '0',
      };
    } catch (e) {
      stats = { total_empresas:'—', total_usuarios:'—', total_empleos:'—', total_postulaciones:'—' };
    }
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }
</script>

<svelte:head>
  <title>Shovel - Inicio</title>
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

<!-- Hero -->
<div class="hero">
  <div class="hero-contenido">
    <h1>Encuentra el Trabajo de tus Sueños</h1>
    <p>Conectamos talento con oportunidades. Descubre miles de empleos en las mejores empresas.</p>
  </div>
</div>

<!-- Stats -->
<div class="grid-stats">
  <div class="tarjeta-stat">
    <div class="stat-icono">🏢</div>
    <div class="stat-numero">{stats.total_empresas}</div>
    <div class="stat-etiqueta">Empresas</div>
  </div>
  <div class="tarjeta-stat">
    <div class="stat-icono">👥</div>
    <div class="stat-numero">{stats.total_usuarios}</div>
    <div class="stat-etiqueta">Usuarios</div>
  </div>
  <div class="tarjeta-stat">
    <div class="stat-icono">📄</div>
    <div class="stat-numero">{stats.total_empleos}</div>
    <div class="stat-etiqueta">Empleos Publicados</div>
  </div>
  <div class="tarjeta-stat">
    <div class="stat-icono">📨</div>
    <div class="stat-numero">{stats.total_postulaciones}</div>
    <div class="stat-etiqueta">Solicitudes Recibidas</div>
  </div>
</div>

<!-- Features -->
<div class="seccion-features">
  <h2>Explora y encuentra tu trabajo Ideal</h2>

  <div class="texto-descripcion">
    <p>Explora y encuentra tu trabajo ideal a través de una plataforma diseñada para conectar a las personas con
      nuevas oportunidades laborales. Aquí puedes descubrir diferentes ofertas de empleo según tus intereses,
      habilidades y experiencia. Además, tendrás la posibilidad de conocer empresas que buscan talento como el
      tuyo y postularte fácilmente a las vacantes disponibles. El objetivo es facilitar la búsqueda de empleo
      y ayudarte a dar el siguiente paso en tu vida profesional.</p>
  </div>

  <div class="grid-features">
    <div class="feature-tarjeta">
      <div class="feature-icono">🔍</div>
      <h3>Búsqueda Inteligente</h3>
      <p>Algoritmos avanzados para conectarte con los empleos más relevantes según tu perfil y experiencia.</p>
    </div>
    <div class="feature-tarjeta">
      <div class="feature-icono">🛡️</div>
      <h3>Empresas Verificadas</h3>
      <p>Todas las empresas son verificadas para garantizar oportunidades legítimas y de calidad.</p>
    </div>
    <div class="feature-tarjeta">
      <div class="feature-icono">👥</div>
      <h3>Comunidad Activa</h3>
      <p>Únete a miles de profesionales, comparte experiencias y crece en tu carrera.</p>
    </div>
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
      <a href="#">Gestionar Vacantes</a>
      <a href="#">Ver Candidatos</a>
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
  /* ── Hero ── */
  .hero {
    background: linear-gradient(180deg, #0a0a18 0%, #13131f 100%);
    padding: 5rem 2rem 4rem;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(ellipse at 50% 0%, rgba(124,111,239,0.12) 0%, transparent 70%);
  }
  .hero-contenido { position: relative; z-index: 1; }
  .hero h1 {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #fff 40%, #9b8af0);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero p { color: var(--texto2); max-width: 520px; margin: 0 auto; font-size: 1.05rem; }

  /* ── Stats ── */
  .grid-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    max-width: 1200px;
    margin: -2rem auto 2rem;
    padding: 0 2rem;
    position: relative;
    z-index: 2;
  }
  .tarjeta-stat { background-color: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio); padding: 1.25rem; }
  .stat-icono { width: 36px; height: 36px; background-color: var(--morado-claro); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.75rem; font-size: 1.1rem; }
  .stat-numero  { font-size: 1.6rem; font-weight: 700; margin-bottom: 2px; }
  .stat-etiqueta { font-size: 0.78rem; color: var(--texto2); }

  /* ── Features ── */
  .seccion-features { max-width: 1200px; margin: 0 auto; padding: 0 2rem 3rem; }
  .seccion-features h2 { text-align: center; font-size: 1.6rem; margin-bottom: 1.5rem; }

  .texto-descripcion { background-color: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio-grande); padding: 1.5rem; text-align: center; color: var(--texto2); line-height: 1.8; margin-bottom: 2rem; }

  .grid-features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
  .feature-tarjeta { background-color: var(--tarjeta2); border: 1px solid var(--borde); border-radius: var(--radio); padding: 1.25rem; }
  .feature-icono { width: 44px; height: 44px; background-color: var(--morado-claro); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; font-size: 1.3rem; }
  .feature-tarjeta h3 { font-size: 1rem; margin-bottom: 0.5rem; }
  .feature-tarjeta p  { font-size: 0.85rem; color: var(--texto2); line-height: 1.6; }

  /* ── Footer ── */
  footer { background: var(--tarjeta); border-top: 1px solid var(--borde); padding: 2rem 2rem 1.5rem; margin-top: 3rem; }
  .footer-grid { max-width: 1200px; margin: 0 auto 1.5rem; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; }
  .footer-col p, .footer-col a { font-size: 0.82rem; color: var(--texto2); line-height: 1.8; display: block; text-decoration: none; }
  .footer-col h4 { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }
  .footer-col a:hover { color: var(--morado); }
  .footer-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
  .footer-logo img  { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
  .footer-logo span { font-weight: 700; color: var(--morado); font-size: 0.95rem; }
  .footer-bottom { max-width: 1200px; margin: 0 auto; text-align: center; font-size: 0.78rem; color: var(--texto3); border-top: 1px solid var(--borde); padding-top: 1.25rem; }

  /* ── Nav logout ── */
  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }
</style>
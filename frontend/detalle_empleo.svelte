<script>
  import '../css/home.css';
  import { onMount } from 'svelte';
  import { Search, Briefcase, BookOpen, MessageSquare, User, LayoutGrid, LogOut, ArrowLeft } from 'lucide-svelte';

  const API = 'http://localhost:3000';

  let usuario = null;
  let empleo = null;
  let cargando = true;
  let error = '';

  $: esAdmin   = usuario?.rol === 'admin';
  $: esEmpresa = usuario?.rol === 'empresa';

  $: salario = empleo?.rango_salarial_min && empleo?.rango_salarial_max
    ? `$${empleo.rango_salarial_min.toLocaleString()} - $${empleo.rango_salarial_max.toLocaleString()}`
    : 'No especificado';

  $: responsabilidades = parseLineas(empleo?.responsabilidades);
  $: requisitos        = parseLineas(empleo?.requisitos);
  $: requisitosDeseables = parseLineas(empleo?.requisitos_deseables);
  $: beneficios        = parseLineas(empleo?.beneficios);

  function parseLineas(texto) {
    if (!texto) return [];
    return texto.split('\n').map(l => l.trim()).filter(Boolean);
  }

  function calcularTiempo(fecha) {
    const diff = Math.floor((new Date() - new Date(fecha)) / 60000);
    if (diff < 60)   return `Hace ${diff} minutos`;
    if (diff < 1440) return `Hace ${Math.floor(diff / 60)} horas`;
    if (diff < 2880) return 'Hace 1 día';
    return `Hace ${Math.floor(diff / 1440)} días`;
  }

  function formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = 'login.html';
  }

  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario'));

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      error = 'No se especificó un empleo.';
      cargando = false;
      return;
    }

    try {
      const res = await fetch(`${API}/empleos/${id}`);
      const data = await res.json();

      if (!res.ok) {
        error = 'Empleo no encontrado.';
      } else {
        empleo = data;
        document.title = `Shovel - ${empleo.titulo}`;
      }
    } catch (e) {
      error = 'Error al cargar el empleo.';
    } finally {
      cargando = false;
    }
  });

  async function postularse() {
    if (!usuario) {
      alert('Debes iniciar sesión para postularte.');
      window.location.href = 'login.html';
      return;
    }
    if (usuario.rol === 'empresa') {
      alert('Las empresas no pueden postularse a empleos.');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const empleo_id = params.get('id');

    try {
      const res = await fetch(`${API}/postulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, empleo_id, carta_presentacion: '' })
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Error al postularse'); return; }
      alert('✅ ¡Postulación enviada correctamente!');
    } catch (e) {
      alert('No se pudo conectar con el servidor');
    }
  }
</script>

<!-- Navbar -->
<nav>
  <a href="home.html" class="nav-logo">
    <img src="/contenido_multimedia/logo.png" alt="Shovel logo" />
    Shovel
  </a>
  <div class="nav-links">
    <a href="buscar.html" class="nav-link activo"><Search size={16} /> Buscar Empleos</a>
    {#if esEmpresa}
      <a href="publicar.html" class="nav-link"><Briefcase size={16} /> Publicar Empleo</a>
    {/if}
    <a href="recursos.html" class="nav-link"><BookOpen size={16} /> Recursos</a>
    <a href="foros.html" class="nav-link"><MessageSquare size={16} /> Foros</a>
    {#if !esAdmin}
      <a href="perfil.html" class="nav-link"><User size={16} /> Mi Perfil</a>
    {/if}
    {#if esAdmin}
      <a href="admin.html" class="nav-link"><LayoutGrid size={16} /> Admin</a>
    {/if}
    {#if usuario}
      <button class="btn-logout" on:click={logout}>
        <LogOut size={16} /> Cerrar Sesión
      </button>
    {/if}
  </div>
</nav>

<div class="contenedor-detalle">

  <a href="buscar.html" class="boton-volver">
    <ArrowLeft size={15} /> Volver a resultados
  </a>

  <!-- Header del empleo -->
  <div class="empleo-header">
    {#if cargando}
      <p style="color:var(--texto2); text-align:center; padding:2rem;">Cargando empleo...</p>
    {:else if error}
      <p style="color:var(--texto2); text-align:center; padding:2rem;">{error}</p>
    {:else if empleo}
      <div class="empleo-header-izq">
        <h1>{empleo.titulo}</h1>
        <p class="empleo-header-empresa">{empleo.empresa_nombre || '-'}</p>
        <div class="empleo-header-meta">
          <span>📍 {empleo.ubicacion || '-'}</span>
          <span>🕐 {empleo.tipo_contrato || '-'}</span>
          <span>💰 {salario}</span>
        </div>
        <div class="empleo-header-tags">
          <span class="tag">{empleo.nivel_experiencia || '-'}</span>
          <span class="tag">{empleo.sector || '-'}</span>
        </div>
      </div>
      <div class="empleo-header-der">
        <span class="empleo-publicado">Publicado {calcularTiempo(empleo.fecha_publicacion)}</span>
      </div>
    {/if}
  </div>

  {#if empleo}
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

        <div class="seccion-descripcion">
          <h2>Requisitos</h2>
          <ul class="lista-requisitos">
            {#each requisitos as item}
              <li>{item}</li>
            {:else}
              <li>No especificados</li>
            {/each}
          </ul>
        </div>

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
          <button class="btn btn-primario" on:click={postularse}>
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
            <span class="info-valor" style="color:var(--verde);">{salario}</span>
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
  /* ─ Navbar */
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 2rem;
    background-color: var(--fondo);
    border-bottom: 1px solid var(--borde);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--morado);
    text-decoration: none;
  }

  .nav-logo img {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    object-fit: cover;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.9rem;
    color: var(--texto);
    text-decoration: none;
    transition: background 0.2s;
  }

  .nav-link:hover,
  .nav-link.activo {
    background-color: var(--tarjeta);
    color: var(--morado);
  }

  .btn-logout {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.9rem;
    background: transparent;
    border: 1px solid #ef4444;
    color: #ef4444;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-logout:hover {
    background-color: rgba(239, 68, 68, 0.1);
  }

  /* ─ Contenedor  */
  .contenedor-detalle {
    max-width: 1000px;
    margin: 0 auto;
    padding: 2rem;
  }

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

  /* ─ Header empleo */
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

  .empleo-header-izq h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 6px;
  }

  .empleo-header-empresa {
    font-size: 1rem;
    color: var(--texto2);
    margin-bottom: 1rem;
  }

  .empleo-header-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.875rem;
    color: var(--texto2);
    margin-bottom: 1rem;
  }

  .empleo-header-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    background-color: var(--morado-claro);
    color: var(--morado);
    border-radius: 4px;
    font-size: 0.78rem;
    font-weight: 500;
  }

  .empleo-header-der {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.75rem;
    flex-shrink: 0;
  }

  .empleo-publicado {
    font-size: 0.8rem;
    color: var(--texto3);
  }

  /* ─ Layout dos columnas */
  .detalle-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    align-items: start;
  }

  /* ─ Secciones descripción */
  .seccion-descripcion {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .seccion-descripcion h2 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--borde);
  }

  .seccion-descripcion p {
    font-size: 0.9rem;
    color: var(--texto2);
    line-height: 1.8;
    margin-bottom: 0.75rem;
  }

  .lista-requisitos {
    list-style: none;
    padding: 0;
  }

  .lista-requisitos li {
    font-size: 0.9rem;
    color: var(--texto2);
    padding: 6px 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
    line-height: 1.5;
  }

  .lista-requisitos li::before {
    content: '✓';
    color: var(--morado);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* -Sidebar info */
  .sidebar-info {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .barra-postular {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 1.25rem;
  }

  .barra-postular p {
    font-size: 0.82rem;
    color: var(--texto2);
    margin-top: 0.75rem;
    text-align: center;
  }

  .tarjeta-info,
  .tarjeta-empresa {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 1.5rem;
  }

  .tarjeta-info h3,
  .tarjeta-empresa h3 {
    font-size: 0.95rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .info-fila {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--borde);
    font-size: 0.85rem;
  }

  .info-fila:last-child { border-bottom: none; }
  .info-etiqueta { color: var(--texto2); }
  .info-valor { font-weight: 500; color: var(--texto); }

  .empresa-logo {
    width: 56px;
    height: 56px;
    background-color: var(--morado-claro);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
  }

  .empresa-nombre { font-weight: 600; font-size: 1rem; margin-bottom: 4px; }
  .empresa-sector { font-size: 0.85rem; color: var(--texto2); margin-bottom: 0.75rem; }
  .empresa-desc   { font-size: 0.85rem; color: var(--texto2); line-height: 1.6; }

  /* ─ Botones  */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 7px;
    padding: 14px 20px;
    border-radius: var(--radio);
    font-size: 1rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    border: none;
    text-decoration: none;
    transition: opacity 0.15s, transform 0.1s;
  }

  .btn-primario {
    background: linear-gradient(135deg, var(--morado), #9b6ef5);
    color: #fff;
  }

  .btn-primario:hover { opacity: 0.88; transform: translateY(-1px); }

  /* ─ Footer */
  footer {
    border-top: 1px solid var(--borde);
    margin-top: 2rem;
  }

  .footer-bottom {
    text-align: center;
    padding: 1rem;
    font-size: 0.8rem;
    color: var(--texto2);
  }
</style>
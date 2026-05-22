<script>
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ── Estado de navegación ──────────────────────────────────
  let vistaActual = 'dashboard';

  // ── Estado sesión ─────────────────────────────────────────
  let usuario = null;

  // ── Dashboard ─────────────────────────────────────────────
  let stats = { total_usuarios: 0, total_empresas: 0, total_empleos: 0, total_postulaciones: 0 };
  let usuariosRecientes = [];
  let empresasRecientes = [];
  let graficaCrecimientoInst = null;
  let graficaCategoriasInst  = null;

  // ── Usuarios ──────────────────────────────────────────────
  let todosLosUsuarios = [];
  let usuariosFiltrados = [];
  let busquedaUsuarios = '';

  // ── Empresas ─────────────────────────────────────────────
  let empresas = [];

  // ── Vacantes ─────────────────────────────────────────────
  let vacantes = [];

  // ── Configuración ─────────────────────────────────────────
  let cfg = {
    nombreSitio: 'Shovel',
    descripcion: '',
    emailContacto: '',
    registroUsuarios: true,
    registroEmpresas: true,
    mantenimiento: false,
    maxEmpleos: 10,
    duracionVacante: 30,
    aprobarEmpleos: false,
    notifRegistros: true,
    notifPostulaciones: false,
  };
  let feedbackVisible = false;

  // ─────────────────────────────────────────────────────────
  onMount(() => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    cargarDashboard();
  });

  // ── Helpers ───────────────────────────────────────────────
  function formatFecha(fechaStr) {
    if (!fechaStr) return '—';
    const fecha = new Date(fechaStr);
    const diff = Math.floor((new Date() - fecha) / 86400000);
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    if (diff < 7)  return `Hace ${diff} días`;
    return fecha.toLocaleDateString('es-ES');
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ── Navegación ────────────────────────────────────────────
  function mostrarVista(vista) {
    vistaActual = vista;
    if (vista === 'dashboard')     cargarDashboard();
    if (vista === 'usuarios')      cargarUsuarios();
    if (vista === 'empresas')      cargarEmpresas();
    if (vista === 'vacantes')      cargarVacantes();
    if (vista === 'configuracion') cargarConfiguracion();
  }

  // ── Dashboard ─────────────────────────────────────────────
  async function cargarDashboard() {
    try {
      const res = await fetch(`${API}/admin/stats`);
      stats = await res.json();
    } catch (e) { console.error('Error stats:', e); }

    try {
      const res = await fetch(`${API}/admin/usuarios-recientes`);
      usuariosRecientes = await res.json();
    } catch (e) { usuariosRecientes = []; }

    try {
      const res = await fetch(`${API}/admin/empresas-recientes`);
      empresasRecientes = await res.json();
    } catch (e) { empresasRecientes = []; }

    // Charts se renderizan después del tick de Svelte
    setTimeout(() => {
      cargarGraficaCrecimiento();
      cargarGraficaCategorias();
    }, 50);
  }

  async function cargarGraficaCrecimiento() {
    if (graficaCrecimientoInst) { graficaCrecimientoInst.destroy(); graficaCrecimientoInst = null; }
    let labels = ['Ene','Feb','Mar','Abr','May','Jun'];
    let dataUsuarios = [0,0,0,0,0,0];
    let dataEmpresas = [0,0,0,0,0,0];
    try {
      const res = await fetch(`${API}/admin/crecimiento`);
      if (res.ok) {
        const data = await res.json();
        if (data.meses?.length)    labels       = data.meses;
        if (data.usuarios?.length) dataUsuarios = data.usuarios;
        if (data.empresas?.length) dataEmpresas = data.empresas;
      }
    } catch (e) {}
    const canvas = document.getElementById('graficaCrecimiento');
    if (!canvas) return;
    graficaCrecimientoInst = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label:'Usuarios', data:dataUsuarios, borderColor:'#7c6fef', backgroundColor:'rgba(124,111,239,0.1)', fill:true, tension:0.4, pointBackgroundColor:'#7c6fef', pointRadius:4 },
          { label:'Empresas', data:dataEmpresas, borderColor:'#22c55e', backgroundColor:'rgba(34,197,94,0.1)',   fill:true, tension:0.4, pointBackgroundColor:'#22c55e', pointRadius:4 }
        ]
      },
      options: {
        responsive:true,
        plugins: { legend:{ labels:{ color:'#a0a0b8', font:{ size:11 } } }, tooltip:{ mode:'index', intersect:false } },
        scales: {
          x:{ ticks:{ color:'#a0a0b8' }, grid:{ color:'rgba(255,255,255,0.05)' } },
          y:{ ticks:{ color:'#a0a0b8' }, grid:{ color:'rgba(255,255,255,0.05)' }, beginAtZero:true }
        }
      }
    });
  }

  async function cargarGraficaCategorias() {
    if (graficaCategoriasInst) { graficaCategoriasInst.destroy(); graficaCategoriasInst = null; }
    let labels = ['Sin datos']; let valores = [1];
    const COLORES = ['#7c6fef','#6158d4','#22c55e','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16'];
    try {
      const res = await fetch(`${API}/admin/empleos-por-categoria`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          labels  = data.map(d => d.categoria || d.sector || d.nombre || '—');
          valores = data.map(d => d.total || d.cantidad || d.count || 0);
        }
      }
    } catch (e) {}
    const canvas = document.getElementById('graficaCategorias');
    if (!canvas) return;
    graficaCategoriasInst = new Chart(canvas.getContext('2d'), {
      type:'doughnut',
      data:{ labels, datasets:[{ data:valores, backgroundColor:labels.map((_,i)=>COLORES[i%COLORES.length]), borderWidth:0 }] },
      options:{
        responsive:true,
        plugins:{
          legend:{ position:'right', labels:{ color:'#a0a0b8', font:{ size:11 } } },
          tooltip:{ callbacks:{ label: ctx => {
            const total = ctx.dataset.data.reduce((a,b)=>a+b,0);
            const pct = total>0?((ctx.raw/total)*100).toFixed(1):0;
            return ` ${ctx.label}: ${ctx.raw.toLocaleString()} (${pct}%)`;
          }}}
        }
      }
    });
  }

  // ── Usuarios ──────────────────────────────────────────────
  async function cargarUsuarios() {
    try {
      const res = await fetch(`${API}/usuarios`);
      todosLosUsuarios = await res.json();
      usuariosFiltrados = [...todosLosUsuarios];
    } catch (e) { todosLosUsuarios = []; usuariosFiltrados = []; }
  }

  function filtrarUsuarios() {
    const t = busquedaUsuarios.toLowerCase();
    usuariosFiltrados = todosLosUsuarios.filter(u =>
      u.nombre_completo.toLowerCase().includes(t) ||
      u.email.toLowerCase().includes(t)
    );
  }

  function verUsuario(u) {
    alert(`👤 ${u.nombre_completo}\n📧 ${u.email}\n📍 ${u.ubicacion||'—'}\n💼 ${u.titulo_profesional||'—'}\n🔖 Rol: ${u.rol}`);
  }

  async function eliminarUsuario(id, nombre) {
    if (!confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      const res = await fetch(`${API}/usuarios/${id}`, { method:'DELETE' });
      const data = await res.json();
      if (res.ok) {
        todosLosUsuarios  = todosLosUsuarios.filter(u => u.id !== id);
        usuariosFiltrados = usuariosFiltrados.filter(u => u.id !== id);
      } else alert('Error: ' + data.error);
    } catch (e) { alert('Error al eliminar el usuario'); }
  }

  // ── Empresas ─────────────────────────────────────────────
  async function cargarEmpresas() {
    try {
      const res = await fetch(`${API}/empresas`);
      empresas = await res.json();
    } catch (e) { empresas = []; }
  }

  function verEmpresa(id) { window.open(`${API}/empresas/${id}`, '_blank'); }

  async function eliminarEmpresa(id, nombre) {
    if (!confirm(`¿Eliminar la empresa "${nombre}"?`)) return;
    try {
      const res = await fetch(`${API}/empresas/${id}`, { method:'DELETE' });
      if (res.ok) empresas = empresas.filter(e => e.id !== id);
      else alert('Error al eliminar empresa');
    } catch (e) { alert('Error al eliminar empresa'); }
  }

  // ── Vacantes ─────────────────────────────────────────────
  async function cargarVacantes() {
    try {
      const res = await fetch(`${API}/empleos`);
      vacantes = await res.json();
    } catch (e) { vacantes = []; }
  }

  async function eliminarVacante(id, titulo) {
    if (!confirm(`¿Eliminar la vacante "${titulo}"?`)) return;
    try {
      const res = await fetch(`${API}/empleos/${id}`, { method:'DELETE' });
      if (res.ok) vacantes = vacantes.filter(v => v.id !== id);
      else alert('Error al eliminar vacante');
    } catch (e) { alert('Error al eliminar vacante'); }
  }

  // ── Configuración ─────────────────────────────────────────
  function cargarConfiguracion() {
    const guardada = JSON.parse(localStorage.getItem('shovel_config') || '{}');
    cfg = {
      nombreSitio:        guardada.nombreSitio        ?? 'Shovel',
      descripcion:        guardada.descripcion        ?? '',
      emailContacto:      guardada.emailContacto      ?? '',
      registroUsuarios:   guardada.registroUsuarios   ?? true,
      registroEmpresas:   guardada.registroEmpresas   ?? true,
      mantenimiento:      guardada.mantenimiento      ?? false,
      maxEmpleos:         guardada.maxEmpleos         ?? 10,
      duracionVacante:    guardada.duracionVacante    ?? 30,
      aprobarEmpleos:     guardada.aprobarEmpleos     ?? false,
      notifRegistros:     guardada.notifRegistros     ?? true,
      notifPostulaciones: guardada.notifPostulaciones ?? false,
    };
  }

  function guardarConfiguracion() {
    localStorage.setItem('shovel_config', JSON.stringify(cfg));
    feedbackVisible = true;
    setTimeout(() => { feedbackVisible = false; }, 3000);
  }
</script>

<svelte:head>
  <title>Shovel - Admin</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
</svelte:head>

<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">
    <img src="/contenido_multimedia/logo.png" alt="Shovel" style="width:36px;height:36px;border-radius:8px;object-fit:cover;">
    Shovel
  </a>
  <div class="nav-links">
    <a href="/buscar"   class="nav-link">Buscar Empleos</a>
    <a href="/recursos" class="nav-link">Recursos</a>
    <a href="/foros"    class="nav-link">Foros</a>
    <a href="/admin"    class="nav-link activo">Admin</a>
    {#if usuario}
      <button class="nav-link btn-logout" on:click={logout}>Cerrar Sesión</button>
    {/if}
  </div>
</nav>

<div class="layout-admin">

  <!-- Sidebar -->
  <div class="sidebar-admin">
    <h3>Panel Admin</h3>
    {#each [
      { id:'dashboard',     label:'Dashboard',     icon:'layout-grid' },
      { id:'usuarios',      label:'Usuarios',      icon:'users'       },
      { id:'empresas',      label:'Empresas',      icon:'briefcase'   },
      { id:'vacantes',      label:'Vacantes',      icon:'file-text'   },
      { id:'configuracion', label:'Configuración', icon:'settings'    },
    ] as item}
      <a
        class="nav-admin-item"
        class:activo={vistaActual === item.id}
        on:click|preventDefault={() => mostrarVista(item.id)}
        href="#"
      >
        {item.label}
      </a>
    {/each}
  </div>

  <!-- Contenido -->
  <div class="contenido-admin">

    <!-- ══ DASHBOARD ══ -->
    {#if vistaActual === 'dashboard'}
      <h1>Dashboard Principal</h1>

      <div class="grid-stats-admin">
        <div class="stat-admin">
          <div class="stat-admin-cabecera"><div class="stat-admin-icono">👥</div><span class="tendencia">↗</span></div>
          <div class="numero">{stats.total_usuarios?.toLocaleString() || '0'}</div>
          <div class="etiqueta">Usuarios Totales</div>
        </div>
        <div class="stat-admin">
          <div class="stat-admin-cabecera"><div class="stat-admin-icono">🏢</div><span class="tendencia">↗</span></div>
          <div class="numero">{stats.total_empresas?.toLocaleString() || '0'}</div>
          <div class="etiqueta">Empresas Activas</div>
        </div>
        <div class="stat-admin">
          <div class="stat-admin-cabecera"><div class="stat-admin-icono">📄</div><span class="tendencia">↗</span></div>
          <div class="numero">{stats.total_empleos?.toLocaleString() || '0'}</div>
          <div class="etiqueta">Empleos Publicados</div>
        </div>
        <div class="stat-admin">
          <div class="stat-admin-cabecera"><div class="stat-admin-icono">📨</div><span class="tendencia">↗</span></div>
          <div class="numero">{stats.total_postulaciones?.toLocaleString() || '0'}</div>
          <div class="etiqueta">Postulaciones</div>
        </div>
      </div>

      <div class="grid-graficas">
        <div class="tarjeta-grafica">
          <h3>Crecimiento de Usuarios y Empresas</h3>
          <canvas id="graficaCrecimiento" height="200"></canvas>
        </div>
        <div class="tarjeta-grafica">
          <h3>Empleos por Categoría</h3>
          <canvas id="graficaCategorias" height="200"></canvas>
        </div>
      </div>

      <div class="grid-listas">
        <div class="lista-reciente">
          <h3>Usuarios Recientes</h3>
          {#if usuariosRecientes.length === 0}
            <div style="color:var(--texto2); padding:1rem;">Sin datos</div>
          {:else}
            {#each usuariosRecientes as u}
              <div class="fila-lista">
                <div>
                  <div class="fila-usuario-nombre">{u.nombre_completo}</div>
                  <div class="fila-usuario-email">{u.email}</div>
                </div>
                <div class="fila-der">
                  <div class="fila-tiempo">{formatFecha(u.fecha_registro)}</div>
                  <span class="badge {u.estado?.toLowerCase() === 'activo' ? 'badge-verde' : 'badge-amarillo'}">{u.estado || '—'}</span>
                </div>
              </div>
            {/each}
          {/if}
        </div>

        <div class="lista-reciente">
          <h3>Empresas Recientes</h3>
          {#if empresasRecientes.length === 0}
            <div style="color:var(--texto2); padding:1rem;">Sin datos</div>
          {:else}
            {#each empresasRecientes as e}
              <div class="fila-lista">
                <div>
                  <div class="fila-empresa-nombre">{e.nombre} {e.verificada ? '✓' : ''}</div>
                  <div class="fila-empresa-sector">{e.industria || '—'}</div>
                </div>
                <div class="fila-empleos">{e.total_empleos} empleos<br>publicados</div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/if}

    <!-- ══ USUARIOS ══ -->
    {#if vistaActual === 'usuarios'}
      <div class="encabezado-tabla">
        <h1>Gestión de Usuarios</h1>
        <input
          class="input"
          style="max-width:240px;"
          placeholder="Buscar usuarios..."
          bind:value={busquedaUsuarios}
          on:input={filtrarUsuarios}
        >
      </div>
      <div class="tabla-contenedor">
        <table class="tabla-datos">
          <thead>
            <tr>
              <th>Usuario</th><th>Email</th><th>Fecha Registro</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#if usuariosFiltrados.length === 0}
              <tr><td colspan="5" style="text-align:center; color:var(--texto2);">No hay usuarios</td></tr>
            {:else}
              {#each usuariosFiltrados as u}
                <tr>
                  <td style="font-weight:500;">{u.nombre_completo}</td>
                  <td style="color:var(--texto2);">{u.email}</td>
                  <td style="color:var(--texto2);">{formatFecha(u.fecha_registro)}</td>
                  <td>
                    <span class="badge {u.estado?.toLowerCase() === 'activo' ? 'badge-verde' : 'badge-rojo'}">{u.estado || '—'}</span>
                  </td>
                  <td>
                    <span style="cursor:pointer; color:var(--texto2); margin-right:8px;" on:click={() => verUsuario(u)}>👁</span>
                    <span style="cursor:pointer; color:var(--rojo);" on:click={() => eliminarUsuario(u.id, u.nombre_completo)}>✕</span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    {/if}

    <!-- ══ EMPRESAS ══ -->
    {#if vistaActual === 'empresas'}
      <div class="encabezado-tabla">
        <h1>Gestión de Empresas</h1>
      </div>
      <div class="tabla-contenedor" style="margin-top:1rem;">
        <table class="tabla-datos">
          <thead>
            <tr>
              <th>Empresa</th><th>Sector</th><th>Empleos</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#if empresas.length === 0}
              <tr><td colspan="5" style="text-align:center; color:var(--texto2);">No hay empresas registradas</td></tr>
            {:else}
              {#each empresas as e}
                <tr>
                  <td style="font-weight:500;">{e.nombre}</td>
                  <td style="color:var(--texto2);">{e.industria || '—'}</td>
                  <td>{e.total_empleos || 0}</td>
                  <td>
                    {#if e.verificada}
                      <span class="badge badge-verde">Verificada</span>
                    {:else}
                      <span class="badge badge-amarillo">Pendiente</span>
                    {/if}
                  </td>
                  <td>
                    <span style="cursor:pointer; color:var(--texto2); margin-right:8px;" on:click={() => verEmpresa(e.id)}>👁</span>
                    <span style="cursor:pointer; color:var(--rojo);" on:click={() => eliminarEmpresa(e.id, e.nombre)}>✕</span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    {/if}

    <!-- ══ VACANTES ══ -->
    {#if vistaActual === 'vacantes'}
      <div class="encabezado-tabla">
        <h1>Gestión de Vacantes</h1>
      </div>
      <div class="tabla-contenedor" style="margin-top:1rem;">
        <table class="tabla-datos">
          <thead>
            <tr>
              <th>Título</th><th>Empresa</th><th>Sector</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {#if vacantes.length === 0}
              <tr><td colspan="6" style="text-align:center; color:var(--texto2);">No hay vacantes registradas</td></tr>
            {:else}
              {#each vacantes as emp}
                <tr>
                  <td style="font-weight:500;">{emp.titulo}</td>
                  <td style="color:var(--texto2);">{emp.empresa_nombre || '—'}</td>
                  <td style="color:var(--texto2);">{emp.sector || '—'}</td>
                  <td>
                    <span class="badge {emp.estado?.toLowerCase() === 'activo' ? 'badge-verde' : 'badge-amarillo'}">{emp.estado || '—'}</span>
                  </td>
                  <td style="color:var(--texto2);">{formatFecha(emp.fecha_publicacion)}</td>
                  <td>
                    <span style="cursor:pointer; color:var(--rojo);" on:click={() => eliminarVacante(emp.id, emp.titulo)}>✕</span>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    {/if}

    <!-- ══ CONFIGURACIÓN ══ -->
    {#if vistaActual === 'configuracion'}
      <h1>Configuración</h1>

      <!-- Información del sitio -->
      <div class="config-seccion" style="margin-top:1.5rem;">
        <h3>🌐 Información del Sitio</h3>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Nombre del sitio</span>
            <span class="config-fila-desc">Nombre que aparece en el navegador y encabezados</span>
          </div>
          <input class="config-input" type="text" placeholder="Shovel" bind:value={cfg.nombreSitio}>
        </div>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Descripción breve</span>
            <span class="config-fila-desc">Descripción corta de la plataforma</span>
          </div>
          <input class="config-input" type="text" placeholder="Plataforma de empleos" bind:value={cfg.descripcion}>
        </div>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Email de contacto</span>
            <span class="config-fila-desc">Correo público de soporte o contacto</span>
          </div>
          <input class="config-input" type="email" placeholder="contacto@shovel.com" bind:value={cfg.emailContacto}>
        </div>
      </div>

      <!-- Registro y acceso -->
      <div class="config-seccion">
        <h3>👤 Registro y Acceso</h3>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Permitir registro de usuarios</span>
            <span class="config-fila-desc">Habilita o deshabilita nuevos registros de candidatos</span>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={cfg.registroUsuarios}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Permitir registro de empresas</span>
            <span class="config-fila-desc">Habilita o deshabilita nuevos registros de empresas</span>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={cfg.registroEmpresas}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Modo mantenimiento</span>
            <span class="config-fila-desc">Solo los admins pueden acceder al sitio</span>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={cfg.mantenimiento}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Empleos -->
      <div class="config-seccion">
        <h3>💼 Empleos</h3>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Máximo de empleos por empresa</span>
            <span class="config-fila-desc">Límite de vacantes activas que puede tener una empresa</span>
          </div>
          <input class="config-input" type="number" placeholder="10" min="1" style="width:100px;" bind:value={cfg.maxEmpleos}>
        </div>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Duración de vacante (días)</span>
            <span class="config-fila-desc">Días antes de que una vacante expire automáticamente</span>
          </div>
          <select class="config-select" bind:value={cfg.duracionVacante}>
            <option value={15}>15 días</option>
            <option value={30}>30 días</option>
            <option value={60}>60 días</option>
            <option value={90}>90 días</option>
            <option value={0}>Sin límite</option>
          </select>
        </div>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Aprobar empleos manualmente</span>
            <span class="config-fila-desc">Los empleos requieren aprobación del admin antes de publicarse</span>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={cfg.aprobarEmpleos}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <!-- Notificaciones -->
      <div class="config-seccion">
        <h3>🔔 Notificaciones</h3>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Notificar nuevos registros</span>
            <span class="config-fila-desc">Recibir alerta cuando se registre un nuevo usuario o empresa</span>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={cfg.notifRegistros}>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="config-fila">
          <div class="config-fila-info">
            <span class="config-fila-titulo">Notificar nuevas postulaciones</span>
            <span class="config-fila-desc">Recibir alerta cuando alguien postule a una vacante</span>
          </div>
          <label class="toggle">
            <input type="checkbox" bind:checked={cfg.notifPostulaciones}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <button class="btn-guardar-config" on:click={guardarConfiguracion}>Guardar Cambios</button>
      {#if feedbackVisible}
        <div class="config-feedback">✓ Configuración guardada correctamente</div>
      {/if}
    {/if}

  </div>
</div>

<footer>
  <div style="text-align:center; padding:0.75rem; font-size:0.8rem; color:var(--texto3);">
    © 2026 Shovel. Todos los derechos reservados.
  </div>
</footer>

<style>
  /* ── Layout ── */
  .layout-admin {
    display: flex;
    min-height: calc(100vh - 60px);
  }

  .sidebar-admin {
    width: 200px;
    background-color: var(--fondo2);
    border-right: 1px solid var(--borde);
    padding: 1.5rem 1rem;
    flex-shrink: 0;
  }

  .sidebar-admin h3 {
    font-size: 0.95rem;
    color: var(--morado);
    font-weight: 700;
    margin-bottom: 1.5rem;
  }

  .nav-admin-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--texto2);
    margin-bottom: 4px;
    transition: all 0.15s;
    text-decoration: none;
  }
  .nav-admin-item:hover { color: var(--texto); background-color: var(--tarjeta2); }
  .nav-admin-item.activo { color: var(--morado); background-color: var(--morado-claro); }

  .contenido-admin { flex: 1; padding: 1.5rem; overflow-y: auto; }
  .contenido-admin h1 { font-size: 1.4rem; margin-bottom: 1.25rem; }

  /* ── Stats ── */
  .grid-stats-admin {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .stat-admin {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio);
    padding: 1.25rem;
  }
  .stat-admin-cabecera { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
  .stat-admin-icono {
    width: 36px; height: 36px;
    background-color: var(--morado-claro);
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem;
  }
  .tendencia { font-size: 0.8rem; color: var(--verde); }
  .stat-admin .numero { font-size: 1.6rem; font-weight: 700; margin-bottom: 2px; }
  .stat-admin .etiqueta { font-size: 0.78rem; color: var(--texto2); }

  /* ── Gráficas ── */
  .grid-graficas { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
  .tarjeta-grafica {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 1.25rem;
  }
  .tarjeta-grafica h3 { font-size: 0.9rem; margin-bottom: 1rem; }

  /* ── Listas ── */
  .grid-listas { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .lista-reciente {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 1.25rem;
  }
  .lista-reciente h3 { font-size: 0.9rem; margin-bottom: 1rem; }
  .fila-lista { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--borde); }
  .fila-lista:last-child { border-bottom: none; }
  .fila-usuario-nombre { font-size: 0.875rem; font-weight: 500; margin-bottom: 2px; }
  .fila-usuario-email  { font-size: 0.78rem; color: var(--texto2); }
  .fila-der { text-align: right; }
  .fila-tiempo { font-size: 0.8rem; color: var(--texto2); margin-bottom: 4px; }
  .fila-empresa-nombre { font-size: 0.875rem; font-weight: 500; margin-bottom: 2px; }
  .fila-empresa-sector { font-size: 0.78rem; color: var(--texto2); }
  .fila-empleos { text-align: right; font-size: 0.8rem; color: var(--texto2); }

  /* ── Tablas ── */
  .tabla-contenedor {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    overflow: hidden;
  }
  .tabla-datos { width: 100%; border-collapse: collapse; }
  .tabla-datos th { text-align: left; padding: 12px 16px; font-size: 0.8rem; color: var(--texto2); font-weight: 500; border-bottom: 1px solid var(--borde); }
  .tabla-datos td { padding: 14px 16px; font-size: 0.875rem; border-bottom: 1px solid var(--borde); }
  .tabla-datos tr:last-child td { border-bottom: none; }
  .tabla-datos tr:hover td { background-color: rgba(124,111,239,0.04); }
  .encabezado-tabla { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }

  /* ── Configuración ── */
  .config-seccion {
    background: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 20px;
  }
  .config-seccion h3 { font-size: 1rem; font-weight: 700; margin-bottom: 18px; color: var(--texto); display: flex; align-items: center; gap: 8px; }
  .config-fila { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--borde); }
  .config-fila:last-child { border-bottom: none; }
  .config-fila-info { display: flex; flex-direction: column; gap: 3px; }
  .config-fila-titulo { font-size: 0.9rem; font-weight: 500; color: var(--texto); }
  .config-fila-desc   { font-size: 0.78rem; color: var(--texto2); }

  .config-input {
    background: var(--tarjeta2);
    border: 1px solid var(--borde);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--texto);
    font-size: 0.88rem;
    font-family: inherit;
    outline: none;
    width: 220px;
    transition: border-color 0.2s;
  }
  .config-input:focus { border-color: var(--morado); }

  .config-select {
    background: var(--tarjeta2);
    border: 1px solid var(--borde);
    border-radius: 8px;
    padding: 8px 12px;
    color: var(--texto);
    font-size: 0.88rem;
    font-family: inherit;
    outline: none;
    width: 180px;
    cursor: pointer;
  }

  .btn-guardar-config {
    background: var(--morado);
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
    transition: opacity 0.2s;
    margin-top: 8px;
  }
  .btn-guardar-config:hover { opacity: 0.85; }

  .config-feedback {
    margin-top: 12px;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    background: rgba(34,197,94,0.15);
    border: 1px solid #22c55e;
    color: #4ade80;
  }

  /* ── Toggle ── */
  .toggle { position: relative; width: 44px; height: 24px; flex-shrink: 0; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; inset: 0; background: var(--borde); border-radius: 24px; cursor: pointer; transition: background 0.2s; }
  .toggle-slider::before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
  .toggle input:checked + .toggle-slider { background: var(--morado); }
  .toggle input:checked + .toggle-slider::before { transform: translateX(20px); }

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
<script>
  import { onMount } from 'svelte';
  import '../css/perfil.css';
  import '../css/publicar.css';

  const API = 'http://localhost:3000';

  // ── Sesión ────────────────────────────────────────────────
  let usuario = null;

  // ── Tab activo ────────────────────────────────────────────
  let tab = 'general';

  // ── Datos perfil ──────────────────────────────────────────
  let perfil = {};
  let fotoPerfil = '';
  let cvNombre = 'Sin CV subido';
  let cvFecha  = '-';
  let cvUrl    = '';

  // ── Stats ─────────────────────────────────────────────────
  let statVisitas       = '-';
  let statPostulaciones = '-';
  let statGuardados     = '-';
  let statCompletitud   = '-';

  // ── Editar ────────────────────────────────────────────────
  let edit = {};
  let msgEditar = '';
  let msgEditarTipo = '';

  // ── Errores de validación por campo ──────────────────────
  let errores = {};

  // ── Habilidades ───────────────────────────────────────────
  let habilidades    = [];
  let nuevaHabilidad = '';
  let nivelHabilidad = 'Intermedio';
  const NIVELES_HAB  = ['Básico','Intermedio','Avanzado','Experto'];
  const nivelTexto   = { 1:'Básico', 2:'Intermedio', 3:'Intermedio+', 4:'Avanzado', 5:'Experto' };

  // ── Postulaciones ─────────────────────────────────────────
  let postulaciones = [];
  const estadoColores = {
    'pendiente':   { bg:'#f59e0b22', color:'#f59e0b', texto:'En Revisión' },
    'en_revision': { bg:'#f59e0b22', color:'#f59e0b', texto:'En Revisión' },
    'entrevista':  { bg:'#6366f122', color:'#6366f1', texto:'Entrevista Agendada' },
    'activo':      { bg:'#22c55e22', color:'#22c55e', texto:'Activo' },
    'rechazado':   { bg:'#ef444422', color:'#ef4444', texto:'No Pasó' },
    'aceptado':    { bg:'#22c55e22', color:'#22c55e', texto:'Aceptado' },
  };

  // ── Valoraciones ──────────────────────────────────────────
  let valoraciones   = [];
  let valoracionesRecibidas = [];
  let empresas       = [];
  let modalValoracion = false;
  let valEmpresaId   = '';
  let valCalificacion = '5';
  let valComentario  = '';
  let msgValoracion  = '';
  let msgValoracionTipo = '';

  // ── Alertas ───────────────────────────────────────────────
  let alertas        = [];
  let alertaPalabras = '';
  let alertaUbicacion= '';
  let alertaFrecuencia = 'Semanal';
  let msgAlertas     = '';
  let msgAlertasTipo = '';

  // ─────────────────────────────────────────────────────────
  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    if (!usuario) { window.location.href = '/login'; return; }
    await cargarPerfil();
  });

  // ── Helpers ───────────────────────────────────────────────
  function formatFecha(f) {
    return new Date(f).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
  }
  function estrellas(n) { return '⭐'.repeat(n) + '☆'.repeat(5 - n); }
  function completitud(d, fotoUrl) {
    const campos = [d.nombre_completo, d.email, d.telefono, d.ubicacion,
      d.titulo_profesional, d.sobre_mi, d.sector_preferido, d.anios_experiencia, fotoUrl, d.linkedin_url];
    const rellenos = campos.filter(c => c && String(c).trim() !== '').length;
    return Math.round((rellenos / campos.length) * 100) + '%';
  }
  function logout() { localStorage.removeItem('usuario'); window.location.href = '/login'; }

  // ── Teléfono auto-formato XXXX-XXXX ─────────────────────
  function handleTelefonoInput(e) {
    let val = e.target.value.replace(/[^\d-]/g, '');
    const soloDigitos = val.replace(/-/g, '');
    if (soloDigitos.length <= 4) {
      val = soloDigitos;
    } else {
      val = soloDigitos.slice(0, 4) + '-' + soloDigitos.slice(4, 8);
    }
    edit.telefono = val;
    delete errores.telefono;
    errores = errores;
  }

  // ── Validaciones ─────────────────────────────────────────
  function validarPerfil() {
    const e = {};
    const esEmpresa = usuario?.rol === 'empresa';

    if (!edit.nombre_completo?.trim()) {
      e.nombre_completo = 'El nombre es obligatorio.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/.test(edit.nombre_completo.trim())) {
      e.nombre_completo = 'Solo se permiten letras y espacios.';
    } else if (edit.nombre_completo.trim().length < 3) {
      e.nombre_completo = 'Mínimo 3 caracteres.';
    }

    if (!edit.email?.trim()) {
      e.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(edit.email.trim())) {
      e.email = 'Ingresa un correo electrónico válido.';
    }

    if (edit.telefono?.trim() && !/^\d{4}-\d{4}$/.test(edit.telefono.trim())) {
      e.telefono = 'Formato inválido. Ej: 7777-8888';
    }

    if (edit.ubicacion?.trim() && edit.ubicacion.trim().length > 100) {
      e.ubicacion = 'Máximo 100 caracteres.';
    }

    if (!esEmpresa) {
      if (edit.titulo_profesional?.trim() && edit.titulo_profesional.trim().length > 80) {
        e.titulo_profesional = 'Máximo 80 caracteres.';
      }
      if (edit.anios_experiencia !== '' && edit.anios_experiencia !== null && edit.anios_experiencia !== undefined) {
        const anios = parseInt(edit.anios_experiencia);
        if (isNaN(anios) || anios < 0) {
          e.anios_experiencia = 'Debe ser un número positivo.';
        } else if (anios > 60) {
          e.anios_experiencia = 'Valor máximo: 60 años.';
        }
      }
    }

    if (edit.disponibilidad?.trim() && edit.disponibilidad.trim().length > 60) {
      e.disponibilidad = 'Máximo 60 caracteres.';
    }

    if (edit.sector_preferido?.trim() && edit.sector_preferido.trim().length > 80) {
      e.sector_preferido = 'Máximo 80 caracteres.';
    }

    if (edit.linkedin_url?.trim()) {
      try {
        const url = new URL(edit.linkedin_url.trim());
        if (!url.hostname.includes('linkedin.com')) e.linkedin_url = 'Debe ser una URL de LinkedIn.';
      } catch {
        e.linkedin_url = 'Ingresa una URL válida. Ej: https://linkedin.com/in/tu-perfil';
      }
    }

    if (edit.github_url?.trim()) {
      try {
        const url = new URL(edit.github_url.trim());
        if (!url.hostname.includes('github.com')) e.github_url = 'Debe ser una URL de GitHub.';
      } catch {
        e.github_url = 'Ingresa una URL válida. Ej: https://github.com/tu-usuario';
      }
    }

    if (edit.sobre_mi?.trim() && edit.sobre_mi.trim().length > 1000) {
      e.sobre_mi = 'Máximo 1000 caracteres.';
    }

    errores = e;
    return Object.keys(e).length === 0;
  }

  // ── Cambiar tab ───────────────────────────────────────────
  function cambiarTab(t) {
    tab = t;
    errores = {};
    if (t === 'postulaciones') cargarPostulaciones();
    if (t === 'habilidades')   cargarHabilidades();
    if (t === 'valoraciones')  {
      cargarValoraciones();
      cargarEmpresas();
      if (usuario?.rol === 'empresa') cargarValoracionesRecibidas();
    }
    if (t === 'alertas')       cargarAlertas();
  }

  // ── Perfil ────────────────────────────────────────────────
  async function cargarPerfil() {
    try {
      let res;
      if (usuario.rol === 'empresa') {
        res = await fetch(`${API}/empresas/${usuario.id}`);
      } else {
        res = await fetch(`${API}/usuarios/${usuario.id}`);
      }
      perfil = await res.json();

      if (usuario.rol === 'empresa') {
        perfil.nombre_completo = perfil.nombre_completo || perfil.nombre || '';
        perfil.sobre_mi        = perfil.sobre_mi        || perfil.descripcion || '';
        perfil.github_url      = perfil.github_url      || perfil.sitio_web   || '';
      }

      edit       = { ...perfil };
      fotoPerfil = perfil.foto_perfil ? `/contenido_multimedia/${perfil.foto_perfil}` : '';
      statVisitas     = perfil.visitas_perfil || 0;
      statCompletitud = completitud(perfil, perfil.foto_perfil);

      const resG    = await fetch(`${API}/postulaciones/guardados/${usuario.id}`);
      const guardados = await resG.json();
      statGuardados = Array.isArray(guardados) ? guardados.length : 0;
    } catch (e) { console.error(e); }
  }

  async function guardarPerfil() {
    if (!validarPerfil()) {
      msgEditar = 'Corrige los errores antes de guardar.';
      msgEditarTipo = 'error';
      return;
    }
    msgEditar = '';
    try {
      const url = usuario.rol === 'empresa'
        ? `${API}/empresas/${perfil.id}`
        : `${API}/usuarios/${usuario.id}`;

      const body = usuario.rol === 'empresa'
        ? JSON.stringify({
            nombre:          edit.nombre_completo,
            email:           edit.email,
            telefono:        edit.telefono,
            ubicacion:       edit.ubicacion,
            descripcion:     edit.sobre_mi,
            linkedin_url:    edit.linkedin_url,
            sitio_web:       edit.github_url,
            disponibilidad:  edit.disponibilidad,
            sector_preferido: edit.sector_preferido,
            industria:       perfil.industria,
            tamano:          perfil.tamano,
            logo:            perfil.logo,
          })
        : JSON.stringify({
            nombre_completo:    edit.nombre_completo,
            email:              edit.email,
            telefono:           edit.telefono,
            ubicacion:          edit.ubicacion,
            titulo_profesional: edit.titulo_profesional,
            anios_experiencia:  parseInt(edit.anios_experiencia) || 0,
            disponibilidad:     edit.disponibilidad,
            sector_preferido:   edit.sector_preferido,
            linkedin_url:       edit.linkedin_url,
            github_url:         edit.github_url,
            sobre_mi:           edit.sobre_mi,
          });

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();
      if (!res.ok) { msgEditar = data.error || 'Error al guardar'; msgEditarTipo = 'error'; return; }

      perfil = { ...perfil, ...edit };

      localStorage.setItem('usuario', JSON.stringify({
        ...usuario,
        nombre_completo: edit.nombre_completo,
        email: edit.email
      }));

      statCompletitud = completitud(edit, perfil.foto_perfil);
      msgEditar = '✓ Perfil actualizado correctamente';
      msgEditarTipo = 'exito';
      setTimeout(() => { msgEditar = ''; }, 3000);
    } catch (e) { console.error(e); }
  }

  async function subirFoto(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    try {
      const res  = await fetch(`${API}/usuarios/${usuario.id}/foto`, { method:'POST', body:fd });
      const data = await res.json();
      if (res.ok) fotoPerfil = `/contenido_multimedia/${data.foto_perfil}`;
    } catch (err) { console.error(err); }
  }

  async function subirCV(e) {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('cv', file);
    try {
      const res  = await fetch(`${API}/usuarios/${usuario.id}/cv`, { method:'POST', body:fd });
      const data = await res.json();
      if (res.ok) {
        cvNombre = data.nombre_archivo;
        cvFecha  = 'Actualizado: ' + new Date().toLocaleDateString('es-ES');
        cvUrl    = `/contenido_multimedia/${data.cv_url}`;
      }
    } catch (err) { console.error(err); }
  }

  // ── Habilidades ───────────────────────────────────────────
  async function cargarHabilidades() {
    try {
      const res = await fetch(`${API}/habilidades/usuario/${usuario.id}`);
      habilidades = await res.json();
    } catch (e) { habilidades = []; }
  }

  async function agregarHabilidad() {
    if (!nuevaHabilidad.trim()) return;
    try {
      const res = await fetch(`${API}/habilidades/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, nombre: nuevaHabilidad.trim(), nivel: nivelHabilidad })
      });
      if (res.ok) { nuevaHabilidad = ''; await cargarHabilidades(); }
    } catch (e) { console.error(e); }
  }

  async function eliminarHabilidad(id) {
    try {
      await fetch(`${API}/habilidades/usuario/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
      await cargarHabilidades();
    } catch (e) { console.error(e); }
  }

  // ── Postulaciones ─────────────────────────────────────────
  async function cargarPostulaciones() {
    try {
      const res = await fetch(`${API}/postulaciones/usuario/${usuario.id}`);
      postulaciones = await res.json();
      statPostulaciones = postulaciones.length;
    } catch (e) { postulaciones = []; }
  }

  async function eliminarPostulacion(id) {
    if (!confirm('¿Deseas retirar esta postulación?')) return;
    try {
      await fetch(`${API}/postulaciones/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
      await cargarPostulaciones();
    } catch (e) { console.error(e); }
  }

  // ── Valoraciones ──────────────────────────────────────────
  async function cargarValoraciones() {
    try {
      const res = await fetch(`${API}/valoraciones/usuario/${usuario.id}`);
      valoraciones = await res.json();
    } catch (e) { valoraciones = []; }
  }

  async function cargarValoracionesRecibidas() {
    try {
      const res = await fetch(`${API}/valoraciones/empresa/${usuario.id}`);
      valoracionesRecibidas = await res.json();
    } catch (e) { valoracionesRecibidas = []; }
  }

  async function cargarEmpresas() {
    if (empresas.length) return;
    try {
      const res = await fetch(`${API}/empresas`);
      empresas = await res.json();
    } catch (e) { empresas = []; }
  }

  async function guardarValoracion() {
    if (!valEmpresaId) { msgValoracion = 'Selecciona una empresa.'; msgValoracionTipo = 'error'; return; }
    try {
      const res = await fetch(`${API}/valoraciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, empresa_id: valEmpresaId, calificacion: valCalificacion, comentario: valComentario })
      });
      if (res.ok) {
        modalValoracion = false; valComentario = ''; valEmpresaId = ''; msgValoracion = '';
        await cargarValoraciones();
      } else {
        const data = await res.json();
        msgValoracion = data.error || 'Error al guardar valoración.';
        msgValoracionTipo = 'error';
      }
    } catch (e) { console.error(e); }
  }

  async function eliminarValoracion(id) {
    if (!confirm('¿Eliminar esta valoración?')) return;
    try {
      await fetch(`${API}/valoraciones/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
      await cargarValoraciones();
    } catch (e) { console.error(e); }
  }

  // ── Alertas ───────────────────────────────────────────────
  async function cargarAlertas() {
    try {
      const res = await fetch(`${API}/alertas/usuario/${usuario.id}`);
      alertas = await res.json();
    } catch (e) { alertas = []; }
  }

  async function guardarAlerta() {
    if (!alertaPalabras.trim()) {
      msgAlertas = 'Ingresa al menos una palabra clave.'; msgAlertasTipo = 'error';
      setTimeout(() => { msgAlertas = ''; }, 3000); return;
    }
    try {
      const res = await fetch(`${API}/alertas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, palabras_clave: alertaPalabras, ubicacion: alertaUbicacion, frecuencia: alertaFrecuencia })
      });
      if (res.ok) {
        alertaPalabras = ''; alertaUbicacion = '';
        msgAlertas = '✓ Alerta creada correctamente'; msgAlertasTipo = 'exito';
        setTimeout(() => { msgAlertas = ''; }, 3000);
        await cargarAlertas();
      }
    } catch (e) { console.error(e); }
  }

  async function toggleAlerta(id, activa) {
    try {
      await fetch(`${API}/alertas/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, activa: !activa })
      });
      await cargarAlertas();
    } catch (e) { console.error(e); }
  }

  async function eliminarAlerta(id) {
    if (!confirm('¿Eliminar esta alerta?')) return;
    try {
      await fetch(`${API}/alertas/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id })
      });
      await cargarAlertas();
    } catch (e) { console.error(e); }
  }
</script>

<svelte:head><title>Shovel - Mi Perfil</title></svelte:head>

<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">
    <img src="/contenido_multimedia/logo.png" alt="Shovel" style="width:36px;height:36px;border-radius:8px;object-fit:cover;">Shovel
  </a>
  <div class="nav-links">
    <a href="/buscar"   class="nav-link">Buscar Empleos</a>
    {#if usuario?.rol === 'empresa'}<a href="/publicar" class="nav-link">Publicar Empleo</a>{/if}
    <a href="/recursos" class="nav-link">Recursos</a>
    <a href="/foros"    class="nav-link">Foros</a>
    <a href="/perfil"   class="nav-link activo">Mi Perfil</a>
    {#if usuario?.rol === 'admin'}<a href="/admin" class="nav-link">Admin</a>{/if}
    {#if usuario}<button class="nav-link btn-logout" on:click={logout}>Cerrar Sesión</button>{/if}
  </div>
</nav>

<div class="contenido-perfil">

  <!-- Header perfil -->
  <div class="perfil-header">
    <div class="perfil-avatar" style="position:relative;cursor:pointer;width:80px;height:80px;" on:click={() => document.getElementById('input-foto').click()}>
      {#if fotoPerfil}
        <img src={fotoPerfil} alt="foto" style="width:80px;height:80px;border-radius:50%;object-fit:cover;">
      {:else}
        <span style="font-size:2.5rem;">👤</span>
      {/if}
      <div style="position:absolute;bottom:0;right:0;background:var(--morado);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;">📷</div>
      <input type="file" id="input-foto" accept="image/*" style="display:none;" on:change={subirFoto}>
    </div>
    <div class="perfil-info">
      <h1>{perfil.nombre_completo || 'Cargando...'}</h1>
      <p class="perfil-cargo">{perfil.titulo_profesional || '-'}</p>
      <div class="perfil-contacto">
        <span>📍 {perfil.ubicacion || '-'}</span>
        <span>✉ {perfil.email || '-'}</span>
        <span>📞 {perfil.telefono || '-'}</span>
        <span>💼 {perfil.anios_experiencia || '0'} años de experiencia</span>
      </div>
    </div>
  </div>

  <!-- Stats -->
  <div class="perfil-stats">
    <div><div class="perfil-stat-numero">{statVisitas}</div><div class="perfil-stat-label">Visitas al Perfil</div></div>
    <div><div class="perfil-stat-numero">{statPostulaciones}</div><div class="perfil-stat-label">Solicitudes Enviadas</div></div>
    <div><div class="perfil-stat-numero">{statGuardados}</div><div class="perfil-stat-label">Empleos Guardados</div></div>
    <div><div class="perfil-stat-numero">{statCompletitud}</div><div class="perfil-stat-label">Completitud del Perfil</div></div>
  </div>

  <!-- Tarjeta con tabs -->
  <div class="tarjeta">
    <div class="tabs">
      {#each [
        {id:'general',        label:'Vista General'},
        {id:'editar',         label:'Editar Perfil'},
        {id:'postulaciones',  label:'Mis Postulaciones'},
        {id:'habilidades',    label:'Habilidades'},
        {id:'valoraciones',   label:'Mis Valoraciones'},
        {id:'alertas',        label:'Alertas'},
      ] as t}
        <div class="tab" class:activo={tab === t.id} on:click={() => cambiarTab(t.id)}>{t.label}</div>
      {/each}
    </div>

    <!-- ══ VISTA GENERAL ══ -->
    {#if tab === 'general'}
      <div class="contenido-tab">
        <div class="seccion-perfil">
          <h3>Sobre {usuario?.rol === 'empresa' ? 'la Empresa' : 'Mí'}</h3>
          <p>{perfil.sobre_mi || '-'}</p>
        </div>
        <div class="seccion-perfil">
          <h3>Currículum</h3>
          <div class="tarjeta-cv">
            <div class="cv-icono-wrap">
              <div class="cv-icono">📄</div>
              <div>
                <div class="cv-nombre">{cvNombre}</div>
                <div class="cv-fecha">{cvFecha}</div>
              </div>
            </div>
            <div style="display:flex;gap:0.5rem;align-items:center;">
              {#if cvUrl}<a href={cvUrl} target="_blank" class="btn btn-borde btn-pequeno">👁 Ver CV</a>{/if}
              <button class="btn btn-borde btn-pequeno" on:click={() => document.getElementById('input-cv').click()}>↑ Actualizar CV</button>
              <input type="file" id="input-cv" accept=".pdf,.doc,.docx" style="display:none;" on:change={subirCV}>
            </div>
          </div>
        </div>
        <div class="seccion-perfil">
          <h3>Experiencia Laboral</h3>
          <div class="experiencia-item">
            <h4>{perfil.titulo_profesional || '-'}</h4>
            <p class="experiencia-empresa">{perfil.sector_preferido || '-'}</p>
            <p class="experiencia-desc">Disponibilidad: {perfil.disponibilidad || '-'}</p>
          </div>
        </div>
      </div>
    {/if}

    <!-- ══ EDITAR PERFIL ══ -->
    {#if tab === 'editar'}
      <div class="contenido-tab">
        <div class="seccion-perfil">
          <h3>Editar Información</h3>
          {#if msgEditar}
            <div class="msg-feedback" class:error={msgEditarTipo==='error'} class:exito={msgEditarTipo==='exito'}>{msgEditar}</div>
          {/if}
          <div class="grid-2">

            <div class="grupo-input" class:campo-error={errores.nombre_completo}>
              <label>Nombre completo <span class="requerido">*</span></label>
              <input class="input" type="text" bind:value={edit.nombre_completo}
                on:input={() => { delete errores.nombre_completo; errores = errores; }}
                placeholder="Ej: Juan Pérez">
              {#if errores.nombre_completo}<span class="error-msg">{errores.nombre_completo}</span>{/if}
            </div>

            <div class="grupo-input" class:campo-error={errores.email}>
              <label>Email <span class="requerido">*</span></label>
              <input class="input" type="email" bind:value={edit.email}
                on:input={() => { delete errores.email; errores = errores; }}
                placeholder="Ej: correo@ejemplo.com">
              {#if errores.email}<span class="error-msg">{errores.email}</span>{/if}
            </div>

            <div class="grupo-input" class:campo-error={errores.telefono}>
              <label>Teléfono</label>
              <input class="input" type="text" bind:value={edit.telefono}
                on:input={handleTelefonoInput}
                maxlength="9"
                placeholder="Ej: 7777-8888">
              {#if errores.telefono}<span class="error-msg">{errores.telefono}</span>{/if}
            </div>

            <div class="grupo-input" class:campo-error={errores.ubicacion}>
              <label>Ubicación</label>
              <input class="input" type="text" bind:value={edit.ubicacion}
                on:input={() => { delete errores.ubicacion; errores = errores; }}
                placeholder="Ej: San Salvador, El Salvador">
              {#if errores.ubicacion}<span class="error-msg">{errores.ubicacion}</span>{/if}
            </div>

            {#if usuario?.rol !== 'empresa'}
              <div class="grupo-input" class:campo-error={errores.titulo_profesional}>
                <label>Título Profesional</label>
                <input class="input" type="text" bind:value={edit.titulo_profesional}
                  on:input={() => { delete errores.titulo_profesional; errores = errores; }}
                  placeholder="Ej: Desarrollador Full Stack">
                {#if errores.titulo_profesional}<span class="error-msg">{errores.titulo_profesional}</span>{/if}
              </div>

              <div class="grupo-input" class:campo-error={errores.anios_experiencia}>
                <label>Años de Experiencia</label>
                <input class="input" type="number" min="0" max="60" bind:value={edit.anios_experiencia}
                  on:input={() => { delete errores.anios_experiencia; errores = errores; }}
                  placeholder="Ej: 3">
                {#if errores.anios_experiencia}<span class="error-msg">{errores.anios_experiencia}</span>{/if}
              </div>
            {/if}

            <div class="grupo-input" class:campo-error={errores.disponibilidad}>
              <label>Disponibilidad</label>
              <input class="input" type="text" bind:value={edit.disponibilidad}
                on:input={() => { delete errores.disponibilidad; errores = errores; }}
                placeholder="Ej: Inmediata, Remoto">
              {#if errores.disponibilidad}<span class="error-msg">{errores.disponibilidad}</span>{/if}
            </div>

            <div class="grupo-input" class:campo-error={errores.sector_preferido}>
              <label>Sector Preferido</label>
              <input class="input" type="text" bind:value={edit.sector_preferido}
                on:input={() => { delete errores.sector_preferido; errores = errores; }}
                placeholder="Ej: Tecnología, Salud">
              {#if errores.sector_preferido}<span class="error-msg">{errores.sector_preferido}</span>{/if}
            </div>

            <div class="grupo-input" class:campo-error={errores.linkedin_url}>
              <label>LinkedIn</label>
              <input class="input" type="text" bind:value={edit.linkedin_url}
                on:input={() => { delete errores.linkedin_url; errores = errores; }}
                placeholder="https://linkedin.com/in/tu-perfil">
              {#if errores.linkedin_url}<span class="error-msg">{errores.linkedin_url}</span>{/if}
            </div>

            <div class="grupo-input" class:campo-error={errores.github_url}>
              <label>{usuario?.rol === 'empresa' ? 'Sitio Web' : 'GitHub'}</label>
              <input class="input" type="text" bind:value={edit.github_url}
                on:input={() => { delete errores.github_url; errores = errores; }}
                placeholder="{usuario?.rol === 'empresa' ? 'https://tuempresa.com' : 'https://github.com/tu-usuario'}">
              {#if errores.github_url}<span class="error-msg">{errores.github_url}</span>{/if}
            </div>

          </div>

          <div class="grupo-input" style="margin-top:1rem;" class:campo-error={errores.sobre_mi}>
            <label>
              {usuario?.rol === 'empresa' ? 'Sobre la Empresa' : 'Sobre Mí'}
              <span class="char-count" class:char-limit={edit.sobre_mi?.length > 900}>
                {edit.sobre_mi?.length || 0}/1000
              </span>
            </label>
            <textarea class="input" rows="4" style="resize:vertical;" bind:value={edit.sobre_mi}
              on:input={() => { delete errores.sobre_mi; errores = errores; }}
              placeholder="{usuario?.rol === 'empresa' ? 'Describe tu empresa, misión y valores...' : 'Cuéntanos sobre ti, tu experiencia y objetivos...'}"></textarea>
            {#if errores.sobre_mi}<span class="error-msg">{errores.sobre_mi}</span>{/if}
          </div>

          <div style="margin-top:1rem;display:flex;gap:1rem;align-items:center;">
            <button class="btn btn-primario" on:click={guardarPerfil}>Guardar Cambios</button>
            <button class="btn btn-borde" on:click={() => { cambiarTab('general'); errores = {}; }}>Cancelar</button>
            <span style="font-size:0.78rem;color:var(--texto3);"><span class="requerido">*</span> Campos obligatorios</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- ══ POSTULACIONES ══ -->
    {#if tab === 'postulaciones'}
      <div class="contenido-tab">
        <div class="seccion-perfil">
          <h3>Historial de Postulaciones</h3>
          {#if postulaciones.length === 0}
            <p style="color:var(--texto2);">No tienes postulaciones aún. <a href="/buscar" style="color:var(--morado);">Busca empleos</a></p>
          {:else}
            {#each postulaciones as p}
              {@const est = estadoColores[p.estado] || {bg:'#ffffff11',color:'#aaa',texto:p.estado}}
              <div class="fila-postulacion">
                <div>
                  <div style="font-weight:600;font-size:1rem;margin-bottom:4px;">{p.titulo}</div>
                  <div style="color:var(--texto2);font-size:0.875rem;">{p.empresa_nombre} • {p.ubicacion || ''}</div>
                  <div style="color:var(--texto3);font-size:0.8rem;margin-top:4px;">Aplicado el {formatFecha(p.fecha_aplicacion)}</div>
                </div>
                <div style="display:flex;align-items:center;gap:0.75rem;">
                  <span class="badge-estado" style="background:{est.bg};color:{est.color};border:1px solid {est.color}44;">{est.texto}</span>
                  <button on:click={() => eliminarPostulacion(p.id)} class="btn-x" title="Retirar postulación">✕</button>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/if}

    <!-- ══ HABILIDADES ══ -->
    {#if tab === 'habilidades'}
      <div class="contenido-tab">
        <div class="seccion-perfil">
          <h3>Mis Habilidades</h3>
          <div style="display:flex;gap:1rem;margin-bottom:1.5rem;align-items:center;">
            <input class="input" type="text" placeholder="Ej: JavaScript, React, Python..." style="flex:1;" bind:value={nuevaHabilidad}>
            <select class="input" style="width:160px;" bind:value={nivelHabilidad}>
              {#each NIVELES_HAB as n}<option>{n}</option>{/each}
            </select>
            <button class="btn btn-primario" on:click={agregarHabilidad}>+ Agregar</button>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:0.75rem;">
            {#if habilidades.length === 0}
              <p style="color:var(--texto2);">No tienes habilidades agregadas aún.</p>
            {:else}
              {#each habilidades as h}
                <div class="habilidad-pill">
                  <span style="font-size:0.875rem;font-weight:500;">{h.nombre}</span>
                  <span style="font-size:0.75rem;color:var(--morado);">{nivelTexto[h.nivel] || 'Intermedio'}</span>
                  <button on:click={() => eliminarHabilidad(h.id)} class="btn-x">✕</button>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    {/if}

    <!-- ══ VALORACIONES ══ -->
    {#if tab === 'valoraciones'}
      <div class="contenido-tab">
        <div class="seccion-perfil">

          {#if usuario?.rol === 'empresa'}
            <!-- Vista empresa: valoraciones recibidas -->
            <h3>Valoraciones Recibidas</h3>
            {#if valoracionesRecibidas.length === 0}
              <p style="color:var(--texto2);">Aún no tienes valoraciones de usuarios.</p>
            {:else}
              {#each valoracionesRecibidas as v}
                <div class="fila-postulacion">
                  <div>
                    <div style="font-weight:600;font-size:1rem;">{v.usuario_nombre || 'Usuario'}</div>
                    <div style="color:var(--texto2);font-size:0.8rem;">{formatFecha(v.fecha_valoracion)}</div>
                    {#if v.comentario}<p style="margin:0.5rem 0 0;color:var(--texto2);font-size:0.875rem;">{v.comentario}</p>{/if}
                  </div>
                  <div style="display:flex;align-items:center;">
                    <span>{estrellas(v.calificacion)}</span>
                  </div>
                </div>
              {/each}
            {/if}

          {:else}
            <!-- Vista usuario normal: valoraciones hechas -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
              <h3 style="margin:0;">Valoraciones de Empresas</h3>
              <button class="btn btn-primario btn-pequeno" on:click={() => modalValoracion = true}>+ Nueva Valoración</button>
            </div>

            {#if modalValoracion}
              <div class="modal-inline">
                <h4 style="margin:0 0 1rem;">Nueva Valoración</h4>
                {#if msgValoracion}
                  <div class="msg-feedback" class:error={msgValoracionTipo==='error'} class:exito={msgValoracionTipo==='exito'}>{msgValoracion}</div>
                {/if}
                <div class="grid-2" style="margin-bottom:1rem;">
                  <div class="grupo-input">
                    <label>Empresa</label>
                    <select class="input" bind:value={valEmpresaId}>
                      <option value="">Selecciona una empresa...</option>
                      {#each empresas as e}<option value={e.id}>{e.nombre}</option>{/each}
                    </select>
                  </div>
                  <div class="grupo-input">
                    <label>Calificación (1-5)</label>
                    <select class="input" bind:value={valCalificacion}>
                      <option value="5">⭐⭐⭐⭐⭐ Excelente</option>
                      <option value="4">⭐⭐⭐⭐ Muy buena</option>
                      <option value="3">⭐⭐⭐ Buena</option>
                      <option value="2">⭐⭐ Regular</option>
                      <option value="1">⭐ Mala</option>
                    </select>
                  </div>
                </div>
                <div class="grupo-input" style="margin-bottom:1rem;">
                  <label>Comentario</label>
                  <textarea class="input" rows="3" placeholder="Describe tu experiencia..." style="resize:vertical;" bind:value={valComentario}></textarea>
                </div>
                <div style="display:flex;gap:1rem;">
                  <button class="btn btn-primario" on:click={guardarValoracion}>Guardar Valoración</button>
                  <button class="btn btn-borde" on:click={() => { modalValoracion = false; msgValoracion = ''; }}>Cancelar</button>
                </div>
              </div>
            {/if}

            {#if valoraciones.length === 0}
              <p style="color:var(--texto2);">No has valorado ninguna empresa aún.</p>
            {:else}
              {#each valoraciones as v}
                <div class="fila-postulacion">
                  <div>
                    <div style="font-weight:600;font-size:1rem;">{v.empresa_nombre}</div>
                    <div style="color:var(--texto2);font-size:0.8rem;">{v.industria || ''} • {formatFecha(v.fecha_valoracion)}</div>
                    {#if v.comentario}<p style="margin:0.5rem 0 0;color:var(--texto2);font-size:0.875rem;">{v.comentario}</p>{/if}
                  </div>
                  <div style="display:flex;align-items:center;gap:0.75rem;">
                    <span>{estrellas(v.calificacion)}</span>
                    <button class="btn-x" on:click={() => eliminarValoracion(v.id)}>✕</button>
                  </div>
                </div>
              {/each}
            {/if}
          {/if}

        </div>
      </div>
    {/if}

    <!-- ══ ALERTAS ══ -->
    {#if tab === 'alertas'}
      <div class="contenido-tab">
        <div class="seccion-perfil">
          <h3>Alertas de Trabajo</h3>
          <div class="modal-inline" style="margin-bottom:1.5rem;">
            <p style="margin:0 0 1rem;color:var(--texto2);font-size:0.875rem;">Configura tus alertas. Recibirás notificaciones cuando aparezcan empleos que coincidan con tus preferencias.</p>
            {#if msgAlertas}
              <div class="msg-feedback" class:error={msgAlertasTipo==='error'} class:exito={msgAlertasTipo==='exito'}>{msgAlertas}</div>
            {/if}
            <div class="grid-2" style="margin-bottom:1rem;">
              <div class="grupo-input"><label>Palabras Clave</label><input class="input" type="text" placeholder="Ej: React, Frontend..." bind:value={alertaPalabras}></div>
              <div class="grupo-input"><label>Ubicación</label><input class="input" type="text" placeholder="Ej: San Salvador, Remoto" bind:value={alertaUbicacion}></div>
            </div>
            <div class="grupo-input" style="margin-bottom:1rem;">
              <label>Frecuencia de Notificaciones</label>
              <select class="input" style="max-width:300px;" bind:value={alertaFrecuencia}>
                <option>Diaria</option>
                <option>Semanal</option>
                <option>Mensual</option>
              </select>
            </div>
            <button class="btn btn-primario" on:click={guardarAlerta}>Guardar Alerta</button>
          </div>

          <h4 style="margin:0 0 1rem;">Mis Alertas Activas</h4>
          {#if alertas.length === 0}
            <p style="color:var(--texto2);">No tienes alertas configuradas aún.</p>
          {:else}
            {#each alertas as a}
              <div class="fila-postulacion">
                <div>
                  <div style="font-weight:600;font-size:0.95rem;margin-bottom:4px;">🔍 {a.palabras_clave || 'Sin palabras clave'}</div>
                  <div style="color:var(--texto2);font-size:0.8rem;">📍 {a.ubicacion || 'Cualquier lugar'} &nbsp;•&nbsp; 🔔 {a.frecuencia}</div>
                </div>
                <div style="display:flex;align-items:center;gap:0.75rem;">
                  <span class="badge-estado"
                    style="background:{a.activa ? '#22c55e22':'#ffffff11'};color:{a.activa ? '#22c55e':'#aaa'};border:1px solid {a.activa ? '#22c55e44':'#ffffff22'};cursor:pointer;"
                    on:click={() => toggleAlerta(a.id, a.activa)}
                  >{a.activa ? 'Activa' : 'Inactiva'}</span>
                  <button class="btn-x" on:click={() => eliminarAlerta(a.id)}>✕</button>
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    {/if}

  </div>
</div>

<footer><div class="footer-bottom">© 2026 Shovel. Todos los derechos reservados.</div></footer>

<style>
  .contenido-perfil { max-width: 900px; margin: 0 auto; padding: 2rem; }

  .perfil-header { background: linear-gradient(135deg, #4c3fa0 0%, #7c6fef 60%, #9b8af0 100%); border-radius: var(--radio-grande); padding: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 1.5rem; }
  .perfil-avatar { width: 72px; height: 72px; border-radius: 50%; background: rgba(0,0,0,0.2); border: 3px solid rgba(255,255,255,0.3); display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0; }
  .perfil-info h1 { font-size: 1.5rem; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .perfil-cargo { color: rgba(255,255,255,0.8); margin-bottom: 8px; }
  .perfil-contacto { display: flex; gap: 1.25rem; font-size: 0.82rem; color: rgba(255,255,255,0.7); flex-wrap: wrap; }

  .perfil-stats { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio); padding: 1rem; margin-bottom: 1.5rem; text-align: center; }
  .perfil-stat-numero { font-size: 1.4rem; font-weight: 700; color: var(--morado); }
  .perfil-stat-label  { font-size: 0.75rem; color: var(--texto2); margin-top: 2px; }

  .tabs { display: flex; border-bottom: 1px solid var(--borde); margin-bottom: 1.5rem; overflow-x: auto; }
  .tab { padding: 10px 18px; cursor: pointer; font-size: 0.875rem; color: var(--texto2); border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.15s; white-space: nowrap; }
  .tab.activo { color: var(--morado); border-color: var(--morado); }
  .tab:hover:not(.activo) { color: var(--texto); }

  .seccion-perfil { margin-bottom: 1.5rem; }
  .seccion-perfil h3 { font-size: 1rem; margin-bottom: 0.75rem; }
  .seccion-perfil p  { font-size: 0.875rem; color: var(--texto2); line-height: 1.7; }

  .tarjeta-cv { display: flex; align-items: center; justify-content: space-between; background: var(--tarjeta2); border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
  .cv-icono-wrap { display: flex; align-items: center; gap: 10px; }
  .cv-icono { width: 36px; height: 36px; background: var(--morado-claro); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
  .cv-nombre { font-size: 0.875rem; font-weight: 500; }
  .cv-fecha  { font-size: 0.8rem; color: var(--texto2); }

  .experiencia-item { border-left: 3px solid var(--morado); padding-left: 1rem; margin-bottom: 1rem; }
  .experiencia-item h4 { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
  .experiencia-empresa { font-size: 0.82rem; color: var(--texto2); margin-bottom: 4px; }
  .experiencia-desc    { font-size: 0.85rem; color: var(--texto2); line-height: 1.5; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .grupo-input { margin-bottom: 0; }
  .grupo-input label { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--texto2); margin-bottom: 6px; }

  .requerido { color: #ef4444; font-weight: 700; margin-left: 2px; }
  .error-msg { display: block; margin-top: 4px; font-size: 0.78rem; color: #ef4444; }
  .campo-error .input { border-color: #ef4444 !important; background: #ef444408; }
  .char-count { font-size: 0.75rem; color: var(--texto3); font-weight: 400; }
  .char-count.char-limit { color: #f59e0b; }

  .msg-feedback { padding: 10px; border-radius: 6px; margin-bottom: 10px; text-align: center; font-size: 14px; }
  .msg-feedback.error { background: #ff4d4d33; color: #ff4d4d; border: 1px solid #ff4d4d; }
  .msg-feedback.exito { background: #4CAF5033; color: #4CAF50; border: 1px solid #4CAF50; }

  .fila-postulacion { border: 1px solid var(--borde); border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; }
  .badge-estado { border-radius: 20px; padding: 4px 12px; font-size: 0.8rem; font-weight: 500; white-space: nowrap; }
  .btn-x { background: none; border: none; cursor: pointer; color: var(--texto3); font-size: 0.8rem; }

  .habilidad-pill { display: flex; align-items: center; gap: 0.5rem; background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: 20px; padding: 6px 14px; }

  .modal-inline { background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }

  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: var(--radio); font-size: 0.875rem; font-weight: 600; font-family: inherit; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.15s; }
  .btn-primario { background: linear-gradient(135deg, var(--morado), #9b6ef5); color: #fff; }
  .btn-primario:hover { opacity: 0.88; }
  .btn-borde { background: transparent; color: var(--texto2); border: 1px solid var(--borde); }
  .btn-borde:hover { background: var(--tarjeta2); color: var(--texto); }
  .btn-pequeno { padding: 6px 12px; font-size: 0.8rem; }
  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }

  footer .footer-bottom { text-align: center; padding: 0.75rem; font-size: 0.8rem; color: var(--texto3); border-top: 1px solid var(--borde); }

  .input-telefono-wrap { display: flex; align-items: center; background: var(--input-bg, #1e1e2e); border: 1px solid var(--borde); border-radius: var(--radio, 8px); overflow: hidden; }
  .campo-error .input-telefono-wrap { border-color: #ef4444 !important; background: #ef444408; }
  .telefono-prefix { padding: 0 10px; font-size: 0.875rem; color: var(--texto2); border-right: 1px solid var(--borde); background: rgba(255,255,255,0.04); white-space: nowrap; height: 100%; display: flex; align-items: center; }
  .input-telefono { border: none !important; border-radius: 0 !important; background: transparent !important; flex: 1; }
  .input-telefono:focus { outline: none; box-shadow: none; }
</style>
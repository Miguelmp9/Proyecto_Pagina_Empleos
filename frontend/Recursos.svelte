<script>
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ─ Sesión 
  let usuario = null;
  let esAdmin = false;

  // ─ Recursos 
  let recursosCache    = [];
  let cargando         = true;
  let categoriaActiva  = 'todos';
  let busqueda         = '';

  // ─ Tab admin 
  let uploadTab = 'pdf'; // 'pdf' | 'url'

  // ─ Form PDF 
  let pdfTitulo    = '';
  let pdfCategoria = '';
  let pdfTipo      = 'documento';
  let pdfSector    = '';
  let pdfTiempo    = '';
  let pdfContenido = '';
  let pdfArchivo   = null;
  let pdfNombreArchivo = '';
  let pdfSubiendo  = false;
  let pdfProgreso  = 0;
  let feedbackPdf  = '';
  let feedbackPdfTipo = '';
  let dragover     = false;

  // ─ Form URL 
  let urlTitulo    = '';
  let urlCategoria = '';
  let urlTipo      = 'video';
  let urlSector    = '';
  let urlDuracion  = '';
  let urlLink      = '';
  let urlThumbnail = '';
  let urlContenido = '';
  let urlSubiendo  = false;
  let feedbackUrl  = '';
  let feedbackUrlTipo = '';

  const CATEGORIAS = ['Todos','Carrera Profesional','Entrevistas','Currículum','Habilidades','Videos'];

  const TIPO_INFO = {
    documento:  ['tipo-documento',  '📄'],
    video:      ['tipo-video',       '▶️'],
    articulo:   ['tipo-articulo',    '📰'],
    infografia: ['tipo-infografia',  '🗂️'],
    podcast:    ['tipo-podcast',     '🎙️'],
  };


  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    esAdmin = usuario?.rol === 'admin';
    await cargarRecursos();
  });

  function logout() { localStorage.removeItem('usuario'); window.location.href = '/login'; }

  // ─ Carga 
  async function cargarRecursos() {
    cargando = true;
    try {
      const res  = await fetch(`${API}/recursos?estado=activo`);
      const data = await res.json();
      recursosCache = Array.isArray(data) ? data : (data.recursos || []);
    } catch (e) { recursosCache = []; }
    finally { cargando = false; }
  }

  // ─ Filtrado reactivo 
  function norm(t) {
    return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  }

  $: recursosFiltrados = recursosCache.filter(r => {
    const cat = norm(categoriaActiva);
    const okCat = cat === 'todos'
      || (r.categoria || '').toLowerCase().includes(cat)
      || (r.sector    || '').toLowerCase().includes(cat)
      || (cat === 'videos' && r.tipo === 'video');

    const txt = busqueda.toLowerCase();
    const okTxt = !txt
      || (r.titulo    || '').toLowerCase().includes(txt)
      || (r.categoria || '').toLowerCase().includes(txt)
      || (r.sector    || '').toLowerCase().includes(txt)
      || (r.contenido || '').toLowerCase().includes(txt);

    return okCat && okTxt;
  });

  // ─ Helpers 
  function formatDuracion(seg) {
    if (!seg) return '';
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    return h > 0 ? `⏱ ${h}h ${m}m` : `⏱ ${m}m${s > 0 ? ' ' + s + 's' : ''}`;
  }

  function formatTamano(bytes) {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb >= 1 ? `📦 ${mb.toFixed(1)} MB` : `📦 ${Math.round(bytes / 1024)} KB`;
  }

  function formatFecha(f) {
    if (!f) return '';
    return new Date(f).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' });
  }

  // ─ Like 
  async function darLike(recurso) {
    try {
      const res = await fetch(`${API}/recursos/${recurso.id}/like`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sumar: true })
      });
      if (res.ok) {
        recursosCache = recursosCache.map(r =>
          r.id === recurso.id ? { ...r, total_likes: (r.total_likes || 0) + 1 } : r
        );
      }
    } catch (e) {}
  }

  function registrarDescarga(id) {
    fetch(`${API}/recursos/${id}/descargas`, { method:'PATCH' }).catch(() => {});
  }

  // ─ Eliminar
  async function eliminarRecurso(id) {
    if (!confirm('¿Eliminar este recurso permanentemente?')) return;
    try {
      const res = await fetch(`${API}/recursos/${id}`, { method:'DELETE' });
      if (res.ok) recursosCache = recursosCache.filter(r => r.id !== id);
      else alert('No se pudo eliminar el recurso.');
    } catch (e) { alert('No se pudo eliminar el recurso.'); }
  }

  // ─ Feedback 
  function mostrarFeedback(tipo, msg, esPdf) {
    if (esPdf) { feedbackPdf = msg; feedbackPdfTipo = tipo; setTimeout(() => feedbackPdf = '', 5000); }
    else       { feedbackUrl = msg; feedbackUrlTipo = tipo; setTimeout(() => feedbackUrl = '', 5000); }
  }

  // ─ Drag & Drop PDF 
  function onDrop(e) {
    e.preventDefault(); dragover = false;
    const file = e.dataTransfer.files[0];
    if (file?.type === 'application/pdf') { pdfArchivo = file; pdfNombreArchivo = `✓ ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`; }
    else mostrarFeedback('error', 'Solo se permiten archivos PDF.', true);
  }

  function onFileChange(e) {
    const file = e.target.files[0];
    if (file) { pdfArchivo = file; pdfNombreArchivo = `✓ ${file.name} (${(file.size/1024/1024).toFixed(2)} MB)`; }
  }

  // ─ Subir PDF (XHR para progreso) 
  function subirPDF() {
    if (!pdfTitulo)  return mostrarFeedback('error', 'El título es obligatorio.', true);
    if (!pdfArchivo) return mostrarFeedback('error', 'Debes seleccionar un archivo PDF.', true);
    if (pdfArchivo.size > 10 * 1024 * 1024) return mostrarFeedback('error', 'El archivo supera el límite de 10 MB.', true);

    pdfSubiendo = true; pdfProgreso = 0;

    const fd = new FormData();
    fd.append('titulo',         pdfTitulo);
    fd.append('tipo',           pdfTipo);
    fd.append('categoria',      pdfCategoria);
    fd.append('tiempo_lectura', pdfTiempo || 0);
    fd.append('sector',         pdfSector);
    fd.append('contenido',      pdfContenido);
    fd.append('es_premium',     false);
    fd.append('autor_id',       usuario?.id || '');
    fd.append('estado',         'activo');
    fd.append('archivo',        pdfArchivo);

    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) pdfProgreso = Math.round((e.loaded / e.total) * 100);
    });
    xhr.addEventListener('load', () => {
      pdfSubiendo = false; pdfProgreso = 0;
      if (xhr.status >= 200 && xhr.status < 300) {
        mostrarFeedback('exito', '✓ PDF publicado correctamente.', true);
        pdfTitulo = ''; pdfCategoria = ''; pdfTipo = 'documento';
        pdfSector = ''; pdfTiempo = ''; pdfContenido = '';
        pdfArchivo = null; pdfNombreArchivo = '';
        cargarRecursos();
      } else {
        let msg = 'Error del servidor: ' + xhr.status;
        try { msg = JSON.parse(xhr.responseText).error || msg; } catch(_) {}
        mostrarFeedback('error', msg, true);
      }
    });
    xhr.addEventListener('error', () => {
      pdfSubiendo = false;
      mostrarFeedback('error', 'No se pudo conectar con el servidor.', true);
    });
    xhr.open('POST', `${API}/recursos`);
    xhr.send(fd);
  }

  // ─ Subir URL 
  async function subirURL() {
    if (!urlTitulo) return mostrarFeedback('error', 'El título es obligatorio.', false);
    if (!urlLink)   return mostrarFeedback('error', 'La URL es obligatoria.', false);

    let thumbnail = urlThumbnail;
    if (!thumbnail) {
      const yt = urlLink.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (yt) thumbnail = `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg`;
    }

    urlSubiendo = true;
    try {
      const res = await fetch(`${API}/recursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: urlTitulo, tipo: urlTipo, categoria: urlCategoria,
          contenido: urlContenido || null, video_url: urlLink,
          thumbnail_url: thumbnail || null,
          duracion_segundos: urlDuracion ? Number(urlDuracion) : null,
          sector: urlSector || null, es_premium: false,
          autor_id: usuario?.id || null, estado: 'activo'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error: ' + res.status);
      mostrarFeedback('exito', '✓ Enlace publicado correctamente.', false);
      urlTitulo = ''; urlCategoria = ''; urlTipo = 'video';
      urlSector = ''; urlDuracion = ''; urlLink = '';
      urlThumbnail = ''; urlContenido = '';
      cargarRecursos();
    } catch (err) {
      mostrarFeedback('error', 'No se pudo publicar: ' + err.message, false);
    } finally {
      urlSubiendo = false;
    }
  }
</script>

<svelte:head><title>Shovel - Recursos</title></svelte:head>

<!-- NAV -->
<nav>
  <a href="/" class="nav-logo">
    <img src="/contenido_multimedia/logo.png" alt="Shovel" style="width:36px;height:36px;border-radius:8px;object-fit:cover;">Shovel
  </a>
  <div class="nav-links">
    <a href="/buscar"   class="nav-link">Buscar Empleos</a>
    {#if usuario?.rol === 'empresa'}<a href="/publicar" class="nav-link">Publicar Empleo</a>{/if}
    <a href="/recursos" class="nav-link activo">Recursos</a>
    <a href="/foros"    class="nav-link">Foros</a>
    {#if usuario?.rol !== 'admin'}<a href="/perfil" class="nav-link">Mi Perfil</a>{/if}
    {#if esAdmin}<a href="/admin" class="nav-link">Admin</a>{/if}
    {#if usuario}<button class="nav-link btn-logout" on:click={logout}>Cerrar Sesión</button>{/if}
  </div>
</nav>

<!-- Encabezado -->
<div class="encabezado-recursos">
  <h1>Centro de Recursos</h1>
  <p>Aprende, crece y destaca en tu carrera profesional con nuestros recursos exclusivos</p>
</div>

<div class="contenido-recursos">

  <!-- ══ PANEL ADMIN ══ -->
  {#if esAdmin}
    <div class="admin-upload-panel">
      <div class="admin-panel-header">
        <span style="color:#818cf8;font-size:1.1rem;">🛡</span>
        <h3>Publicar Nuevo Recurso</h3>
        <span class="admin-badge">Solo Admin</span>
      </div>

      <!-- Tabs -->
      <div class="upload-tabs">
        <button class="upload-tab" class:activo={uploadTab === 'pdf'} on:click={() => uploadTab = 'pdf'}>
          📄 Subir PDF
        </button>
        <button class="upload-tab" class:activo={uploadTab === 'url'} on:click={() => uploadTab = 'url'}>
          🔗 Agregar URL / Video
        </button>
      </div>

      <!-- Form PDF -->
      {#if uploadTab === 'pdf'}
        <div class="form-grid">
          <div class="form-field"><label>Título *</label><input type="text" placeholder="Ej. Guía de Entrevistas 2026" bind:value={pdfTitulo}></div>
          <div class="form-field">
            <label>Categoría</label>
            <select bind:value={pdfCategoria}>
              <option value="">Seleccionar categoría</option>
              <option value="entrevistas">Entrevistas</option>
              <option value="curriculum">Currículum</option>
              <option value="carrera profesional">Carrera Profesional</option>
              <option value="habilidades">Habilidades</option>
            </select>
          </div>
          <div class="form-field">
            <label>Tipo</label>
            <select bind:value={pdfTipo}>
              <option value="documento">Documento</option>
              <option value="articulo">Artículo</option>
              <option value="infografia">Infografía</option>
            </select>
          </div>
          <div class="form-field"><label>Sector</label><input type="text" placeholder="Ej. Tecnología, Finanzas…" bind:value={pdfSector}></div>
          <div class="form-field"><label>Tiempo de lectura (min)</label><input type="number" placeholder="Ej. 8" min="1" bind:value={pdfTiempo}></div>
          <div class="form-field full-width"><label>Descripción (opcional)</label><textarea placeholder="Breve descripción…" bind:value={pdfContenido}></textarea></div>
          <div class="form-field full-width">
            <label>Archivo PDF *</label>
            <div
              class="pdf-drop-zone"
              class:dragover
              on:click={() => document.getElementById('input-pdf').click()}
              on:dragover|preventDefault={() => dragover = true}
              on:dragleave={() => dragover = false}
              on:drop={onDrop}
            >
              <div class="drop-icon">📄</div>
              <p>Haz clic o arrastra tu PDF aquí</p>
              <span>Máximo 10 MB · Solo archivos .pdf</span>
              <input type="file" id="input-pdf" accept=".pdf" style="display:none;" on:change={onFileChange}>
            </div>
            {#if pdfNombreArchivo}<div style="color:#6ee7b7;font-size:0.82rem;margin-top:6px;">{pdfNombreArchivo}</div>{/if}
            {#if pdfSubiendo}
              <div class="barra-progreso-upload">
                <div class="progreso" style="width:{pdfProgreso}%"></div>
              </div>
            {/if}
          </div>
        </div>
        <button class="btn-subir" on:click={subirPDF} disabled={pdfSubiendo}>
          {pdfSubiendo ? '⏳ Subiendo...' : '☁ Publicar PDF'}
        </button>
        {#if feedbackPdf}
          <div class="upload-feedback {feedbackPdfTipo}">{feedbackPdf}</div>
        {/if}
      {/if}

      <!-- Form URL -->
      {#if uploadTab === 'url'}
        <div class="form-grid">
          <div class="form-field"><label>Título *</label><input type="text" placeholder="Ej. Cómo hacer networking efectivo" bind:value={urlTitulo}></div>
          <div class="form-field">
            <label>Categoría</label>
            <select bind:value={urlCategoria}>
              <option value="">Seleccionar categoría</option>
              <option value="entrevistas">Entrevistas</option>
              <option value="curriculum">Currículum</option>
              <option value="carrera profesional">Carrera Profesional</option>
              <option value="habilidades">Habilidades</option>
              <option value="videos">Videos</option>
            </select>
          </div>
          <div class="form-field">
            <label>Tipo</label>
            <select bind:value={urlTipo}>
              <option value="video">Video</option>
              <option value="articulo">Artículo</option>
              <option value="podcast">Podcast</option>
            </select>
          </div>
          <div class="form-field"><label>Sector</label><input type="text" placeholder="Ej. Tecnología, Salud…" bind:value={urlSector}></div>
          <div class="form-field"><label>Duración (segundos)</label><input type="number" placeholder="Ej. 3600 = 1 hora" min="0" bind:value={urlDuracion}></div>
          <div class="form-field full-width"><label>URL del recurso *</label><input type="url" placeholder="https://www.youtube.com/watch?v=..." bind:value={urlLink}></div>
          <div class="form-field full-width"><label>URL de miniatura</label><input type="url" placeholder="https://…imagen.jpg" bind:value={urlThumbnail}></div>
          <div class="form-field full-width"><label>Descripción (opcional)</label><textarea placeholder="Breve descripción…" bind:value={urlContenido}></textarea></div>
        </div>
        <button class="btn-subir" on:click={subirURL} disabled={urlSubiendo}>
          {urlSubiendo ? '⏳ Publicando...' : '🔗 Publicar Enlace'}
        </button>
        {#if feedbackUrl}
          <div class="upload-feedback {feedbackUrlTipo}">{feedbackUrl}</div>
        {/if}
      {/if}
    </div>
  {/if}

  <!-- Búsqueda -->
  <div class="barra-busqueda-recursos" style="margin-bottom:24px;">
    <input type="text" placeholder="Buscar artículos, tutoriales, videos..." bind:value={busqueda}>
  </div>

  <!-- Categorías -->
  <div class="categorias-recursos">
    {#each CATEGORIAS as cat}
      <button
        class="categoria-pill"
        class:activo={norm(categoriaActiva) === norm(cat)}
        on:click={() => categoriaActiva = cat}
      >{cat}</button>
    {/each}
  </div>

  <!-- Grid recursos -->
  <div class="seccion-bd">
    <h2>Recursos Publicados</h2>
    <div class="grid-recursos-bd">
      {#if cargando}
        <div class="spinner-carga"><div class="spinner"></div></div>
      {:else if recursosFiltrados.length === 0}
        <div class="estado-vacio">
          {recursosCache.length ? 'No se encontraron recursos con ese filtro.' : 'Aún no hay recursos publicados.'}
        </div>
      {:else}
        {#each recursosFiltrados as r}
          {@const info = TIPO_INFO[r.tipo] || ['tipo-articulo','📄']}
          <div class="tarjeta-recurso-bd">
            {#if r.thumbnail_url}
              <img src={r.thumbnail_url} alt={r.titulo}
                style="width:100%;height:140px;object-fit:cover;border-radius:8px;"
                on:error={(e) => e.target.style.display='none'}>
            {/if}

            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span class="recurso-tipo-badge {info[0]}">{info[1]} {r.tipo}</span>
              {#if r.sector}<span style="font-size:0.75rem;color:var(--texto2);">📍 {r.sector}</span>{/if}
            </div>

            <p class="recurso-titulo">{r.titulo}</p>

            {#if r.contenido}
              <p style="font-size:0.82rem;color:var(--texto2);line-height:1.5;margin:0;">
                {r.contenido.length > 120 ? r.contenido.slice(0,120) + '…' : r.contenido}
              </p>
            {/if}

            <div class="recurso-meta">
              {#if r.tiempo_lectura}<span>🕐 {r.tiempo_lectura} min</span>{/if}
              {#if r.duracion_segundos}<span>{formatDuracion(r.duracion_segundos)}</span>{/if}
              {#if r.tamano_archivo}<span>{formatTamano(r.tamano_archivo)}</span>{/if}
              {#if r.fecha_publicacion}<span>📅 {formatFecha(r.fecha_publicacion)}</span>{/if}
              {#if r.autor_nombre}<span>✍️ {r.autor_nombre}</span>{/if}
            </div>

            <div class="recurso-stats">
              {#if r.total_vistas}<span>👁 {Number(r.total_vistas).toLocaleString()}</span>{/if}
              {#if r.total_descargas}<span>⬇️ {Number(r.total_descargas).toLocaleString()}</span>{/if}
            </div>

            <div class="recurso-acciones">
              {#if r.archivo_url}
                <a href="{API}/{r.archivo_url}" target="_blank" class="btn-recurso btn-recurso-ver">👁 Ver</a>
                <a href="{API}/{r.archivo_url}" download class="btn-recurso btn-recurso-descargar"
                   on:click={() => registrarDescarga(r.id)}>⬇️ Descargar</a>
              {:else if r.video_url}
                <a href={r.video_url} target="_blank" rel="noopener noreferrer" class="btn-recurso btn-recurso-link">🔗 Abrir enlace</a>
              {/if}
              <button class="btn-recurso btn-recurso-like" on:click={() => darLike(r)}>
                ❤️ <span>{r.total_likes || 0}</span>
              </button>
              {#if esAdmin}
                <button class="btn-recurso btn-recurso-eliminar" on:click={() => eliminarRecurso(r.id)} title="Eliminar recurso">🗑</button>
              {/if}
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </div>

</div>

<footer>
  <div class="footer-bottom">© 2026 Shovel. Todos los derechos reservados.</div>
</footer>

<style>
  /* ── Encabezado ── */
  .encabezado-recursos { text-align: center; padding: 2rem 2rem 0; max-width: 1200px; margin: 0 auto; }
  .encabezado-recursos h1 { font-size: 2rem; margin-bottom: 0.5rem; color: var(--morado); }
  .encabezado-recursos p  { color: var(--texto2); }

  /* ── Búsqueda ── */
  .barra-busqueda-recursos { position: relative; max-width: 600px; margin: 1.5rem auto; padding: 0 2rem; }
  .barra-busqueda-recursos input { width: 100%; background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: 8px; padding: 10px 14px; color: var(--texto); font-size: 0.9rem; outline: none; font-family: inherit; box-sizing: border-box; }
  .barra-busqueda-recursos input:focus { border-color: var(--morado); }

  /* ── Categorías ── */
  .categorias-recursos { display: flex; gap: 0.5rem; justify-content: center; margin-bottom: 2rem; flex-wrap: wrap; padding: 0 2rem; }
  .categoria-pill { padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; border: 1px solid var(--borde); background: transparent; color: var(--texto2); transition: all 0.15s; font-family: inherit; }
  .categoria-pill.activo, .categoria-pill:hover { background: var(--morado); color: #fff; border-color: var(--morado); }

  /* ── Contenido ── */
  .contenido-recursos { max-width: 1200px; margin: 0 auto; padding: 0 2rem 3rem; }

  /* ── Grid recursos ── */
  .seccion-bd { margin-bottom: 40px; }
  .seccion-bd h2 { font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; }
  .grid-recursos-bd { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }

  .tarjeta-recurso-bd { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio-grande); padding: 20px; transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s; display: flex; flex-direction: column; gap: 12px; }
  .tarjeta-recurso-bd:hover { border-color: var(--morado); box-shadow: 0 8px 30px rgba(0,0,0,0.2); transform: translateY(-2px); }

  .recurso-tipo-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 0.73rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; padding: 4px 10px; border-radius: 99px; width: fit-content; }
  :global(.tipo-documento)  { background: rgba(109,40,217,0.2); color: #a78bfa; }
  :global(.tipo-video)      { background: rgba(220,38,38,0.2);  color: #fca5a5; }
  :global(.tipo-articulo)   { background: rgba(29,78,216,0.2);  color: #93c5fd; }
  :global(.tipo-infografia) { background: rgba(6,95,70,0.2);    color: #6ee7b7; }
  :global(.tipo-podcast)    { background: rgba(146,64,14,0.2);  color: #fcd34d; }

  .recurso-titulo { font-size: 0.97rem; font-weight: 600; color: var(--texto); line-height: 1.4; margin: 0; }
  .recurso-meta   { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; font-size: 0.8rem; color: var(--texto2); }
  .recurso-stats  { display: flex; gap: 12px; font-size: 0.78rem; color: var(--texto2); }
  .recurso-acciones { display: flex; gap: 8px; margin-top: auto; flex-wrap: wrap; }

  .btn-recurso { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; text-decoration: none; border: none; transition: all 0.15s; min-width: 80px; }
  .btn-recurso-ver       { background: rgba(109,40,217,0.2); color: #a78bfa; }
  .btn-recurso-ver:hover { background: rgba(109,40,217,0.35); }
  .btn-recurso-descargar { background: #4f46e5; color: #fff; }
  .btn-recurso-descargar:hover { background: #4338ca; }
  .btn-recurso-link      { background: rgba(220,38,38,0.2); color: #fca5a5; }
  .btn-recurso-link:hover { background: rgba(220,38,38,0.35); }
  .btn-recurso-like      { background: rgba(255,255,255,0.07); color: var(--texto2); flex: 0 0 auto; }
  .btn-recurso-like:hover { background: rgba(255,255,255,0.12); }
  .btn-recurso-eliminar  { background: rgba(220,38,38,0.15); color: #fca5a5; flex: 0 0 auto; padding: 9px 12px; }
  .btn-recurso-eliminar:hover { background: rgba(220,38,38,0.3); }

  .estado-vacio { grid-column: 1/-1; text-align: center; padding: 40px; color: var(--texto2); font-size: 0.95rem; }
  .spinner-carga { grid-column: 1/-1; display: flex; justify-content: center; padding: 40px; }
  .spinner { width: 32px; height: 32px; border: 3px solid var(--borde); border-top-color: var(--morado); border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Panel Admin ── */
  .admin-upload-panel { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); border: 1px solid #4f46e5; border-radius: 16px; padding: 28px 32px; margin: 0 auto 40px auto; max-width: 900px; }
  .admin-panel-header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
  .admin-panel-header h3 { color: #e0e7ff; font-size: 1.1rem; font-weight: 700; margin: 0; }
  .admin-badge { background: #4f46e5; color: #c7d2fe; font-size: 0.7rem; font-weight: 700; padding: 3px 10px; border-radius: 99px; letter-spacing: 0.08em; text-transform: uppercase; }

  .upload-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
  .upload-tab { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #a5b4fc; border-radius: 8px; padding: 8px 20px; cursor: pointer; font-size: 0.88rem; font-weight: 500; transition: all 0.2s; }
  .upload-tab:hover  { background: rgba(99,102,241,0.25); color: #e0e7ff; }
  .upload-tab.activo { background: #4f46e5; border-color: #6366f1; color: #fff; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .form-grid .full-width { grid-column: 1 / -1; }
  .form-field { display: flex; flex-direction: column; gap: 6px; }
  .form-field label { color: #a5b4fc; font-size: 0.82rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
  .form-field input, .form-field select, .form-field textarea { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; color: #e0e7ff; padding: 10px 14px; font-size: 0.92rem; outline: none; transition: border-color 0.2s; font-family: inherit; }
  .form-field input:focus, .form-field select:focus, .form-field textarea:focus { border-color: #6366f1; background: rgba(99,102,241,0.1); }
  .form-field textarea { resize: vertical; min-height: 80px; }

  .pdf-drop-zone { border: 2px dashed rgba(99,102,241,0.5); border-radius: 10px; padding: 28px; text-align: center; cursor: pointer; transition: all 0.2s; background: rgba(99,102,241,0.05); }
  .pdf-drop-zone:hover, .pdf-drop-zone.dragover { border-color: #6366f1; background: rgba(99,102,241,0.12); }
  .pdf-drop-zone .drop-icon { font-size: 2rem; margin-bottom: 8px; }
  .pdf-drop-zone p   { color: #a5b4fc; font-size: 0.88rem; margin: 0; }
  .pdf-drop-zone span { color: #818cf8; font-size: 0.78rem; }

  .barra-progreso-upload { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 10px; overflow: hidden; }
  .progreso { height: 100%; background: linear-gradient(90deg, #4f46e5, #7c3aed); border-radius: 2px; transition: width 0.3s ease; }

  .btn-subir { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff; border: none; border-radius: 10px; padding: 12px 28px; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s, transform 0.1s; margin-top: 8px; }
  .btn-subir:hover:not(:disabled)  { opacity: 0.9; transform: translateY(-1px); }
  .btn-subir:disabled { opacity: 0.5; cursor: not-allowed; }

  .upload-feedback { margin-top: 12px; padding: 10px 16px; border-radius: 8px; font-size: 0.88rem; font-weight: 500; display: flex; align-items: center; gap: 8px; }
  .upload-feedback.exito { background: rgba(16,185,129,0.15); border: 1px solid #059669; color: #6ee7b7; }
  .upload-feedback.error { background: rgba(239,68,68,0.15);  border: 1px solid #dc2626; color: #fca5a5; }

  /* ── Nav ── */
  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }
  footer .footer-bottom { text-align: center; padding: 0.75rem; font-size: 0.8rem; color: var(--texto3); border-top: 1px solid var(--borde); }

  @media (max-width: 640px) {
    .form-grid { grid-template-columns: 1fr; }
    .upload-tabs { flex-wrap: wrap; }
    .admin-upload-panel { padding: 20px 16px; }
  }
</style>
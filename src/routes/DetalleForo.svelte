<script>
  import { onMount } from 'svelte';

  const API = 'http://localhost:3000';

  // ── Sesión ────────────────────────────────────────────────
  let usuario = null;

  // ── Estado ────────────────────────────────────────────────
  let discusion     = null;
  let cargando      = true;
  let error         = '';
  let discusionId   = null;

  // ── Respuestas ────────────────────────────────────────────
  let respuestas    = [];
  let replyTexto    = '';

  // ── Likes ─────────────────────────────────────────────────
  let likedPrincipal  = false;
  let likeCount       = 0;
  let likesRespuestas = {};  // { [respuestaId]: true }

  // ── Toast ─────────────────────────────────────────────────
  let toastVisible = false;
  let toastMsg     = '';

  // ─────────────────────────────────────────────────────────
  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

    const params = new URLSearchParams(window.location.search);
    discusionId = params.get('id');

    // Fallback: leer desde pathname /detalle-foro/123
    if (!discusionId) {
      const partes = window.location.pathname.split('/');
      discusionId = partes[partes.length - 1];
    }

    // Cargar likes guardados
    const likesGuardados = JSON.parse(localStorage.getItem('likes_discusiones') || '{}');
    likedPrincipal = !!likesGuardados[discusionId];
    likesRespuestas = JSON.parse(localStorage.getItem('likes_respuestas') || '{}');

    await cargarDiscusion();
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

  function mostrarToast(msg) {
    toastMsg = msg;
    toastVisible = true;
    setTimeout(() => { toastVisible = false; }, 2500);
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ── Carga ─────────────────────────────────────────────────
  async function cargarDiscusion() {
    if (!discusionId) { error = 'No se especificó una discusión.'; cargando = false; return; }
    cargando = true;
    try {
      const res  = await fetch(`${API}/foros/${discusionId}`);
      const data = await res.json();
      if (data.error) { error = data.error; return; }
      discusion  = data;
      likeCount  = data.total_likes;
      respuestas = data.respuestas || [];
    } catch (e) {
      error = 'Error al conectar con el servidor. ¿Está corriendo Node.js?';
    } finally {
      cargando = false;
    }
  }

  // ── Like principal ────────────────────────────────────────
  async function likeDiscusion() {
    if (likedPrincipal) { mostrarToast('Ya le diste like a esta discusión'); return; }
    try {
      await fetch(`${API}/foros/${discusionId}/like`, { method: 'POST' });
      const likesGuardados = JSON.parse(localStorage.getItem('likes_discusiones') || '{}');
      likesGuardados[discusionId] = true;
      localStorage.setItem('likes_discusiones', JSON.stringify(likesGuardados));
      likedPrincipal = true;
      likeCount++;
    } catch (e) {}
  }

  // ── Like respuesta ────────────────────────────────────────
  async function likeRespuesta(rid) {
    if (likesRespuestas[rid]) { mostrarToast('Ya le diste like a esta respuesta'); return; }
    try {
      await fetch(`${API}/foros/respuestas/${rid}/like`, { method: 'POST' });
      likesRespuestas[rid] = true;
      localStorage.setItem('likes_respuestas', JSON.stringify(likesRespuestas));
      likesRespuestas = { ...likesRespuestas }; // trigger reactivity
      await cargarDiscusion();
    } catch (e) {}
  }

  // ── Compartir ─────────────────────────────────────────────
  function compartir() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      mostrarToast('Enlace copiado al portapapeles');
    }
  }

  // ── Responder citando ─────────────────────────────────────
  function responderA(autor) {
    replyTexto = `@${autor} `;
    document.getElementById('reply-textarea')?.focus();
    document.getElementById('reply-textarea')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // ── Publicar respuesta ────────────────────────────────────
  async function publicarRespuesta() {
    const texto = replyTexto.trim();
    if (!texto) return;
    if (!usuario) { mostrarToast('Debes iniciar sesión para responder'); return; }
    try {
      const res  = await fetch(`${API}/foros/${discusionId}/respuestas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuario.id, contenido: texto })
      });
      const data = await res.json();
      if (data.error) { mostrarToast('Error: ' + data.error); return; }
      replyTexto = '';
      mostrarToast('¡Respuesta publicada!');
      await cargarDiscusion();
    } catch (e) {
      mostrarToast('Error al publicar la respuesta');
    }
  }
</script>

<svelte:head>
  <title>Shovel - {discusion?.titulo ?? 'Detalle del Foro'}</title>
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

<div class="page-wrapper">

  <a href="/foros" class="back-btn">← Volver a los foros</a>

  <!-- ── Estado carga / error ── -->
  {#if cargando}
    <div class="detalle-card"><p style="text-align:center;color:#888;">Cargando discusión...</p></div>

  {:else if error}
    <div class="detalle-card"><p style="color:#e53e3e;text-align:center;">{error}</p></div>

  {:else if discusion}

    <!-- ── Tarjeta principal ── -->
    <div class="detalle-card">
      <div class="detalle-top">
        <div class="detalle-badges">
          {#if discusion.destacado}
            <span class="badge badge-morado">⭐ Destacado</span>
          {/if}
          <span class="badge badge-cat">{discusion.categoria}</span>
        </div>
        <div class="detalle-acciones-top">
          <button class="btn-icono" title="Compartir" on:click={compartir}>🔗</button>
        </div>
      </div>

      <h1 class="detalle-titulo">{discusion.titulo}</h1>

      <div class="detalle-hashtags">
        {#each (discusion.etiquetas || []) as e}
          <span class="post-hashtag">#{e.nombre}</span>
        {/each}
      </div>

      <div class="detalle-autor">
        <div class="avatar {getColorAvatar(getIniciales(discusion.autor))}">{getIniciales(discusion.autor)}</div>
        <div class="autor-info">
          <p class="autor-nombre">{discusion.autor}</p>
          <p class="autor-titulo">{discusion.titulo_pro || ''}</p>
        </div>
        <div class="autor-meta">
          <span>📅 {timeAgo(discusion.fecha_creacion)}</span>
          <span>👁 {discusion.total_vistas} vistas</span>
        </div>
      </div>

      <div class="detalle-contenido">{@html discusion.contenido.replace(/\n/g, '<br>')}</div>

      <div class="detalle-footer">
        <button class="btn-like" class:liked={likedPrincipal} on:click={likeDiscusion}>
          👍 <span>{likeCount}</span>
        </button>
        <div class="btn-respuestas">
          💬 <span>{discusion.total_respuestas}</span> Respuestas
        </div>
      </div>
    </div>

    <!-- ── Formulario respuesta ── -->
    <div class="reply-card">
      <h3>Añadir una respuesta</h3>
      <textarea
        id="reply-textarea"
        placeholder="Comparte tu opinión o experiencia..."
        bind:value={replyTexto}
      ></textarea>
      <div class="reply-form-footer">
        <p class="reply-hint">Sé respetuoso y constructivo en tu respuesta</p>
        <button class="btn btn-primario" on:click={publicarRespuesta}>
          ✉ Publicar Respuesta
        </button>
      </div>
    </div>

    <!-- ── Lista respuestas ── -->
    <div class="respuestas-seccion">
      <h3 class="respuestas-titulo">Respuestas ({respuestas.length})</h3>

      {#if respuestas.length === 0}
        <p class="sin-respuestas">Sé el primero en responder esta discusión.</p>
      {:else}
        {#each respuestas as r}
          <div class="respuesta-card">
            <div class="respuesta-cabecera">
              <div class="avatar {getColorAvatar(getIniciales(r.autor))}" style="width:36px;height:36px;font-size:0.78rem;">
                {getIniciales(r.autor)}
              </div>
              <div class="respuesta-autor-info">
                <p class="autor-nombre">{r.autor}</p>
                <p class="autor-titulo">{r.titulo_pro || ''}</p>
              </div>
              <span class="respuesta-fecha">{timeAgo(r.fecha_creacion)}</span>
            </div>

            <div class="respuesta-contenido">{@html r.contenido.replace(/\n/g, '<br>')}</div>

            <div class="respuesta-acciones">
              <button class="btn-like" class:liked={!!likesRespuestas[r.id]} on:click={() => likeRespuesta(r.id)}>
                👍 {r.total_likes + (likesRespuestas[r.id] ? 1 : 0)}
              </button>
              <button class="btn-responder" on:click={() => responderA(r.autor)}>
                ↩ Responder
              </button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  {/if}

</div>

<!-- Toast -->
{#if toastVisible}
  <div class="toast show">
    <span>✓</span>
    <span>{toastMsg}</span>
  </div>
{/if}

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
  .page-wrapper { max-width: 900px; margin: 0 auto; padding: 2rem 2rem 5rem; }

  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--texto2); text-decoration: none; margin-bottom: 1.5rem; transition: color 0.15s; }
  .back-btn:hover { color: var(--texto); }

  /* ── Tarjeta principal ── */
  .detalle-card { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio-grande); padding: 2rem; margin-bottom: 1.25rem; }
  .detalle-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1rem; gap: 1rem; }
  .detalle-badges { display: flex; gap: 8px; flex-wrap: wrap; }
  .detalle-acciones-top { display: flex; gap: 6px; flex-shrink: 0; }
  .detalle-titulo { font-size: 1.5rem; font-weight: 700; line-height: 1.4; margin-bottom: 1rem; }
  .detalle-hashtags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 1.25rem; }
  .detalle-contenido { font-size: 0.925rem; line-height: 1.8; color: var(--texto); white-space: pre-line; margin-bottom: 1.5rem; }
  .detalle-footer { display: flex; gap: 10px; align-items: center; }

  /* ── Autor ── */
  .detalle-autor { display: flex; align-items: center; gap: 12px; padding: 1rem 0; border-top: 1px solid var(--borde); border-bottom: 1px solid var(--borde); margin-bottom: 1.5rem; flex-wrap: wrap; }
  .autor-info { flex: 1; }
  .autor-nombre { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
  .autor-titulo  { font-size: 0.8rem; color: var(--texto2); }
  .autor-meta { display: flex; gap: 1rem; font-size: 0.82rem; color: var(--texto2); flex-shrink: 0; }

  /* ── Badges ── */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 500; }
  .badge-morado { background: var(--morado-claro); color: var(--morado); }
  .badge-cat    { background: var(--tarjeta2); color: var(--texto2); border: 1px solid var(--borde); }
  .post-hashtag { font-size: 0.8rem; color: var(--morado); }

  /* ── Avatares ── */
  .avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.875rem; flex-shrink: 0; }
  :global(.avatar-morado)   { background: rgba(124,111,239,0.2); color: var(--morado); }
  :global(.avatar-verde)    { background: rgba(34,197,94,0.2);   color: var(--verde); }
  :global(.avatar-amarillo) { background: rgba(245,158,11,0.2);  color: #f59e0b; }
  :global(.avatar-rojo)     { background: rgba(239,68,68,0.2);   color: var(--rojo); }
  :global(.avatar-azul)     { background: rgba(59,130,246,0.2);  color: #3b82f6; }

  /* ── Botones ── */
  .btn-icono { width: 34px; height: 34px; background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--texto2); transition: background 0.15s, color 0.15s; }
  .btn-icono:hover { background: var(--morado-claro); color: var(--morado); }

  .btn-like { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; font-family: inherit; font-weight: 500; cursor: pointer; border: 1px solid var(--borde); background: var(--tarjeta2); color: var(--texto2); transition: background 0.15s, color 0.15s; }
  .btn-like:hover, .btn-like.liked { background: var(--morado-claro); color: var(--morado); border-color: rgba(124,111,239,0.4); }

  .btn-respuestas { display: inline-flex; align-items: center; gap: 7px; padding: 8px 16px; border-radius: 8px; font-size: 0.875rem; color: var(--texto2); background: var(--tarjeta2); border: 1px solid var(--borde); }

  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: var(--radio); font-size: 0.875rem; font-weight: 600; font-family: inherit; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.15s; }
  .btn-primario { background: linear-gradient(135deg, var(--morado), #9b6ef5); color: #fff; }
  .btn-primario:hover { opacity: 0.88; }

  /* ── Formulario respuesta ── */
  .reply-card { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio-grande); padding: 1.5rem; margin-bottom: 1.25rem; }
  .reply-card h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem; }
  .reply-card textarea { width: 100%; font-family: inherit; font-size: 0.9rem; color: var(--texto); background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: var(--radio); padding: 12px 14px; outline: none; min-height: 120px; resize: vertical; line-height: 1.7; transition: border-color 0.15s; margin-bottom: 1rem; box-sizing: border-box; }
  .reply-card textarea:focus { border-color: var(--morado); box-shadow: 0 0 0 3px rgba(124,111,239,0.15); }
  .reply-form-footer { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .reply-hint { font-size: 0.82rem; color: var(--texto2); }

  /* ── Respuestas ── */
  .respuestas-seccion { margin-bottom: 2.5rem; }
  .respuestas-titulo  { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; }
  .sin-respuestas { text-align: center; color: var(--texto2); font-size: 0.875rem; padding: 2rem; background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio); }

  .respuesta-card { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio); padding: 1.25rem; margin-bottom: 0.75rem; transition: border-color 0.15s; }
  .respuesta-card:hover { border-color: rgba(124,111,239,0.35); }
  .respuesta-cabecera { display: flex; align-items: center; gap: 10px; margin-bottom: 0.85rem; }
  .respuesta-autor-info { flex: 1; }
  .respuesta-fecha { font-size: 0.78rem; color: var(--texto3); flex-shrink: 0; }
  .respuesta-contenido { font-size: 0.875rem; line-height: 1.75; color: var(--texto); margin-bottom: 0.85rem; padding-left: 46px; }
  .respuesta-acciones { display: flex; align-items: center; gap: 8px; padding-left: 46px; }

  .btn-responder { display: inline-flex; align-items: center; gap: 5px; background: none; border: none; font-size: 0.82rem; color: var(--texto2); cursor: pointer; font-family: inherit; padding: 4px 8px; border-radius: 6px; transition: background 0.12s, color 0.12s; }
  .btn-responder:hover { background: var(--tarjeta2); color: var(--texto); }

  /* ── Toast ── */
  .toast { position: fixed; bottom: 2rem; right: 2rem; background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: var(--radio); padding: 0.85rem 1.2rem; font-size: 0.875rem; color: var(--texto); display: flex; align-items: center; gap: 10px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); z-index: 999; transform: translateY(20px); opacity: 0; transition: transform 0.25s ease, opacity 0.25s ease; }
  .toast.show { transform: translateY(0); opacity: 1; }

  /* ── Footer ── */
  footer { background: var(--tarjeta); border-top: 1px solid var(--borde); padding: 2rem 2rem 1.5rem; margin-top: 3rem; }
  .footer-grid { max-width: 1200px; margin: 0 auto 1.5rem; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 2rem; }
  .footer-col p, .footer-col a { font-size: 0.82rem; color: var(--texto2); line-height: 1.8; display: block; text-decoration: none; }
  .footer-col h4 { font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }
  .footer-col a:hover { color: var(--morado); }
  .footer-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 0.75rem; }
  .footer-logo img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
  .footer-logo span { font-weight: 700; color: var(--morado); font-size: 0.95rem; }
  .footer-bottom { max-width: 1200px; margin: 0 auto; text-align: center; font-size: 0.78rem; color: var(--texto3, #5a5a7a); border-top: 1px solid var(--borde); padding-top: 1.25rem; }

  /* ── Nav logout ── */
  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }

  /* ── Responsive ── */
  @media (max-width: 640px) {
    .page-wrapper { padding: 1.5rem 1rem 4rem; }
    .detalle-titulo { font-size: 1.25rem; }
    .autor-meta { flex-direction: column; gap: 4px; }
    .reply-form-footer { flex-direction: column; align-items: flex-start; }
    .respuesta-contenido, .respuesta-acciones { padding-left: 0; }
    .footer-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
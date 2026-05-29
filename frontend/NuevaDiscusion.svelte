<script>
  import { onMount } from 'svelte';
  import '../css/nueva-discusion.css';

  const API = 'http://localhost:3000';

  const POPULAR_TAGS = [
    'Desarrollo Web','React','Node.js','Python','Marketing Digital',
    'SEO','UX','UI','Diseño','Freelance','Remoto','Salario',
    'Negociación','Entrevistas','Portfolio','Carrera','Aprendizaje',
    'Soft Skills','Liderazgo','Productividad'
  ];

  // ── Sesión ────────────────────────────────────────────────
  let usuario = null;

  // ── Form ──────────────────────────────────────────────────
  let titulo    = '';
  let contenido = '';
  let categoria = '';
  let categorias = [];

  // ── Validación ────────────────────────────────────────────
  let errorTitulo    = false;
  let errorContenido = false;
  let errorCategoria = false;

  // ── Tags ──────────────────────────────────────────────────
  let tags         = [];
  let tagInput     = '';
  let sugerencias  = [];
  let mostrarSugs  = false;

  // ── Estado ────────────────────────────────────────────────
  let publicando   = false;
  let toastVisible = false;
  let toastMsg     = '';

  // ─────────────────────────────────────────────────────────
  onMount(async () => {
    usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
    await cargarCategorias();
  });

  async function cargarCategorias() {
    try {
      const res = await fetch(`${API}/foros/categorias`);
      categorias = await res.json();
    } catch (e) { categorias = []; }
  }

  // ── Toast ─────────────────────────────────────────────────
  function mostrarToast(msg) {
    toastMsg     = msg;
    toastVisible = true;
    setTimeout(() => { toastVisible = false; }, 2500);
  }

  function logout() {
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }

  // ── Tags ──────────────────────────────────────────────────
  function actualizarSugerencias() {
    if (!tagInput.trim()) { sugerencias = POPULAR_TAGS.filter(t => !tags.includes(t)).slice(0, 10); }
    else {
      sugerencias = POPULAR_TAGS.filter(t =>
        t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t)
      ).slice(0, 10);
    }
  }

  function onTagFocus() { actualizarSugerencias(); mostrarSugs = true; }
  function onTagBlur()  { setTimeout(() => { mostrarSugs = false; }, 150); }

  function onTagInput() { actualizarSugerencias(); mostrarSugs = true; }

  function onTagKeydown(e) {
    if (e.key === 'Enter') { e.preventDefault(); agregarTag(tagInput); }
  }

  function agregarTag(t) {
    t = t.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      tags = [...tags, t];
      tagInput = '';
      mostrarSugs = false;
    }
  }

  function quitarTag(t) { tags = tags.filter(x => x !== t); }

  // ── Submit ────────────────────────────────────────────────
  async function publicar() {
    errorTitulo    = !titulo.trim();
    errorContenido = !contenido.trim();
    errorCategoria = !categoria;
    if (errorTitulo || errorContenido || errorCategoria) return;

    if (!usuario) { mostrarToast('Debes iniciar sesión para publicar'); return; }

    publicando = true;
    try {
      const res  = await fetch(`${API}/foros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario_id:   usuario.id,
          categoria_id: parseInt(categoria),
          titulo:       titulo.trim(),
          contenido:    contenido.trim(),
          etiquetas:    tags
        })
      });
      const data = await res.json();
      if (data.error) { mostrarToast('Error: ' + data.error); return; }
      mostrarToast('¡Discusión creada exitosamente!');
      setTimeout(() => { window.location.href = '/foros'; }, 1800);
    } catch (e) {
      mostrarToast('Error al conectar con el servidor');
    } finally {
      publicando = false;
    }
  }
</script>

<svelte:head>
  <title>Shovel - Nueva Discusión</title>
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

  <div class="page-header">
    <h1>Crear Nueva Discusión</h1>
    <p>Comparte tus ideas, preguntas o experiencias con la comunidad</p>
  </div>

  <!-- Título -->
  <div class="form-card">
    <label class="field-label">Título <span class="req">*</span></label>
    <input
      type="text"
      maxlength="255"
      placeholder="Escribe un título claro y descriptivo para tu discusión"
      bind:value={titulo}
      class:campo-error={errorTitulo}
      on:input={() => errorTitulo = false}
    >
    <p class="char-count">{titulo.length} / 255 caracteres</p>
  </div>

  <!-- Categoría -->
  <div class="form-card">
    <label class="field-label">Categoría <span class="req">*</span></label>
    <div class="select-wrap">
      <select
        bind:value={categoria}
        class:campo-error={errorCategoria}
        on:change={() => errorCategoria = false}
      >
        <option value="" disabled>
          {categorias.length === 0 ? 'Cargando categorías...' : 'Selecciona una categoría'}
        </option>
        {#each categorias as cat}
          <option value={cat.id}>{cat.nombre}</option>
        {/each}
      </select>
    </div>
  </div>

  <!-- Contenido -->
  <div class="form-card">
    <label class="field-label">Contenido <span class="req">*</span></label>
    <textarea
      placeholder="Describe tu discusión con detalle..."
      bind:value={contenido}
      class:campo-error={errorContenido}
      on:input={() => errorContenido = false}
    ></textarea>
    <div class="tip-box">
      💡 <strong>Consejo:</strong> Sé específico y claro en tu discusión.
      Incluye toda la información relevante para que otros puedan ayudarte mejor.
    </div>
  </div>

  <!-- Etiquetas -->
  <div class="form-card">
    <label class="field-label">
      Etiquetas <span class="field-label-opt">(Opcional — máximo 5)</span>
    </label>
    <p class="field-sub">Añade etiquetas para ayudar a otros a encontrar tu discusión</p>

    <!-- Pills actuales -->
    <div class="tags-display">
      {#each tags as t}
        <span class="tag-pill">
          #{t}
          <button type="button" on:click={() => quitarTag(t)}>✕</button>
        </span>
      {/each}
    </div>

    <!-- Input + sugerencias -->
    {#if tags.length < 5}
      <div class="tag-input-wrap">
        <span class="tag-icon-left">🏷</span>
        <input
          type="text"
          placeholder="Escribe o selecciona etiquetas"
          bind:value={tagInput}
          on:input={onTagInput}
          on:focus={onTagFocus}
          on:blur={onTagBlur}
          on:keydown={onTagKeydown}
          autocomplete="off"
        >
        {#if mostrarSugs && sugerencias.length > 0}
          <div class="tag-suggestions visible">
            <div class="tag-sug-header">Etiquetas populares</div>
            {#each sugerencias as s}
              <div class="tag-sug-item" on:mousedown|preventDefault={() => agregarTag(s)}>
                + #{s}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Pautas -->
  <div class="guidelines-card">
    <h3>Pautas de la Comunidad</h3>
    <ul>
      {#each [
        'Sé respetuoso y profesional en tus comentarios',
        'Evita contenido ofensivo, spam o autopromoción excesiva',
        'Verifica que tu pregunta no haya sido respondida antes',
        'Usa un lenguaje claro y evita abreviaturas innecesarias',
        'Agradece las respuestas útiles y marca las soluciones',
      ] as pauta}
        <li>{pauta}</li>
      {/each}
    </ul>
  </div>

  <!-- Acciones -->
  <div class="form-actions">
    <a href="/foros" class="btn btn-borde">✕ Cancelar</a>
    <button class="btn btn-primario" on:click={publicar} disabled={publicando}>
      {publicando ? 'Publicando...' : '✉ Publicar Discusión'}
    </button>
  </div>

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
  .page-wrapper { max-width: 800px; margin: 0 auto; padding: 2rem 2rem 5rem; }

  .back-btn { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--texto2); text-decoration: none; margin-bottom: 1.5rem; transition: color 0.15s; }
  .back-btn:hover { color: var(--texto); }

  .page-header { margin-bottom: 2rem; }
  .page-header h1 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
  .page-header p  { font-size: 0.875rem; color: var(--texto2); }

  /* ── Cards ── */
  .form-card { background: var(--tarjeta); border: 1px solid var(--borde); border-radius: var(--radio-grande); padding: 1.5rem; margin-bottom: 1rem; }

  .field-label { display: block; font-size: 0.875rem; font-weight: 600; margin-bottom: 8px; color: var(--texto); }
  .field-label .req { color: var(--rojo); margin-left: 2px; }
  .field-label-opt  { font-weight: 400; color: var(--texto2); font-size: 0.8rem; margin-left: 6px; }
  .field-sub { font-size: 0.8rem; color: var(--texto2); margin-bottom: 10px; }

  /* ── Inputs ── */
  input[type="text"], textarea, select {
    width: 100%;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--texto);
    background: var(--tarjeta2);
    border: 1px solid var(--borde);
    border-radius: var(--radio);
    padding: 10px 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    appearance: none;
    box-sizing: border-box;
  }
  input[type="text"]:focus, textarea:focus, select:focus { border-color: var(--morado); box-shadow: 0 0 0 3px rgba(124,111,239,0.15); }
  textarea { min-height: 260px; resize: vertical; line-height: 1.7; }
  .char-count { font-size: 0.75rem; color: var(--texto3); text-align: right; margin-top: 6px; }
  .campo-error { border-color: var(--rojo) !important; }

  /* ── Select ── */
  .select-wrap { position: relative; }
  .select-wrap::after { content: ''; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid var(--texto2); pointer-events: none; }
  .select-wrap select { padding-right: 2.5rem; cursor: pointer; }

  /* ── Tip ── */
  .tip-box { background: var(--tarjeta2); border-left: 3px solid var(--morado); border-radius: 0 8px 8px 0; padding: 0.85rem 1rem; font-size: 0.82rem; color: var(--texto2); line-height: 1.6; margin-top: 1rem; }
  .tip-box strong { color: var(--texto); }

  /* ── Tags ── */
  .tags-display { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .tag-pill { display: inline-flex; align-items: center; gap: 5px; background: var(--morado-claro); color: var(--morado); border: 1px solid rgba(124,111,239,0.3); padding: 4px 12px; border-radius: 999px; font-size: 0.8rem; font-weight: 500; }
  .tag-pill button { background: none; border: none; color: var(--morado); cursor: pointer; opacity: 0.7; font-size: 14px; padding: 0; transition: opacity 0.15s; }
  .tag-pill button:hover { opacity: 1; }

  .tag-input-wrap { position: relative; }
  .tag-icon-left { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 0.85rem; pointer-events: none; color: var(--texto3); }
  .tag-input-wrap input[type="text"] { padding-left: 36px; }

  .tag-suggestions { position: absolute; z-index: 50; top: calc(100% + 6px); left: 0; right: 0; background: var(--tarjeta2); border: 1px solid var(--borde); border-radius: var(--radio); box-shadow: 0 8px 24px rgba(0,0,0,0.5); max-height: 220px; overflow-y: auto; display: none; }
  .tag-suggestions.visible { display: block; }
  .tag-sug-header { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; color: var(--texto3); padding: 8px 12px 4px; }
  .tag-sug-item { display: flex; align-items: center; gap: 8px; padding: 8px 12px; font-size: 0.875rem; color: var(--texto2); cursor: pointer; transition: background 0.12s, color 0.12s; }
  .tag-sug-item:hover { background: var(--morado-claro); color: var(--morado); }

  /* ── Pautas ── */
  .guidelines-card { background: var(--morado-claro); border: 1px solid rgba(124,111,239,0.25); border-radius: var(--radio-grande); padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
  .guidelines-card h3 { font-size: 0.9rem; font-weight: 600; margin-bottom: 0.85rem; }
  .guidelines-card ul { list-style: none; padding: 0; }
  .guidelines-card li { font-size: 0.84rem; color: var(--texto2); padding: 3px 0; display: flex; align-items: flex-start; gap: 8px; line-height: 1.5; }
  .guidelines-card li::before { content: '•'; color: var(--morado); flex-shrink: 0; }

  /* ── Acciones ── */
  .form-actions { display: flex; justify-content: flex-end; gap: 10px; }
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 20px; border-radius: var(--radio); font-size: 0.875rem; font-weight: 600; font-family: inherit; cursor: pointer; border: none; text-decoration: none; transition: opacity 0.15s; }
  .btn-borde { background: transparent; color: var(--texto2); border: 1px solid var(--borde); }
  .btn-borde:hover { background: var(--tarjeta2); color: var(--texto); }
  .btn-primario { background: linear-gradient(135deg, var(--morado), #9b6ef5); color: #fff; }
  .btn-primario:hover:not(:disabled) { opacity: 0.88; }
  .btn-primario:disabled { opacity: 0.7; cursor: not-allowed; }

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
  .footer-logo span { font-weight: 700; color: var(--morado); }
  .footer-bottom { max-width: 1200px; margin: 0 auto; text-align: center; font-size: 0.78rem; color: var(--texto3); border-top: 1px solid var(--borde); padding-top: 1.25rem; }

  .btn-logout { background: transparent; border: 1px solid #ef4444; color: #ef4444; cursor: pointer; border-radius: 8px; padding: 6px 14px; }

  @media (max-width: 640px) {
    .page-wrapper { padding: 1.5rem 1rem 4rem; }
    .page-header h1 { font-size: 1.35rem; }
    .form-actions { flex-direction: column-reverse; }
    .form-actions .btn { width: 100%; justify-content: center; }
  }
</style>

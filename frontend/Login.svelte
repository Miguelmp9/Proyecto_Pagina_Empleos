<script>
  import "../css/login.css";
  import { onMount } from "svelte";

  const API = "http://localhost:3000";

  // ── Estado ────────────────────────────────────────────────
  let tab = "login"; // 'login' | 'registro'
  let tipoRegistro = "usuario"; // 'usuario' | 'empresa'

  // ── Mensaje feedback ──────────────────────────────────────
  let mensaje = "";
  let mensajeTipo = ""; // 'error' | 'exito'

  // ── Campos login ──────────────────────────────────────────
  let loginEmail = "";
  let loginContrasena = "";
  let loginCargando = false;

  // ── Campos registro ───────────────────────────────────────
  let regNombre = "";
  let regEmail = "";
  let regContrasena = "";
  let regConfirmar = "";
  let regIndustria = "";
  let regTamano = "";

  // ─────────────────────────────────────────────────────────
  onMount(() => {
    const u = localStorage.getItem("usuario");
    if (u) window.location.href = "/";
  });

  // ── Helpers ───────────────────────────────────────────────
  function mostrarMensaje(texto, tipo) {
    mensaje = texto;
    mensajeTipo = tipo;
  }

  function cambiarTab(t) {
    tab = t;
    mensaje = "";
  }

  function seleccionarTipo(tipo) {
    tipoRegistro = tipo;
  }

  async function iniciarSesion() {
    if (!loginEmail || !loginContrasena) {
      mostrarMensaje("Por favor completa todos los campos", "error");
      return;
    }
    loginCargando = true;
    mensaje = "";
    try {
      // Intentar como usuario
      let res = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail,
          contrasena: loginContrasena,
        }),
      });
      let data = await res.json();

      // Si falla, intentar como empresa
      if (!res.ok) {
        res = await fetch(`${API}/empresas/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginEmail,
            contrasena: loginContrasena,
          }),
        });
        data = await res.json();
      }

      if (!res.ok) {
        mostrarMensaje(
          data.error || "Correo o contraseña incorrectos",
          "error",
        );
        return;
      }

      if (data.usuario) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("tipoUsuario", data.usuario.rol);
        localStorage.setItem("token", data.token);
      } else if (data.empresa) {
        localStorage.setItem("usuario", JSON.stringify({ ...data.empresa, rol: 'empresa' }));
        localStorage.setItem("tipoUsuario", "empresa");
        localStorage.setItem("token", data.token);
      }

      mostrarMensaje("✓ Entrando...", "exito");
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } catch (e) {
      mostrarMensaje("No se pudo conectar con el servidor", "error");
    } finally {
      loginCargando = false;
    }
  }

  // ── Registro ──────────────────────────────────────────────
  async function registrarse() {
    if (!regNombre || !regEmail || !regContrasena || !regConfirmar) {
      mostrarMensaje("Por favor completa todos los campos", "error");
      return;
    }
    if (regContrasena !== regConfirmar) {
      mostrarMensaje("Las contraseñas no coinciden", "error");
      return;
    }
    if (tipoRegistro === "empresa" && (!regIndustria || !regTamano)) {
      mostrarMensaje("Por favor completa los datos de la empresa", "error");
      return;
    }

    mensaje = "";
    try {
      let res;
      if (tipoRegistro === "usuario") {
        res = await fetch(`${API}/usuarios`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre_completo: regNombre,
            email: regEmail,
            contrasena: regContrasena,
          }),
        });
      } else {
        res = await fetch(`${API}/empresas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: regNombre,
            email: regEmail,
            contrasena: regContrasena,
            industria: regIndustria,
            tamano: regTamano,
          }),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        mostrarMensaje(data.error || "Error al crear la cuenta", "error");
        return;
      }

      mostrarMensaje(
        "Cuenta creada exitosamente, ya puedes iniciar sesión",
        "exito",
      );
      setTimeout(() => cambiarTab("login"), 2000);
    } catch (e) {
      mostrarMensaje("No se pudo conectar con el servidor", "error");
    }
  }

  // ── Enter para submit ─────────────────────────────────────
  function onKeyLogin(e) {
    if (e.key === "Enter") iniciarSesion();
  }
</script>

<svelte:head>
  <title>Shovel - Iniciar Sesión</title>
</svelte:head>

<div class="contenedor-auth">
  <!-- Lado izquierdo -->
  <div class="auth-izquierda">
    <div class="auth-tarjeta">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="auth-logo-fila">
          <img
            src="/contenido_multimedia/logo.png"
            alt="Shovel"
            style="width:40px;height:40px;border-radius:8px;object-fit:cover;"
          />
          <span>Shovel</span>
        </div>
        <p class="auth-subtitulo">
          {tab === "login"
            ? "Bienvenido de vuelta"
            : "Comienza tu búsqueda laboral"}
        </p>
      </div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <div
          class="auth-tab"
          class:activo={tab === "login"}
          on:click={() => cambiarTab("login")}
        >
          Iniciar Sesión
        </div>
        <div
          class="auth-tab"
          class:activo={tab === "registro"}
          on:click={() => cambiarTab("registro")}
        >
          Registrarse
        </div>
      </div>

      <!-- Mensaje feedback -->
      {#if mensaje}
        <div
          class="mensaje"
          class:error={mensajeTipo === "error"}
          class:exito={mensajeTipo === "exito"}
        >
          {mensaje}
        </div>
      {/if}

      <!-- ── FORM LOGIN ── -->
      {#if tab === "login"}
        <div class="form-animado">
          <div class="grupo-input">
            <label>Correo electrónico</label>
            <div class="input-con-icono">
              <span class="icono-input">✉</span>
              <input
                class="input"
                type="email"
                placeholder="tu@email.com"
                bind:value={loginEmail}
                on:keydown={onKeyLogin}
              />
            </div>
          </div>
          <div class="grupo-input">
            <label>Contraseña</label>
            <input
              class="input"
              type="password"
              placeholder="••••••••"
              bind:value={loginContrasena}
              on:keydown={onKeyLogin}
            />
          </div>
          <button
            class="btn btn-primario btn-ancho-completo"
            on:click={iniciarSesion}
            disabled={loginCargando}
          >
            {#if loginCargando}<span class="btn-spinner"></span> Iniciando sesión...{:else}Iniciar
              Sesión{/if}
          </button>
          <p class="texto-link-auth">
            ¿No tienes cuenta? 
              href="#"
              on:click|preventDefault={() => cambiarTab("registro")}
             <a>Regístrate aquí</a>
          </p>
        </div>
      {/if}

      <!-- ── FORM REGISTRO ── -->
      {#if tab === "registro"}
        <div class="form-animado">
          <!-- Selector tipo -->
          <div class="selector-tipo">
            <div
              class="tipo-card"
              class:activo={tipoRegistro === "usuario"}
              on:click={() => seleccionarTipo("usuario")}
            >
              <div class="tipo-emoji">👤</div>
              <div class="tipo-titulo">Soy Candidato</div>
              <div class="tipo-desc">Busco empleo</div>
            </div>
            <div
              class="tipo-card"
              class:activo={tipoRegistro === "empresa"}
              on:click={() => seleccionarTipo("empresa")}
            >
              <div class="tipo-emoji">🏢</div>
              <div class="tipo-titulo">Soy Empresa</div>
              <div class="tipo-desc">Publico empleos</div>
            </div>
          </div>

          <div class="grupo-input">
            <label
              >{tipoRegistro === "empresa"
                ? "Nombre de la empresa"
                : "Nombre completo"}</label
            >
            <input
              class="input"
              type="text"
              placeholder={tipoRegistro === "empresa"
                ? "Mi Empresa S.A."
                : "Juan Pérez"}
              bind:value={regNombre}
            />
          </div>
          <div class="grupo-input">
            <label>Correo electrónico</label>
            <div class="input-con-icono">
              <span class="icono-input">✉</span>
              <input
                class="input"
                type="email"
                placeholder="tu@email.com"
                bind:value={regEmail}
              />
            </div>
          </div>
          <div class="grupo-input">
            <label>Contraseña</label>
            <input
              class="input"
              type="password"
              placeholder="••••••••"
              bind:value={regContrasena}
            />
          </div>
          <div class="grupo-input">
            <label>Confirmar contraseña</label>
            <input
              class="input"
              type="password"
              placeholder="••••••••"
              bind:value={regConfirmar}
            />
          </div>

          {#if tipoRegistro === "empresa"}
            <div class="grupo-input">
              <label>Industria</label>
              <select class="input" bind:value={regIndustria}>
                <option value="">Selecciona una industria...</option>
                {#each ["Tecnología", "Marketing", "Diseño", "Finanzas", "Salud", "Educación", "Manufactura", "Comercio", "Otro"] as ind}
                  <option value={ind}>{ind}</option>
                {/each}
              </select>
            </div>
            <div class="grupo-input">
              <label>Tamaño de la empresa</label>
              <select class="input" bind:value={regTamano}>
                <option value="">Selecciona...</option>
                <option value="1-10">1-10 empleados</option>
                <option value="11-50">11-50 empleados</option>
                <option value="51-200">51-200 empleados</option>
                <option value="201-500">201-500 empleados</option>
                <option value="500+">500+ empleados</option>
              </select>
            </div>
          {/if}

          <button
            class="btn btn-primario btn-ancho-completo"
            on:click={registrarse}
          >
            Crear Cuenta
          </button>
          <p class="texto-link-auth">
            ¿Ya tienes cuenta? 
              href="#"
              on:click|preventDefault={() => cambiarTab("login")}
              <a>Inicia sesión</a
            >
          </p>
        </div>
      {/if}

      <p class="texto-terminos">
        Al continuar, aceptas nuestros Términos de Servicio y Política de
        Privacidad
      </p>
    </div>
  </div>

  <!-- Lado derecho -->
  <div class="auth-derecha">
    <div class="auth-fondo-img"></div>
    <div class="auth-texto-fondo">
      <h2>Encuentra el trabajo de<br />tus sueños</h2>
      <p>Miles de oportunidades laborales esperan por ti</p>
    </div>
  </div>
</div>

<style>
  /* ── Layout ── */
  .contenedor-auth {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .auth-izquierda {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--fondo);
  }

  .auth-tarjeta {
    background-color: var(--tarjeta);
    border: 1px solid var(--borde);
    border-radius: var(--radio-grande);
    padding: 2rem;
    width: 100%;
    max-width: 440px;
    animation: fadeSlideUp 0.4s ease;
  }

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* ── Logo ── */
  .auth-logo {
    text-align: center;
    margin-bottom: 1.75rem;
  }
  .auth-logo-fila {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 6px;
  }
  .auth-logo-fila span {
    font-size: 1.4rem;
    font-weight: 700;
  }
  .auth-subtitulo {
    color: var(--texto2);
    font-size: 0.9rem;
  }

  /* ── Tabs ── */
  .auth-tabs {
    display: flex;
    background-color: var(--tarjeta2);
    border-radius: 8px;
    padding: 4px;
    margin-bottom: 1.5rem;
  }
  .auth-tab {
    flex: 1;
    text-align: center;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.25s ease;
    color: var(--texto2);
  }
  .auth-tab:hover:not(.activo) {
    color: var(--texto);
    background-color: rgba(124, 111, 239, 0.1);
  }
  .auth-tab.activo {
    background-color: var(--morado);
    color: #fff;
    box-shadow: 0 2px 8px rgba(124, 111, 239, 0.4);
  }

  /* ── Mensaje ── */
  .mensaje {
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 10px;
    text-align: center;
    font-size: 14px;
    animation: fadeIn 0.3s ease;
  }
  .mensaje.error {
    background: rgba(255, 77, 77, 0.2);
    color: #ff4d4d;
    border: 1px solid #ff4d4d;
  }
  .mensaje.exito {
    background: rgba(76, 175, 80, 0.2);
    color: #4caf50;
    border: 1px solid #4caf50;
  }

  /* ── Selector tipo registro ── */
  .selector-tipo {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .tipo-card {
    border: 2px solid var(--borde);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    cursor: pointer;
    transition:
      border-color 0.2s,
      background 0.2s;
  }
  .tipo-card.activo {
    border-color: var(--morado);
    background: rgba(124, 111, 239, 0.1);
  }
  .tipo-emoji {
    font-size: 1.5rem;
    margin-bottom: 4px;
  }
  .tipo-titulo {
    font-size: 0.875rem;
    font-weight: 600;
  }
  .tipo-desc {
    font-size: 0.75rem;
    color: var(--texto2);
  }

  /* ── Grupos input ── */
  .grupo-input {
    margin-bottom: 1rem;
  }
  .grupo-input label {
    display: block;
    font-size: 0.85rem;
    color: var(--texto2);
    margin-bottom: 6px;
    transition: color 0.2s;
  }
  .grupo-input:focus-within label {
    color: var(--morado);
  }

  .input-con-icono {
    position: relative;
  }
  .input-con-icono .input {
    padding-left: 36px;
  }
  .icono-input {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--texto3);
    font-size: 0.9rem;
    pointer-events: none;
  }

  /* ── Botones ── */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    border-radius: var(--radio);
    font-size: 0.875rem;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    border: none;
    text-decoration: none;
    transition:
      opacity 0.15s,
      transform 0.1s;
  }
  .btn-primario {
    background: linear-gradient(135deg, var(--morado), #9b6ef5);
    color: #fff;
  }
  .btn-primario:hover:not(:disabled) {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(124, 111, 239, 0.4);
  }
  .btn-primario:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
  .btn-ancho-completo {
    width: 100%;
    margin-bottom: 1rem;
    justify-content: center;
  }

  .btn-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ── Textos ── */
  .texto-link-auth {
    text-align: center;
    font-size: 0.85rem;
    color: var(--texto2);
  }
  .texto-link-auth a {
    color: var(--morado);
    text-decoration: none;
  }
  .texto-link-auth a:hover {
    opacity: 0.75;
  }
  .texto-terminos {
    text-align: center;
    font-size: 0.75rem;
    color: var(--texto3);
    margin-top: 1.25rem;
  }

  /* ── Animación forms ── */
  .form-animado {
    animation: fadeIn 0.3s ease;
  }
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateX(10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  /* ── Lado derecho ── */
  .auth-derecha {
    background-color: var(--fondo2);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 3rem;
    position: relative;
    overflow: hidden;
  }

  .auth-fondo-img {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(
        180deg,
        rgba(13, 13, 26, 0.5) 0%,
        rgba(13, 13, 26, 0.8) 100%
      ),
      url("/contenido_multimedia/mejor-trabajo.jpg") center/cover no-repeat;
  }
  .auth-fondo-img::after {
    content: "";
    position: absolute;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(124, 111, 239, 0.15) 0%,
      transparent 70%
    );
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    animation: pulso 4s ease-in-out infinite;
  }
  @keyframes pulso {
    0%,
    100% {
      transform: translateX(-50%) scale(1);
      opacity: 0.5;
    }
    50% {
      transform: translateX(-50%) scale(1.2);
      opacity: 1;
    }
  }

  .auth-texto-fondo {
    position: relative;
    z-index: 1;
  }
  .auth-texto-fondo h2 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    color: #fff;
    line-height: 1.2;
  }
  .auth-texto-fondo p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .contenedor-auth {
      grid-template-columns: 1fr;
    }
    .auth-derecha {
      display: none;
    }
  }
</style>
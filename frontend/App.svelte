<script>
  import '../css/home.css';
  import Home from './Home.svelte';
  import Login from './Login.svelte';
  import Buscar from './Buscar.svelte';
  import Publicar from './Publicar.svelte';
  import Perfil from './Perfil.svelte';
  import Foros from './Foros.svelte';
  import Recursos from './Recursos.svelte';
  import Admin from './Admin.svelte';
  import NuevaDiscusion from './NuevaDiscusion.svelte';
  import DetalleEmpleo from './DetalleEmpleo.svelte';
  import DetalleForo from './DetalleForo.svelte';

  let ruta = window.location.pathname;

  // Escuchar navegación con botones atrás/adelante del browser
  window.addEventListener('popstate', () => {
    ruta = window.location.pathname;
  });

  // Interceptar clicks en <a> para navegación SPA (sin recargar)
  function navegar(e) {
    const a = e.target.closest('a');
    if (a && a.href && a.origin === location.origin && !a.target) {
      e.preventDefault();
      history.pushState(null, '', a.href);
      ruta = a.pathname;
    }
  }
</script>

<svelte:window on:click={navegar} />

{#if ruta === '/' || ruta === '/home'}
  <Home />
{:else if ruta === '/login'}
  <Login />
{:else if ruta === '/buscar'}
  <Buscar />
{:else if ruta === '/publicar'}
  <Publicar />
{:else if ruta === '/perfil'}
  <Perfil />
{:else if ruta === '/foros'}
  <Foros />
{:else if ruta === '/recursos'}
  <Recursos />
{:else if ruta === '/admin'}
  <Admin />
{:else if ruta === '/nueva-discusion'}
  <NuevaDiscusion />
{:else if ruta.startsWith('/detalle-empleo/')}
  <DetalleEmpleo />
{:else if ruta.startsWith('/foro/')}
  <DetalleForo />
{:else}
  <Home />
{/if}

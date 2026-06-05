<script>
  import '../css/home.css';
  import Home from '/Home.svelte';
  import Login from '/Login.svelte';
  import Buscar from '/Buscar.svelte';
  import Publicar from '/Publicar.svelte';
  import Perfil from '/Perfil.svelte';
  import Foros from '/Foros.svelte';
  import Recursos from '/Recursos.svelte';
  import Admin from '/Admin.svelte';
  import NuevaDiscusion from '/NuevaDiscusion.svelte';
  import DetalleEmpleo from '/DetalleEmpleo.svelte';
  import DetalleForo from '/DetalleForo.svelte';

  let ruta = window.location.pathname;
  let usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  window.addEventListener('popstate', () => {
    ruta = window.location.pathname;
  });

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
  {#if usuario?.rol === 'empresa'}
    <Publicar />
  {:else}
    <Login />
  {/if}

{:else if ruta === '/perfil'}
  {#if usuario}
    <Perfil />
  {:else}
    <Login />
  {/if}

{:else if ruta === '/foros'}
  <Foros />

{:else if ruta === '/recursos'}
  <Recursos />

{:else if ruta === '/admin'}
  {#if usuario?.rol === 'admin'}
    <Admin />
  {:else}
    <Login />
  {/if}

{:else if ruta === '/nueva-discusion'}
  {#if usuario}
    <NuevaDiscusion />
  {:else}
    <Login />
  {/if}

{:else if ruta.startsWith('/detalle-empleo/')}
  <DetalleEmpleo />

{:else if ruta.startsWith('/foro/')}
  <DetalleForo />

{:else if ruta.startsWith('/detalle-foro/')}
  <DetalleForo />

{:else}
  <Home />
{/if}
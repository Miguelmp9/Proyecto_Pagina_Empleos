<script>
  import Router from 'svelte-spa-router';
  import Login          from './routes/Login.svelte';
  import Home           from './routes/Home.svelte';
  import Buscar         from './routes/Buscar.svelte';
  import Foros          from './routes/Foros.svelte';
  import DetalleForo    from './routes/DetalleForo.svelte';
  import Perfil         from './routes/Perfil.svelte';
  import Publicar       from './routes/Publicar.svelte';
  import Recursos       from './routes/Recursos.svelte';
  import NuevaDiscusion from './routes/NuevaDiscusion.svelte';
  import Admin          from './routes/Admin.svelte';
  import DetalleEmpleo  from './routes/DetalleEmpleo.svelte';

  const routes = {
    '/':                  Home,
    '/login':             Login,
    '/buscar':            Buscar,
    '/foros':             Foros,
    '/foros/:id':         DetalleForo,
    '/perfil':            Perfil,
    '/publicar':          Publicar,
    '/recursos':          Recursos,
    '/nueva-discusion':   NuevaDiscusion,
    '/admin':             Admin,
    '/empleo/:id':        DetalleEmpleo,
  };
</script>

<Router {routes} />
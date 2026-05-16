import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { pedidoBorradorGuard } from './core/guards/pedido-borrador.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'obrador/alertas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/helados/stock/alertas-stock.component').then(m => m.AlertasStockHeladosComponent),
  },
  {
    path: 'obrador/stock',
    canActivate: [authGuard],
    loadComponent: () => import('./features/helados/stock/consultar-stock.component').then(m => m.ConsultarStockComponent),
  },
  {
    path: 'obrador/consumir',
    canActivate: [authGuard],
    loadComponent: () => import('./features/helados/elaboracion/consumir-helado.component').then(m => m.ConsumirHeladoComponent),
  },
  {
    path: 'obrador/detalles/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/helados/elaboracion/helado-form.component').then(m => m.HeladoFormComponent),
  },
  {
    path: 'obrador/elaborar',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_HELADERO'] },
    loadComponent: () => import('./features/helados/elaboracion/elaborar-producto.component').then(m => m.ElaborarProductoComponent),
  },
  {
    path: 'obrador/nuevo',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_HELADERO'] },
    loadComponent: () => import('./features/helados/elaboracion/helado-form.component').then(m => m.HeladoFormComponent),
  },
  {
    path: 'obrador/recetas',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_HELADERO'] },
    loadComponent: () => import('./features/helados/recetas/gestionar-recetas.component').then(m => m.GestionarRecetasComponent),
  },
  {
    path: 'obrador/recetas/nueva',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_HELADERO'] },
    loadComponent: () => import('./features/helados/recetas/receta-form.component').then(m => m.RecetaFormComponent),
  },
  {
    path: 'obrador/recetas/detalles/:id',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_HELADERO'] },
    loadComponent: () => import('./features/helados/recetas/receta-form.component').then(m => m.RecetaFormComponent),
  },
  {
    path: 'pedidos/historial',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pedidos/historial-pedidos.component').then(m => m.HistorialPedidosComponent),
  },
  {
    path: 'pedidos/pendientes',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pedidos/pedidos-pendientes.component').then(m => m.PedidosPendientesComponent),
  },
  {
    path: 'pedidos/nuevo',
    canActivate: [authGuard],
    canDeactivate: [pedidoBorradorGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_ENCARGADO'] },
    loadComponent: () => import('./features/pedidos/nuevo-pedido.component').then(m => m.NuevoPedidoComponent),
  },
  {
    path: 'pedidos/modificar/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pedidos/modificar-pedido.component').then(m => m.ModificarPedidoComponent),
  },
  {
    path: 'pedidos/detalles/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/pedidos/modificar-pedido.component').then(m => m.ModificarPedidoComponent),
  },
  {
    path: 'pedidos/plantillas',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_ENCARGADO'] },
    loadComponent: () => import('./features/pedidos/plantillas-pedido.component').then(m => m.PlantillasPedidoComponent),
  },

  {
    path: 'almacen/gestion',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/gestionar-almacen.component').then(m => m.GestionarAlmacenComponent),
  },
  {
    path: 'almacen/consumir',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/consumir-producto.component').then(m => m.ConsumirProductoComponent),
  },
  {
    path: 'almacen/alertas',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/alertas-stock.component').then(m => m.AlertasStockComponent),
  },
  {
    path: 'almacen/nuevo',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_ENCARGADO'] },
    loadComponent: () => import('./features/productos/producto-form.component').then(m => m.ProductoFormComponent),
  },
  {
    path: 'almacen/detalles/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/producto-form.component').then(m => m.ProductoFormComponent),
  },

  {
    path: 'proveedores/gestion',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_ENCARGADO'] },
    loadComponent: () => import('./features/proveedores/gestionar-proveedores.component').then(m => m.GestionarProveedoresComponent),
  },
  {
    path: 'proveedores/nuevo',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_ENCARGADO'] },
    loadComponent: () => import('./features/proveedores/proveedor-form.component').then(m => m.ProveedorFormComponent),
  },
  {
    path: 'proveedores/detalles/:id',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN', 'ROLE_ENCARGADO'] },
    loadComponent: () => import('./features/proveedores/proveedor-form.component').then(m => m.ProveedorFormComponent),
  },

  {
    path: 'usuarios/gestion',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./features/usuarios/gestionar-usuarios.component').then(m => m.GestionarUsuariosComponent),
  },
  {
    path: 'usuarios/nuevo',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./features/usuarios/usuario-form.component').then(m => m.UsuarioFormComponent),
  },
  {
    path: 'usuarios/detalles/:id',
    canActivate: [authGuard],
    data: { roles: ['ROLE_ADMIN'] },
    loadComponent: () => import('./features/usuarios/usuario-form.component').then(m => m.UsuarioFormComponent),
  },

  { path: '**', loadComponent: () => import('./shared/error404/error404.component').then(m => m.Error404Component) },
];
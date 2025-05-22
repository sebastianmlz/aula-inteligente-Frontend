import { Routes } from '@angular/router';
import { administradorGuard } from './core/auth/guards/administrador.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/autenticacion/pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'main',
    loadComponent: () =>
      import('./modules/layout/pages/main/main.component').then(m => m.MainComponent),
    canActivate: [administradorGuard],
    children: [
      // rutas hijas protegidas
    ]
  },
  {
    path: 'admin/gestion-usuarios',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-usuarios/gestion-usuarios.component')
        .then(m => m.GestionUsuariosComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./modules/autenticacion/pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

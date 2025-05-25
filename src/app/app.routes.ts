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
    path: 'admin/gestion-cursos',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-cursos/gestion-cursos.component')
        .then(m => m.GestionCursosComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/gestion-materias',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-materias/gestion-materias.component')
        .then(m => m.GestionMateriasComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/gestion-profesores',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-profesores/gestion-profesores.component')
        .then(m => m.GestionProfesoresComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/gestion-estudiantes',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-estudiantes/gestion-estudiantes.component')
        .then(m => m.GestionEstudiantesComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/gestion-asignaciones',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-asignaciones/gestion-asignaciones.component')
        .then(m => m.GestionAsignacionesComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./modules/autenticacion/pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

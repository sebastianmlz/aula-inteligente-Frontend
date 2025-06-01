import { Routes } from '@angular/router';
import { administradorGuard } from './core/auth/guards/administrador.guard';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { ProfesorGuard } from './core/auth/guards/profesor.guard';
import { EstudianteGuard } from './core/auth/guards/estudiante.guard';
import { TutorGuard } from './core/auth/guards/tutor.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./modules/autenticacion/pages/login/login.component').then(m => m.LoginComponent)
  },
  
  // Rutas de administrador
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
      import('./modules/gestion-academica/pages/gestion-cursos/gestion-cursos.component')
        .then(m => m.GestionCursosComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/gestion-materias',
    loadComponent: () =>
      import('./modules/gestion-academica/pages/gestion-materias/gestion-materias.component')
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
      import('./modules/gestion-academica/pages/gestion-asignaciones/gestion-asignaciones.component')
        .then(m => m.GestionAsignacionesComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/gestion-calificaciones',
    loadComponent: () =>
      import('./modules/gestion-academica/pages/gestion-calificaciones/gestion-calificaciones.component')
        .then(m => m.GestionCalificacionesComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/bitacora',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-bitacora/gestion-bitacora.component')
        .then(m => m.GestionBitacoraComponent),
    canActivate: [administradorGuard]
  },
  {
    path: 'admin/backup',
    loadComponent: () =>
      import('./modules/gestion-usuarios/pages/gestion-backup/gestion-backup.component')
        .then(m => m.GestionBackupComponent),
    canActivate: [administradorGuard]
  },

  //Rutas de profesor
  {
    path: 'profesor/mis-clases',
    loadComponent: () =>
      import('./modules/gestion-academica/pages/gestion-asignaciones/gestion-asignaciones.component')
        .then(m => m.GestionAsignacionesComponent),
    canActivate: [ProfesorGuard]
  },
  {
    path: 'profesor/asistencias',
    loadComponent: () =>
      import('./modules/gestion-academica/pages/gestion-asistencia/gestion-asistencia.component')
        .then(m => m.GestionAsistenciaComponent),
    canActivate: [ProfesorGuard]
  },
  {
    path: 'profesor/participaciones',
    loadComponent: () =>
      import('./modules/gestion-academica/pages/gestion-participacion/gestion-participacion.component')
        .then(m => m.GestionParticipacionComponent),
    canActivate: [ProfesorGuard]
  },
  {
    path: 'profesor/calificaciones',
    loadComponent: () =>
      import('./modules/gestion-academica/pages/gestion-calificaciones/gestion-calificaciones.component')
        .then(m => m.GestionCalificacionesComponent),
    canActivate: [ProfesorGuard]
  },
  
  // Rutas compartidas
  {
    path: 'main',
    loadComponent: () =>
      import('./modules/layout/pages/main/main.component').then(m => m.MainComponent),
    canActivate: [AuthGuard], // Cualquier usuario autenticado puede acceder a main
    children: [
      // rutas hijas protegidas
    ]
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./modules/autenticacion/pages/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
    canActivate: [AuthGuard]
  },
  
  // Rutas por defecto
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

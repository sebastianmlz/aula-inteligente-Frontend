import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../modules/autenticacion/services/auth.service';
import { MessageService } from 'primeng/api';

export const administradorGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const messageService = inject(MessageService);

  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  localStorage.setItem('logout_reason', 'No tenés permiso para acceder a esta ruta.');
  authService.logout();

  messageService.add({
    severity: 'warn',
    summary: 'Acceso no autorizado',
    detail: 'Tu sesión se ha cerrado automáticamente',
    life: 4000
  });

  router.navigate(['/login']);
  return false;
};
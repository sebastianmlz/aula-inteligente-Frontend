import { Injectable } from '@angular/core';
import {
  CanActivate, ActivatedRouteSnapshot,
  RouterStateSnapshot, Router
} from '@angular/router';
import { AuthService } from '../../../modules/autenticacion/services/auth.service';
import { NotificacionService } from '../../../modules/autenticacion/services/notificacion.service';

@Injectable({
  providedIn: 'root'
})
export class ProfesorGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificacionService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn() && this.authService.getRole() === 'Teacher') {
      return true;
    }
    
    this.notificationService.warn('Acceso denegado', 'No tiene permisos para acceder a esta sección');
    
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/main']);
    } else {
      this.router.navigate(['/login']);
    }
    return false;
  }
}
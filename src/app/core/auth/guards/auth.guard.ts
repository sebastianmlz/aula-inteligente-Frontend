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
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificacionService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isLoggedIn()) {
      return true;
    }
    
    this.notificationService.warn('Acceso denegado', 'Debe iniciar sesión para acceder a esta página');
    this.router.navigate(['/login']);
    return false;
  }
}
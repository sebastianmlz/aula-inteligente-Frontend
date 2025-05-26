import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };
  
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private noti: NotificacionService
  ) {}

  ngOnInit() {
    const reason = localStorage.getItem('logout_reason');
    if (reason) {
      this.noti.warn('Atención', reason);
      localStorage.removeItem('logout_reason');
    }
  }

  onLogin(): void {
    this.loading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
       

        // Guardar datos en localStorage
        localStorage.setItem('auth_access', response.access);
        localStorage.setItem('auth_refresh', response.refresh);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        localStorage.setItem('auth_role', response.roles?.[0] || '');

        // this.noti.success('¡Bienvenido!', 'Inicio de sesión exitoso.');

        // Redireccionar según el rol
        const role = response.roles?.[0] || '';
        console.log("rolll", role);
        // Redirige a /main para todos los roles conocidos
        if (
          ['Administrator', 'admin', 'Teacher', 'Parent', 'Student'].includes(role)
        ) {
          this.router.navigate(['/main']);
        } else {
          this.router.navigate(['/']);
        }
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        this.noti.error('Error', 'Credenciales inválidas o error en el servidor.');
      }
    });
  }
}

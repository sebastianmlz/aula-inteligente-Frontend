import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../services/auth.service';
import { NotificacionService } from '../../services/notificacion.service';
import { UserService } from '../../../gestion-usuarios/services/user.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TitleCasePipe
  ]
})
export class ConfiguracionComponent implements OnInit {
  usuario: any = {};
  modoEdicion = false;
  mostrarCambioPassword = false;
  private baseUrl = environment.apiUrl;

  cambioPassword = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private noti: NotificacionService
  ) { }

  ngOnInit() {
    this.usuario = this.authService.getUser();
  }

  get userKeys(): string[] {
    return this.usuario ? Object.keys(this.usuario).filter(key => !key.toLowerCase().includes('token')) : [];
  }

  guardarDatos(): void {
    const id = this.usuario.id;
    const updatedUser = {
      email: this.usuario.email,
      first_name: this.usuario.first_name,
      last_name: this.usuario.last_name,
      role: this.usuario.role,
      is_staff: this.usuario.is_staff,
      is_superuser: this.usuario.is_superuser
    };

    // this.userService.actualizarUser(id, updatedUser).subscribe({
    //   next: () => {
    //     this.noti.success('Datos actualizados', '¡Actualización correcta!');
    //     localStorage.setItem('user', JSON.stringify(this.usuario));
    //     this.modoEdicion = false;
    //   },
    //   error: (err) => {
    //     console.error('Error al actualizar usuario', err);
    //     this.noti.error('Error', 'No se pudo actualizar el usuario');
    //   }
    // });
  }

  cambiarPassword(form: NgForm): void {
    if (form.invalid) return;

    if (this.cambioPassword.newPassword !== this.cambioPassword.confirmPassword) {
      this.noti.warn('Las contraseñas no coinciden', 'Verifica que ambas contraseñas sean iguales.');
      return;
    }

    const id = this.authService.getUser()?.id;
    const data = {
      old_password: this.cambioPassword.oldPassword,
      new_password: this.cambioPassword.newPassword,
      confirm_password: this.cambioPassword.confirmPassword
    };

    this.authService.changePassword(id, data).subscribe({
      next: () => {
        this.noti.success('Contraseña actualizada', 'Tu contraseña fue cambiada exitosamente');
        form.resetForm();
        this.mostrarCambioPassword = false;
      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        this.noti.error('Error', err?.error?.detail || JSON.stringify(err?.error) || 'No se pudo cambiar la contraseña');
      }
    });
  }

  cancelarEdicion() {
    this.modoEdicion = false;
    this.usuario = this.authService.getUser();
    this.noti.warn('Cancelada', 'Edición de información cancelada');
  }

  cancelarCambioPassword() {
    this.mostrarCambioPassword = false;
    this.cambioPassword = { oldPassword: '', newPassword: '', confirmPassword: '' };
    this.noti.warn('Cancelado', 'Cambio de contraseña cancelado');
  }
}

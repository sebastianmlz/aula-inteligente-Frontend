import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { HeaderComponent } from './modules/layout/components/header/header.component';
import { SidebarComponent } from './modules/layout/components/sidebar/sidebar.component';
import { ToastModule } from 'primeng/toast';
import { AuthService } from './modules/autenticacion/services/auth.service';
import { CommonModule } from '@angular/common'; // <-- AGREGA ESTA LÍNEA

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, // <-- Y ESTA LÍNEA
    RouterOutlet,
    ButtonModule,
    HeaderComponent,
    SidebarComponent,
    ToastModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'aula-inteligente-Frontend';

  constructor(public authService: AuthService) {}
}

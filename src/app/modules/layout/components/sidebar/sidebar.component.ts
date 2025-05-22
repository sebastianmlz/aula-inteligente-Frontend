import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../../autenticacion/services/auth.service';
import { OnInit } from '@angular/core'; // 👈 importá esto si no lo tenés aún


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    DrawerModule,
    AvatarModule,
    RippleModule,
    MessageModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  visible = false;
  @Output() onclose = new EventEmitter();
  user: any;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  closeCallback(event: any) {
    this.visible = false;
    this.onclose.emit();
  }

  cerrarSesion() {
    this.authService.logout();
  }
}

import { Component } from '@angular/core';
import { Toolbar } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { SharedModule } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../autenticacion/services/auth.service';
import { CommonModule } from '@angular/common';
import { OverlayBadgeModule } from 'primeng/overlaybadge';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    ButtonModule,
    Toolbar,
    AvatarModule,
    RouterModule,
    CommonModule,
    AvatarModule,
    OverlayBadgeModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  constructor(public authService: AuthService, private router: Router) {}

  redireecionar():void{
    const footer=document.getElementById('footer')
    if(footer){
      footer.scrollIntoView({behavior:'smooth'})
    }
  }

  cerrarSesion() {
    this.authService.logout();
    this.router.navigate(['/ingreso']);
  }

}

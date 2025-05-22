import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  usuario: any = null;

  ngOnInit(): void {
    // Intenta recuperar el usuario del localStorage
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      this.usuario = JSON.parse(userStr);
    }
  }
}

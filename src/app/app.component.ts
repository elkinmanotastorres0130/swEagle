import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  template: '<router-outlet></router-outlet>', // Usa <router-outlet> para cargar las rutas
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'login-app';
}

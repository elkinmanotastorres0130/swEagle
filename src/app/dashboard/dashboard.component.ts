import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../auth.service'; // Importa el servicio AuthService
import {
  faDoorOpen,
  faVideoCamera,
  faUpload,
  faCamera
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FontAwesomeModule], // Importa FontAwesomeModule aquí
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  constructor(
    private router: Router, // Inyecta Router
    private authService: AuthService, // Inyecta el servicio AuthService
  ) {
  }
  // Dentro de la clase del componente
  iconLogout = faDoorOpen;
  iconVideo = faVideoCamera;
  iconUpload = faUpload;
  iconCamera = faCamera;
  // Método para redireccionar a la vista de video
  goToVideoView() {
    this.router.navigate(['/video']); // Navega a la ruta '/video'
  }
  // Función para redirigir al login
  goToLogin() {
    this.authService.logout(); // Llama al método logout() del servicio
    this.router.navigate(['/login']); // Asegúrate de que la ruta '/login' esté configurada en tu RouterModule
  }

  // Método para redireccionar a la vista de video
  goToloadingDownload() {
    this.router.navigate(['/loading-download']); // Navega a la ruta '/video'
  }

   // Método para redireccionar a la vista de video
   goToEvidence() {
    this.router.navigate(['/evidence']); // Navega a la ruta '/video'
  }
}





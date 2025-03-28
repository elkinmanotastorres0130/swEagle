import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service'; // Importa el servicio
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { fadeAnimation } from '../animations'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  animations: [fadeAnimation] // Añade la animación aquí
})
export class LoginComponent {
  usuario: string = '';
  contrasena: string = '';

  constructor(private authService: AuthService, private router: Router) { }
  errorMessage: string = ''; // Variable para el mensaje de error


  onSubmit() {
    // Llama al método login del servicio
    this.authService.login(this.usuario, this.contrasena).subscribe(success => {
      if (success) {
        console.log('Login exitoso');
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Usuario o contraseña incorrectos'; // Mensaje de error
      }
    });
  }
}
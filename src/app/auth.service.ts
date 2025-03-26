import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = '/services/autenticacion/login'; // URL del endpoint

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  // Método para realizar el login
  login(username: string, password: string): Observable<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post(this.loginUrl, formData).pipe(
      tap((response: any) => {
        if (response.success) {
          if (isPlatformBrowser(this.platformId)) {
            // Guarda el estado de autenticación en localStorage
            localStorage.setItem('isLoggedIn', 'true');
          }
          // Redirige al dashboard solo si el login es exitoso
          this.router.navigate(['/dashboard']);
        } else {
          // Muestra un alert con el mensaje de error
          alert(response.msg);
          // No redirijas al dashboard si el login falla
        }
      })
    );
  }

  isLoggedIn(): boolean {
    if (typeof localStorage !== 'undefined') { // Verifica si localStorage está disponible
      return localStorage.getItem('isLoggedIn') === 'true';
    }
    return false; // Si localStorage no está disponible, asume que el usuario no está autenticado
  }

  // Método para cerrar sesión
  logout(): void {
    if (typeof localStorage !== 'undefined') { // Verifica si localStorage está disponible
      localStorage.removeItem('isLoggedIn'); // Elimina el estado de autenticación
    }
    this.router.navigate(['/login']); // Redirige al login
  }

  private isLocalStorageAvailable(): boolean {
    if (isPlatformBrowser(this.platformId)) { // Solo en el navegador
      try {
        const testKey = '__test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false; // No está disponible en el servidor
  }
}
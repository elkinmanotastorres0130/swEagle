import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CausalesService {
  private apiUrl = '/services/parametros/causalesRechazoVideo';
  private apirechazo = '/services/operacion/rechazarVideo';


  constructor(private http: HttpClient) { }

  obtenerCausales(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // Método para rechazar el video
  rechazarVideo(id_video: string, id_causal: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_video', id_video);
    formData.append('id_causal', id_causal);

    return this.http.post(this.apirechazo, formData);
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OperacionService {
  private apiUrl = '/services/operacion/crearInfraccionMP';

  constructor(private http: HttpClient) { }

  enviarDatos(id_video: string, url_video: string, captura1: string, captura2: string, placa: string, direccion: string): Observable<any> {
    const formData = new FormData();
    formData.append('id_video', id_video);
    formData.append('url_video', url_video);
    formData.append('panoramica', captura1);
    formData.append('zoom', captura2);
    formData.append('placa', placa);
    formData.append('direccion', direccion);

    return this.http.post(this.apiUrl, formData);
  }
}
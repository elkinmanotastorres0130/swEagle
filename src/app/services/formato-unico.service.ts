import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormatoUnicoService {
  private baseUrl = '/services/FormatoUnico/webresources/reporte';

  constructor(private http: HttpClient) { }

  descargarFormatoUnico(fecha: string): Observable<any> {
    const url = `${this.baseUrl}/generarmasivopdf?fecha=${fecha}`;
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
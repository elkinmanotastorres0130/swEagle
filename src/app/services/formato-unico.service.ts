import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormatoUnicoService {
  private baseUrl = '/services/FormatoUnico/webresources/reporte';
  private baseUrlCantidadComparendo = '/services/operacion/listarCantidadComparendo';
  private baseUrlEvidencia = '/services/operacion/imprimirEvidenciaMPE1';


  constructor(private http: HttpClient) { }

  descargarFormatoUnico(fecha: string): Observable<any> {
    const url = `${this.baseUrl}/generarmasivopdf?fecha=${fecha}`;
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    });
  }

  // descargarFormatoEvidencia(fecha: string) {
  //   let origin = window.location.origin;
  //   //${origin}/index.php/acuerdosincumplidos/descargarDocumentos/${datos.archivo}/pdf/0;
  //   const url = `${origin}${this.baseUrlEvidencia}?fecha_cargue=${fecha}`;
  //   window.location = url;
   
  // // }

    obtenerCantidadDeComparendos(fecha: string): Observable<any> {
      return this.http.get(this.baseUrlCantidadComparendo, {
        params: { fecha_cargue: fecha }
      });
    }
}
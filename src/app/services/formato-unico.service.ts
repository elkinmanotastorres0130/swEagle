import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,throwError  } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FormatoUnicoService {
  private baseUrl = '/services/FormatoUnico/webresources/reporte';
  private baseUrlCantidadComparendo = '/services/operacion/listarCantidadComparendo';
  private baseUrlEvidencia = '/services/operacion/imprimirEvidenciaMPE1';
  private baseUrlDescargaEvidencia = '/services/operacion/descarcarLoteEvidenciaMPE1'
  private baseUrlDescargaMensajeria = '/services/operacion/crearExcelMensajeriaMPE1'
  private baseUrlDescargaSimit = '/services/operacion/crearPlanoSimitMPE1'

  constructor(private http: HttpClient) { }

  descargarFormatoUnico(fecha: string): Observable<any> {
    const url = `${this.baseUrl}/generarmasivopdf?fecha=${fecha}`;
    
    return this.http.get(url, {
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      timeout(180000), // 30 segundos de timeout
      catchError(error => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('Tiempo de espera agotado (30 segundos)'));
        }
        return throwError(() => error);
      })
    );
  }

  descargarFormatoEvidencia(fecha: string): Observable<any> {
    const formData = new FormData();
    formData.append('fecha_cargue', fecha);
  
    return this.http.post(`${this.baseUrlEvidencia}`, formData).pipe(
      timeout(180000), // 30 segundos de timeout
      catchError(error => {
        if (error.name === 'TimeoutError') {
          return throwError(() => new Error('La solicitud tardó demasiado en responder'));
        }
        return throwError(() => error);
      })
    );
  }

  descargarLoteEvidenciaMPE1(archivo: string): Observable<Blob> {
    const url = this.baseUrlDescargaEvidencia;
    return this.http.get(url, {
      params: { archivo },
      responseType: 'blob'
    });
  }

  descargarFormatoMensajeria(fecha: string): Observable<Blob> {
    return this.http.get(this.baseUrlDescargaMensajeria, {
      params: { fecha_cargue: fecha },
      responseType: 'blob'
    });
  }

  descargarFormatoSIMIT(fecha: string): Observable<Blob> {
    return this.http.get(this.baseUrlDescargaSimit, {
      params: { fecha_cargue: fecha },
      responseType: 'blob'
    });
  }

  obtenerCantidadDeComparendos(fecha: string): Observable<any> {
    return this.http.get(this.baseUrlCantidadComparendo, {
      params: { fecha_cargue: fecha }
    });
  }
}
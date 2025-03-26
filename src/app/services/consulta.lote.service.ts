// services/pending-files.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

interface PendingFilesResponse {
  success: boolean;
  msg: string;
  total: number;
}

interface UploadCsvResponse {
  success: boolean;
  msg: string;
  data?: Array<{
    cod_error: string;
    data: string;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class consultaLoteService {
  private apiUrl = '/services/operacion/listarMPE1Count'; // Usa la ruta del proxy
  private downloadUrl = '/services/operacion/descargarCsvMPE1';
  private uploadUrl = '/services/operacion/cargarCsvMPE1'; // Nueva URL para carga

  constructor(private http: HttpClient) { }

  getPendingFilesCount(fecha: string): Observable<PendingFilesResponse> {
    return this.http.get<PendingFilesResponse>(this.apiUrl, {
      params: { fecha_creacion: fecha }
    });
  }

  downloadCsv(fecha: string): Observable<Blob> {
    return this.http.post(this.downloadUrl, null, {
      params: { fecha_creacion: fecha },
      responseType: 'blob' // Indicamos que esperamos un blob (archivo)
    });
  }

  uploadCsv(file: File): Observable<UploadCsvResponse> {
    const formData = new FormData();
    formData.append('plano_csv', file, file.name);
    return this.http.post<UploadCsvResponse>(this.uploadUrl, formData);
  }

  // Método helper para mostrar errores con SweetAlert
  showErrorAlert(title: string, message: string, errors?: any[]) {
    if (!errors || errors.length === 0) {
      Swal.fire({
        title: title,
        text: message,
        icon: 'error'
      });
    } else {
      let html = `<p>${message}</p><div class="text-left mt-4">`;
      errors.forEach(error => {
        html += `<p><strong>${error.data}:</strong> ${error.cod_error}</p>`;
      });
      html += '</div>';

      Swal.fire({
        title: title,
        html: html,
        icon: 'error',
        scrollbarPadding: false
      });
    }
  }
}
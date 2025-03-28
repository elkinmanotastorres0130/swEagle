import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faDownload, faUpload, faSearch, faCloudUploadAlt, faFileDownload, faSpinner, faTimes, faUpload as faUploadSolid, faCloudDownloadAlt, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormatoUnicoService } from '../services/formato-unico.service';
import { saveAs } from 'file-saver';
import { fadeAnimation } from '../animations'; // Ajusta la ruta según tu estructura
import Swal from 'sweetalert2';

@Component({
  selector: 'app-evidence.component',
  templateUrl: './evidence.component.html',
  styleUrls: ['./evidence.component.css'],
  imports: [FontAwesomeModule, CommonModule, FormsModule],
  standalone: true,
  animations: [fadeAnimation] // Añade la animación aquí
})
export class EvidenceComponent {
  selectedFile: File | null = null;
  // Definición de iconos
  iconArrowLeft = faArrowLeft;
  iconDownload = faDownload;
  iconUpload = faUpload;
  iconSearch = faSearch;
  iconCloudUpload = faCloudUploadAlt;
  iconFileDownload = faFileDownload;
  faSpin = true;
  iconCloudDownload = faCloudDownloadAlt;
  iconCalendar = faCalendarAlt;

  // Variables del componente
  selectedDate: string;
  maxDate: string;
  pendingFiles: number = 0;
  showResults: boolean = false;
  loading: boolean = false;
  isLoading = false;
  conteoEvidencias = 0;
  conteoFormatos = 0;
  loadingEvidence = false;
  loadingFormat = false;
  iconSpinner = faSpinner;  // Asegúrate de tener esta importación
  loadingMensajeria = false;
  loadingSIMIT = false;
  conteoMensajeria = 0;
  conteoSIMIT = 0;

  private router = inject(Router);
  private formatoUnicoService = inject(FormatoUnicoService);

  constructor() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.selectedDate = this.maxDate;
  }

  ngOnInit() {
    this.setMaxDate();
  }

  descargarFormatoUnico() {
    if (!this.selectedDate) {
      console.error('No se ha seleccionado una fecha');
      return;
    }

    this.loadingFormat = true;

    this.formatoUnicoService.descargarFormatoUnico(this.selectedDate)
      .subscribe({
        next: (response) => {
          const blob = response.body;
          const contentDisposition = response.headers.get('content-disposition');
          let filename = `formato_unico_${this.selectedDate}.pdf`;

          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1];
            }
          }
          this.loadingFormat = false;
          // Método nativo para descargar
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);

          this.loadingFormat = false;
        },
        error: (error) => {
          console.error('Error al descargar:', error);
          this.loadingFormat = false;
          // Aquí puedes agregar notificación de error al usuario
        }
      });
  }

  descargarFormatoEvidencia() {
    if (!this.selectedDate) {
      console.error('No se ha seleccionado una fecha');
      return;
    }

    this.loadingEvidence = true;

    // Primera llamada - Obtener el código de archivo
    this.formatoUnicoService.descargarFormatoEvidencia(this.selectedDate)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            const fileCode = response.file;

            // Segunda llamada - Descargar el PDF
            this.formatoUnicoService.descargarLoteEvidenciaMPE1(fileCode)
              .subscribe({
                next: (pdfResponse: any) => {
                  // Manejar la descarga del PDF
                  const blob = new Blob([pdfResponse], { type: 'application/pdf' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `evidencia_${this.selectedDate}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  this.loadingEvidence = false;
                  Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: response.msg,
                    confirmButtonText: 'Aceptar'
                  });
                },
                error: (pdfError) => {
                  console.error('Error al descargar PDF:', pdfError);
                  this.loadingEvidence = false;
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al descargar el archivo PDF',
                    confirmButtonText: 'Aceptar'
                  });
                }
              });
          } else {
            this.loadingEvidence = false;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.msg,
              confirmButtonText: 'Aceptar'
            });
          }
        },
        error: (error) => {
          console.error('Error al generar evidencia:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error al comunicarse con el servidor',
            confirmButtonText: 'Aceptar'
          });
          this.loadingEvidence = false;
        }
      });
  }

  descargarFormatoMensajeria() {
    if (!this.selectedDate || this.loadingMensajeria) return;

    this.loadingMensajeria = true;

    this.formatoUnicoService.descargarFormatoMensajeria(this.selectedDate)
      .subscribe({
        next: (blob) => {
          this.descargarArchivo(blob, `mensajeria_${this.selectedDate}.xlsx`);
        },
        error: (error) => {
          console.error('Error al descargar formato mensajería:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al descargar el formato de mensajería',
            confirmButtonText: 'Aceptar'
          });
        },
        complete: () => {
          this.loadingMensajeria = false;
        }
      });
  }

  descargarFormatoSIMIT() {
    if (!this.selectedDate || this.loadingSIMIT) return;

    this.loadingSIMIT = true;

    this.formatoUnicoService.descargarFormatoSIMIT(this.selectedDate)
      .subscribe({
        next: (blob) => {
          this.descargarArchivo(blob, `simit_${this.selectedDate}.txt`);
        },
        error: (error) => {
          console.error('Error al descargar formato SIMIT:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al descargar el formato SIMIT',
            confirmButtonText: 'Aceptar'
          });
        },
        complete: () => {
          this.loadingSIMIT = false;
        }
      });
  }

  // Reutilizamos tu método existente para descargar archivos
  private descargarArchivo(blob: Blob, nombreArchivo: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  cargarConteo(fecha: string) {
    this.isLoading = true;
    this.formatoUnicoService.obtenerCantidadDeComparendos(fecha)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.conteoEvidencias = response.total;
            this.conteoFormatos = response.total; // Asumimos mismo valor para ambos
          } else {
            this.conteoEvidencias = 0;
            this.conteoFormatos = 0;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al obtener conteo:', error);
          this.conteoEvidencias = 0;
          this.conteoFormatos = 0;
          this.isLoading = false;
        }
      });
  }

  private setMaxDate() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.selectedDate = this.maxDate; // Fecha actual por defecto
  }

  validateDate() {
    const selected = new Date(this.selectedDate);
    const today = new Date(this.maxDate);
    if (selected > today) {
      this.selectedDate = this.maxDate;
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

}
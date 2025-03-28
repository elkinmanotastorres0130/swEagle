import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faDownload, faUpload, faSearch, faCloudUploadAlt, faFileDownload, faSpinner, faTimes,faUpload as faUploadSolid } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { consultaLoteService } from '../services/consulta.lote.service';
import Swal from 'sweetalert2';
import { fadeAnimation } from '../animations'; // Ajusta la ruta según tu estructura


@Component({
  selector: 'app-loading-download',
  templateUrl: './loading-download.component.html',
  styleUrls: ['./loading-download.component.css'],
  imports: [FontAwesomeModule, CommonModule, FormsModule],
  standalone: true,
  animations: [fadeAnimation] // Añade la animación aquí

})
export class LoadingDownloadComponent {
  selectedFile: File | null = null;
  // Definición de iconos
  iconArrowLeft = faArrowLeft;
  iconDownload = faDownload;
  iconUpload = faUpload;
  iconSearch = faSearch;
  iconCloudUpload = faCloudUploadAlt;
  iconFileDownload = faFileDownload;
  iconSpinner = faSpinner;
  iconTimes = faTimes;
  faSpin = true;
  iconUploadSolid = faUploadSolid; // Icono diferente para el área de drop

  // Variables del componente
  maxDate: string;
  pendingFiles: number = 0;
  showResults: boolean = false;
  loading: boolean = false;
  errorMessage: string | null = null;
  isDragOver = false;
  startDate: string;  // <-- Nueva propiedad
  endDate: string;    // <-- Nueva propiedad


  private router = inject(Router);
  private pendingFilesService = inject(consultaLoteService);


  constructor() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
    this.startDate = this.maxDate;
    this.endDate = this.maxDate;
  }

  validateDate() {
    const today = new Date(this.maxDate);
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    // Validar que no sean futuras
    if (start > today) this.startDate = this.maxDate;
    if (end > today) this.endDate = this.maxDate;
    
    // Validar que startDate <= endDate
    if (start > end) this.endDate = this.startDate;
}

  getPendingFiles() {
    this.loading = true;
    this.errorMessage = null;
    this.showResults = false;

    this.pendingFilesService.getPendingFilesCount(this.startDate, this.endDate)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.pendingFiles = response.total;
            this.showResults = true;
          } else {
            this.errorMessage = response.msg || 'Error en la consulta';
          }
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Error al conectar con el servidor';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }

  downloadCsv() {
    if (this.pendingFiles === 0) return;

    this.loading = true;
    this.errorMessage = null;

    this.pendingFilesService.downloadCsv(this.startDate, this.endDate)
      .subscribe({
        next: (blob) => {
          this.handleDownload(blob);
          this.resetFilters(); // Limpia los filtros después de descargar
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Error al descargar el archivo';
          this.loading = false;
          console.error('Error:', err);
        }
      });
  }

  private handleDownload(blob: Blob) {
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Nombre del archivo con la fecha seleccionada
    a.download = `archivos_pendientes_${this.maxDate}.csv`;

    document.body.appendChild(a);
    a.click();

    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  resetFilters() {
    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0]; // Restablece a fecha actual
    this.pendingFiles = 0; // Resetea el contador
    this.showResults = false; // Oculta los resultados
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && !file.name.endsWith('.csv')) {
        Swal.fire({
            title: 'Formato incorrecto',
            text: 'Por favor selecciona un archivo CSV',
            icon: 'warning'
        });
        event.target.value = ''; // Limpia el input
        return;
    }
    this.selectedFile = file;
  }

  uploadFile() {
    if (!this.selectedFile) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor selecciona un archivo primero',
        icon: 'warning'
      });
      return;
    }
  
    this.loading = true;
  
    this.pendingFilesService.uploadCsv(this.selectedFile).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.success) {
          // Caso exitoso
          Swal.fire({
            title: '¡Éxito!',
            text: `El archivo ${this.selectedFile?.name} se cargó correctamente`,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
          this.clearFile();
        } else {
          // Caso con errores
          Swal.fire({
            title: 'Error en la carga',
            text: response.msg,
            icon: 'error',
            confirmButtonText: 'Entendido',
            didClose: () => {
              // Descargar CSV de errores después de cerrar la alerta
              this.downloadErrorCsv();
            }
          });
        }
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          title: 'Error',
          text: 'Ocurrió un problema al conectar con el servidor',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      }
    });
  }

  private downloadErrorCsv() {
    this.pendingFilesService.downloadErrorsCsv().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `errores_carga_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error al descargar CSV de errores:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo descargar el reporte de errores',
          icon: 'warning'
        });
      }
    });
  }

  showErrorTable(message: string, errors: any[]) {
    // Creamos el HTML para la tabla con bordes visibles
    let html = `
      <div style="text-align: center; max-width: 100%; overflow-x: auto;">
        <p style="margin-bottom: 1.5rem; color: #333; font-size: 1.1rem;">${message}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 0 auto; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px 15px; border: 1px solid #ddd; text-align: center;">Código</th>
              <th style="padding: 12px 15px; border: 1px solid #ddd; text-align: center;">Descripción</th>
            </tr>
          </thead>
          <tbody>
    `;
  
    errors.forEach((error, index) => {
      // Alternamos colores de fila para mejor legibilidad
      const rowColor = index % 2 === 0 ? '#ffffff' : '#f9f9f9';
      html += `
        <tr style="background-color: ${rowColor};">
          <td style="padding: 10px 15px; border: 1px solid #ddd; text-align: center;">${error.data || 'N/A'}</td>
          <td style="padding: 10px 15px; border: 1px solid #ddd; text-align: left;">${error.cod_error || 'Error no especificado'}</td>
        </tr>
      `;
    });
  
    html += `
          </tbody>
        </table>
      </div>
    `;
  
    // Mostramos el modal con SweetAlert en estilo claro
    Swal.fire({
      title: 'Errores en el archivo',
      html: html,
      icon: 'error',
      width: '700px',
      confirmButtonColor: '#3085d6',
      focusConfirm: false,
      customClass: {
        popup: 'custom-swal-popup',
        title: 'custom-swal-title',
        htmlContainer: 'custom-swal-html',
        confirmButton: 'custom-swal-confirm'
      }
    });
  }

  clearFile() {
    this.selectedFile = null;
    // Esto limpia el input file para permitir seleccionar el mismo archivo otra vez
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

   // Añade estos nuevos métodos para manejar el drag and drop
   onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
}

onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
}

onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        
        // Validación básica de tipo de archivo (opcional)
        if (!file.name.endsWith('.csv')) {
            Swal.fire({
                title: 'Formato incorrecto',
                text: 'Por favor sube solo archivos CSV',
                icon: 'error'
            });
            return;
        }
        
        this.selectedFile = file;
    }
}
}
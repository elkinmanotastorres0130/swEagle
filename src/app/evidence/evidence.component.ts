import { Component, inject,OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faDownload, faUpload, faSearch, faCloudUploadAlt, faFileDownload, faSpinner, faTimes,faUpload as faUploadSolid,faCloudDownloadAlt,faCalendarAlt } from '@fortawesome/free-solid-svg-icons';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormatoUnicoService } from '../services/formato-unico.service';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-evidence.component',
  templateUrl: './evidence.component.html',
  styleUrls: ['./evidence.component.css'],
  imports: [FontAwesomeModule, CommonModule, FormsModule],
  standalone: true,
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

    this.isLoading = true;
    
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

          // Método nativo para descargar
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
          
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al descargar:', error);
          this.isLoading = false;
          // Aquí puedes agregar notificación de error al usuario
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
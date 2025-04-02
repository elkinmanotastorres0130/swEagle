import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para usar ngModel
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { VideosService } from '../services/videos.service'; // Importa el servicio de videos
import { OperacionService } from '../services/operacion.service'; // Importa de las infracciones
import { CausalesService } from '../services/causales.service'; // Importar servicio de causales de rechazo
import { faArrowLeft, faSpinner,faDoorOpen } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { fadeAnimation } from '../animations'; // Ajusta la ruta según tu estructura
import { AuthService } from '../auth.service'; // Importa el servicio AuthService

// Definir la interfaz para la respuesta del servicio
export interface VideoResponse {
  success: boolean;
  msg: string;
  data: Video[];
}

// Definir la interfaz para un video
export interface Video {
  id_video: string;
  url_video: string;
  fecha_video: string;
  total: string;
}

@Component({
  selector: 'app-video-view',
  standalone: true, // Asegúrate de que sea standalone
  imports: [FormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './video-view.component.html',
  styleUrls: ['./video-view.component.css'],
  animations: [fadeAnimation] // Añade la animación aquí
})
export class VideoViewComponent {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>; // Referencia al elemento de video
  imagenCapturada: string | null = null; // URL de la imagen capturada
  placa: string = ''; // Propiedad para almacenar la placa
  direccion: string = ''; // Propiedad para almacenar la dirección
  zoomActivo: boolean = false; // Estado del zoom
  estilosZoom: any = {}; // Estilos dinámicos para el zoom
  faArrowLeft = faArrowLeft; // Define el ícono
  videoUrl: string = ''; // URL del video a reproducir
  totalVideos: number = 0; // Total de videos
  videos: any[] = []; // Lista de videos
  videoIndex: number = 0; // Índice del video actual
  captura1: string | null = null; // URL de la primera captura
  captura2: string | null = null; // URL de la segunda captura
  currentVideoIndex: number = 0; // Índice del video actual en el array (siempre será 0)
  enviandoDatos = false;
  iconLogout = faDoorOpen;
  iconSpinner = faSpinner;

  // Variables para la modal de rechazo
  modalRechazarAbierta: boolean = false;
  imagenVideoRechazo: string | null = null;
  causales: any[] = [];
  causalSeleccionada: string | null = null;

  // Expresión regular para la placa (letras mayúsculas, números y guiones)
  private placaRegex = /^[A-Z]{1,3}-?\d{1,4}$/;

  // Expresión regular para la dirección (letras, números, espacios y algunos caracteres especiales)
  private direccionRegex = /^(AV|CL|CR|TRV|VIA|KM|DIAGONAL)\s\d+[A-Z]?(?:-\d+[A-Z]?)?(?:\s(AV|CL|CR|TRV|VIA|KM|DIAGONAL)\s\d+[A-Z]?(?:-\d+[A-Z]?)?)*$/;

  // Inyecta el servicio Router en el constructor
  constructor(
    private Router: Router,
    private videosService: VideosService,
    private operacionService: OperacionService,
    private causalesService: CausalesService,
    private authService: AuthService, // Inyecta el servicio AuthService

  ) { }

  // Método que se ejecuta al inicializar el componente
  ngOnInit(): void {
    this.obtenerVideos();
  }

  ngOnDestroy(): void {
    // Limpiar el localStorage al salir de la vista
    localStorage.removeItem('totalVideosInicial');
    localStorage.removeItem('videoIndex');
  }

  // Método para obtener la lista de videos
  obtenerVideos(): void {
    this.videosService.obtenerVideos().subscribe({
      next: (response: VideoResponse) => { // Tipar la respuesta como VideoResponse
        if (response.success && response.data && response.data.length > 0) { // Verifica si hay videos
          this.videos = response.data; // Almacena la lista completa de videos
          this.totalVideos = parseInt(response.data[0].total, 10); // Usa el campo "total" de la respuesta

          // Guardar el total inicial en el localStorage si no está definido
          if (!localStorage.getItem('totalVideosInicial')) {
            localStorage.setItem('totalVideosInicial', this.totalVideos.toString());
          }

          // Cargar el video actual
          this.cargarVideo(this.videoIndex);
        } else {
          Swal.fire({
            title: 'Advertencia',
            text: 'No se encontraron videos pendientes por procesar.',
            icon: 'warning',
            confirmButtonText: 'OK'
          }).then((result) => {
            if (result.isConfirmed) {
              this.Router.navigate(['/dashboard']);
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al obtener los videos:', error);
        Swal.fire('Error', 'Hubo un problema al obtener los videos.', 'error');
      }
    });
  }

  // Método para cargar un video específico
  cargarVideo(index: number): void {
    // Verificar que el índice esté dentro del rango válido
    if (this.videos.length === 0) {
      console.error('No hay videos disponibles');
      return;
    }

    // Reiniciar el índice si es inválido
    if (index < 0 || index >= this.totalVideos) {

      index = 0; // Reiniciar el índice
      this.videoIndex = index; // Actualizar el índice actual
      localStorage.setItem('videoIndex', index.toString()); // Actualizar el localStorage
    }

    const video = this.videos[0];
    this.videoUrl = `${window.location.origin}/services/${video.url_video}`; // Construye la URL completa del video
    this.videoIndex = index; // Actualiza el índice del video actual

    // Forzar la actualización del video
    const videoElement = this.videoElement.nativeElement;
    videoElement.src = this.videoUrl; // Asignar la nueva URL
    videoElement.load(); // Recargar el video
    videoElement.play(); // Reproducir el video
  }

  // Capturar una imagen del video
  capturarImagen() {
    const video = this.videoElement.nativeElement;

    if (video.readyState >= 2) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext('2d');

      if (context) {
        // Captura la primera imagen y la convierte en base64
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imagenCompleta = canvas.toDataURL("image/jpeg", 1); // Transforma a base64

        if (!this.captura1) {
          // Si no hay primera captura, la asignamos
          this.captura1 = imagenCompleta;
        } else if (!this.captura2) {
          // Si hay primera captura pero no segunda, la asignamos
          this.captura2 = imagenCompleta;
        } else {
          // Si ambas capturas ya están llenas, mostramos un mensaje
          Swal.fire('Advertencia', 'Ya se han tomado dos capturas.', 'warning');
        }
      }
    } else {
      Swal.fire('Error', 'El video no está listo para capturar una imagen.', 'error');
    }
  }

  eliminarCaptura(index: number): void {
    if (index === 1) {
      // Si se elimina la primera captura, también se elimina la segunda
      this.captura1 = null;
      this.captura2 = null;
    } else if (index === 2) {
      // Si se elimina la segunda captura, la primera permanece
      this.captura2 = null;
    }
  }

  // Método para manejar el envío de datos
  enviarDatos() {
    this.enviandoDatos = true; // Activar spinner

    // Validar los campos
    const validacion = this.validarCampos();
   
    if (!validacion.valido) {
      this.enviandoDatos = false; // Desactivar spinner
      Swal.fire('Error', validacion.mensaje, 'error');
      return;
    }
    if (!this.placa || !this.direccion || !this.captura1 || !this.captura2) {
      this.enviandoDatos = false; // Desactivar spinner
      Swal.fire('Error', 'Por favor, complete todos los campos y capture ambas imágenes.', 'error');
      return;
    }

    const id_video = this.videos[0].id_video;
    const url_video = this.videos[0].url_video;

    const imagen1 = this.captura1.split(',')[1]; // Extrae solo el base64
    const imagen2 = this.captura2.split(',')[1]; // Extrae solo el base64
   
    this.operacionService.enviarDatos(id_video, url_video, imagen1, imagen2, this.placa, this.direccion).subscribe({
      next: (response) => {
        if (response.success) {
          // Incrementar el índice del video y guardarlo en el localStorage
          this.videoIndex++;
          localStorage.setItem('videoIndex', this.videoIndex.toString());
          this.enviandoDatos = false; // Desactivar spinner
          this.recargarDatos();
        } else {
          this.enviandoDatos = false; // Desactivar spinner
          Swal.fire('Error', response.msg || 'Hubo un problema al enviar los datos.', 'error');
          this.recargarDatos();
        }
      },
      error: (error) => {
        this.enviandoDatos = false; // Desactivar spinner
        console.error('Error al enviar los datos:', error);
        Swal.fire('Error', 'Hubo un problema al enviar los datos.', 'error');
      }
    });
  }

  // Método para el keypress (evita caracteres no deseados)
  soloAlfanumerico(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    return (charCode >= 48 && charCode <= 57) || // Números (0-9)
      (charCode >= 65 && charCode <= 90) || // Letras mayúsculas (A-Z)
      (charCode >= 97 && charCode <= 122);  // Letras minúsculas (a-z) (las convertiremos)
  }

  soloCaracteresPermitidos(event: KeyboardEvent): boolean {
    const input = event.target as HTMLInputElement;
    const key = event.key;
    
    // Permitir teclas de control
    if ([
      'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 
      'Home', 'End', 'Enter'
    ].includes(key)) return true;
  
    // Validar caracteres permitidos
    if (!/^[A-Za-z0-9\s-#]$/.test(key)) return false;
  
    // Auto-mayúsculas para letras
    if (/[a-z]/.test(key)) {
      event.preventDefault();
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      input.value = input.value.slice(0, start) + key.toUpperCase() + input.value.slice(end);
      input.setSelectionRange(start + 1, start + 1);
      return false;
    }
  
    return true;
  }


  // Método para el input (convierte a mayúsculas y limpia)
  aMayusculasYLimpiarPlaca() {
    this.placa = this.placa.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
  }

// Método para el input (convierte a mayúsculas y limpia)
aMayusculasYLimpiarDireccion() {
  this.direccion = this.direccion.toUpperCase()
                   .replace(/[^A-Z0-9\s#-]/g, '');
}

  // Método para validar la placa
  validarPlaca(placa: string): boolean {
    return this.placaRegex.test(placa);
  }

  // Método para validar la dirección
  validarDireccion(direccion: string): boolean {
    return this.direccionRegex.test(direccion);
  }

  // Método para validar todos los campos antes de enviar
  validarCampos(): { valido: boolean, mensaje: string } {
    if (!this.placa) {
      return { valido: false, mensaje: 'El campo de placa es obligatorio.' };
    }
    if (!this.validarPlaca(this.placa)) {
      return { valido: false, mensaje: 'El formato de la placa no es válido. Use letras mayúsculas y números.' };
    }
    if (!this.direccion) {
      return { valido: false, mensaje: 'El campo de dirección es obligatorio.' };
    }
    if (!this.validarDireccion(this.direccion)) {
      return { valido: false, mensaje: 'El formato de la dirección no es válido.' };
    }
    if (!this.captura1) {
      return { valido: false, mensaje: 'Falta la primera captura.' };
    }
    if (!this.captura2) {
      return { valido: false, mensaje: 'Falta la segunda captura.' };
    }
    return { valido: true, mensaje: '' };
  }

  // Aplicar zoom en la posición del clic
  aplicarZoom(event: MouseEvent) {
    const imagen = event.target as HTMLImageElement;
    const rect = imagen.getBoundingClientRect();

    // Coordenadas relativas a la imagen
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    // Aplicar zoom
    this.zoomActivo = !this.zoomActivo; // Alternar zoom
    if (this.zoomActivo) {
      this.estilosZoom = {
        transform: `scale(2)`, // Zoom de 2x
        'transform-origin': `${offsetX}px ${offsetY}px`, // Origen del zoom en la posición del clic
        transition: 'transform 0.3s ease' // Transición suave
      };
    } else {
      this.estilosZoom = {}; // Restablecer estilos si el zoom está desactivado
    }
  }

  // Método para abrir la modal de rechazo
  abrirModalRechazar() {
    // Capturar la imagen actual del video para mostrar en la modal
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imagenVideoRechazo = canvas.toDataURL('image/png');
    }

    // Obtener las causales de rechazo
    this.causalesService.obtenerCausales().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.causales = response.data; // Llenar el combobox con las causales
        } else {
          Swal.fire('Error', 'No se pudieron obtener las causales de rechazo.', 'error');
        }
      },
      error: (error) => {
        console.error('Error al obtener las causales:', error);
        Swal.fire('Error', 'Hubo un problema al obtener las causales de rechazo.', 'error');
      }
    });

    // Abrir la modal
    this.modalRechazarAbierta = true;
  }

  // Método para cerrar la modal de rechazo
  cerrarModalRechazar() {
    this.modalRechazarAbierta = false;
    this.imagenVideoRechazo = null;
    this.causalSeleccionada = null;
  }

  // Método para confirmar el rechazo
  confirmarRechazo() {
    // Validar que el array de videos no esté vacío y que el índice sea válido
    if (!this.videos || this.videos.length === 0 || this.videoIndex >= this.totalVideos) {
      Swal.fire('Error', 'No hay videos disponibles para rechazar.', 'error');
      return;
    }

    // Validar que se haya seleccionado una causal
    if (!this.causalSeleccionada) {
      Swal.fire('Error', 'Por favor, seleccione una causal de rechazo.', 'error');
      return;
    }

    // Obtener el id_video del video actual
    const id_video = this.videos[0].id_video;
    const id_causal = this.causalSeleccionada;

    // Llamar al servicio para rechazar el video
    this.causalesService.rechazarVideo(id_video, id_causal).subscribe({
      next: (response: any) => {
        if (response.success) {
          // Incrementar el índice del video y guardarlo en el localStorage
          this.videoIndex++;
          localStorage.setItem('videoIndex', this.videoIndex.toString());

          Swal.fire('Éxito', response.msg, 'success');
          this.cerrarModalRechazar();
          this.recargarDatos();
        } else {
          Swal.fire('Error', response.msg || 'Hubo un problema al rechazar el video.', 'error');
          this.recargarDatos();
        }
      },
      error: (error) => {
        console.error('Error al rechazar el video:', error);
        Swal.fire('Error', 'Hubo un problema al rechazar el video.', 'error');
      }
    });
  }

  // Método para obtener el índice del video desde el localStorage
  getVideoIndex(): number {
    return this.videoIndex; // Devolver el índice actual
  }

  // Método para obtener el total de videos desde el localStorage
  getTotalVideos(): number {
    const totalVideosGuardado = localStorage.getItem('totalVideosInicial');
    return totalVideosGuardado ? parseInt(totalVideosGuardado, 10) : 0;
  }

  // Método para recargar los datos sin recargar la página
  recargarDatos() {
    // Reiniciar el estado del componente
    this.captura1 = null;
    this.captura2 = null;
    this.placa = '';
    this.direccion = '';

    // Obtener la lista de videos nuevamente
    this.obtenerVideos();
  }

  onVideoLoaded() {
    console.log('Video cargado correctamente');
  }

  onVideoError() {
    console.error('Error al cargar el video');
    Swal.fire('Error', 'No se pudo cargar el video. Inténtalo de nuevo.', 'error');
  }

  // Función para regresar a la página anterior
  goBack() {
    this.Router.navigate(['/dashboard']); // Cambia '/dashboard' por la ruta que desees
  }

    // Función para redirigir al login
    goToLogin() {
      this.authService.logout(); // Llama al método logout() del servicio
      this.Router.navigate(['/login']); // Asegúrate de que la ruta '/login' esté configurada en tu RouterModule
    }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {VideoResponse } from '../video-view/video-view.component'; // Importa la interfaz

@Injectable({
  providedIn: 'root'
})
export class VideosService {

  private apiUrl = '/services/operacion/listarVideos'; // Usa la ruta del proxy

  constructor(private http: HttpClient) { }

  // Método para obtener la lista de videos
  obtenerVideos(): Observable<VideoResponse> { // Tipar la respuesta como VideoResponse
    return this.http.get<VideoResponse>(this.apiUrl); // Usa GET para obtener los videos
  }
}
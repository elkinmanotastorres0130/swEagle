import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { VideoViewComponent } from './video-view/video-view.component'; 
import { LoadingDownloadComponent } from './loading-download/loading-download.component';
import { EvidenceComponent } from './evidence/evidence.component';

import { AuthGuard } from './auth.guard';

export const routes: Routes = [ // Asegúrate de usar `export`
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent , canActivate: [AuthGuard]},
  { path: 'video', component: VideoViewComponent , canActivate: [AuthGuard]}, // Ruta para la vista de video
  { path: 'loading-download', component: LoadingDownloadComponent , canActivate: [AuthGuard]}, // Ruta para la carga y descarga
  { path: 'evidence', component: EvidenceComponent , canActivate: [AuthGuard]}, // Ruta para la evidencia
  { path: '**', redirectTo: '/login' } // Redirige cualquier ruta no encontrada al login
];
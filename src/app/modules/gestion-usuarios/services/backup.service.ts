import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private baseUrl = environment.apiUrl + 'core/database/backup-restore/';
  private downloadUrl = environment.apiUrl + 'core/database/backup-download/';
  private restoreUrl = environment.apiUrl + 'core/database/restore/';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene la lista de backups disponibles
   */
  listarBackups(): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<any>(this.baseUrl, { headers });
  }

  /**
   * Crea un nuevo backup de la base de datos
   */
  crearBackup(): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post<any>(this.baseUrl, {}, { headers });
  }

  /**
   * Elimina un backup específico
   * @param filename Nombre del archivo de backup a eliminar
   */
  eliminarBackup(filename: string): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Para DELETE con body, necesitamos incluir el nombre del archivo en el cuerpo
    const options = {
      headers,
      body: { filename } 
    };
    
    return this.http.delete<any>(this.baseUrl, options);
  }

  /**
   * Obtiene la URL para descargar un backup específico
   * @param filename Nombre del archivo de backup a descargar
   */
  getDownloadUrl(filename: string): string {
    return `${this.downloadUrl}${filename}/`;
  }

  /**
   * Descarga un backup específico
   * @param filename Nombre del archivo de backup a descargar
   */
  descargarBackup(filename: string): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get(`${this.downloadUrl}${filename}/`, {
      headers,
      responseType: 'blob'
    });
  }

  /**
   * Restaura la base de datos desde un archivo de backup
   * @param file Archivo de backup para restaurar
   */
  restaurarBackup(file: File): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const formData = new FormData();
    formData.append('backup_file', file);
    
    return this.http.post<any>(this.restoreUrl, formData, { headers });
  }
}
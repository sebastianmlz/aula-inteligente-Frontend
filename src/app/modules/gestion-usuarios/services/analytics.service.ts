import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una predicción de rendimiento para un estudiante específico
   */
  obtenerPrediccionRendimiento(userId: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const requestUrl = `${this.apiUrl}analytics/performance-predictions/${userId}/predict/`;
    console.log('[ANALYTICS SERVICE] Enviando petición GET a:', requestUrl);
    console.log('[ANALYTICS SERVICE] userId enviado:', userId);
    console.log('[ANALYTICS SERVICE] Tipo de userId:', typeof userId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Utilizar tap para mostrar la respuesta en consola sin interferir con ella
    return this.http.get(requestUrl, { headers }).pipe(
      tap(
        response => console.log('[ANALYTICS SERVICE] Respuesta exitosa de predicción:', response),
        error => console.log('[ANALYTICS SERVICE] Error en predicción:', error)
      )
    );
  }

  /**
   * Compara el rendimiento actual con el rendimiento predicho para un estudiante
   */
  compararRendimiento(userId: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const requestUrl = `${this.apiUrl}analytics/performance-predictions/${userId}/compare-performance/`;
    console.log('[ANALYTICS SERVICE] Enviando petición GET a:', requestUrl);
    console.log('[ANALYTICS SERVICE] userId enviado:', userId);
    console.log('[ANALYTICS SERVICE] Tipo de userId:', typeof userId);

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Utilizar tap para mostrar la respuesta en consola sin interferir con ella
    return this.http.get(requestUrl, { headers }).pipe(
      tap(
        response => console.log('[ANALYTICS SERVICE] Respuesta exitosa de comparación:', response),
        error => console.log('[ANALYTICS SERVICE] Error en comparación:', error)
      )
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private baseUrl = environment.apiUrl + 'academic/grades/';

  constructor(private http: HttpClient) {}

  listarCalificaciones(
    filtros: any = {},
    page: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    Object.keys(filtros).forEach(key => {
      if (
        filtros[key] !== '' &&
        filtros[key] !== null &&
        filtros[key] !== undefined
      ) {
        params = params.set(key, filtros[key]);
      }
    });

    return this.http.get<any>(this.baseUrl, { headers, params });
  }

  obtenerCalificacionesEstudiante(studentId: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Usar el parámetro que espera la API según la documentación
    let params = new HttpParams().set('student_id', studentId.toString());
    
    // Loguear la URL y parámetros para debug
    const url = `${environment.apiUrl}academic/grades/student_grades/`;
    console.log(`Llamando a API: ${url} con student_id=${studentId}`);
    
    return this.http.get<any>(url, { headers, params });
  }

  obtenerDetalleCalificacion(id: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}${id}/`, { headers });
  }
}
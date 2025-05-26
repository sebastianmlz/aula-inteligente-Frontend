import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private baseUrl = environment.apiUrl + 'academic/teacher-assignments/';

  constructor(private http: HttpClient) {}

  listarAsignaciones(
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

  crearAsignacion(data: any): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.baseUrl, data, { headers });
  }

  editarAsignacion(id: number, data: any): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<any>(`${this.baseUrl}${id}/`, data, { headers });
  }

  eliminarAsignacion(id: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.baseUrl}${id}/`, { headers });
  }
}
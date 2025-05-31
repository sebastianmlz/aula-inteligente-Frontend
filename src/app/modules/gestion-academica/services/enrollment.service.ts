import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {
  private baseUrl = environment.apiUrl + 'academic/enrollments/';

  constructor(private http: HttpClient) {}

  matricularEstudiante(data: any): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.post(this.baseUrl, data, { headers });
  }

  listarMatriculaciones(page: number = 1, pageSize: number = 10, filters: any = {}): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Construir parámetros de consulta basados en filtros
    let url = `${this.baseUrl}?page=${page}&page_size=${pageSize}`;
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        url += `&${key}=${filters[key]}`;
      }
    });
    
    return this.http.get(url, { headers });
  }
}
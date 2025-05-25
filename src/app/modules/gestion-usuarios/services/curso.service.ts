import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
    private baseUrl = environment.apiUrl + 'academic/courses/';

    constructor(private http: HttpClient) {}

    obtenerCursos(page: number = 1, pageSize: number = 10, search: string = ''): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) {
        throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams()
        .set('page', page.toString())
        .set('page_size', pageSize.toString());

    if (search) {
        params = params.set('search', search);
    }

    return this.http.get<any>(this.baseUrl, { headers, params });
    }

    crearCurso(data: any): Observable<any> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
            throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<any>(this.baseUrl, data, { headers });
    }

    editarCurso(id: number, data: any): Observable<any> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
            throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.patch<any>(`${this.baseUrl}${id}/`, data, { headers });
    }

    eliminarCurso(id: number): Observable<any> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
            throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.delete<any>(`${this.baseUrl}${id}/`, { headers });
    }
}
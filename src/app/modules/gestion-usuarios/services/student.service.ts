import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../models/paginated-response.model';
import { Student } from '../models/student.model';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private baseUrl = environment.apiUrl + 'auth/students/';

    constructor(private http: HttpClient) {}

    listarEstudiantes(page: number = 1, pageSize: number = 10, search: string = '', gradeLevel?: string): Observable<PaginatedResponse<Student>> {
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
        if (gradeLevel) {
        params = params.set('grade_level', gradeLevel);
        }

        return this.http.get<PaginatedResponse<Student>>(this.baseUrl, { headers, params });
    }

    obtenerEstudiante(id: string): Observable<Student> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
        throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<Student>(`${this.baseUrl}${id}/`, { headers });
    }

    crearEstudiante(data: any): Observable<Student> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
        throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.post<Student>(this.baseUrl, data, { headers });
    }

    actualizarEstudiante(id: string, data: any): Observable<Student> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
        throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.patch<Student>(`${this.baseUrl}${id}/`, data, { headers });
    }

    obtenerPerfilAcademico(id: number): Observable<any> {
        const token = localStorage.getItem('auth_access');
        if (!token) {
        throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
        }
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        return this.http.get<any>(`${this.baseUrl}${id}/profile/`, { headers });
    }
}
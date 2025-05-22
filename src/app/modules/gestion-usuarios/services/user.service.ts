import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../models/paginated-response.model';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private baseUrl = environment.apiUrl + 'auth/users/';

    constructor(private http: HttpClient) {}

    obtenerUsers(page: number = 1, pageSize: number = 10, search: string = ''): Observable<PaginatedResponse<User>> {
    const token = localStorage.getItem('auth_access');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if (!token) {
      throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    }

    let params = new HttpParams()
        .set('page', page.toString())
        .set('page_size', pageSize.toString());

    if (search) {
        params = params.set('search', search);
    }

    return this.http.get<PaginatedResponse<User>>(this.baseUrl, { headers, params });
    }
}
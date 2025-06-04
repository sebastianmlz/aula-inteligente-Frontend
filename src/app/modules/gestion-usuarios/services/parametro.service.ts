import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface PeriodFilters {
  active?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface TrimesterFilters {
  search?: string;
  page?: number;
  page_size?: number;
}

export interface Period {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  current?: boolean;
}

export interface Trimester {
  id: number;
  name: string;
  period: number;
  start_date: string;
  end_date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParametroService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de periodos académicos
   */
  obtenerPeriodos(filters: PeriodFilters = {}): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    let params = new HttpParams();
    
    // Agregar filtros si existen
    if (filters.active !== undefined) params = params.set('active', filters.active.toString());
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.page_size) params = params.set('page_size', filters.page_size.toString());

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}academic/periods/`, { headers, params });
  }

  /**
   * Crear un nuevo periodo académico
   */
  crearPeriodo(periodo: Partial<Period>): Observable<Period> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Period>(`${this.apiUrl}academic/periods/`, periodo, { headers });
  }

  /**
   * Actualizar un periodo académico
   */
  actualizarPeriodo(id: number, periodo: Partial<Period>): Observable<Period> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<Period>(`${this.apiUrl}academic/periods/${id}/`, periodo, { headers });
  }

  /**
   * Eliminar un periodo académico
   */
  eliminarPeriodo(id: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}academic/periods/${id}/`, { headers });
  }

  /**
   * Obtiene la lista de trimestres académicos
   */
  obtenerTrimestres(filters: TrimesterFilters = {}): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    let params = new HttpParams();
    
    // Agregar filtros si existen
    if (filters.search) params = params.set('search', filters.search);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.page_size) params = params.set('page_size', filters.page_size.toString());

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${this.apiUrl}academic/trimesters/`, { headers, params });
  }

  /**
   * Crear un nuevo trimestre académico
   */
  crearTrimestre(trimestre: Partial<Trimester>): Observable<Trimester> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<Trimester>(`${this.apiUrl}academic/trimesters/`, trimestre, { headers });
  }

  /**
   * Actualizar un trimestre académico
   */
  actualizarTrimestre(id: number, trimestre: Partial<Trimester>): Observable<Trimester> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<Trimester>(`${this.apiUrl}academic/trimesters/${id}/`, trimestre, { headers });
  }

  /**
   * Eliminar un trimestre académico
   */
  eliminarTrimestre(id: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}academic/trimesters/${id}/`, { headers });
  }
}
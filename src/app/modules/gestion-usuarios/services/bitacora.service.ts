import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BitacoraService {
  private baseUrl = environment.apiUrl + 'core/logs/';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los registros del sistema con filtros opcionales
   * @param filtros Objeto con los filtros a aplicar
   * @param page Número de página actual
   * @param pageSize Cantidad de elementos por página
   * @returns Observable con la respuesta paginada
   */
  listarLogs(
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

    // Añadir todos los filtros disponibles
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== '' && filtros[key] !== null && filtros[key] !== undefined) {
        params = params.set(key, filtros[key]);
      }
    });

    return this.http.get<any>(this.baseUrl, { headers, params });
  }
}
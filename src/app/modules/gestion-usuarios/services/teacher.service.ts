import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private baseUrl = environment.apiUrl + 'auth/teachers/';

  constructor(private http: HttpClient) {}

  listarProfesores(page: number = 1, pageSize: number = 10, search: string = '', specialization?: string): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
    if (search) params = params.set('search', search);
    if (specialization) params = params.set('specialization', specialization);

    return this.http.get<any>(this.baseUrl, { headers, params });
  }

  getNextTeacherId(): Observable<string> {
    return this.listarProfesores(1, 1000).pipe(
      map(response => {
        let maxNumber = 19; // Empezaremos desde T020 como solicitaste
        
        if (response.items && response.items.length > 0) {
          response.items.forEach((teacher: any) => {
            if (teacher.teacher_id && teacher.teacher_id.startsWith('T')) {
              // Extraer el número después de 'T'
              const numStr = teacher.teacher_id.substring(1);
              const num = parseInt(numStr, 10);
              if (!isNaN(num) && num > maxNumber) {
                maxNumber = num;
              }
            }
          });
          // Incrementar para el siguiente ID
          maxNumber += 1;
        }
        
        // Formatear el número con ceros a la izquierda para que tenga 3 dígitos
        const formattedNumber = maxNumber.toString().padStart(3, '0');
        return `T${formattedNumber}`;
      })
    );
  }

  obtenerProfesor(id: string): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any>(`${this.baseUrl}${id}/`, { headers });
  }

  crearProfesor(data: any): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(this.baseUrl, data, { headers });
  }

  actualizarProfesor(id: string, data: any, originalEmail: string): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    // Crea una copia profunda para no modificar el objeto original
    const profesorData = {
      user: {
        first_name: data.user.first_name,
        last_name: data.user.last_name,
        // Solo incluir email si ha cambiado
        ...(data.user.email !== originalEmail && { email: data.user.email }),
        phone_number: data.user.phone_number || "70000000",
        address: data.user.address || "Sin dirección",
        date_of_birth: data.user.date_of_birth || "1990-01-01",
        groups: [2]
      },
      teacher_id: data.teacher_id,
      specialization: data.specialization || "",
      qualification: data.qualification || "",
      years_of_experience: parseInt(data.years_of_experience) || 0,
      date_joined: data.date_joined || new Date().toISOString().slice(0, 10),
      employment_status: data.employment_status || "active"
    };
    
    console.log('Enviando datos al servidor:', profesorData);
    return this.http.patch<any>(`${this.baseUrl}${id}/`, profesorData, { headers });
  }

  eliminarProfesor(id: string): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.baseUrl}${id}/`, { headers });
  }
}
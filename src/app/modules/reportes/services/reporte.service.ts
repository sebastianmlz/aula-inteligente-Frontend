import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ReporteFile {
  id: number;
  format: string;
  file: string;
  url: string;
  created_at: string;
}

export interface Assessment {
  date: string;
  name: string;
  max_score: number;
  grade_value: number;
}

export interface SubjectGrades {
  subject_id: number;
  subject_name: string;
  subject_average: number;
  assessments: Assessment[];
}

export interface GradesData {
  subjects: SubjectGrades[];
  overall_average: number;
}

export interface Student {
  user_id: number;
  student_id: string;
  full_name: string;
  email: string;
  current_course_name: string;
}

export interface Trimester {
  id: number;
  name: string;
  period: number;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
}

export interface Reporte {
  id: number;
  student: Student;
  trimester: Trimester;
  overall_average: string;
  grades_data: GradesData;
  status: string;
  files: ReporteFile[];
  generated_at: string;
  created_at: string;
  updated_at: string;
  error_message: null | string;
}

export interface ReportesResponse {
  items: Reporte[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
  has_next: boolean;
  has_prev: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  listarReportes(page: number = 1, pageSize: number = 10, filters?: any): Observable<ReportesResponse> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());

    // Agregar filtros opcionales
    if (filters) {
      if (filters.student_id) params = params.set('student_id', filters.student_id);
      if (filters.trimester_id) params = params.set('trimester_id', filters.trimester_id);
      if (filters.period_id) params = params.set('period_id', filters.period_id);
      if (filters.search) params = params.set('search', filters.search);
    }

    return this.http.get<ReportesResponse>(`${this.apiUrl}reports/bulletins/`, { headers, params });
  }

  listarTrimestres(page: number = 1, pageSize: number = 100, search?: string): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString());
      
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get(`${this.apiUrl}academic/trimesters/`, { headers, params });
  }

  buscarEstudiantes(query: string, page: number = 1, pageSize: number = 10): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams()
      .set('page', page.toString())
      .set('page_size', pageSize.toString())
      .set('search', query);

    // Log for debugging
    console.log('Búsqueda de estudiantes con parámetros:', params.toString());
    
    return this.http.get(`${this.apiUrl}users/students/`, { headers, params });
  }

  generarReporte(studentId: number, trimesterId: number, forceRegenerate: boolean = false): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const payload = {
      student_id: studentId,
      trimester_id: trimesterId,
      force_regenerate: forceRegenerate
    };

    return this.http.post(`${this.apiUrl}reports/bulletins/generate-bulletin/`, payload, { headers });
  }
}
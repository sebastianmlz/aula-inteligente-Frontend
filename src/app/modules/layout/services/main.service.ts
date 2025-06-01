import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SchoolStats {
  active_students_count: number;
  active_teachers_count: number;
  active_courses_count: number;
  active_enrollment_current_period: number;
  overall_average_grade: number;
}

export interface CoursePerformance {
  course_id: string;
  course_name: string;
  enrolled_students: number;
  average_grade: number;
}

@Injectable({
  providedIn: 'root'
})
export class MainService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getGeneralStats(): Observable<SchoolStats> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<SchoolStats>(`${this.apiUrl}analytics/dashboards/general-stats/`, { headers })
      .pipe(
        map(response => {
          // Asegurar que todos los valores numéricos sean números (no strings)
          return {
            active_students_count: +response.active_students_count || 0,
            active_teachers_count: +response.active_teachers_count || 0,
            active_courses_count: +response.active_courses_count || 0,
            active_enrollment_current_period: +response.active_enrollment_current_period || 0,
            overall_average_grade: +response.overall_average_grade || 0
          };
        })
      );
  }

  getCoursePerformance(): Observable<CoursePerformance[]> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de acceso. Inicie sesión nuevamente.');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get<CoursePerformance[]>(`${this.apiUrl}analytics/dashboards/course-performance/`, { headers })
      .pipe(
        map(response => {
          if (!Array.isArray(response)) {
            console.error('La respuesta no es un array:', response);
            return [];
          }
          
          return response.map(course => ({
            course_id: course.course_id || '',
            course_name: course.course_name || '',
            enrolled_students: +course.enrolled_students || 0,
            average_grade: +course.average_grade || 0
          }));
        })
      );
  }
}
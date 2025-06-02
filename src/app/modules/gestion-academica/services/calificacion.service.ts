import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { MateriaService } from './materia.service';
import { CursoService } from './curso.service';

@Injectable({
  providedIn: 'root'
})
export class CalificacionService {
  private apiUrl = environment.apiUrl;
  
  constructor(
    private http: HttpClient,
    private materiaService: MateriaService,
    private cursoService: CursoService
  ) {}
  
  // Método faltante: Obtener calificaciones por estudiante
  obtenerCalificacionesEstudiante(estudianteId: number, filtros?: {
    materiaId?: number;
    periodoId?: number;
    trimestreId?: number;
    page?: number;
    pageSize?: number;
  }): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams()
      .set('student', estudianteId.toString())
      .set('page', filtros?.page?.toString() || '1')
      .set('page_size', filtros?.pageSize?.toString() || '10');
    
    if (filtros?.materiaId) params = params.set('subject', filtros.materiaId.toString());
    if (filtros?.periodoId) params = params.set('period', filtros.periodoId.toString());
    if (filtros?.trimestreId) params = params.set('trimester', filtros.trimestreId.toString());
    
    return this.http.get(`${this.apiUrl}academic/grades/`, { headers, params });
  }
  
  // Obtener lista de evaluaciones con filtros obligatorios
  listarEvaluaciones(filtros: AssessmentFilters): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams()
      .set('page', filtros.page?.toString() || '1')
      .set('page_size', filtros.pageSize?.toString() || '10');
    
    // Aplicar filtros obligatorios
    if (filtros.subject) params = params.set('subject', filtros.subject.toString());
    if (filtros.trimester) params = params.set('trimester', filtros.trimester.toString());
    if (filtros.course) params = params.set('course', filtros.course.toString());
    if (filtros.assessmentType) params = params.set('assessment_type', filtros.assessmentType);
    
    return this.http.get(`${this.apiUrl}academic/assessment-items/`, { headers, params });
  }
  
  // Obtener lista de calificaciones con filtros obligatorios
  listarCalificaciones(filtros: GradesFilters): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams()
      .set('page', filtros.page?.toString() || '1')
      .set('page_size', filtros.pageSize?.toString() || '10');
    
    // Aplicar filtros obligatorios
    if (filtros.student) params = params.set('student', filtros.student.toString());
    if (filtros.subject) params = params.set('subject', filtros.subject.toString());
    if (filtros.period) params = params.set('period', filtros.period.toString());
    if (filtros.assessmentItem) params = params.set('assessment_item', filtros.assessmentItem.toString());
    
    return this.http.get(`${this.apiUrl}academic/grades/`, { headers, params });
  }
  
  // Método mantenido por compatibilidad pero ya no necesario para la interfaz
  listarTrimestres(periodId?: number): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    
    if (periodId) params = params.set('period', periodId.toString());
    
    return this.http.get(`${this.apiUrl}academic/trimesters/`, { headers, params });
  }
  
  // Obtener lista de periodos académicos
  listarPeriodos(activo: boolean = true): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    let params = new HttpParams();
    
    if (activo) params = params.set('active', 'true');
    
    return this.http.get(`${this.apiUrl}academic/periods/`, { headers, params });
  }
  
  // Reutilizamos el servicio existente para materias
  listarMaterias(): Observable<any> {
    return this.materiaService.obtenerMaterias(1, 100);
  }
  
  // Reutilizamos el servicio existente para cursos
  listarCursos(activo: boolean = true): Observable<any> {
    return this.cursoService.obtenerCursos(1, 100);
  }

  // Crear una nueva evaluación
  crearEvaluacion(evaluacion: any): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}academic/assessment-items/`, evaluacion, { headers });
  }

  // Editar una evaluación existente
  editarEvaluacion(id: number, evaluacion: any): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}academic/assessment-items/${id}/`, evaluacion, { headers });
  }

  // Registrar calificación para un estudiante
  registrarCalificacion(calificacion: any): Observable<any> {
    const token = localStorage.getItem('auth_access');
    if (!token) throw new Error('No hay token de autenticación');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${this.apiUrl}academic/grades/`, calificacion, { headers });
  }
}

// Interfaces para tipado fuerte en los filtros
export interface AssessmentFilters {
  page?: number;
  pageSize?: number;
  subject?: number;
  course?: number;
  trimester?: number;
  assessmentType?: string;
}

export interface GradesFilters {
  page?: number;
  pageSize?: number;
  student?: number;
  subject?: number;
  period?: number;
  assessmentItem?: number;
}
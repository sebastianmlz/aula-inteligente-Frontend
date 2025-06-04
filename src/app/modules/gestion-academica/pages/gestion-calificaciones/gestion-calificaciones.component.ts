import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CalificacionService, AssessmentFilters, GradesFilters } from '../../services/calificacion.service';
import { StudentService } from '../../../gestion-usuarios/services/student.service';
import { finalize } from 'rxjs';

// Importaciones correctas de PrimeNG
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputNumberModule } from 'primeng/inputnumber';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-gestion-calificaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    ToastModule,
    DropdownModule,
    InputTextModule,
    CardModule,
    ToolbarModule,
    TagModule,
    DialogModule,
    ProgressBarModule,
    InputNumberModule,
    TooltipModule,
    RippleModule,
    AvatarModule,
    CalendarModule
  ],
  providers: [MessageService],
  templateUrl: './gestion-calificaciones.component.html',
  styleUrl: './gestion-calificaciones.component.css'
})
export class GestionCalificacionesComponent implements OnInit {
  // Servicios
  private calificacionService = inject(CalificacionService);
  private studentService = inject(StudentService);
  public messageService = inject(MessageService); // Cambiar a public para acceder desde el template
  
  // Tab activo
  activeTabIndex = 0;
  
  // Estados con signals
  loadingAssessments = signal<boolean>(false);
  loadingGrades = signal<boolean>(false);
  loadingMasterData = signal<boolean>(false);
  
  // Datos para desplegables
  periodos = signal<any[]>([]);
  trimestres = signal<any[]>([]);
  materias = signal<any[]>([]);
  cursos = signal<any[]>([]);
  tiposEvaluacion = [
    { label: 'Examen', value: 'EXAM' },
    { label: 'Tarea', value: 'TASK' },
    { label: 'Proyecto', value: 'PROJECT' },
    { label: 'Participación', value: 'PARTICIPATION' }
  ];
  
  // Datos de tablas
  evaluaciones = signal<any[]>([]);
  calificaciones = signal<any[]>([]);
  
  // Paginación evaluaciones
  totalEvaluaciones = signal<number>(0);
  pageAssessments = 1;
  pageSizeAssessments = 10;
  
  // Paginación calificaciones
  totalCalificaciones = signal<number>(0);
  pageGrades = 1;
  pageSizeGrades = 10;

  // Propiedades para paginación (búsqueda)
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;
  
  // Filtros para evaluaciones
  filtrosEvaluacion: AssessmentFilters = {
    subject: undefined,
    course: undefined,
    trimester: undefined,
    assessmentType: undefined
  };
  
  // Filtros para calificaciones
  filtrosCalificacion: GradesFilters = {
    student: undefined,
    subject: undefined,
    period: undefined,
    assessmentItem: undefined,
    valueMin: undefined,
    valueMax: undefined,
    assessmentType: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    course: undefined,
    teacherComment: undefined
  };
  
  // Estudiante seleccionado (búsqueda)
  studentSearchQuery: string = '';
  filteredStudents = signal<any[]>([]);
  searchingStudents = signal<boolean>(false);
  selectedStudent = signal<any | null>(null);
  
  // Modal detalle de evaluación
  showEvaluacionDialog = signal<boolean>(false);
  selectedEvaluacion = signal<any | null>(null);
  
  // Modal detalle de calificación
  showCalificacionDialog = signal<boolean>(false);
  selectedCalificacion = signal<any | null>(null);
  
  // Para el diálogo de crear/editar evaluación
  showEvaluacionFormDialog = signal<boolean>(false);
  evaluacionForm: any = {
    name: '',
    assessment_type: 'TASK',
    date: new Date(),
    subject: undefined,
    course: undefined,
    trimester: undefined,
    max_score: 100
  };
  editingEvaluacionId: number | null = null;
  
  // Para el diálogo de calificar estudiantes
  showCalificarDialog = signal<boolean>(false);
  evaluacionSeleccionada = signal<any | null>(null);
  estudiantesParaCalificar = signal<any[]>([]);
  loadingEstudiantes = signal<boolean>(false);
  estudiantesCalificados: { [key: number]: number } = {}; // Mapeo de estudiante_id -> calificacion

  // Busqueda de estudiantes en modal de calificaciones
  estudianteSearchQuery: string = '';
  estudiantesFiltrados = signal<any[]>([]);
  estudiantesOriginal = signal<any[]>([]);
  buscandoEstudiantes = signal<boolean>(false);

  // Datos fijos de trimestres para evitar problemas de permisos
  private trimestresData = {
    "items": [
      {
        "id": 4,
        "name": "Trimestre 1 (2024)",
        "period": 1,
        "start_date": "2024-02-01",
        "end_date": "2024-05-11",
        "created_at": "2025-05-31T13:19:59.832352Z",
        "updated_at": "2025-05-31T13:19:59.832352Z"
      },
      {
        "id": 5,
        "name": "Trimestre 2 (2024)",
        "period": 1,
        "start_date": "2024-05-12",
        "end_date": "2024-08-20",
        "created_at": "2025-05-31T13:20:00.414314Z",
        "updated_at": "2025-05-31T13:20:00.414314Z"
      },
      {
        "id": 6,
        "name": "Trimestre 3 (2024)",
        "period": 1,
        "start_date": "2024-08-21",
        "end_date": "2024-11-30",
        "created_at": "2025-05-31T13:20:01.014156Z",
        "updated_at": "2025-05-31T13:20:01.014156Z"
      },
      {
        "id": 7,
        "name": "Trimestre 1 (2025)",
        "period": 2,
        "start_date": "2025-02-01",
        "end_date": "2025-05-11",
        "created_at": "2025-05-31T13:20:02.061679Z",
        "updated_at": "2025-05-31T13:20:02.061679Z"
      },
      {
        "id": 8,
        "name": "Trimestre 2 (2025)",
        "period": 2,
        "start_date": "2025-05-12",
        "end_date": "2025-08-19",
        "created_at": "2025-05-31T13:20:02.643040Z",
        "updated_at": "2025-05-31T13:20:02.644039Z"
      },
      {
        "id": 9,
        "name": "Trimestre 3 (2025)",
        "period": 2,
        "start_date": "2025-08-20",
        "end_date": "2025-11-30",
        "created_at": "2025-05-31T13:20:03.236863Z",
        "updated_at": "2025-05-31T13:20:03.236863Z"
      }
    ],
    "total": 6
  };
  
  ngOnInit(): void {
    this.cargarDatosMaestros();
  }
  
  // Cargar datos maestros (periodos, trimestres, materias, cursos)
  cargarDatosMaestros(): void {
    this.loadingMasterData.set(true);
    
    // Primero, añadimos manualmente los periodos para asegurar que ambos años estén disponibles
    const periodos = [
      { 
        id: 1, 
        name: 'Año Escolar 2024', 
        start_date: '2024-02-01',
        end_date: '2024-11-30',
        is_active: false // el periodo 2024 probablemente ya no es activo
      },
      { 
        id: 2, 
        name: 'Año Escolar 2025', 
        start_date: '2025-02-01',
        end_date: '2025-11-30',
        is_active: true // suponemos que el periodo 2025 es el activo
      }
    ];
    
    // Establecemos los periodos manualmente para evitar problemas con la API
    this.periodos.set(periodos);

    // Seleccionamos el periodo activo por defecto
    const periodoActivo = periodos.find(p => p.is_active);
    if (periodoActivo) {
      this.filtrosCalificacion.period = periodoActivo.id;
      this.cargarTrimestres(periodoActivo.id);
    }
    
    // Cargamos materias y cursos normalmente
    this.cargarMaterias();
    this.cargarCursos();
  }

  onPageChange(event: any): void {
    if (event.page !== undefined) {
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } else if (event.first !== undefined) {
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    this.cargarCalificaciones(this.currentPage, this.pageSize);
  }
  
  // Cargar materias de forma separada
  cargarMaterias(): void {
    this.calificacionService.listarMaterias().subscribe({
      next: (materias) => {
        if (materias && materias.items) {
          this.materias.set(materias.items);
        }
      },
      error: (error) => {
        console.error('Error cargando materias:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las materias'
        });
      }
    });
  }
  
  // Cargar cursos de forma separada
  cargarCursos(): void {
    this.calificacionService.listarCursos().subscribe({
      next: (cursos) => {
        if (cursos && cursos.items) {
          this.cursos.set(cursos.items);
        }
        this.loadingMasterData.set(false);
      },
      error: (error) => {
        console.error('Error cargando cursos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los cursos'
        });
        this.loadingMasterData.set(false);
      }
    });
  }
  
  // Cargar trimestres de un periodo específico (modificado para usar datos fijos)
  cargarTrimestres(periodoId: number): void {
    // En lugar de hacer una llamada HTTP, filtramos los datos fijos
    const trimestresFiltrados = this.trimestresData.items.filter(t => t.period === periodoId);
    this.trimestres.set(trimestresFiltrados);
    
    // Seleccionamos el primer trimestre por defecto si existe
    if (trimestresFiltrados.length > 0) {
      this.filtrosEvaluacion.trimester = trimestresFiltrados[0].id;
    } else {
      // Si no hay trimestres para el periodo, reseteamos el filtro
      this.filtrosEvaluacion.trimester = undefined;
    }
  }
  
  // Cargar evaluaciones con filtros aplicados
  cargarEvaluaciones(): void {
    // Validar que los filtros obligatorios estén presentes
    if (!this.filtrosEvaluacion.subject || !this.filtrosEvaluacion.trimester) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtros incompletos',
        detail: 'Debe seleccionar al menos materia y trimestre para cargar las evaluaciones.'
      });
      return;
    }
    
    this.loadingAssessments.set(true);
    
    this.filtrosEvaluacion.page = this.pageAssessments;
    this.filtrosEvaluacion.pageSize = this.pageSizeAssessments;
    
    this.calificacionService.listarEvaluaciones(this.filtrosEvaluacion)
      .pipe(finalize(() => this.loadingAssessments.set(false)))
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.evaluaciones.set(response.items);
            this.totalEvaluaciones.set(response.total);
          } else {
            this.evaluaciones.set([]);
            this.totalEvaluaciones.set(0);
          }
        },
        error: (err) => {
          console.error('Error cargando evaluaciones:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las evaluaciones.'
          });
        }
      });
  }
  
  // Cargar calificaciones con filtros aplicados - versión corregida
  cargarCalificaciones(page: number = 1, pageSize: number = 10): void {
    // Validar que los filtros obligatorios estén presentes
    if ((!this.filtrosCalificacion.student && !this.filtrosCalificacion.subject) || !this.filtrosCalificacion.period) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Filtros incompletos',
        detail: 'Debe seleccionar al menos un estudiante o materia, y un periodo académico.'
      });
      return;
    }
    
    this.loadingGrades.set(true);
    this.pageGrades = page;
    this.pageSizeGrades = pageSize;
    
    // Procesar las fechas si se seleccionaron
    const filtros = { ...this.filtrosCalificacion, page, pageSize };
    
    if (this.rangoFechas && this.rangoFechas.length === 2) {
      // Formato YYYY-MM-DD
      filtros.dateFrom = this.formatDateForApi(this.rangoFechas[0]);
      filtros.dateTo = this.formatDateForApi(this.rangoFechas[1]);
    }
    
    console.log('Cargando calificaciones con filtros:', filtros);
    
    // El resto del método continúa igual...
    this.calificacionService.listarCalificaciones(filtros)
      .pipe(finalize(() => this.loadingGrades.set(false)))
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.calificaciones.set(response.items);
            this.totalCalificaciones.set(response.total);
            console.log(`Calificaciones cargadas: ${response.items.length}, total: ${response.total}`);
          } else {
            this.calificaciones.set([]);
            this.totalCalificaciones.set(0);
          }
        },
        error: (err) => {
          console.error('Error cargando calificaciones:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las calificaciones.'
          });
        }
      });
  }
  
  // Método auxiliar para formatear fechas en formato API
  formatDateForApi(date: Date): string {
    if (!date) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
  
  // Búsqueda de estudiantes (para filtro de calificaciones)
  searchStudents(): void {
    if (!this.studentSearchQuery.trim()) {
      this.filteredStudents.set([]);
      return;
    }
    
    this.searchingStudents.set(true);
    
    this.studentService.listarEstudiantes(1, 10, this.studentSearchQuery)
      .pipe(finalize(() => this.searchingStudents.set(false)))
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.filteredStudents.set(response.items);
          } else {
            this.filteredStudents.set([]);
          }
        },
        error: (err) => {
          console.error('Error buscando estudiantes:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al buscar estudiantes'
          });
        }
      });
  }
  
  // Seleccionar un estudiante de la lista de resultados
  selectStudent(student: any): void {
    this.selectedStudent.set(student);
    this.studentSearchQuery = student.full_name;
    this.filteredStudents.set([]);
    
    // Actualizar el filtro de calificaciones
    this.filtrosCalificacion.student = student.user_id;
  }
  
  // Limpiar estudiante seleccionado
  clearSelectedStudent(): void {
    this.selectedStudent.set(null);
    this.studentSearchQuery = '';
    this.filtrosCalificacion.student = undefined;
  }
  
  // Cambio de página en tabla de evaluaciones
  onPageChangeAssessments(event: any): void {
    this.pageAssessments = event.page + 1;
    this.pageSizeAssessments = event.rows;
    this.cargarEvaluaciones();
  }
  
  // Cambio de página en tabla de calificaciones - método corregido
  onPageChangeGrades(event: any): void {
    // El evento de PrimeNG tiene índice de página basado en 0, mientras que la API suele usar base 1
    this.pageGrades = event.first / event.rows + 1; 
    this.pageSizeGrades = event.rows;
    
    console.log(`Cambiando a página ${this.pageGrades}, tamaño ${this.pageSizeGrades}`);
    this.cargarCalificaciones(this.pageGrades, this.pageSizeGrades);
  }
  
  // Método auxiliar para calcular el número total de páginas
  calcularTotalPaginas(): number {
    if (!this.totalCalificaciones()) return 1;
    // Usar window.Math para evitar el error de "Math is not defined"
    return Math.ceil(this.totalCalificaciones() / this.pageSizeGrades);
  }
  
  // Abrir modal de detalle de evaluación
  verDetalleEvaluacion(evaluacion: any): void {
    this.selectedEvaluacion.set(evaluacion);
    this.showEvaluacionDialog.set(true);
  }
  
  // Abrir modal de detalle de calificación
  verDetalleCalificacion(calificacion: any): void {
    this.selectedCalificacion.set(calificacion);
    this.showCalificacionDialog.set(true);
  }
  
  // Abrir el diálogo para crear una nueva evaluación
  abrirNuevaEvaluacion(): void {
    this.editingEvaluacionId = null;
    this.evaluacionForm = {
      name: '',
      assessment_type: 'TASK',
      date: new Date(),
      subject: this.filtrosEvaluacion.subject,
      course: this.filtrosEvaluacion.course,
      trimester: this.filtrosEvaluacion.trimester,
      max_score: 100
    };
    this.showEvaluacionFormDialog.set(true);
  }
  
  // Abrir el diálogo para editar una evaluación existente
  abrirEditarEvaluacion(evaluacion: any): void {
    this.editingEvaluacionId = evaluacion.id;
    this.evaluacionForm = {
      name: evaluacion.name,
      assessment_type: evaluacion.assessment_type,
      date: new Date(evaluacion.date),
      subject: evaluacion.subject?.id,
      course: evaluacion.course?.id,
      trimester: evaluacion.trimester?.id,
      max_score: evaluacion.max_score
    };
    this.showEvaluacionFormDialog.set(true);
  }
  
  // Guardar la evaluación (crear o editar)
  guardarEvaluacion(): void {
    // Validar que todos los campos obligatorios estén completos
    if (!this.evaluacionForm.name || !this.evaluacionForm.subject || !this.evaluacionForm.trimester) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor complete todos los campos obligatorios'
      });
      return;
    }
    
    // Crear una copia del formulario para no modificar el original
    const evaluacionData = {...this.evaluacionForm};
    
    // Formatear la fecha al formato que espera la API (YYYY-MM-DD)
    if (evaluacionData.date instanceof Date) {
      const date = evaluacionData.date;
      evaluacionData.date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }
    
    const observable = this.editingEvaluacionId
      ? this.calificacionService.editarEvaluacion(this.editingEvaluacionId, evaluacionData)
      : this.calificacionService.crearEvaluacion(evaluacionData);
    
    observable.subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.editingEvaluacionId 
            ? 'Evaluación actualizada correctamente' 
            : 'Evaluación creada correctamente'
        });
        this.showEvaluacionFormDialog.set(false);
        // Recargar la lista de evaluaciones
        this.cargarEvaluaciones();
      },
      error: (err) => {
        console.error('Error al guardar evaluación:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la evaluación: ' + (err.error?.detail || 'Error desconocido')
        });
      }
    });
  }
  
  // Abrir diálogo para calificar estudiantes por una evaluación específica
  abrirCalificarEstudiantes(evaluacion: any): void {
    this.evaluacionSeleccionada.set(evaluacion);
    this.loadingEstudiantes.set(true);
    this.estudiantesCalificados = {};
    this.estudianteSearchQuery = ''; // Resetear búsqueda
    
    // Si la evaluación tiene un curso, buscamos estudiantes de ese curso
    const filtro = evaluacion.course?.name || '';
    
    this.studentService.listarEstudiantes(1, 100, filtro)
      .pipe(finalize(() => this.loadingEstudiantes.set(false)))
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            // Guardamos tanto la lista original como la de trabajo
            this.estudiantesOriginal.set(response.items);
            this.estudiantesParaCalificar.set(response.items);
          } else {
            this.estudiantesOriginal.set([]);
            this.estudiantesParaCalificar.set([]);
            this.messageService.add({
              severity: 'info',
              summary: 'Sin resultados',
              detail: 'No se encontraron estudiantes para este curso'
            });
          }
          this.showCalificarDialog.set(true);
        },
        error: (err) => {
          console.error('Error al obtener estudiantes:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los estudiantes'
          });
        }
      });
  }
  
  // Método corregido para registrar calificación incluyendo period
  registrarCalificacionEstudiante(estudiante: any, nota: any): void {
    if (!this.evaluacionSeleccionada()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se ha seleccionado una evaluación'
      });
      return;
    }
    
    const evaluacion = this.evaluacionSeleccionada();
    
    // Convertir a número y validar
    const notaNum = parseFloat(nota);
    
    // Validar la nota ingresada
    if (isNaN(notaNum) || notaNum < 0 || notaNum > evaluacion.max_score) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `La calificación debe ser un número entre 0 y ${evaluacion.max_score}`
      });
      return;
    }
    
    // Construir objeto con estructura exacta que espera la API
    const calificacionData = {
      student: estudiante.user_id,
      subject: evaluacion.subject.id,
      period: evaluacion.trimester.period, // Añadir el period desde el trimester
      assessment_item_id: evaluacion.id,
      value: notaNum.toString(),
      comment: ""
    };
    
    console.log('Enviando datos de calificación:', calificacionData);
    
    this.calificacionService.registrarCalificacion(calificacionData)
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Calificación registrada para ${estudiante.full_name}`
          });
          // Marcar como calificado
          this.estudiantesCalificados[estudiante.user_id] = nota;
        },
        error: (err) => {
          console.error('Error detallado:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo registrar la calificación: ' + 
                  (err.error?.detail || err.message || 'Error desconocido')
          });
        }
      });
  }
  
  // Verificar si un estudiante ya ha sido calificado
  estaCalificado(estudiante: any): boolean {
    return estudiante.user_id in this.estudiantesCalificados;
  }
  
  // Obtener la calificación de un estudiante
  getCalificacion(estudiante: any): number | null {
    return this.estudiantesCalificados[estudiante.user_id] || null;
  }
  
  // Obtener el color del tipo de evaluación
  getAssessmentTypeColor(type: string): string {
    switch (type) {
      case 'EXAM': return 'bg-blue-500';
      case 'TASK': return 'bg-green-500';
      case 'PROJECT': return 'bg-purple-500';
      case 'PARTICIPATION': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  }
  
  // Obtener etiqueta legible del tipo de evaluación
  getAssessmentTypeLabel(type: string): string {
    switch (type) {
      case 'EXAM': return 'Examen';
      case 'TASK': return 'Tarea';
      case 'PROJECT': return 'Proyecto';
      case 'PARTICIPATION': return 'Participación';
      default: return type;
    }
  }
  
  // Modificar el método formatDate para aceptar tanto string como Date
  formatDate(dateInput: string | Date): string {
    if (!dateInput) return '';
    
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  // Cambio de periodo seleccionado
  onPeriodoChange(event: any): void {
    let periodoId: number;
    
    if (event && typeof event === 'object' && 'value' in event) {
      // Si es un evento de PrimeNG
      periodoId = event.value;
    } else {
      // Si es directamente el ID del periodo
      periodoId = event;
    }
    
    // Actualizamos el filtro de calificaciones
    this.filtrosCalificacion.period = periodoId;
    
    // Cargamos los trimestres correspondientes
    this.cargarTrimestres(periodoId);

    // Reiniciar filtros relacionados con el trimestre al cambiar periodo
    this.filtrosEvaluacion.trimester = undefined;
    this.evaluaciones.set([]); // Limpiamos las evaluaciones al cambiar periodo
  }
  
  // Función para determinar el color de la calificación según su valor
  getGradeColor(value: string): string {
    const numValue = parseFloat(value);
    if (numValue >= 80) return 'bg-green-500';
    if (numValue >= 65) return 'bg-yellow-500';
    return 'bg-red-500';
  }
  
  // Función para convertir string a número (usada en template)
  parseFloat(value: string): number {
    return parseFloat(value);
  }

  // Agregar método para buscar estudiantes en el diálogo
  buscarEstudiantesEnModal(): void {
    this.buscandoEstudiantes.set(true);
    
    const query = this.estudianteSearchQuery.trim().toLowerCase();
    
    if (!query) {
      // Si la búsqueda está vacía, restaurar lista original
      this.estudiantesParaCalificar.set(this.estudiantesOriginal());
      this.buscandoEstudiantes.set(false);
      return;
    }
    
    // Si hay un curso seleccionado, usar ese curso más la búsqueda
    if (this.evaluacionSeleccionada() && this.evaluacionSeleccionada().course) {
      // Buscar estudiantes por curso + término de búsqueda
      const curso = this.evaluacionSeleccionada().course.name;
      
      this.studentService.listarEstudiantes(1, 100, query)
        .pipe(finalize(() => this.buscandoEstudiantes.set(false)))
        .subscribe({
          next: (response) => {
            if (response && response.items) {
              this.estudiantesParaCalificar.set(response.items);
            } else {
              this.estudiantesParaCalificar.set([]);
            }
          },
          error: (err) => {
            console.error('Error al buscar estudiantes:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error al buscar estudiantes'
            });
            this.buscandoEstudiantes.set(false);
          }
        });
    } else {
      // Filtrar localmente si no hay curso seleccionado
      const filtrados = this.estudiantesOriginal().filter(estudiante => 
        estudiante.full_name.toLowerCase().includes(query) || 
        estudiante.student_id.toLowerCase().includes(query)
      );
      this.estudiantesParaCalificar.set(filtrados);
      this.buscandoEstudiantes.set(false);
    }
  }

  // Agregar método para limpiar la búsqueda
  limpiarBusquedaEstudiantes(): void {
    this.estudianteSearchQuery = '';
    this.estudiantesParaCalificar.set(this.estudiantesOriginal());
  }

  // Hacer disponible Math para cálculos en la plantilla
  Math: any = Math;

  // Agregar propiedades adicionales al componente
  // En GestionCalificacionesComponent

  // Para el rango de fechas
  rangoFechas: Date[] = [];

  // Filtro avanzado visible/oculto
  mostrarFiltrosAvanzados: boolean = false;

  // Método para alternar la visibilidad de los filtros avanzados
  toggleFiltrosAvanzados(): void {
    this.mostrarFiltrosAvanzados = !this.mostrarFiltrosAvanzados;
  }

  // Método para limpiar todos los filtros
  limpiarFiltros(): void {
    this.filtrosCalificacion = {
      student: undefined,
      subject: undefined,
      period: this.periodos().find(p => p.is_active)?.id, // Mantener solo el periodo activo
      assessmentItem: undefined,
      valueMin: undefined,
      valueMax: undefined,
      assessmentType: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      course: undefined,
      teacherComment: undefined
    };
    
    // Limpiar rango de fechas
    this.rangoFechas = [];
    
    // Limpiar estudiante seleccionado
    this.selectedStudent.set(null);
    this.studentSearchQuery = '';
    
    // Notificar al usuario
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros reiniciados',
      detail: 'Los filtros han sido reiniciados'
    });
  }
}
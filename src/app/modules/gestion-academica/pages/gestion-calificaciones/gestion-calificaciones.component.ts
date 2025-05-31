import { Component, OnInit } from '@angular/core';
import { CalificacionService } from '../../services/calificacion.service';
import { CursoService } from '../../services/curso.service';
import { MateriaService } from '../../services/materia.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';
import { AuthService } from '../../../autenticacion/services/auth.service';
import { StudentService } from '../../../gestion-usuarios/services/student.service';

// IMPORTA LOS MODULOS DE PRIMENG
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { TooltipModule } from 'primeng/tooltip';

// Definiendo interfaces para el tipo de datos
interface Calificacion {
  id: number;
  student_id?: number;
  student_name?: string;
  subject_id?: number;
  subject_name?: string;
  course_id?: number;
  course_name?: string;
  value: number;
  date?: string;
  created_at?: string;
  description?: string;
  observations?: string;
  comment?: string;
  period?: string;
}

interface PeriodoData {
  [key: string]: Calificacion[];
}

interface AnoData {
  ano: number;
  periodos: PeriodoData;
}

interface HistorialPorAno {
  [key: string]: AnoData;
}

@Component({
  selector: 'app-gestion-calificaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CardModule,
    TabViewModule,
    AccordionModule,
    TooltipModule
  ],
  templateUrl: './gestion-calificaciones.component.html',
  styleUrls: ['./gestion-calificaciones.component.css']
})
export class GestionCalificacionesComponent implements OnInit {
  calificaciones: Calificacion[] = [];
  subjects: any[] = [];
  courses: any[] = [];
  periods: any[] = [];

  filtros: any = {
    student: '',
    subject: '',
    course: '',
    period: '',
    min_value: null,
    max_value: null,
    search: '',
  };

  // Propiedades para paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;
  
  // Modal de detalles
  detalleModalVisible = false;
  detalleCalificacion: Calificacion | null = null;
  
  // Historial completo del estudiante
  historialModalVisible = false;
  historialCalificaciones: Calificacion[] = [];
  estudianteSeleccionado: any = null;
  historialPorAno: HistorialPorAno = {};
  loadingHistorial: boolean = false;

  // Nuevas propiedades y métodos
  isTeacher: boolean = false;
  activeTab: number = 0;

  // Para el registro de calificaciones
  estudiantes: any[] = [];
  loadingEstudiantes: boolean = false;
  estudiantesRegistrados: {[key: string]: boolean} = {};
  notasEstudiantes: {[key: string]: number} = {};
  notasRegistradas: {[key: string]: number} = {};

  filtrosRegistro: any = {
    search: '',
    course: '',
    subject: '',
    comment: ''
  };

  constructor(
    private calificacionService: CalificacionService,
    private courseService: CursoService,
    private subjectService: MateriaService,
    private noti: NotificacionService,
    private authService: AuthService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    // Cargar materias y cursos
    this.subjectService.obtenerMaterias(1, 100).subscribe(res => this.subjects = res.items || res);
    this.courseService.obtenerCursos(1, 100).subscribe(res => this.courses = res.items || res);
    
    // Verificar si el usuario es profesor - CAMBIAR ESTA LÍNEA
    this.isTeacher = this.authService.isTeacher();
    
    // Determinar el periodo por defecto
    const currentYear = new Date().getFullYear();
    this.filtrosRegistro.period = currentYear === 2024 ? 1 : 2;
    
    // Cargar calificaciones iniciales
    this.buscar();
  }

  buscar(page: number = 1, pageSize: number = 10) {
    this.loading = true;
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtros).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
    );

    this.calificacionService.listarCalificaciones(filtrosLimpios, page, pageSize).subscribe({
      next: (res) => {
        this.calificaciones = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener calificaciones:', err);
        this.noti.error('Error', 'No se pudieron cargar las calificaciones');
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    if (event.page !== undefined) {
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } else if (event.first !== undefined) {
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    this.buscar(this.currentPage, this.pageSize);
  }

  verDetalleCalificacion(calificacion: Calificacion) {
    console.log("calificacion", calificacion);
    this.calificacionService.obtenerDetalleCalificacion(calificacion.id).subscribe({
      next: (detalle) => {
        this.detalleCalificacion = detalle;
        this.detalleModalVisible = true;
      },
      error: (err) => {
        console.error('Error al obtener detalle de calificación:', err);
        this.noti.error('Error', 'No se pudo cargar el detalle de la calificación');
      }
    });
  }

  limpiarFiltros() {
    this.filtros = {
      student: '',
      subject: '',
      course: '',
      period: '',
      min_value: null,
      max_value: null,
      search: '',
    };
    this.buscar();
  }
  
  verHistorialCalificaciones(calificacion: Calificacion) {
    this.estudianteSeleccionado = calificacion;
    this.loadingHistorial = true;
    this.historialModalVisible = true;
    console.log("calificacion", calificacion);
    
    // Usar student_id en lugar de id
    if (!calificacion.student_id) {
      this.noti.error('Error', 'No se pudo identificar al estudiante');
      this.loadingHistorial = false;
      return;
    }
    
    this.calificacionService.obtenerCalificacionesEstudiante(calificacion.student_id).subscribe({
      next: (res) => {
        this.historialCalificaciones = res || [];
        this.organizarCalificacionesPorAno();
        this.loadingHistorial = false;
      },
      error: (err) => {
        console.error('Error al obtener historial de calificaciones:', err);
        this.noti.error('Error', 'No se pudo cargar el historial de calificaciones del estudiante');
        this.loadingHistorial = false;
      }
    });
  }
  
  organizarCalificacionesPorAno() {
    this.historialPorAno = {};
    
    // Agrupar por año académico
    this.historialCalificaciones.forEach(calificacion => {
      const fecha = new Date(calificacion.created_at || new Date());
      const ano = fecha.getFullYear();
      
      if (!this.historialPorAno[ano.toString()]) {
        this.historialPorAno[ano.toString()] = {
          ano: ano,
          periodos: {}
        };
      }
      
      // Agrupar por período dentro del año
      const periodo = calificacion.period || 'Sin período';
      if (!this.historialPorAno[ano.toString()].periodos[periodo]) {
        this.historialPorAno[ano.toString()].periodos[periodo] = [];
      }
      
      this.historialPorAno[ano.toString()].periodos[periodo].push(calificacion);
    });
  }
  
  calcularPromedioNotas(calificaciones: Calificacion[]): number {
    if (!calificaciones || calificaciones.length === 0) return 0;
    const suma = calificaciones.reduce((acc, nota) => acc + (nota.value || 0), 0);
    return Math.round((suma / calificaciones.length) * 10) / 10; // Redondear a 1 decimal
  }

  // Métodos de seguridad para la plantilla
  getPeriodos(ano: AnoData): Array<{key: string, value: Calificacion[]}> {
    if (!ano || !ano.periodos) return [];
    return Object.entries(ano.periodos).map(([key, value]) => ({key, value}));
  }

  getAnoKey(item: {key: string, value: AnoData}): string {
    return item.key;
  }

  getPeriodoKey(item: {key: string, value: Calificacion[]}): string {
    return item.key;
  }

  getPeriodoValue(item: {key: string, value: Calificacion[]}): Calificacion[] {
    return item.value || [];
  }

  /**
   * Método para buscar estudiantes cuando se hace clic en el botón de búsqueda
   */
  onBuscarClick() {
    this.loadingEstudiantes = true;
    this.estudiantes = [];
    this.estudiantesRegistrados = {};
    this.notasEstudiantes = {};
    this.notasRegistradas = {};
    
    this.studentService.listarEstudiantes(
      1,
      100,
      this.filtrosRegistro.search?.trim() || ''
    ).subscribe({
      next: (res) => {
        this.estudiantes = res.items || [];
        this.loadingEstudiantes = false;
        
        if (this.estudiantes.length === 0) {
          this.noti.info('Sin resultados', 'No se encontraron estudiantes con ese criterio');
        }
      },
      error: (err) => {
        console.error('Error al obtener estudiantes:', err);
        this.loadingEstudiantes = false;
        this.noti.error('Error', 'No se pudieron cargar los estudiantes');
      }
    });
  }

  /**
   * Registra la calificación para un estudiante
   */
  registrarCalificacion(estudiante: any) {
    if (!this.validarDatosCalificacion(estudiante)) {
      return;
    }
    
    // Clave única para controlar duplicados
    const clave = `${estudiante.user_id}-${this.filtrosRegistro.subject}-${this.filtrosRegistro.comment}`;
    
    if (this.estudiantesRegistrados[clave]) {
      this.noti.error('Ya registrado', 'La calificación de este estudiante ya fue registrada');
      return;
    }
    
    // Determinar el periodo basado en el año actual
    const currentYear = new Date().getFullYear();
    const period = currentYear === 2024 ? 1 : 2; // 2024 -> 1, otros años (2025) -> 2
    
    // Preparar datos con el campo period incluido
    const calificacionData = {
      student: estudiante.user_id,
      course: this.filtrosRegistro.course,
      subject: this.filtrosRegistro.subject,
      value: this.notasEstudiantes[estudiante.user_id],
      comment: this.filtrosRegistro.comment,
      period: this.filtrosRegistro.period // Añadimos el campo period obligatorio
    };
    
    console.log('DATOS A ENVIAR A LA API:', calificacionData);
    
    this.calificacionService.registrarCalificacion(calificacionData).subscribe({
      next: (res) => {
        console.log('RESPUESTA EXITOSA:', res);
        this.noti.success('Éxito', `Calificación registrada para ${estudiante.full_name}`);
        // Marcar como registrado
        this.estudiantesRegistrados[clave] = true;
        this.notasRegistradas[estudiante.user_id] = this.notasEstudiantes[estudiante.user_id];
      },
      error: (err) => {
        console.error('ERROR COMPLETO:', err);
        console.error('DETALLES DEL ERROR:', err.error);
        
        if (err.error?.detail?.includes('already exists')) {
          this.noti.error('Duplicado', 'Ya existe una calificación registrada para este estudiante con estos datos');
          this.estudiantesRegistrados[clave] = true;
        } else {
          this.noti.error('Error', 'No se pudo registrar la calificación: ' + (err.error?.detail || err.message || 'Error desconocido'));
        }
      }
    });
  }

  /**
   * Valida que los datos necesarios para registrar la calificación estén completos
   */
  validarDatosCalificacion(estudiante: any): boolean {
    if (!this.filtrosRegistro.course) {
      this.noti.error('Campo requerido', 'Seleccione un curso');
      return false;
    }
    
    if (!this.filtrosRegistro.subject) {
      this.noti.error('Campo requerido', 'Seleccione una materia');
      return false;
    }
    
    if (!this.filtrosRegistro.comment) {
      this.noti.error('Campo requerido', 'Ingrese un título para la calificación');
      return false;
    }
    
    if (!this.notasEstudiantes[estudiante.user_id]) {
      this.noti.error('Campo requerido', 'Ingrese una calificación para el estudiante');
      return false;
    }
    
    const nota = this.notasEstudiantes[estudiante.user_id];
    if (isNaN(nota) || nota < 0 || nota > 100) {
      this.noti.error('Valor inválido', 'La calificación debe estar entre 0 y 100');
      return false;
    }
    
    return true;
  }

  /**
   * Verifica si un estudiante ya tiene calificación registrada
   */
  estaRegistrado(estudiante: any): boolean {
    if (!estudiante || !this.filtrosRegistro.subject || !this.filtrosRegistro.comment) {
      return false;
    }
    
    const clave = `${estudiante.user_id}-${this.filtrosRegistro.subject}-${this.filtrosRegistro.comment}`;
    return this.estudiantesRegistrados[clave] === true;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

import { ParticipacionService } from '../../services/participacion.service';
import { MateriaService } from '../../services/materia.service';
import { CursoService } from '../../services/curso.service';
import { StudentService } from '../../../gestion-usuarios/services/student.service';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';
import { AuthService } from '../../../autenticacion/services/auth.service';

@Component({
  selector: 'app-gestion-participacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CalendarModule,
    TabViewModule,
    ToastModule,
    TooltipModule
  ],
  templateUrl: './gestion-participacion.component.html',
  styleUrl: './gestion-participacion.component.css'
})
export class GestionParticipacionComponent implements OnInit {
  // SECCIÓN 1: PROPIEDADES PARA BÚSQUEDA DE PARTICIPACIONES
  subjects: any[] = [];
  courses: any[] = [];
  periods: any[] = [
    { label: '2024', value: 1 },
    { label: '2025', value: 2 }
  ];
  
  participaciones: any[] = [];
  resultadosBusqueda: boolean = false;
  
  filtros: any = {
    subject: '',
    course: '',
    student: '',
    from_date: '',
    to_date: '',
    period: '',
    level: '',
    search: ''
  };
  
  nivelesParticipacion = [
    { label: 'Alta', value: 'high' },
    { label: 'Media', value: 'medium' },
    { label: 'Baja', value: 'low' }
  ];
  
  // Propiedades para paginación (búsqueda)
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;
  
  // SECCIÓN 2: PROPIEDADES PARA CREAR PARTICIPACIONES
  activeTab: number = 0; // 0 = consulta, 1 = registro
  
  // Añadir propiedad para la fecha actual
  fechaActual: Date = new Date();
  
  // Filtros para registro de participación
  filtrosRegistro: any = {
    course: '',
    subject: '',
    date: new Date(),
    period: 1, // Default 2024
  };

  filtrosA: any = {
    search: ''
  };
  
  // Estudiantes del curso seleccionado
  estudiantes: any[] = [];
  loadingEstudiantes: boolean = false;
  
  // Control de estudiantes con participación registrada
  estudiantesRegistrados: {[key: string]: boolean} = {};
  
  constructor(
    private participacionService: ParticipacionService,
    private materiaService: MateriaService,
    private cursoService: CursoService,
    private studentService: StudentService,
    private noti: NotificacionService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    // Cargar opciones para los filtros
    this.cargarDatosIniciales();
  }
  
  cargarDatosIniciales() {
    this.materiaService.obtenerMaterias(1, 100).subscribe(res => this.subjects = res.items || res);
    this.cursoService.obtenerCursos(1, 100).subscribe(res => this.courses = res.items || res);
  }
  
  /**
   * Realiza búsqueda de participaciones con los filtros aplicados
   */
  buscar(page: number = 1, pageSize: number = 10) {
    this.loading = true;
    
    // Convertir fechas al formato esperado por la API (YYYY-MM-DD)
    if (this.filtros.from_date && typeof this.filtros.from_date === 'object') {
      this.filtros.from_date = this.formatDate(this.filtros.from_date);
    }
    
    if (this.filtros.to_date && typeof this.filtros.to_date === 'object') {
      this.filtros.to_date = this.formatDate(this.filtros.to_date);
    }
    
    // Eliminar filtros vacíos
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtros).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
    );
    
    // Añadir filtro por ID del profesor si no es admin
    if (!this.authService.isAdmin()) {
      filtrosLimpios['teacher'] = this.authService.getCurrentUserId();
    }
    
    this.participacionService.listarParticipaciones(filtrosLimpios, page, pageSize).subscribe({
      next: (res) => {
        this.participaciones = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
        this.resultadosBusqueda = true;
      },
      error: (err) => {
        console.error('Error al obtener participaciones:', err);
        this.loading = false;
        this.noti.error('Error', 'No se pudieron cargar las participaciones');
      }
    });
  }
  
  /**
   * Método para buscar estudiantes cuando se hace clic en el botón de búsqueda
   */
  onBuscarClick() {
    this.currentPage = 1;
    this.obtenerEstudiantes(1, 100); // Usando 100 como tamaño para mostrar más estudiantes
  }
  
  /**
   * Obtiene estudiantes basados en el término de búsqueda
   * El término puede ser nombre, ID, o código de curso (S2, P4, etc.)
   */
  obtenerEstudiantes(page: number = 1, pageSize: number = 100): void {
    this.loadingEstudiantes = true;
    this.estudiantes = [];
    this.estudiantesRegistrados = {};
    
    this.studentService.listarEstudiantes(
      page,
      pageSize,
      this.filtrosA.search?.trim() || ''
    ).subscribe({
      next: (res) => {
        this.estudiantes = res.items;
        this.totalRecords = res.total;
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
   * Registra participación para un estudiante
   */
  registrarParticipacion(estudiante: any, nivel: string) {
    if (!this.validarDatosParticipacion()) {
      return;
    }
    
    // Clave única para controlar duplicados: estudiante-materia-fecha
    const clave = `${estudiante.user_id}-${this.filtrosRegistro.subject}-${this.formatDate(this.filtrosRegistro.date)}`;
    
    // Si ya está registrado, no permitir registrar nuevamente
    if (this.estudiantesRegistrados[clave]) {
      this.noti.error('Ya registrado', 'La participación de este estudiante ya fue registrada para esta fecha y materia');
      return;
    }
    
    // Obtener descripciones para mensaje
    const cursoSeleccionado = this.courses.find(c => c.id === this.filtrosRegistro.course);
    const materiaSeleccionada = this.subjects.find(s => s.id === this.filtrosRegistro.subject);
    const nivelTexto = nivel === 'high' ? 'Alta' : nivel === 'medium' ? 'Media' : 'Baja';
    
    if (!cursoSeleccionado) {
      this.noti.error('Error', 'Seleccione un curso válido');
      return;
    }
    
    // Configurar datos para enviar a la API
    const participacionData = {
      student: estudiante.user_id,
      course: this.filtrosRegistro.course,
      subject: this.filtrosRegistro.subject,
      date: this.formatDate(this.filtrosRegistro.date),
      level: nivel,
      period: this.filtrosRegistro.period,
      comments: `Participación ${nivelTexto}`
    };
    
    // Mostrar indicador de carga en la UI (puedes agregar un estado de carga si es necesario)
    this.loading = true;
    
    this.participacionService.registrarParticipacion(participacionData).subscribe({
      next: (res) => {
        // Actualizar UI
        this.estudiantesRegistrados[clave] = true;
        this.loading = false;
        
        // Mostrar mensaje de éxito con detalles
        this.noti.success(
          'Participación registrada', 
          `${nivelTexto} participación registrada para ${estudiante.full_name} en ${materiaSeleccionada?.name}`
        );
      },
      error: (err) => {
        this.loading = false;
        
        // Manejar casos de error específicos
        if (err.error?.detail?.includes('already exists')) {
          this.estudiantesRegistrados[clave] = true;
          this.noti.error(
            'Participación duplicada', 
            `${estudiante.full_name} ya tiene participación registrada para esta fecha y materia`
          );
        } else {
          this.noti.error(
            'Error al registrar', 
            err.error?.detail || 'No se pudo registrar la participación. Intente nuevamente.'
          );
        }
      }
    });
  }
  
  /**
   * Valida que los datos necesarios para registrar participación estén completos
   */
  validarDatosParticipacion(): boolean {
    if (!this.filtrosRegistro.course) {
      this.noti.error('Campo requerido', 'Seleccione un curso');
      return false;
    }
    
    if (!this.filtrosRegistro.subject) {
      this.noti.error('Campo requerido', 'Seleccione una materia');
      return false;
    }
    
    if (!this.filtrosRegistro.date) {
      this.noti.error('Campo requerido', 'Seleccione una fecha');
      return false;
    }
    
    return true;
  }
  
  /**
   * Gestiona el cambio de página
   */
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
  
  /**
   * Resetea los filtros de búsqueda
   */
  limpiarFiltros(): void {
    this.filtros = {
      subject: '',
      course: '',
      student: '',
      from_date: '',
      to_date: '',
      period: '',
      level: '',
      search: ''
    };
    this.resultadosBusqueda = false;
  }
  
  /**
   * Resetea los filtros de registro
   */
  limpiarFiltrosRegistro(): void {
    this.filtrosRegistro = {
      course: '',
      subject: '',
      date: new Date(),
      period: 1,
    };
    this.estudiantes = [];
    this.estudiantesRegistrados = {};
  }
  
  /**
   * Convierte un objeto Date a string en formato YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Verifica si un estudiante ya tiene participación registrada
   */
  estaRegistrado(estudiante: any): boolean {
    if (!estudiante || !this.filtrosRegistro.subject || !this.filtrosRegistro.date) {
      return false;
    }
    
    const clave = `${estudiante.user_id}-${this.filtrosRegistro.subject}-${this.formatDate(this.filtrosRegistro.date)}`;
    return this.estudiantesRegistrados[clave] === true;
  }
  
  /**
   * Devuelve la fecha actual para usar en la plantilla
   */
  getFechaActual(): Date {
    return new Date();
  }
  
  /**
   * Valida que el código de curso tenga el formato correcto (S1-S6, P1-P6)
   */
  validarCodigoCurso(codigo: string): boolean {
    return /^[SP][1-6]$/i.test(codigo);
  }
}

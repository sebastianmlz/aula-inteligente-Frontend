import { Component, OnInit } from '@angular/core';
import { CalificacionService } from '../../services/calificacion.service';
import { CursoService } from '../../services/curso.service';
import { MateriaService } from '../../services/materia.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';

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

  constructor(
    private calificacionService: CalificacionService,
    private courseService: CursoService,
    private subjectService: MateriaService,
    private noti: NotificacionService
  ) {}

  ngOnInit() {
    this.subjectService.obtenerMaterias(1, 100).subscribe(res => this.subjects = res.items || res);
    this.courseService.obtenerCursos(1, 100).subscribe(res => this.courses = res.items || res);
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
}

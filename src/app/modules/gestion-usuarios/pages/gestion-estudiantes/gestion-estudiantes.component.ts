import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { StudentService } from '../../services/student.service';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { CalificacionService } from '../../../gestion-academica/services/calificacion.service';

@Component({
  selector: 'app-gestion-estudiantes',
  templateUrl: './gestion-estudiantes.component.html',
  styleUrls: ['./gestion-estudiantes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule,
    TabViewModule
  ]
})
export class GestionEstudiantesComponent implements OnInit {
  // Propiedades para paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;

  estudiantes: any[] = [];
  gradoSeleccionado: string | null = null;

  perfilModalVisible = false;
  perfilAcademico: any = null;
  
  // Propiedades básicas
  activeTabIndex: number = 0;

  filtros: any = {
    search: ''
  };

  // Añade esta nueva propiedad para el historial de calificaciones
  historialCalificaciones: any = {};
  loadingHistorial: boolean = false;

  constructor(
    private studentService: StudentService,
    private noti: NotificacionService,
    private calificacionService: CalificacionService  // Añade esta línea
  ) {}

  ngOnInit(): void {
    this.obtenerEstudiantes();
  }

  obtenerEstudiantes(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.studentService.listarEstudiantes(
        page,
        pageSize,
        this.filtros.search?.trim() || ''
    ).subscribe({
      next: (res) => {
        this.estudiantes = res.items;
        this.totalRecords = res.total;
        this.loading = false;
      },
      error: (err) => {
        this.noti.error('Error', 'Error al obtener estudiantes');
        this.loading = false;
        console.error('Error al obtener estudiantes:', err);
      }
    });
  }

  // Llama a este método cuando cambie el grado o la página
  onGradoChange(nuevoGrado: string) {
    this.gradoSeleccionado = nuevoGrado;
    this.currentPage = 1;
    this.obtenerEstudiantes();
  }

  // Nuevo método para manejar el cambio de página
  onPageChange(event: any): void {
    if (event.page !== undefined) {
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } else if (event.first !== undefined) {
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    this.obtenerEstudiantes(this.currentPage, this.pageSize);
  }

  // Modifica el método verPerfilAcademico para cargar también las calificaciones
  verPerfilAcademico(estudiante: any) {
    this.activeTabIndex = 0;
    this.perfilAcademico = null;
    this.historialCalificaciones = {};
    
    this.studentService.obtenerPerfilAcademico(estudiante.user_id).subscribe({
      next: (res) => {
        this.perfilAcademico = res;
        this.perfilModalVisible = true;
        
        // Una vez que tenemos el perfil, cargamos sus calificaciones
        this.cargarHistorialCalificaciones(estudiante.user_id);
      },
      error: (err) => {
        this.noti.error('Error', 'Error al obtener perfil académico');
        console.error('Error al obtener perfil académico:', err);
      }
    });
  }

  // Método para cargar las calificaciones
  cargarHistorialCalificaciones(userId: number) {
    if (!userId) return;
    
    this.loadingHistorial = true;
    console.log('Obteniendo historial para usuario ID:', userId);
    
    this.calificacionService.obtenerCalificacionesEstudiante(userId).subscribe({
      next: (res: any) => {
        this.historialCalificaciones = res || {};
        console.log('Datos recibidos:', this.historialCalificaciones);
        this.loadingHistorial = false;
      },
      error: (err) => {
        console.error('Error al obtener historial de calificaciones:', err);
        this.noti.error('Error', 'No se pudo cargar el historial de calificaciones del estudiante');
        this.historialCalificaciones = {};
        this.loadingHistorial = false;
      }
    });
  }

  onBuscarClick() {
    this.currentPage = 1;
    this.obtenerEstudiantes(this.currentPage, this.pageSize);
  }

  // Método auxiliar para obtener las claves del objeto historialCalificaciones
  getMateriasKeys(): string[] {
    if (!this.historialCalificaciones || typeof this.historialCalificaciones !== 'object') {
      return [];
    }
    return Object.keys(this.historialCalificaciones);
  }
}

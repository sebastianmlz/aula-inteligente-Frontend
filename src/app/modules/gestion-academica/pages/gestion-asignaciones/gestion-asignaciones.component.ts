import { Component, OnInit } from '@angular/core';
import { AsignacionService } from '../../services/asignacion.service';
import { TeacherService } from '../../../gestion-usuarios/services/teacher.service';
import { CursoService } from '../../services/curso.service';
import { MateriaService } from '../../services/materia.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';
import { AuthService } from '../../../autenticacion/services/auth.service';

@Component({
  selector: 'app-gestion-asignaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    CheckboxModule
  ],
  templateUrl: './gestion-asignaciones.component.html',
  styleUrls: ['./gestion-asignaciones.component.css']
})
export class GestionAsignacionesComponent implements OnInit {
  teachers: any[] = [];
  subjects: any[] = [];
  courses: any[] = [];
  periods: any[] = [];
  asignaciones: any[] = [];

  filtros: any = {
    teacher: '',
    subject: '',
    course: '',
    period: '',
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

  crearModalVisible = false;
  nuevaAsignacion: any = {
    teacher: null,
    course: null,
    subject: null,
    period: null,
    is_primary: false
  };

  editarModalVisible = false;
  asignacionEditando: any = null;

  // Propiedades para control de acceso
  isAdmin: boolean = false;
  currentUserId: string = '';

  constructor(
    private asignacionService: AsignacionService,
    private teacherService: TeacherService,
    private courseService: CursoService,
    private subjectService: MateriaService,
    private noti: NotificacionService,
    private authService: AuthService // Servicio de autenticación
  ) {}

  ngOnInit() {
    // Verificar rol al inicializar
    this.isAdmin = this.authService.isAdmin();
    this.currentUserId = this.authService.getCurrentUserId();

    // Si es admin, cargar todos los profesores, si no, esta lista puede estar vacía o filtrada
    if (this.isAdmin) {
      this.teacherService.listarProfesores(1, 100).subscribe(res => {
        this.teachers = res.items;
      });
    }

    this.subjectService.obtenerMaterias(1,100).subscribe(res => this.subjects = res.items || res);
    this.courseService.obtenerCursos(1,100).subscribe(res => this.courses = res.items || res);

    this.buscar();
  }

  buscar(page: number = 1, pageSize: number = 10) {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtros).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
    );

    // Si el usuario es profesor (no admin), filtrar por su ID
    if (!this.isAdmin) {
      filtrosLimpios['teacher'] = this.currentUserId; // Cambiado de .teacher a ['teacher']
    }

    this.asignacionService.listarAsignaciones(filtrosLimpios, page, pageSize).subscribe({
      next: (res) => {
        this.asignaciones = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener asignaciones:', err);
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

  abrirModalCrear() {
    if (!this.isAdmin) {
      this.noti.error('Error', 'No tienes permisos para crear asignaciones');
      return;
    }

    this.nuevaAsignacion = {
      teacher: null,
      course: null,
      subject: null,
      period: null,
      is_primary: false
    };
    this.crearModalVisible = true;
  }

  crearAsignacion() {
    this.asignacionService.crearAsignacion(this.nuevaAsignacion).subscribe({
      next: () => {
        this.crearModalVisible = false;
        this.buscar(this.currentPage, this.pageSize);
        this.noti.success('Éxito', 'Asignación creada correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'No se pudo crear la asignación');
        console.error('Error al crear asignación:', err);
      }
    });
  }

  // Abrir modal de edición
  abrirModalEditar(asignacion: any) {
    if (!this.isAdmin) {
      this.noti.error('Error', 'No tienes permisos para editar asignaciones');
      return;
    }

    this.asignacionEditando = { ...asignacion };
    // Asegúrate de mapear los campos correctamente para el formulario
    this.editarModalVisible = true;
  }

  // Guardar cambios
  editarAsignacion() {
    this.asignacionService.editarAsignacion(this.asignacionEditando.id, {
      teacher: this.asignacionEditando.teacher_details?.user_id || this.asignacionEditando.teacher,
      subject: this.asignacionEditando.subject || this.asignacionEditando.subject_id,
      course: this.asignacionEditando.course || this.asignacionEditando.course_id,
      period: this.asignacionEditando.period || this.asignacionEditando.period_id,
      is_primary: this.asignacionEditando.is_primary
    }).subscribe({
      next: () => {
        this.editarModalVisible = false;
        this.buscar(this.currentPage, this.pageSize);
        this.noti.success('Éxito', 'Asignación editada correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'No se pudo editar la asignación');
        console.error('Error al editar asignación:', err);
      }
    });
  }

  // Eliminar asignación
  eliminarAsignacion(asignacion: any) {
    if (!this.isAdmin) {
      this.noti.error('Error', 'No tienes permisos para eliminar asignaciones');
      return;
    }

    if (confirm('¿Seguro que deseas eliminar esta asignación?')) {
      this.asignacionService.eliminarAsignacion(asignacion.id).subscribe({
        next: () => {
          this.buscar(this.currentPage, this.pageSize);
          this.noti.success('Éxito', 'Asignación eliminada correctamente');
        },
        error: (err) => {
          this.noti.error('Error', 'No se pudo eliminar la asignación');
          console.error('Error al eliminar asignación:', err);
        }
      });
    }
  }

  // Método para verificar permisos de edición/eliminación (usar en template)
  canEditDelete(): boolean {
    return this.isAdmin;
  }
}

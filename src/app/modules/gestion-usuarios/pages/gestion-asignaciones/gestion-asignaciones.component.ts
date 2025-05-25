import { Component, OnInit } from '@angular/core';
import { AsignacionService } from '../../services/asignacion.service';
import { TeacherService } from '../../services/teacher.service';
import { CursoService } from '../../services/curso.service';
import { MateriaService } from '../../services/materia.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// IMPORTA LOS MODULOS DE PRIMENG
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

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
    DialogModule
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

  constructor(
    private asignacionService: AsignacionService,
    private teacherService: TeacherService,
    private courseService: CursoService,
    private subjectService: MateriaService,
    // private periodService: PeriodService
  ) {}

  ngOnInit() {
    this.teacherService.listarProfesores(1, 100).subscribe(res => {
      console.log(res.items); // <-- Verifica aquí que cada objeto tenga un id único
      this.teachers = res.items;
    });
    this.subjectService.obtenerMaterias(1,100).subscribe(res => this.subjects = res.items || res);
    this.courseService.obtenerCursos(1,100).subscribe(res => this.courses = res.items || res);
    // this.periodService.listarPeriodos().subscribe(res => this.periods = res.items || res);
    this.buscar();
  }

  buscar(page: number = 1, pageSize: number = 10) {
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtros).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
    );

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
    // Puedes validar aquí si quieres
    this.asignacionService.crearAsignacion(this.nuevaAsignacion).subscribe({
      next: () => {
        this.crearModalVisible = false;
        this.buscar(this.currentPage, this.pageSize);
        // Opcional: notificación de éxito
      },
      error: (err) => {
        // Opcional: notificación de error
        console.error('Error al crear asignación:', err);
      }
    });
  }
}

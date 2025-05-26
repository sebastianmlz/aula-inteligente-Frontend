import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { CursoService } from '../../services/curso.service';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';

@Component({
  selector: 'app-gestion-cursos',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule, InputTextarea, InputSwitchModule],
  templateUrl: './gestion-cursos.component.html',
  styleUrl: './gestion-cursos.component.css'
})
export class GestionCursosComponent implements OnInit {
  cursos: any[] = [];

  // Propiedades para paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;

  crearModalVisible = false;
  nuevoCurso: any = {
    name: '',
    code: '',
    description: '',
    year: new Date().getFullYear(),
    capacity: 0,
    is_active: true
  };

  editarModalVisible = false;
  cursoEditando: any = null;

  constructor(
    private cursoService: CursoService,
    private noti: NotificacionService // Inyecta el servicio
  ) {}

  ngOnInit(): void {
    this.obtenerCursos();
  }

  obtenerCursos(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.cursoService.obtenerCursos(page, this.pageSize).subscribe({
      next: (res) => {
        this.cursos = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al obtener cursos:', err);
      }
    });
  }

  // Nuevo método para manejar el cambio de página
  onPageChange(event: any): void {
    // Si usas p-paginator de PrimeNG
    if (event.page !== undefined) {
      // PrimeNG paginator usa base 0 (primera página = 0)
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } 
    // Si usas p-table con paginación integrada
    else if (event.first !== undefined) {
      // Calcular página basado en first y rows
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    
    console.log(`Cambiando a página ${this.currentPage}, tamaño: ${this.pageSize}`);
    this.obtenerCursos(this.currentPage, this.pageSize);
  }

  abrirModalCrear() {
    this.nuevoCurso = {
      name: '',
      code: '',
      description: '',
      year: new Date().getFullYear(),
      capacity: 0,
      is_active: true
    };
    this.crearModalVisible = true;
  }

  crearCurso() {
    this.cursoService.crearCurso(this.nuevoCurso).subscribe({
      next: () => {
        this.crearModalVisible = false;
        this.obtenerCursos();
        this.noti.success('Éxito', 'Curso creado correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'Error al crear curso');
        console.error(err);
      }
    });
  }

  abrirModalEditar(curso: any) {
    // Copia profunda para evitar modificar el objeto original antes de guardar
    this.cursoEditando = { ...curso };
    this.editarModalVisible = true;
  }

  editarCurso() {
    this.cursoService.editarCurso(this.cursoEditando.id, this.cursoEditando).subscribe({
      next: () => {
        this.editarModalVisible = false;
        this.obtenerCursos();
        this.noti.success('Éxito', 'Curso editado correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'Error al editar curso');
        console.error(err);
      }
    });
  }

  eliminarCurso(curso: any) {
    if (confirm(`¿Seguro que deseas eliminar el curso "${curso.name}"?`)) {
      this.cursoService.eliminarCurso(curso.id).subscribe({
        next: () => {
          this.obtenerCursos();
          this.noti.success('Éxito', 'Curso eliminado correctamente');
        },
        error: (err) => {
          this.noti.error('Error', 'Error al eliminar curso');
          console.error(err);
        }
      });
    }
  }
}

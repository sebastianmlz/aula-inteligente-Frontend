import { Component, OnInit } from '@angular/core';
import { MateriaService } from '../../services/materia.service';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service'; // Importa el servicio
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-materias',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FormsModule
  ],
  templateUrl: './gestion-materias.component.html',
  styleUrl: './gestion-materias.component.css'
})
export class GestionMateriasComponent implements OnInit {
  materias: any[] = [];
  // Propiedades para paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;

  crearModalVisible = false;
  nuevaMateria: any = {
    name: '',
    code: '',
    description: '',
    credit_hours: 1
  };

  editarModalVisible = false;
  materiaEditando: any = null;

  constructor(
    private materiaService: MateriaService,
    private noti: NotificacionService // Inyecta el servicio
  ) {}

  ngOnInit(): void {
    this.obtenerMaterias();
  }

  obtenerMaterias(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.materiaService.obtenerMaterias(page, pageSize).subscribe({
      next: (res) => {
        this.materias = res.items;
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
        console.error('Error al obtener materias:', err);
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
    this.obtenerMaterias(this.currentPage, this.pageSize);
  }

  abrirModalCrear() {
    this.nuevaMateria = {
      name: '',
      code: '',
      description: '',
      credit_hours: 1
    };
    this.crearModalVisible = true;
  }

  crearMateria() {
    this.materiaService.crearMateria(this.nuevaMateria).subscribe({
      next: () => {
        this.crearModalVisible = false;
        this.obtenerMaterias();
        this.noti.success('Éxito', 'Materia creada correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'Error al crear materia');
        console.error(err);
      }
    });
  }

  abrirModalEditar(materia: any) {
    this.materiaEditando = { ...materia };
    this.editarModalVisible = true;
  }

  editarMateria() {
    this.materiaService.editarMateria(this.materiaEditando.id, this.materiaEditando).subscribe({
      next: () => {
        this.editarModalVisible = false;
        this.obtenerMaterias();
        this.noti.success('Éxito', 'Materia editada correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'Error al editar materia');
        console.error(err);
      }
    });
  }

  eliminarMateria(materia: any) {
    if (confirm(`¿Seguro que deseas eliminar la materia "${materia.name}"?`)) {
      this.materiaService.eliminarMateria(materia.id).subscribe({
        next: () => {
          this.obtenerMaterias();
          this.noti.success('Éxito', 'Materia eliminada correctamente');
        },
        error: (err) => {
          this.noti.error('Error', 'Error al eliminar materia');
          console.error(err);
        }
      });
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { StudentService } from '../../services/student.service';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';

@Component({
  selector: 'app-gestion-estudiantes',
  templateUrl: './gestion-estudiantes.component.html',
  styleUrls: ['./gestion-estudiantes.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule
  ]
})
export class GestionEstudiantesComponent {

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

  constructor(
    private studentService: StudentService,
    private noti: NotificacionService // Inyecta el servicio
  ) {}

  ngOnInit(): void {
    this.obtenerEstudiantes();
  }

  obtenerEstudiantes(page: number = 1, pageSize: number = 10): void {
    this.studentService.listarEstudiantes(page, this.pageSize, this.gradoSeleccionado || undefined)
      .subscribe({
        next: (res) => {
          this.estudiantes = res.items;
          this.totalRecords = res.total;
        },
        error: (err) => {
          this.noti.error('Error', 'Error al obtener estudiantes');
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
    this.obtenerEstudiantes(this.currentPage, this.pageSize);
  }

  verPerfilAcademico(estudiante: any) {
    this.studentService.obtenerPerfilAcademico(estudiante.user_id).subscribe({
      next: (res) => {
        this.perfilAcademico = res;
        this.perfilModalVisible = true;
      },
      error: (err) => {
        this.noti.error('Error', 'Error al obtener perfil académico');
        console.error('Error al obtener perfil académico:', err);
      }
    });
  }

}

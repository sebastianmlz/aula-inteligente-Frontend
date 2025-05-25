import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TeacherService } from '../../services/teacher.service';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-gestion-profesores',
  templateUrl: './gestion-profesores.component.html',
  styleUrls: ['./gestion-profesores.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    DialogModule,
    ButtonModule,
    FormsModule
  ]
})
export class GestionProfesoresComponent implements OnInit {
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  loading: boolean = false;

  profesores: any[] = [];
  especialidadSeleccionada: string | null = null;

  crearModalVisible = false;
  nuevoProfesor: any = {
    user: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      groups: [2], // grupo docente
      phone_number: '',
      address: '',
      date_of_birth: '', // o una fecha por defecto
    },
    teacher_id: '',
    specialization: '',
    qualification: '',
    years_of_experience: 0,
    date_joined: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    employment_status: 'active'
  };

  editarModalVisible = false;
  profesorEditando: any = null;

  constructor(
    private teacherService: TeacherService,
    private noti: NotificacionService
  ) {}

  ngOnInit(): void {
    this.obtenerProfesores();
  }

  obtenerProfesores(page: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.teacherService.listarProfesores(page, pageSize, '', this.especialidadSeleccionada || undefined)
      .subscribe({
        next: (res) => {
          this.profesores = res.items;
          this.totalRecords = res.total;
          this.loading = false;
        },
        error: (err) => {
          this.noti.error('Error', 'Error al obtener profesores');
          this.loading = false;
          console.error('Error al obtener profesores:', err);
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
    this.obtenerProfesores(this.currentPage, this.pageSize);
  }

  abrirModalCrear() {
    this.nuevoProfesor = {
      user: {
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        groups: [2],
        phone_number: '70000000',
        address: 'Sin dirección',
        date_of_birth: '1990-01-01',
      },
      teacher_id: 'TCH-' + Math.floor(Math.random() * 100000), // Genera un ID único de prueba
      specialization: '',
      qualification: '',
      years_of_experience: 0,
      date_joined: new Date().toISOString().slice(0, 10),
      employment_status: 'active'
    };
    this.crearModalVisible = true;
  }

  crearProfesor() {
    console.log('Enviando profesor:', this.nuevoProfesor);
    this.teacherService.crearProfesor(this.nuevoProfesor).subscribe({
      next: () => {
        this.crearModalVisible = false;
        this.obtenerProfesores();
        this.noti.success('Éxito', 'Profesor creado correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'Error al crear profesor');
        console.error('Error detalle:', err.error); // <-- Esto
      }
    });
  }

  abrirModalEditar(profesor: any) {
    this.profesorEditando = { ...profesor };
    this.editarModalVisible = true;
  }

  editarProfesor() {
    this.teacherService.actualizarProfesor(this.profesorEditando.user_id, this.profesorEditando).subscribe({
      next: () => {
        this.editarModalVisible = false;
        this.obtenerProfesores();
        this.noti.success('Éxito', 'Profesor editado correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'Error al editar profesor');
        console.error(err);
      }
    });
  }

  eliminarProfesor(profesor: any) {
    if (confirm(`¿Seguro que deseas eliminar al profesor "${profesor.user_full_name}"?`)) {
      this.teacherService.eliminarProfesor(profesor.user_id).subscribe({
        next: () => {
          this.obtenerProfesores();
          this.noti.success('Éxito', 'Profesor eliminado correctamente');
        },
        error: (err) => {
          this.noti.error('Error', 'Error al eliminar profesor');
          console.error(err);
        }
      });
    }
  }
}

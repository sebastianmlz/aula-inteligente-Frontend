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

  // Añade esta propiedad en la clase
  originalEmail: string = '';

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
          // Asegúrate de que todos los campos necesarios estén presentes
          this.profesores = res.items.map((profesor: any) => ({
            ...profesor,
            // Si necesitas cualquier transformación o asegurar que ciertos campos estén presentes
          }));
          console.log('Profesores obtenidos:', this.profesores);
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
    // Asegúrate que el grupo siempre sea 2 (profesores)
    if (!this.nuevoProfesor.user) this.nuevoProfesor.user = {};
    this.nuevoProfesor.user.groups = [2];
    
    // Obtener el siguiente ID de profesor con el formato correcto: T020, T021, etc.
    this.teacherService.getNextTeacherId().subscribe({
      next: (nextId) => {
        // Asignar el ID generado al nuevo profesor
        this.nuevoProfesor.teacher_id = nextId;
        
        // Continuar con la creación del profesor
        this.teacherService.crearProfesor(this.nuevoProfesor).subscribe({
          next: () => {
            this.crearModalVisible = false;
            this.nuevoProfesor = this.initializeNuevoProfesor(); // Reiniciar el formulario
            this.obtenerProfesores(this.currentPage, this.pageSize);
            this.noti.success('Éxito', 'Profesor creado correctamente');
          },
          error: (err) => {
            this.noti.error('Error', 'No se pudo crear al profesor');
            console.error('Error al crear profesor:', err);
          }
        });
      },
      error: (err) => {
        this.noti.error('Error', 'No se pudo generar un ID para el profesor');
        console.error('Error al generar ID:', err);
      }
    });
  }

  // Método auxiliar para reiniciar el formulario
  initializeNuevoProfesor() {
    return {
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
      specialization: '',
      qualification: '',
      years_of_experience: 0,
      date_joined: new Date().toISOString().slice(0, 10),
      employment_status: 'active'
      // teacher_id se generará automáticamente
    };
  }

  abrirModalEditar(profesor: any) {
    console.log('Profesor a editar:', profesor); // Para depuración
    
    // Obtener información detallada del profesor
    this.teacherService.obtenerProfesor(profesor.user_id).subscribe({
      next: (detalleProfesor) => {
        console.log('Detalle del profesor:', detalleProfesor);
        
        // Guardar el email original para compararlo después
        this.originalEmail = detalleProfesor.user?.email || profesor.email || '';
        
        // Crear el objeto con los datos completos del profesor
        this.profesorEditando = {
          user_id: profesor.user_id,
          teacher_id: profesor.teacher_id,
          user: {
            first_name: detalleProfesor.user?.first_name || profesor.user_full_name?.split(' ')[0] || '',
            last_name: detalleProfesor.user?.last_name || 
                      (profesor.user_full_name ? profesor.user_full_name.split(' ').slice(1).join(' ') : ''),
            email: detalleProfesor.user?.email || profesor.email || '',
            phone_number: detalleProfesor.user?.phone_number || "70000000",
            address: detalleProfesor.user?.address || "Sin dirección",
            date_of_birth: detalleProfesor.user?.date_of_birth || "1990-01-01",
            groups: [2]
          },
          specialization: detalleProfesor.specialization || profesor.specialization || '',
          qualification: detalleProfesor.qualification || profesor.qualification || '',
          years_of_experience: detalleProfesor.years_of_experience || profesor.years_of_experience || 0,
          date_joined: detalleProfesor.date_joined || new Date().toISOString().slice(0, 10),
          employment_status: detalleProfesor.employment_status || profesor.employment_status || 'active'
        };
        
        // Abrir el modal
        this.editarModalVisible = true;
      },
      error: (err) => {
        console.error('Error al obtener detalles del profesor:', err);
        this.noti.error('Error', 'No se pudieron cargar los datos del profesor');
        
        // Intenta abrir el modal con los datos disponibles en la tabla
        this.profesorEditando = {
          user_id: profesor.user_id,
          teacher_id: profesor.teacher_id,
          user: {
            first_name: profesor.user_full_name?.split(' ')[0] || '',
            last_name: profesor.user_full_name?.split(' ').slice(1).join(' ') || '',
            email: profesor.email || '',
            phone_number: "70000000",
            address: "Sin dirección",
            date_of_birth: "1990-01-01",
            groups: [2]
          },
          specialization: profesor.specialization || '',
          qualification: profesor.qualification || '',
          years_of_experience: profesor.years_of_experience || 0,
          date_joined: new Date().toISOString().slice(0, 10),
          employment_status: profesor.employment_status || 'active'
        };
        
        this.editarModalVisible = true;
      }
    });
  }

  editarProfesor() {
    // Asegurarse de que years_of_experience sea un número
    this.profesorEditando.years_of_experience = 
      parseInt(this.profesorEditando.years_of_experience, 10) || 0;

    // Validaciones
    if (!this.profesorEditando.user.first_name || 
        !this.profesorEditando.user.last_name || 
        !this.profesorEditando.specialization) {
      this.noti.error('Error', 'Todos los campos obligatorios deben estar completos');
      return;
    }

    // Log para depuración
    console.log('Actualizando profesor:', this.profesorEditando);
    
    // Pasar el email original al servicio
    this.teacherService.actualizarProfesor(
      this.profesorEditando.user_id, 
      this.profesorEditando,
      this.originalEmail
    ).subscribe({
      next: () => {
        this.editarModalVisible = false;
        this.obtenerProfesores();
        this.noti.success('Éxito', 'Profesor editado correctamente');
      },
      error: (err) => {
        this.noti.error('Error', 'Error al editar profesor: ' + (err.error?.detail || err.message || 'Error desconocido'));
        console.error('Error completo:', err);
      }
    });
  }

  eliminarProfesor(profesor: any) {
    if (confirm(`¿Seguro que deseas eliminar al profesor "${profesor.full_name}"?`)) {
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

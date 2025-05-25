import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { StudentService } from '../../services/student.service';
import { first } from 'rxjs';
import { AuthService } from '../../../autenticacion/services/auth.service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
    imports: [
    CommonModule,
    TableModule,
    ToolbarModule,
    ButtonModule,
    FileUploadModule,
    TagModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ToastModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    // RouterLink
  ],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.css'
})
export class GestionUsuariosComponent implements OnInit {
  usuarios: any[] = [];


  // Propiedades para paginación
  currentPage: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;
  totalPages: number = 0;
  hasNextPage: boolean = false;
  hasPrevPage: boolean = false;
  loading: boolean = false;
  
  editModalVisible: boolean = false;
  estudianteEditando: any = null;
  formEstudiante: any = {};
  usuarioEditando: any = {};
  editarModalVisible: boolean = false;
  registroModalVisible: boolean = false;
  nuevoUsuario: any = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    groups: null
  };

  roles = [
    { label: 'Administrador', value: 1 },
    { label: 'Docente', value: 2 },
    { label: 'Estudiante', value: 3 }
  ];

  constructor(
    private userService: UserService,
    private studentService: StudentService,
    private noti: NotificacionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.obtenerUsuarios();
  }

  obtenerUsuarios(page: number = 1, pageSize: number = 10): void {
    this.userService.obtenerUsers(page, this.pageSize).subscribe({
      next: (res) => {
        this.usuarios = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.totalPages = res.pages;
        this.hasNextPage = res.has_next;
        this.hasPrevPage = res.has_prev;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
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
    this.obtenerUsuarios(this.currentPage, this.pageSize);
  }

  cambiarPagina(nuevaPagina: number) {
    this.obtenerUsuarios(nuevaPagina);
  }

  editarUsuario(usuario: any): void {
    this.usuarioEditando = {
      ...usuario,
      user: {
        id: usuario.user?.id || usuario.id, // <-- Aquí debe ser el id del usuario, no del estudiante
        first_name: usuario.first_name || usuario.user?.first_name || '',
        last_name: usuario.last_name || usuario.user?.last_name || '',
      },
      parent_name: usuario.parent_name,
      parent_contact: usuario.parent_contact,
      parent_email: usuario.parent_email,
      enrollment_date: usuario.enrollment_date,
      // Otros campos...
    };
    this.editarModalVisible = true;
    console.log("usuario a editar:", this.usuarioEditando);
  }

  actualizarUsuario(): void {
    if (
      !this.usuarioEditando.user.first_name?.trim() ||
      !this.usuarioEditando.user.last_name?.trim() ||
      !this.usuarioEditando.email?.trim()
    ) {
      this.noti.warn('Campos incompletos', 'Por favor, completa todos los campos requeridos.');
      return;
    }

    // Construir el objeto a enviar con los datos anidados en user
    const estudianteAEnviar: any = {
      email: this.usuarioEditando.email,
      user: {
        id: this.usuarioEditando.user?.id,
        first_name: this.usuarioEditando.first_name, // <-- toma el valor editado
        last_name: this.usuarioEditando.last_name,   // <-- toma el valor editado
      },
      parent_name: this.usuarioEditando.parent_name,
      parent_contact: this.usuarioEditando.parent_contact,
      parent_email: this.usuarioEditando.parent_email,
      enrollment_date: this.usuarioEditando.enrollment_date,
      // Otros campos...
    };
    console.log("estudiante a enviar editado:", estudianteAEnviar);
    this.studentService.actualizarEstudiante(
      this.usuarioEditando.id || this.usuarioEditando.student_id,
      estudianteAEnviar
    ).subscribe({
      next: (res) => {
        this.obtenerUsuarios(this.currentPage, this.pageSize);
        this.noti.success('Actualización exitosa', 'El estudiante fue actualizado correctamente.');
        console.log('Estudiante actualizado:', res);
        this.editarModalVisible = false;
      },
      error: (err) => {
        console.error('Error al actualizar el estudiante', err);
        this.noti.error('Error', 'No se pudo actualizar el estudiante.');
      }
    });
  }

  eliminarUsuario(usuario: any) {
    // Lógica para eliminar el usuario
  }

  abrirModalEditar(usuario: any) {
    this.estudianteEditando = usuario;
    // Copia profunda para evitar modificar el original hasta guardar
    this.formEstudiante = JSON.parse(JSON.stringify(usuario));
    this.editModalVisible = true;
  }

  abrirModalRegistro() {
    this.nuevoUsuario = {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      groups: null
    };
    this.registroModalVisible = true;
  }

  registrarUsuario() {
    // El backend espera groups como array
    const usuarioARegistrar = {
      ...this.nuevoUsuario,
      groups: [this.nuevoUsuario.groups]
    };
    this.authService.registrarUsuario(usuarioARegistrar).subscribe({
      next: (res) => {
        this.noti.success('Usuario registrado', 'El usuario fue registrado correctamente.');
        console.log("Respuesta del backend al registrar un usuario:", res);
        this.registroModalVisible = false;
        this.obtenerUsuarios();
      },
      error: (err) => {
        this.noti.error('Error', err?.error?.detail || 'No se pudo registrar el usuario.');
      }
    });
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Nuevo import
import { ConfirmationService } from 'primeng/api'; // Nuevo import
import { StudentService } from '../../services/student.service';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';
import { FormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { CalificacionService } from '../../../gestion-academica/services/calificacion.service';
import { EnrollmentService } from '../../../gestion-academica/services/enrollment.service';
import { MateriaService } from '../../../gestion-academica/services/materia.service';
import { CursoService } from '../../../gestion-academica/services/curso.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../../autenticacion/services/auth.service'; // Agregar importación del servicio de autenticación

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
    TabViewModule,
    DropdownModule,
    TooltipModule,
    ConfirmDialogModule // Nuevo módulo
  ],
  providers: [
    ConfirmationService // Nuevo servicio
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

  // Añade estas propiedades justo después de la declaración de otras propiedades, por ejemplo después de loadingHistorial
  // Añadir para las predicciones académicas
  prediccionRendimiento: any = null;
  comparacionRendimiento: any = null;
  loadingPredicciones: boolean = false;

  // Añade esta nueva propiedad para el historial de calificaciones
  historialCalificaciones: any = {};
  loadingHistorial: boolean = false;

  // Añadir estas propiedades a la clase GestionEstudiantesComponent
  crearModalVisible = false;
  nuevoEstudiante: any = {
    user: {
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      groups: [3], // grupo estudiante
      phone_number: '',
      address: 'Sin dirección',
      date_of_birth: '2010-01-01', // fecha por defecto para estudiantes
    },
    student_id: '',
    parent_name: '',
    parent_email: '',
    emergency_contact: '',
    enrollment_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
    current_course: ''
  };

  matriculacionModalVisible: boolean = false;
  estudianteSeleccionado: any = null;
  matriculaData: any = {
    student: null,
    course: null,
    subject: null,
    period: 1,  // Default 2024
    status: 'active'
  };

  cursos: any[] = [];
  materias: any[] = [];
  periodos: any[] = [
    { label: '2024', value: 1 },
    { label: '2025', value: 2 }
  ];

  // Añadir estas propiedades a la clase
  cursoOptions: any[] = [
    { label: '1° Primaria (P1)', value: 'P1' },
    { label: '2° Primaria (P2)', value: 'P2' },
    { label: '3° Primaria (P3)', value: 'P3' },
    { label: '4° Primaria (P4)', value: 'P4' },
    { label: '5° Primaria (P5)', value: 'P5' },
    { label: '6° Primaria (P6)', value: 'P6' },
    { label: '1° Secundaria (S1)', value: 'S1' },
    { label: '2° Secundaria (S2)', value: 'S2' },
    { label: '3° Secundaria (S3)', value: 'S3' },
    { label: '4° Secundaria (S4)', value: 'S4' },
    { label: '5° Secundaria (S5)', value: 'S5' },
    { label: '6° Secundaria (S6)', value: 'S6' }
  ];

  selectedCursoForId: string = 'P1'; // Valor por defecto

  // Añadir propiedades para edición
  editarModalVisible = false;
  estudianteEditar: any = {
    user: {
      email: '',
      first_name: '',
      last_name: '',
      groups: [3]
    },
    student_id: '',
    parent_name: '',
    parent_email: '',
    emergency_contact: '',
    enrollment_date: ''
  };

  // Agregar el import del servicio
  constructor(
    private studentService: StudentService,
    private noti: NotificacionService,
    private calificacionService: CalificacionService,
    private enrollmentService: EnrollmentService,
    private materiaService: MateriaService,
    private cursoService: CursoService,
    private confirmationService: ConfirmationService,
    private analyticsService: AnalyticsService, // Añadir el servicio aquí
    private authService: AuthService // Nuevo servicio agregado
  ) {}

  // Agregar estos métodos
  /**
   * Obtiene la predicción de rendimiento para un estudiante
   */
  obtenerPrediccion(estudiante: any) {
    console.log('%c INICIANDO OBTENER PREDICCIÓN ', 'background: #0066cc; color: white; font-size: 14px;');
    this.debugEstudiante(estudiante);
    
    // Verificar si el ID de usuario es válido
    if (!estudiante || !estudiante.user || !estudiante.user.id) {
      console.error('ID de usuario no válido:', estudiante);
      this.noti.error('Error', 'No se puede obtener predicción: ID de usuario no válido');
      return;
    }

    // Asegurarse de que el ID sea un número
    const userId = Number(estudiante.user.id);
    console.log('ID de usuario convertido a Number:', userId);
    
    this.loadingPredicciones = true;
    this.prediccionRendimiento = null;
    this.comparacionRendimiento = null; // Cerrar cualquier comparación previa
    
    this.analyticsService.obtenerPrediccionRendimiento(userId).subscribe({
      next: (res) => {
        console.log('%c PREDICCIÓN RECIBIDA ', 'background: #00cc66; color: white; font-size: 14px;');
        console.log('Respuesta completa:', res);
        this.prediccionRendimiento = res;
        this.loadingPredicciones = false;
        
        // Verificar si la predicción es menor a 80 y mostrar alerta
        const prediccion = res.predicted_next_trimester_avg_grade;
        const nombreEstudiante = `${estudiante.user.first_name} ${estudiante.user.last_name}`;
        
        if (prediccion < 80) {
          this.noti.alertaRendimiento(nombreEstudiante, prediccion);
        }
      },
      error: (err) => {
        console.log('%c ERROR EN PREDICCIÓN ', 'background: #cc0000; color: white; font-size: 14px;');
        console.error('Error al obtener predicción:', err);
        this.noti.error('Error', 'No se pudo obtener la predicción de rendimiento: ' + 
                      (err.error?.detail || err.message || 'Error desconocido'));
        this.loadingPredicciones = false;
      }
    });
  }

  /**
   * Compara el rendimiento actual vs predicho para un estudiante
   */
  compararRendimiento(estudiante: any) {
    console.log('%c INICIANDO COMPARACIÓN DE RENDIMIENTO ', 'background: #0066cc; color: white; font-size: 14px;');
    this.debugEstudiante(estudiante);
    
    // Verificar si el ID de usuario es válido
    if (!estudiante || !estudiante.user || !estudiante.user.id) {
      console.error('ID de usuario no válido:', estudiante);
      this.noti.error('Error', 'No se puede comparar rendimiento: ID de usuario no válido');
      return;
    }

    // Asegurarse de que el ID sea un número
    const userId = Number(estudiante.user.id);
    console.log('ID de usuario convertido a Number:', userId);
    
    this.loadingPredicciones = true;
    this.comparacionRendimiento = null;
    
    this.analyticsService.compararRendimiento(userId).subscribe({
      next: (res) => {
        console.log('%c COMPARACIÓN RECIBIDA ', 'background: #00cc66; color: white; font-size: 14px;');
        console.log('Respuesta completa:', res);
        this.comparacionRendimiento = res;
        this.loadingPredicciones = false;
      },
      error: (err) => {
        console.log('%c ERROR EN COMPARACIÓN ', 'background: #cc0000; color: white; font-size: 14px;');
        console.error('Error al comparar rendimiento:', err);
        console.error('Mensaje de error:', err.message);
        console.error('Status code:', err.status);
        console.error('Error completo:', JSON.stringify(err, null, 2));
        this.noti.error('Error', 'No se pudo obtener la comparación de rendimiento: ' + 
                       (err.error?.detail || err.message || 'Error desconocido'));
        this.loadingPredicciones = false;
      }
    });
  }

  ngOnInit(): void {
    // Verificar el rol del usuario
    this.isAdmin = this.authService.isAdmin();
    
    // Cargar estudiantes y configuración inicial
    this.obtenerEstudiantes();
    this.cargarOpcionesFiltros();
  }

    cargarOpcionesFiltros() {
    this.cursoService.obtenerCursos(1, 100).subscribe(res => {
      this.cursos = res.items || res;
    });
    
    this.materiaService.obtenerMaterias(1, 100).subscribe(res => {
      this.materias = res.items || res;
    });
  }

  // Agregar este método para filtrar estudiantes por profesor (si es un profesor)
  obtenerEstudiantes(page: number = 1, pageSize: number = 10, search: string = '', gradeLevel?: string): void {
    this.loading = true;
    
    // Asegurarse de que se está pasando correctamente el parámetro search
    const searchTerm = search || this.filtros.search || '';
    
    // Para profesores, podríamos tener una lógica diferente (como mostrar solo sus estudiantes)
    if (!this.isAdmin && this.authService.getRole() === 'Teacher') {
      // Aquí podrías llamar a un endpoint específico para obtener solo los estudiantes del profesor
      // O agregar un parámetro adicional para filtrar por ID del profesor
    
      // Para este ejemplo, seguimos utilizando el mismo servicio
      this.studentService.listarEstudiantes(
        page,
        pageSize,
        searchTerm,
        gradeLevel,
        // Potencialmente aquí podrías pasar el ID del profesor para filtrar
      ).subscribe({
        next: (res) => {
          this.estudiantes = res.items;
          this.totalRecords = res.total;
          this.loading = false;
          
          // Verificar predicciones después de cargar estudiantes
          // Descomentar cuando quieras activar esta funcionalidad
          // this.verificarPrediccionesEstudiantes();
        },
        error: (err) => {
          this.noti.error('Error', 'Error al obtener estudiantes');
          this.loading = false;
          console.error('Error al obtener estudiantes:', err);
        }
      });
    } else {
      // Comportamiento normal para administradores
      this.studentService.listarEstudiantes(
        page,
        pageSize,
        searchTerm,
        gradeLevel
      ).subscribe({
        next: (res) => {
          this.estudiantes = res.items;
          this.totalRecords = res.total;
          this.loading = false;
          
          // Verificar predicciones después de cargar estudiantes
          // Descomentar cuando quieras activar esta funcionalidad
          // this.verificarPrediccionesEstudiantes();
        },
        error: (err) => {
          this.noti.error('Error', 'Error al obtener estudiantes');
          this.loading = false;
          console.error('Error al obtener estudiantes:', err);
        }
      });
    }
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
    this.prediccionRendimiento = null;
    this.comparacionRendimiento = null;
    
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
    this.obtenerEstudiantes(this.currentPage, this.pageSize, this.filtros.search);
  }

  // Método auxiliar para obtener las claves del objeto historialCalificaciones
  getMateriasKeys(): string[] {
    if (!this.historialCalificaciones || typeof this.historialCalificaciones !== 'object') {
      return [];
    }
    return Object.keys(this.historialCalificaciones);
  }

  // Modificar el método abrirModalCrear
  abrirModalCrear() {
    // Reiniciar el formulario
    this.nuevoEstudiante = {
      user: {
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        groups: [3], // grupo estudiante
        phone_number: '70000000',
        address: 'Sin dirección',
        date_of_birth: '2010-01-01',
      },
      parent_name: '',
      parent_email: '',
      emergency_contact: '',
      enrollment_date: new Date().toISOString().slice(0, 10),
      current_course: ''
    };
    
    // Valor por defecto para el curso
    this.selectedCursoForId = 'P1';
    
    this.crearModalVisible = true;
  }

  // Modificar para que retorne una promesa
  generarIdEstudiante(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedCursoForId) {
        this.noti.error('Error', 'Debe seleccionar un curso para generar el ID');
        reject('No se seleccionó un curso');
        return;
      }
      
      const cursoPrefix = this.selectedCursoForId;
      
      this.studentService.listarEstudiantes(1, 1000).subscribe({
        next: (res) => {
          // Comenzar desde 400 como se solicitó
          let maxNumber = 399;
          
          if (res.items && res.items.length > 0) {
            // Filtrar estudiantes del mismo curso prefix
            const estudiantesMismoCurso = res.items.filter((estudiante: any) => 
              estudiante.student_id && estudiante.student_id.startsWith(cursoPrefix + '-')
            );
            
            if (estudiantesMismoCurso.length > 0) {
              estudiantesMismoCurso.forEach((estudiante: any) => {
                // Extraer el número después del prefijo (ej: "S4-401" -> "401")
                const numStr = estudiante.student_id.split('-')[1];
                const num = parseInt(numStr, 10);
                if (!isNaN(num) && num > maxNumber) {
                  maxNumber = num;
                }
              });
            }
          }
          
          // Incrementar para el siguiente ID
          maxNumber += 1;
          
          // Formatear el ID con el prefijo del curso
          const studentId = `${cursoPrefix}-${maxNumber}`;
          this.nuevoEstudiante.student_id = studentId;
          
          console.log('ID generado:', this.nuevoEstudiante.student_id);
          resolve(studentId);
        },
        error: (err) => {
          console.error('Error al generar ID:', err);
          reject('Error al generar ID');
        }
      });
    });
  }

  async crearEstudiante() {
    try {
      // Validar email antes de continuar
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailRegex.test(this.nuevoEstudiante.user.email)) {
        this.noti.error('Error', 'El correo electrónico no es válido');
        return;
      }
      
      // Asegurar que el grupo siempre sea 3 (estudiantes)
      this.nuevoEstudiante.user.groups = [3];
      
      // Mostrar indicador de carga
      this.loading = true;
      
      // Preparar datos - eliminar campos vacíos que podrían causar problemas
      if (this.nuevoEstudiante.current_course === '') {
        delete this.nuevoEstudiante.current_course;
      }
      
      // Generar el ID si no existe
      if (!this.nuevoEstudiante.student_id) {
        try {
          await this.generarIdEstudiante();
        } catch (error) {
          this.loading = false;
          return; // Ya se mostró el error en generarIdEstudiante
        }
      }
      
      // Ahora que tenemos el ID, enviar los datos
      console.log('Datos del nuevo estudiante:', this.nuevoEstudiante);
      
      this.studentService.crearEstudiante(this.nuevoEstudiante).subscribe({
        next: () => {
          this.loading = false;
          this.crearModalVisible = false;
          this.obtenerEstudiantes(this.currentPage, this.pageSize);
          this.noti.success('Éxito', 'Estudiante creado correctamente');
        },
        error: (err) => {
          this.loading = false;
          this.noti.error('Error', 'No se pudo crear al estudiante: ' + (err.error?.detail || err.message || 'Error desconocido'));
          console.error('Error al crear estudiante:', err);
        }
      });
    } catch (error) {
      this.loading = false;
      this.noti.error('Error', 'Ocurrió un error inesperado');
      console.error('Error en proceso de creación:', error);
    }
  }

  // Método para abrir el modal de matriculación
  abrirModalMatriculacion(estudiante: any) {
    this.estudianteSeleccionado = estudiante;
    
    // Resetear datos de matriculación
    this.matriculaData = {
      student: estudiante.user_id,
      course: null,
      subject: null,
      period: 1, // Por defecto 2024
      status: 'active'
    };
    
    this.matriculacionModalVisible = true;
  }

  // Método para procesar la matriculación del estudiante
  matricularEstudiante() {
    if (!this.matriculaData.course || !this.matriculaData.subject) {
      this.noti.error('Error', 'Debe seleccionar curso y materia');
      return;
    }

    // Enviar la solicitud al servicio
    this.enrollmentService.matricularEstudiante(this.matriculaData).subscribe({
      next: () => {
        this.noti.success('Éxito', 'Estudiante matriculado correctamente');
        this.matriculacionModalVisible = false;
      },
      error: (err) => {
        console.error('Error al matricular:', err);
        this.noti.error('Error', 'No se pudo matricular al estudiante');
      }
    });
  }

  // Método para abrir el modal de edición
  abrirModalEditar(estudiante: any) {
    // Cargar los datos completos del estudiante
    this.loading = true;
    this.studentService.obtenerEstudiante(estudiante.user_id).subscribe({
      next: (res) => {
        this.estudianteEditar = JSON.parse(JSON.stringify(res)); // Clonar objeto para evitar referencias
        this.editarModalVisible = true;
        this.loading = false;
      },
      error: (err) => {
        this.noti.error('Error', 'No se pudieron cargar los datos del estudiante');
        console.error('Error al obtener datos del estudiante:', err);
        this.loading = false;
      }
    });
  }

  // Método para guardar los cambios del estudiante
  guardarCambiosEstudiante() {
    // Validar email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(this.estudianteEditar.user.email)) {
      this.noti.error('Error', 'El correo electrónico no es válido');
      return;
    }

    this.loading = true;
    // Asegurar que no enviamos campos innecesarios que puedan causar error
    const datosAEnviar = {
      user: {
        email: this.estudianteEditar.user.email,
        first_name: this.estudianteEditar.user.first_name,
        last_name: this.estudianteEditar.user.last_name,
        groups: [3]
      },
      parent_name: this.estudianteEditar.parent_name,
      parent_email: this.estudianteEditar.parent_email,
      emergency_contact: this.estudianteEditar.emergency_contact
    };

    this.studentService.actualizarEstudiante(this.estudianteEditar.user.id, datosAEnviar).subscribe({
      next: () => {
        this.loading = false;
        this.editarModalVisible = false;
        this.obtenerEstudiantes(this.currentPage, this.pageSize);
        this.noti.success('Éxito', 'Datos del estudiante actualizados correctamente');
      },
      error: (err) => {
        this.loading = false;
        this.noti.error('Error', 'No se pudieron actualizar los datos: ' + (err.error?.detail || err.message || 'Error desconocido'));
        console.error('Error al actualizar estudiante:', err);
      }
    });
  }

  // Método para confirmar eliminación
  confirmarEliminacion(estudiante: any) {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar a ${estudiante.full_name}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarEstudiante(estudiante.user_id);
      }
    });
  }

  // Método para eliminar estudiante
  eliminarEstudiante(id: number) {
    this.loading = true;
    this.studentService.eliminarEstudiante(id).subscribe({
      next: () => {
        this.obtenerEstudiantes(this.currentPage, this.pageSize);
        this.noti.success('Éxito', 'Estudiante eliminado correctamente');
        this.loading = false;
      },
      error: (err) => {
        this.noti.error('Error', 'No se pudo eliminar al estudiante: ' + (err.error?.detail || err.message || 'Error desconocido'));
        console.error('Error al eliminar estudiante:', err);
        this.loading = false;
      }
    });
  }

  // Agregar este método después de verPerfilAcademico() o antes de ngOnInit()
  /**
   * Método de depuración extendido para mostrar la estructura completa del objeto estudiante
   */
  debugEstudiante(estudiante: any) {
    console.log('%c DATOS COMPLETOS DEL ESTUDIANTE ', 'background: #222; color: #bada55; font-size: 16px;');
    console.log(JSON.stringify(estudiante, null, 2));
    
    console.log('%c DATOS PARA PREDICCIÓN ', 'background: #222; color: #bada55; font-size: 16px;');
    console.log('ID de usuario (user.id):', estudiante?.user?.id);
    console.log('Tipo de dato del ID:', typeof estudiante?.user?.id);
    console.log('Student ID:', estudiante?.student_id);
    console.log('Nombre completo:', estudiante?.user?.first_name + ' ' + estudiante?.user?.last_name);
  }

  // Agregar esta propiedad
  isAdmin: boolean = false;

  // Agregar este método para comprobar si el usuario es un profesor
  isProfesor(): boolean {
    return this.authService.getRole() === 'Teacher';
  }

  // Añadir este método para verificar las predicciones de todos los estudiantes
  verificarPrediccionesEstudiantes() {
    if (!this.estudiantes || this.estudiantes.length === 0) return;
    
    // Limitar a máximo 5 estudiantes para no sobrecargar con peticiones
    const estudiantesAVerificar = this.estudiantes.slice(0, 5);
    
    // Contador para saber cuándo se han completado todas las predicciones
    let completadas = 0;
    const totalAVerificar = estudiantesAVerificar.length;
    
    estudiantesAVerificar.forEach(estudiante => {
      if (!estudiante.user?.id) {
        completadas++;
        return;
      }
      
      const userId = Number(estudiante.user.id);
      this.analyticsService.obtenerPrediccionRendimiento(userId).subscribe({
        next: (res) => {
          completadas++;
          const prediccion = res.predicted_next_trimester_avg_grade;
          
          if (prediccion < 80) {
            const nombreEstudiante = `${estudiante.full_name}`;
            this.noti.warn(
              'Alerta de Rendimiento', 
              `Estudiante ${nombreEstudiante} tiene una predicción de: ${prediccion}`
            );
          }
          
          // Si es la última predicción, actualizar estado
          if (completadas === totalAVerificar) {
            console.log('Todas las predicciones verificadas');
          }
        },
        error: (err) => {
          completadas++;
          console.error(`Error al verificar predicción para ${estudiante.full_name}:`, err);
          
          // Si es la última predicción, actualizar estado
          if (completadas === totalAVerificar) {
            console.log('Todas las predicciones verificadas');
          }
        }
      });
    });
  }
} // Fin de la clase GestionEstudiantesComponent

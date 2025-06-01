import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog'; // Importamos Dialog
import { TagModule } from 'primeng/tag'; // Importamos Tag para mejorar visualización
import { BitacoraService } from '../../services/bitacora.service';
import { NotificacionService } from '../../../autenticacion/services/notificacion.service';

interface LogEntry {
  id: number;
  user?: string;
  user_email?: string;
  user_id?: number;
  action: string;
  table_name?: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  description?: string;
  ip_address?: string;
  created_at: string;
  updated_at?: string;
  details?: any;
}

@Component({
  selector: 'app-gestion-bitacora',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    CalendarModule,
    ToastModule,
    CardModule,
    DialogModule,
    TagModule
  ],
  templateUrl: './gestion-bitacora.component.html',
  styleUrl: './gestion-bitacora.component.css'
})
export class GestionBitacoraComponent implements OnInit {
  // Propiedades para filtrado
  filtros: any = {
    action: '',
    level: '',
    user: '',
    table_name: '',
    start_date: '',
    end_date: '',
    search: ''
  };

  // Opciones para los dropdowns
  nivelOptions = [
    { label: 'Información', value: 'INFO' },
    { label: 'Advertencia', value: 'WARNING' },
    { label: 'Error', value: 'ERROR' }
  ];

  accionOptions = [
    { label: 'Crear', value: 'CREATE' },
    { label: 'Actualizar', value: 'UPDATE' },
    { label: 'Eliminar', value: 'DELETE' },
    { label: 'Error', value: 'ERROR' },
    { label: 'Login', value: 'LOGIN' },
    { label: 'Logout', value: 'LOGOUT' }
  ];

  // Propiedades para paginación y datos
  logs: LogEntry[] = [];
  loading: boolean = false;
  totalRecords: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  resultadosBusqueda: boolean = false;

  // Nuevas propiedades para el diálogo
  displayDetailDialog: boolean = false;
  selectedLog: LogEntry | null = null;

  constructor(
    private bitacoraService: BitacoraService,
    private noti: NotificacionService
  ) {}

  ngOnInit() {
    // Si se quiere cargar automáticamente al iniciar
    // this.buscar();
  }

  /**
   * Buscar logs con los filtros aplicados
   */
  buscar(page: number = 1) {
    this.loading = true;
    
    // Convertir fechas al formato esperado por la API (YYYY-MM-DD)
    if (this.filtros.start_date && typeof this.filtros.start_date === 'object') {
      this.filtros.start_date = this.formatDate(this.filtros.start_date);
    }
    
    if (this.filtros.end_date && typeof this.filtros.end_date === 'object') {
      this.filtros.end_date = this.formatDate(this.filtros.end_date);
    }
    
    // Eliminar filtros vacíos
    const filtrosLimpios = Object.fromEntries(
      Object.entries(this.filtros).filter(([k, v]) => v !== '' && v !== null && v !== undefined)
    );
    
    this.bitacoraService.listarLogs(filtrosLimpios, page, this.pageSize).subscribe({
      next: (res) => {
        this.logs = res.items;
        this.totalRecords = res.total;
        this.currentPage = res.page;
        this.pageSize = res.page_size;
        this.loading = false;
        this.resultadosBusqueda = true;
      },
      error: (err) => {
        console.error('Error al obtener logs:', err);
        this.loading = false;
        this.noti.error('Error', 'No se pudieron cargar los registros de la bitácora');
      }
    });
  }

  /**
   * Gestión del cambio de página
   */
  onPageChange(event: any): void {
    if (event.page !== undefined) {
      this.currentPage = event.page + 1;
      this.pageSize = event.rows;
    } else if (event.first !== undefined) {
      this.currentPage = Math.floor(event.first / event.rows) + 1;
      this.pageSize = event.rows;
    }
    this.buscar(this.currentPage);
  }

  /**
   * Resetea los filtros de búsqueda
   */
  limpiarFiltros(): void {
    this.filtros = {
      action: '',
      level: '',
      user: '',
      table_name: '',
      start_date: '',
      end_date: '',
      search: ''
    };
    this.resultadosBusqueda = false;
    this.logs = [];
  }

  /**
   * Convierte un objeto Date a string en formato YYYY-MM-DD
   */
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Retorna una clase CSS según el nivel del log
   */
  getNivelClass(nivel: string): string {
    switch (nivel) {
      case 'ERROR': return 'bg-red-100 text-red-800';
      case 'WARNING': return 'bg-yellow-100 text-yellow-800';
      case 'INFO': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Muestra el modal con detalles del log
   */
  showDetails(log: LogEntry) {
    this.selectedLog = log;
    this.displayDetailDialog = true;
  }

  /**
   * Retorna la severidad del tag según el nivel
   */
  getSeverity(level: string): string {
    switch (level) {
      case 'ERROR': return 'danger';
      case 'WARNING': return 'warning';
      case 'INFO': return 'info';
      default: return 'info';
    }
  }
}

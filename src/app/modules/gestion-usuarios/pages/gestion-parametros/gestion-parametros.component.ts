import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';

// PrimeNG Components
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { ParametroService, Period, Trimester } from '../../services/parametro.service';

@Component({
  selector: 'app-gestion-parametros',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    CalendarModule,
    InputSwitchModule,
    TooltipModule,
    ToolbarModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './gestion-parametros.component.html',
  styleUrl: './gestion-parametros.component.css'
})
export class GestionParametrosComponent implements OnInit {
  // Signals
  loadingPeriodos = signal<boolean>(false);
  loadingTrimestres = signal<boolean>(false);
  periodos = signal<Period[]>([]);
  trimestres = signal<Trimester[]>([]);
  
  // Filtros
  filtroPeriodos = {
    active: undefined, // Inicialmente mostrar todos los periodos
    search: '',
    page: 1,
    page_size: 10
  };
  
  filtroTrimestres = {
    search: '',
    page: 1,
    page_size: 10
  };

  // Active tab
  activeTabIndex = 0;

  // Estado para activar/desactivar
  cambiandoEstado = signal<boolean>(false);

  // Modal de nuevo periodo
  dialogoPeriodoVisible = signal<boolean>(false);
  guardandoPeriodo = signal<boolean>(false);
  
  // Nuevo periodo
  nuevoPeriodo: Partial<Period> = {
    name: '',
    start_date: '',
    end_date: '',
    is_active: true
  };

  // Signal para eliminar periodo
  eliminandoPeriodo = signal<boolean>(false);

  // Modal de nuevo/editar trimestre
  dialogoTrimestreVisible = signal<boolean>(false);
  guardandoTrimestre = signal<boolean>(false);
  eliminandoTrimestre = signal<boolean>(false);

  // Nuevo/editar trimestre
  nuevoTrimestre: Partial<Trimester> & { id?: number } = {
    name: '',
    period: undefined, // Cambiar null a undefined
    start_date: '',
    end_date: ''
  };

  // Para la selección de periodo
  periodosParaSelector: {label: string, value: number}[] = [];

  // Modo edición para trimestre
  modoEdicionTrimestre = false;

  constructor(
    private parametroService: ParametroService,
    public messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarPeriodos();
    this.cargarTrimestres();
  }

  /**
   * Carga la lista de periodos académicos
   */
  cargarPeriodos(): void {
    this.loadingPeriodos.set(true);
    
    this.parametroService.obtenerPeriodos(this.filtroPeriodos)
      .pipe(finalize(() => this.loadingPeriodos.set(false)))
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.periodos.set(response.items);
          } else {
            this.periodos.set([]);
          }
        },
        error: (err) => {
          console.error('Error al cargar periodos:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los periodos académicos'
          });
        }
      });
  }

  /**
   * Carga la lista de trimestres académicos
   */
  cargarTrimestres(): void {
    this.loadingTrimestres.set(true);
    
    this.parametroService.obtenerTrimestres(this.filtroTrimestres)
      .pipe(finalize(() => this.loadingTrimestres.set(false)))
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.trimestres.set(response.items);
          } else {
            this.trimestres.set([]);
          }
        },
        error: (err) => {
          console.error('Error al cargar trimestres:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los trimestres académicos'
          });
        }
      });
  }

  /**
   * Cambia el estado activo/inactivo de un periodo
   */
  cambiarEstadoPeriodo(periodo: Period): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea ${periodo.is_active ? 'desactivar' : 'activar'} el periodo "${periodo.name}"?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.cambiandoEstado.set(true);
        
        this.parametroService.actualizarPeriodo(periodo.id, {
          is_active: !periodo.is_active
        })
        .pipe(finalize(() => this.cambiandoEstado.set(false)))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Periodo ${periodo.is_active ? 'desactivado' : 'activado'} correctamente`
            });
            this.cargarPeriodos();
          },
          error: (err) => {
            console.error('Error al cambiar estado del periodo:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo cambiar el estado del periodo'
            });
          }
        });
      }
    });
  }

  /**
   * Filtra la lista de periodos
   */
  buscarPeriodos(): void {
    this.filtroPeriodos.page = 1;
    this.cargarPeriodos();
  }

  /**
   * Filtra la lista de trimestres
   */
  buscarTrimestres(): void {
    this.filtroTrimestres.page = 1;
    this.cargarTrimestres();
  }

  /**
   * Limpia los filtros de periodos
   */
  limpiarFiltroPeriodos(): void {
    this.filtroPeriodos = {
      active: undefined, // Mostrar todos
      search: '',
      page: 1,
      page_size: 10
    };
    this.cargarPeriodos();
  }

  /**
   * Limpia los filtros de trimestres
   */
  limpiarFiltroTrimestres(): void {
    this.filtroTrimestres = {
      search: '',
      page: 1,
      page_size: 10
    };
    this.cargarTrimestres();
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString();
  }

  /**
   * Abre el diálogo para crear un nuevo periodo
   */
  abrirDialogoPeriodo(): void {
    this.nuevoPeriodo = {
      name: '',
      start_date: '',
      end_date: '',
      is_active: true
    };
    this.dialogoPeriodoVisible.set(true);
  }

  /**
   * Guarda el nuevo periodo académico
   */
  guardarPeriodo(): void {
    // Validación básica
    if (!this.nuevoPeriodo.name || !this.nuevoPeriodo.start_date || !this.nuevoPeriodo.end_date) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios'
      });
      return;
    }

    // Convertir fechas a objetos Date para la validación
    const startDate = new Date(this.nuevoPeriodo.start_date);
    const endDate = new Date(this.nuevoPeriodo.end_date);
    
    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (startDate >= endDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
      return;
    }
    
    // Crear una copia del objeto para enviar al backend
    const periodoToSend: Partial<Period> = {
      name: this.nuevoPeriodo.name,
      is_active: this.nuevoPeriodo.is_active,
      // Formatear las fechas directamente sin usar instanceof
      start_date: this.formatDateForBackend(startDate),
      end_date: this.formatDateForBackend(endDate)
    };
    
    this.guardandoPeriodo.set(true);
    
    this.parametroService.crearPeriodo(periodoToSend)
      .pipe(finalize(() => this.guardandoPeriodo.set(false)))
      .subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Periodo académico creado correctamente'
          });
          this.dialogoPeriodoVisible.set(false);
          this.cargarPeriodos();
        },
        error: (err) => {
          console.error('Error al crear periodo:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el periodo académico: ' + 
                  (err.error?.detail || err.message || 'Error desconocido')
          });
        }
      });
  }

  /**
   * Formatea una fecha al formato YYYY-MM-DD que espera el backend
   */
  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Confirma la eliminación de un periodo académico
   */
  confirmarEliminarPeriodo(periodo: Period): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el periodo "${periodo.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarPeriodo(periodo);
      }
    });
  }

  /**
   * Elimina un periodo académico
   */
  eliminarPeriodo(periodo: Period): void {
    this.eliminandoPeriodo.set(true);
    
    this.parametroService.eliminarPeriodo(periodo.id)
      .pipe(finalize(() => this.eliminandoPeriodo.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Periodo "${periodo.name}" eliminado correctamente`
          });
          this.cargarPeriodos(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar periodo:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el periodo: ' + 
                  (err.error?.detail || err.message || 'Error desconocido')
          });
        }
      });
  }

  /**
   * Abre el diálogo para crear un nuevo trimestre
   */
  abrirDialogoTrimestre(): void {
    this.modoEdicionTrimestre = false;
    this.nuevoTrimestre = {
      id: undefined,
      name: '',
      period: undefined, // Cambiar null a undefined
      start_date: '',
      end_date: ''
    };
    this.cargarPeriodosParaSelector();
    this.dialogoTrimestreVisible.set(true);
  }

  /**
   * Abre el diálogo para editar un trimestre existente
   */
  abrirDialogoEditarTrimestre(trimestre: Trimester): void {
    this.modoEdicionTrimestre = true;
    
    this.nuevoTrimestre = {
      id: trimestre.id, // Asegurarse de guardar el ID para la edición
      name: trimestre.name,
      period: trimestre.period,
      start_date: trimestre.start_date,
      end_date: trimestre.end_date
    };
    
    this.cargarPeriodosParaSelector();
    this.dialogoTrimestreVisible.set(true);
  }

  /**
   * Carga la lista de periodos para el selector de periodos
   */
  cargarPeriodosParaSelector(): void {
    // Se usa el mismo servicio de obtenerPeriodos pero sin paginación
    this.parametroService.obtenerPeriodos({ active: true })
      .subscribe({
        next: (response) => {
          if (response && response.items) {
            this.periodosParaSelector = response.items.map((p: Period) => ({ // Añadir tipo explícito
              label: p.name,
              value: p.id
            }));
          }
        },
        error: (err) => {
          console.error('Error al cargar periodos para selector:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los periodos'
          });
        }
      });
  }

  /**
   * Guarda el nuevo trimestre académico o actualiza uno existente
   */
  guardarTrimestre(): void {
    // Validación básica
    if (!this.nuevoTrimestre.name || !this.nuevoTrimestre.period || !this.nuevoTrimestre.start_date || !this.nuevoTrimestre.end_date) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Todos los campos son obligatorios'
      });
      return;
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    const startDate = new Date(this.nuevoTrimestre.start_date);
    const endDate = new Date(this.nuevoTrimestre.end_date);
    
    if (startDate >= endDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La fecha de inicio debe ser anterior a la fecha de fin'
      });
      return;
    }
    
    // Crear una copia del objeto para enviar al backend
    const trimestreToSend: Partial<Trimester> = {
      name: this.nuevoTrimestre.name,
      period: this.nuevoTrimestre.period,
      start_date: this.formatDateForBackend(startDate),
      end_date: this.formatDateForBackend(endDate)
    };
    
    this.guardandoTrimestre.set(true);
    
    if (this.modoEdicionTrimestre && this.nuevoTrimestre.id !== undefined) { // Verificar que id existe
      // Si estamos editando, llamamos a actualizarTrimestre
      this.parametroService.actualizarTrimestre(this.nuevoTrimestre.id, trimestreToSend)
        .pipe(finalize(() => this.guardandoTrimestre.set(false)))
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Trimestre académico actualizado correctamente'
            });
            this.dialogoTrimestreVisible.set(false);
            this.cargarTrimestres();
          },
          error: (err) => {
            console.error('Error al actualizar trimestre:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el trimestre académico: ' + 
                    (err.error?.detail || err.message || 'Error desconocido')
            });
          }
        });
    } else {
      // Si estamos creando, llamamos a crearTrimestre
      this.parametroService.crearTrimestre(trimestreToSend)
        .pipe(finalize(() => this.guardandoTrimestre.set(false)))
        .subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Trimestre académico creado correctamente'
            });
            this.dialogoTrimestreVisible.set(false);
            this.cargarTrimestres();
          },
          error: (err) => {
            console.error('Error al crear trimestre:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear el trimestre académico: ' + 
                    (err.error?.detail || err.message || 'Error desconocido')
            });
          }
        });
    }
  }

  /**
   * Confirma la eliminación de un trimestre académico
   */
  confirmarEliminarTrimestre(trimestre: Trimester): void {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar el trimestre "${trimestre.name}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarTrimestre(trimestre);
      }
    });
  }

  /**
   * Elimina un trimestre académico
   */
  eliminarTrimestre(trimestre: Trimester): void {
    this.eliminandoTrimestre.set(true);
    
    this.parametroService.eliminarTrimestre(trimestre.id)
      .pipe(finalize(() => this.eliminandoTrimestre.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: `Trimestre "${trimestre.name}" eliminado correctamente`
          });
          this.cargarTrimestres(); // Recargar la lista
        },
        error: (err) => {
          console.error('Error al eliminar trimestre:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo eliminar el trimestre: ' + 
                  (err.error?.detail || err.message || 'Error desconocido')
          });
        }
      });
  }

  /**
   * Obtiene el nombre de un periodo por su ID
   */
  obtenerNombrePeriodo(periodoId: number): string {
    const periodo = this.periodos().find(p => p.id === periodoId);
    return periodo ? periodo.name : `Periodo #${periodoId}`;
  }
}

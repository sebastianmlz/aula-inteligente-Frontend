import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';

import { BackupService } from '../../services/backup.service';

interface Backup {
  filename: string;
  size: number;
  created_at: string;
  download_url: string;
  downloading?: boolean;  // Indicador de descarga en progreso
  deleting?: boolean;     // Indicador de eliminación en progreso
}

// Nueva interfaz para el formato de respuesta de la API
interface BackupResponse {
  filename: string;
  size_mb?: number;
  created_at: string;
  download_url?: string;
}

@Component({
  selector: 'app-gestion-backup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    ProgressSpinnerModule,
    CardModule,
    ToolbarModule,
    TooltipModule,
    FileUploadModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './gestion-backup.component.html',
  styleUrl: './gestion-backup.component.css'
})
export class GestionBackupComponent implements OnInit {
  backups: Backup[] = [];
  loading: boolean = false;
  creatingBackup: boolean = false;
  
  // Propiedades para la restauración de backups
  selectedBackupFile: File | null = null;
  restoringBackup: boolean = false;

  constructor(
    private backupService: BackupService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarBackups();
  }

  /**
   * Cargar la lista de backups disponibles
   */
  cargarBackups() {
    this.loading = true;
    this.backupService.listarBackups().subscribe({
      next: (response) => {
        console.log("Respuesta completa:", response);
        
        // La respuesta tiene la estructura { backups: [...] }
        if (response && response.backups && Array.isArray(response.backups)) {
          // Usar el tipo explícito BackupResponse para el parámetro backup
          this.backups = response.backups.map((backup: BackupResponse) => ({
            filename: backup.filename,
            // La API usa size_mb, pero nuestro componente espera size en bytes
            size: backup.size_mb ? backup.size_mb * 1024 * 1024 : 0,
            created_at: backup.created_at,
            download_url: backup.download_url || this.backupService.getDownloadUrl(backup.filename),
            downloading: false,
            deleting: false
          }));
        } else {
          console.warn('La respuesta no tiene la estructura esperada:', response);
          this.backups = [];
        }
        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar backups:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la lista de backups',
          life: 3000
        });
        this.loading = false;
        this.backups = [];
      }
    });
  }

  /**
   * Crear un nuevo backup de la base de datos
   */
  crearBackup() {
    this.confirmationService.confirm({
      message: '¿Está seguro que desea crear una nueva copia de seguridad de la base de datos?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.creatingBackup = true;
        
        this.backupService.crearBackup().subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'La copia de seguridad se ha creado correctamente',
              life: 3000
            });
            this.creatingBackup = false;
            this.cargarBackups(); // Recargar la lista después de crear
          },
          error: (err) => {
            console.error('Error al crear backup:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo crear la copia de seguridad',
              life: 3000
            });
            this.creatingBackup = false;
          }
        });
      }
    });
  }

  /**
   * Eliminar un backup específico
   */
  eliminarBackup(backup: Backup) {
    this.confirmationService.confirm({
      message: `¿Está seguro que desea eliminar la copia de seguridad "${backup.filename}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        // Marcar este backup específico como en eliminación
        backup.deleting = true;
        
        this.backupService.eliminarBackup(backup.filename).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'La copia de seguridad se ha eliminado correctamente',
              life: 3000
            });
            this.cargarBackups(); // Recargar la lista después de eliminar
          },
          error: (err) => {
            console.error('Error al eliminar backup:', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo eliminar la copia de seguridad',
              life: 3000
            });
            
            // Desmarcar como en eliminación si hay error
            backup.deleting = false;
          }
        });
      }
    });
  }

  /**
   * Descargar un backup específico
   */
  descargarBackup(backup: Backup) {
    // Marcar este backup específico como en descarga
    backup.downloading = true;
    
    this.backupService.descargarBackup(backup.filename).subscribe({
      next: (data: Blob) => {
        const downloadURL = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = backup.filename;
        link.click();
        window.URL.revokeObjectURL(downloadURL);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Descarga iniciada correctamente',
          life: 3000
        });
        
        // Desmarcar como en descarga
        backup.downloading = false;
      },
      error: (err) => {
        console.error('Error al descargar backup:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar la copia de seguridad',
          life: 3000
        });
        
        // Desmarcar como en descarga incluso si hay error
        backup.downloading = false;
      }
    });
  }

  /**
   * Manejador para cuando se selecciona un archivo de backup para restaurar
   */
  onBackupFileSelected(event: any): void {
    if (event.files && event.files.length > 0) {
      this.selectedBackupFile = event.files[0];
    }
  }

  /**
   * Confirma antes de restaurar el backup
   */
  confirmarRestaurarBackup(): void {
    if (!this.selectedBackupFile) return;
    
    this.confirmationService.confirm({
      message: '¿Está seguro que desea restaurar la base de datos con este archivo? Esta acción reemplazará TODOS los datos actuales y no se puede deshacer.',
      header: 'Confirmación crítica',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-danger p-button-raised',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: () => {
        this.restaurarBackup();
      }
    });
  }

  /**
   * Restaura la base de datos desde el archivo seleccionado
   */
  restaurarBackup(): void {
    if (!this.selectedBackupFile) return;
    
    this.restoringBackup = true;
    
    this.backupService.restaurarBackup(this.selectedBackupFile).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Restauración exitosa',
          detail: 'La base de datos ha sido restaurada correctamente',
          life: 5000
        });
        this.restoringBackup = false;
        this.selectedBackupFile = null;
        
        // Recargar datos después de 2 segundos para permitir que el servidor se estabilice
        setTimeout(() => {
          this.cargarBackups();
        }, 2000);
      },
      error: (err) => {
        console.error('Error al restaurar backup:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo restaurar la base de datos. ' + 
                  (err.error?.detail || 'Por favor, verifique que el archivo sea válido.'),
          life: 5000
        });
        this.restoringBackup = false;
      }
    });
  }

  /**
   * Formatear tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Verificar si un backup es reciente (menos de 24 horas)
   */
  esBackupReciente(fechaStr: string): boolean {
    const fechaBackup = new Date(fechaStr).getTime();
    const ahora = new Date().getTime();
    const diferenciaHoras = (ahora - fechaBackup) / (1000 * 60 * 60);
    return diferenciaHoras < 24; // Es reciente si tiene menos de 24 horas
  }

  /**
   * Obtener la fecha del último backup
   */
  getUltimaFechaBackup(): string | null {
    if (this.backups.length === 0) return null;
    
    // Ordenar por fecha de creación (más reciente primero)
    const copiaOrdenada = [...this.backups].sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return copiaOrdenada[0].created_at;
  }
}

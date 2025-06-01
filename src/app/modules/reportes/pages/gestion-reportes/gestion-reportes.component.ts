import { Component, OnInit, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService, Reporte } from '../../services/reporte.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ChartModule } from 'primeng/chart';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { DataViewModule } from 'primeng/dataview';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { CheckboxModule } from 'primeng/checkbox';
import { StudentService } from '../../../gestion-usuarios/services/student.service';

@Component({
  selector: 'app-gestion-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToolbarModule,
    InputTextModule,
    DropdownModule,
    DialogModule,
    ChartModule,
    ProgressBarModule,
    TagModule,
    RippleModule,
    DividerModule,
    ChipModule,
    AvatarModule,
    DataViewModule,
    TooltipModule,  // Make sure TooltipModule is included here
    CheckboxModule
  ],
  providers: [MessageService],
  templateUrl: './gestion-reportes.component.html',
  styleUrl: './gestion-reportes.component.css'
})
export class GestionReportesComponent implements OnInit, OnDestroy {
  // Using dependency injection with inject() function
  private reporteService = inject(ReporteService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private studentService = inject(StudentService);
  
  // Using signals for reactive state
  reportes = signal<Reporte[]>([]);
  loading = signal<boolean>(true);
  selectedReporte = signal<Reporte | null>(null);
  showDetalleDialog = signal<boolean>(false);
  
  // Chart data
  chartData = signal<any>(null);
  chartOptions = signal<any>(null);
  
  // Signal declaration
  filters = signal<{
    student_id: string;
    trimester_id: string;
    period_id: string;
    search: string;
  }>({
    student_id: '',
    trimester_id: '',
    period_id: '',
    search: ''
  });

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalReports = signal<number>(0);

  // New properties for Generate Bulletin dialog
  showGenerateDialog = signal<boolean>(false);
  studentSearchQuery: string = '';
  searchingStudents = signal<boolean>(false);
  filteredStudents = signal<any[]>([]);
  selectedStudent = signal<any | null>(null);
  selectedTrimesterId: number | null = null;
  forceRegenerate = false;
  generatingReport = signal<boolean>(false);
  trimesters = signal<any[]>([]);
  
  // For cleanup
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadReportes();
    this.initChartOptions();
    this.loadTrimesters();
    
    // Setup search with debounce
    this.searchSubject.pipe(
      takeUntil(this.destroy$),
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchStudentsFromService(query);
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadReportes() {
    this.loading.set(true);
    this.reporteService.listarReportes(
      this.currentPage(), 
      this.pageSize(), 
      this.filters()
    ).subscribe({
      next: (response) => {
        this.reportes.set(response.items);
        this.totalReports.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar reportes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los reportes'
        });
        this.loading.set(false);
      }
    });
  }
  
  showDetalle(reporte: Reporte) {
    this.selectedReporte.set(reporte);
    this.showDetalleDialog.set(true);
    
    // Preparar datos para el gráfico
    if (reporte && reporte.grades_data && reporte.grades_data.subjects) {
      this.prepareChartData(reporte);
    }
  }
  
  prepareChartData(reporte: Reporte) {
    // Tomar máximo 10 materias para el gráfico para mantenerlo legible
    const subjects = reporte.grades_data.subjects.slice(0, 10);
    
    this.chartData.set({
      labels: subjects.map(s => s.subject_name),
      datasets: [
        {
          label: 'Promedio por materia',
          backgroundColor: '#42A5F5',
          data: subjects.map(s => s.subject_average)
        },
        {
          label: 'Promedio general',
          backgroundColor: '#FFA726',
          data: subjects.map(() => parseFloat(reporte.overall_average))
        }
      ]
    });
  }
  
  initChartOptions() {
    this.chartOptions.set({
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        x: {
          ticks: {
            color: '#495057',
            maxRotation: 45
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    });
  }
  
  downloadReport(url: string, format: string): void {
    if (!url) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La URL del reporte no está disponible'
      });
      return;
    }

    // Show downloading message
    this.messageService.add({
      severity: 'info',
      summary: 'Descargando',
      detail: `Abriendo ${format}...`,
      life: 3000
    });

    // Open the URL in a new tab
    window.open(url, '_blank');
  }
  
  getStatusSeverity(status: string): string {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'info';
      case 'PROCESSING':
        return 'warning';
      case 'FAILED':
        return 'danger';
      default:
        return 'info';
    }
  }
  
  // Method to get a specific filter value
  getFilterValue(field: string): string {
    const currentFilters = this.filters();
    return currentFilters[field as keyof typeof currentFilters] || '';
  }

  // Method to update a specific filter value
  updateFilter(field: string, value: string): void {
    this.filters.update(currentFilters => ({
      ...currentFilters,
      [field]: value
    }));
  }

  // Method to clear all filters
  clearFilters(): void {
    this.filters.set({
      student_id: '',
      trimester_id: '',
      period_id: '',
      search: ''
    });
    this.applyFilter();
  }

  // Method to apply filters and fetch data
  applyFilter(): void {
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadReportes();
  }
  
  onPageChange(event: any) {
    this.currentPage.set(event.page + 1);
    this.pageSize.set(event.rows);
    this.loadReportes();
  }
  
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
  
  // Utility methods to avoid template errors
  parseFloat(value: any): number {
    return parseFloat(value);
  }
  
  // Helper methods for file access
  getPdfFile(reporte: any): any {
    if (!reporte || !reporte.files || !Array.isArray(reporte.files)) {
      return null;
    }
    return reporte.files.find((f: any) => f.format === 'pdf');
  }
  
  getExcelFile(reporte: any): any {
    if (!reporte || !reporte.files || !Array.isArray(reporte.files)) {
      return null;
    }
    return reporte.files.find((f: any) => f.format === 'excel');
  }
  
  getHtmlFile(reporte: any): any {
    if (!reporte || !reporte.files || !Array.isArray(reporte.files)) {
      return null;
    }
    return reporte.files.find((f: any) => f.format === 'html');
  }
  
  loadTrimesters() {
    this.reporteService.listarTrimestres().subscribe({
      next: (response) => {
        if (response && response.items) {
          this.trimesters.set(response.items);
        }
      },
      error: (err) => {
        console.error('Error loading trimesters:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los trimestres'
        });
      }
    });
  }
  
  openGenerateDialog() {
    this.showGenerateDialog.set(true);
    this.studentSearchQuery = '';
    this.filteredStudents.set([]);
    this.selectedStudent.set(null);
    this.selectedTrimesterId = null;
    this.forceRegenerate = false;
  }
  
  searchStudents() {
    if (!this.studentSearchQuery.trim()) {
      this.filteredStudents.set([]);
      return;
    }
    this.searchSubject.next(this.studentSearchQuery);
  }
  
  searchStudentsFromService(query: string) {
    if (!query.trim()) {
      this.filteredStudents.set([]);
      return;
    }
    
    this.searchingStudents.set(true);
    
    // Use the same method from StudentService that works in gestion-estudiantes
    this.studentService.listarEstudiantes(1, 100, query).subscribe({
      next: (response) => {
        this.searchingStudents.set(false);
        if (response && response.items) {
          this.filteredStudents.set(response.items);
        } else {
          this.filteredStudents.set([]);
        }
      },
      error: (err) => {
        this.searchingStudents.set(false);
        console.error('Error searching students:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al buscar estudiantes'
        });
      }
    });
  }
  
  selectStudent(student: any) {
    this.selectedStudent.set(student);
    this.filteredStudents.set([]);
    this.studentSearchQuery = student.full_name;
  }
  
  clearSelectedStudent() {
    this.selectedStudent.set(null);
    this.studentSearchQuery = '';
  }
  
  generateReport() {
    if (!this.selectedStudent() || !this.selectedTrimesterId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debe seleccionar un estudiante y un trimestre'
      });
      return;
    }
    
    this.generatingReport.set(true);
    
    const student = this.selectedStudent();
    // Use user_id which is consistent in the StudentService response
    const userId = student.user_id;
    
    this.reporteService.generarReporte(
      userId,
      this.selectedTrimesterId,
      this.forceRegenerate
    ).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Boletín generado correctamente'
        });
        this.generatingReport.set(false);
        this.showGenerateDialog.set(false);
        this.loadReportes(); // Refresh the reports list
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error?.detail || 'Error al generar el boletín'
        });
        this.generatingReport.set(false);
      }
    });
  }

  openGenerateForStudent(event: Event, student: any) {
    event.stopPropagation(); // Prevent row selection if you have that
    this.showGenerateDialog.set(true);
    this.studentSearchQuery = student.full_name;
    this.selectedStudent.set(student);
    this.selectedTrimesterId = null;
    this.forceRegenerate = false;
  }
}

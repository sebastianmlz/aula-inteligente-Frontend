import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../autenticacion/services/auth.service';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';  // Este es el que requiere chart.js
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MainService, SchoolStats, CoursePerformance } from '../../services/main.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ChartModule,
    TableModule,
    SkeletonModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class MainComponent implements OnInit {
  usuario: any = null;
  schoolStats: SchoolStats | null = null;
  coursePerformance: CoursePerformance[] = [];
  
  // Para gráficos
  pieChartData: any;
  barChartData: any;
  barChartOptions: any;

  loading = true;
  isAdmin = false;

  constructor(
    private mainService: MainService,
    private messageService: MessageService,
    private authService: AuthService // Inyecta el AuthService
  ) {}

  ngOnInit(): void {
    // Cargar datos del usuario
    const userStr = localStorage.getItem('auth_user');
    if (userStr) {
      this.usuario = JSON.parse(userStr);
      
      // Comprobar si es administrador usando el AuthService
      this.isAdmin = this.authService.isAdmin() || this.usuario?.is_superuser;
      
      // Alternativamente, también puedes verificar groups si existe
      // this.isAdmin = this.usuario?.groups?.includes(1) || this.authService.isAdmin();
      // Si es admin, cargar las estadísticas
      if (this.isAdmin) {
        this.loadDashboardData();
      }
    }
    
    // Inicializar opciones del gráfico
    this.barChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#495057'
            },
            grid: {
              color: '#ebedef'
            }
          },
          y: {
            ticks: {
              color: '#495057'
            },
            grid: {
              color: '#ebedef'
            }
          }
        }
      }
    };
  }

  loadDashboardData() {
    this.loading = true;
    
    // Cargar estadísticas generales
    this.mainService.getGeneralStats()
      .pipe(
        catchError(error => {
          console.error('Error al cargar estadísticas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las estadísticas generales'
          });
          return of(null);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(stats => {
        if (stats) {
          this.schoolStats = stats;
          this.setupPieChart();
        }
      });
      
    // Cargar rendimiento de cursos
    this.mainService.getCoursePerformance()
      .pipe(
        catchError(error => {
          console.error('Error al cargar rendimiento de cursos:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los datos de rendimiento de cursos'
          });
          return of([]);
        })
      )
      .subscribe(courses => {
        if (courses && courses.length > 0) {
          this.coursePerformance = courses;
          this.setupBarChart();
        }
      });
  }

  setupPieChart() {
    if (!this.schoolStats) return;
    
    this.pieChartData = {
      labels: ['Estudiantes', 'Profesores', 'Cursos'],
      datasets: [
        {
          data: [
            this.schoolStats.active_students_count,
            this.schoolStats.active_teachers_count,
            this.schoolStats.active_courses_count
          ],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D']
        }
      ]
    };
  }

  setupBarChart() {
    if (!this.coursePerformance.length) return;
    
    // Limitamos a 6 cursos para mejorar la visualización
    const coursesToShow = this.coursePerformance.slice(0, 6);
    
    const labels = coursesToShow.map(course => course.course_name);
    const averages = coursesToShow.map(course => course.average_grade);
    const students = coursesToShow.map(course => course.enrolled_students);
    
    this.barChartData = {
      labels: labels,
      datasets: [
        {
          type: 'bar',
          label: 'Promedio',
          data: averages,
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          type: 'bar',
          label: 'Estudiantes',
          data: students,
          backgroundColor: '#66BB6A',
          borderColor: '#43A047',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };
    
    // Actualizar opciones para los dos ejes Y
    this.barChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#495057'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057',
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Promedio',
            color: '#42A5F5'
          },
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          },
          min: 0,
          max: 100
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Estudiantes',
            color: '#66BB6A'
          },
          ticks: {
            color: '#495057'
          },
          grid: {
            drawOnChartArea: false,
            color: '#ebedef'
          },
          min: 0
        }
      }
    };
  }
}

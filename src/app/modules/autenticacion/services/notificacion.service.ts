import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  constructor(private messageService: MessageService) {}

  success(resumen: string, detalle: string): void {
    this.messageService.add({ severity: 'success', summary: resumen, detail: detalle });
  }

  info(resumen: string, detalle: string): void {
    this.messageService.add({ severity: 'info', summary: resumen, detail: detalle });
  }

  warn(resumen: string, detalle: string): void {
    this.messageService.add({ severity: 'warn', summary: resumen, detail: detalle });
  }

  error(resumen: string, detalle: string): void {
    this.messageService.add({ severity: 'error', summary: resumen, detail: detalle });
  }

  alertaRendimiento(estudiante: string, prediccion: number): void {
    const severity = prediccion < 51 ? 'error' : 'warn';
    
    this.messageService.add({ 
      severity: severity,
      summary: '⚠️ Alerta de Rendimiento', 
      detail: `${estudiante} tiene una predicción de: ${prediccion}`,
      sticky: true, // Hace que la notificación permanezca hasta que se cierre manualmente
      closable: true
    });
  }
}

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
}

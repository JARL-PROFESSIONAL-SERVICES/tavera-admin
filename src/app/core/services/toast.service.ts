import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastOptions {
  severity?: ToastSeverity;
  summary: string;
  detail?: string;
  life?: number;
  sticky?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly messageService: MessageService;

  constructor(customMessageService?: MessageService) {
    this.messageService =
      customMessageService ??
      inject(MessageService, { optional: true }) ??
      new MessageService();
  }

  /**
   * Notificación de éxito (verde comercial Tavera)
   * Ideal para: producto guardado, sesión iniciada, inventario ajustado, etc.
   */
  success(summary: string, detail?: string, life = 4000): void {
    this.messageService.clear();
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life,
    });
  }

  error(summary: string, detail?: string, life = 5000): void {
    this.messageService.clear();
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life,
    });
  }

  warn(summary: string, detail?: string, life = 4500): void {
    this.messageService.clear();
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life,
    });
  }

  info(summary: string, detail?: string, life = 4000): void {
    this.messageService.clear();
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      life,
    });
  }

  /**
   * Muestra un toast personalizado con opciones completas.
   */
  show(options: ToastOptions): void {
    this.messageService.add({
      severity: options.severity ?? 'info',
      summary: options.summary,
      detail: options.detail,
      life: options.life ?? 4000,
      sticky: options.sticky ?? false,
    });
  }

  /**
   * Limpia todos los toasts activos en pantalla.
   */
  clear(): void {
    this.messageService.clear();
  }
}

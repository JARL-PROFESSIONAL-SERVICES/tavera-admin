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
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      life,
    });
  }

  /**
   * Notificación de error (rojo advertencia)
   * Ideal para: fallos de red, error de validación, error de credenciales, etc.
   */
  error(summary: string, detail?: string, life = 5500): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      life,
    });
  }

  /**
   * Notificación de advertencia (naranja comercial Tavera)
   * Ideal para: stock bajo, cambios pendientes, confirmaciones preventivas.
   */
  warn(summary: string, detail?: string, life = 4500): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail,
      life,
    });
  }

  /**
   * Notificación informativa (azul neutro)
   * Ideal para: información operativa, sincronización iniciada, etc.
   */
  info(summary: string, detail?: string, life = 4000): void {
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

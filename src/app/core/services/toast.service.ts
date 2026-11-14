import { Injectable } from '@angular/core';
import { toast } from 'ngx-sonner';

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
  /**
   * Notificación de éxito (Spartan / Sonner).
   * Ideal para: producto guardado, sesión iniciada, inventario ajustado, etc.
   */
  success(summary: string, detail?: string, life = 4000): void {
    toast.success(summary, {
      description: detail,
      duration: life,
    });
  }

  error(summary: string, detail?: string, life = 5000): void {
    toast.error(summary, {
      description: detail,
      duration: life,
    });
  }

  warn(summary: string, detail?: string, life = 4500): void {
    toast.warning(summary, {
      description: detail,
      duration: life,
    });
  }

  info(summary: string, detail?: string, life = 4000): void {
    toast.info(summary, {
      description: detail,
      duration: life,
    });
  }

  /**
   * Muestra un toast personalizado con opciones completas.
   */
  show(options: ToastOptions): void {
    const data = {
      description: options.detail,
      duration: options.sticky ? Number.POSITIVE_INFINITY : (options.life ?? 4000),
    };

    switch (options.severity ?? 'info') {
      case 'success':
        toast.success(options.summary, data);
        break;
      case 'error':
        toast.error(options.summary, data);
        break;
      case 'warn':
        toast.warning(options.summary, data);
        break;
      case 'info':
      default:
        toast.info(options.summary, data);
        break;
    }
  }

  /**
   * Limpia todos los toasts activos en pantalla.
   */
  clear(): void {
    toast.dismiss();
  }
}

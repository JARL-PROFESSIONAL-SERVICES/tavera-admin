import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from 'ngx-sonner';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.restoreAllMocks();
    service = new ToastService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send success toast with default life of 4000ms', () => {
    const spy = vi.spyOn(toast, 'success').mockImplementation(() => 1);
    service.success('Operación exitosa', 'Datos guardados correctamente');
    expect(spy).toHaveBeenCalledWith('Operación exitosa', {
      description: 'Datos guardados correctamente',
      duration: 4000,
    });
  });

  it('should send error toast with 5000ms life', () => {
    const spy = vi.spyOn(toast, 'error').mockImplementation(() => 1);
    service.error('Error de red', 'No se pudo conectar al servidor');
    expect(spy).toHaveBeenCalledWith('Error de red', {
      description: 'No se pudo conectar al servidor',
      duration: 5000,
    });
  });

  it('should send warn and info toasts correctly', () => {
    const warnSpy = vi.spyOn(toast, 'warning').mockImplementation(() => 1);
    const infoSpy = vi.spyOn(toast, 'info').mockImplementation(() => 1);

    service.warn('Atención', 'Stock mínimo alcanzado');
    expect(warnSpy).toHaveBeenCalledWith('Atención', {
      description: 'Stock mínimo alcanzado',
      duration: 4500,
    });

    service.info('Info', 'Sincronización en curso');
    expect(infoSpy).toHaveBeenCalledWith('Info', {
      description: 'Sincronización en curso',
      duration: 4000,
    });
  });

  it('should support custom show options including sticky', () => {
    const warnSpy = vi.spyOn(toast, 'warning').mockImplementation(() => 1);
    service.show({
      severity: 'warn',
      summary: 'Alerta',
      detail: 'Detalle',
      life: 2000,
      sticky: true,
    });
    expect(warnSpy).toHaveBeenCalledWith('Alerta', {
      description: 'Detalle',
      duration: Number.POSITIVE_INFINITY,
    });
  });

  it('should dismiss all toasts when clear() is called', () => {
    const dismissSpy = vi.spyOn(toast, 'dismiss').mockImplementation(() => undefined);
    service.clear();
    expect(dismissSpy).toHaveBeenCalled();
  });
});

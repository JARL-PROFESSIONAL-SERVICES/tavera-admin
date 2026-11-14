import '@angular/compiler';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;
  let messageServiceSpy: any;

  beforeEach(() => {
    messageServiceSpy = {
      add: vi.fn(),
      clear: vi.fn(),
    };
    service = new ToastService(messageServiceSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send success toast with default life of 4000ms', () => {
    service.success('Operación exitosa', 'Datos guardados correctamente');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Operación exitosa',
      detail: 'Datos guardados correctamente',
      life: 4000,
    });
  });

  it('should send error toast with 5000ms life', () => {
    service.error('Error de red', 'No se pudo conectar al servidor');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error de red',
      detail: 'No se pudo conectar al servidor',
      life: 5000,
    });
  });

  it('should send warn and info toasts correctly', () => {
    service.warn('Atención', 'Stock mínimo alcanzado');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Atención',
      detail: 'Stock mínimo alcanzado',
      life: 4500,
    });

    service.info('Info', 'Sincronización en curso');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Info',
      detail: 'Sincronización en curso',
      life: 4000,
    });
  });

  it('should support custom show options', () => {
    service.show({
      severity: 'warn',
      summary: 'Alerta',
      detail: 'Detalle',
      life: 2000,
      sticky: true,
    });
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Alerta',
      detail: 'Detalle',
      life: 2000,
      sticky: true,
    });
  });

  it('should clear messages when clear() is called', () => {
    service.clear();
    expect(messageServiceSpy.clear).toHaveBeenCalled();
  });
});

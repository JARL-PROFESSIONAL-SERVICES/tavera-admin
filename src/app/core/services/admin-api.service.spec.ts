import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AdminApiService } from './admin-api.service';

describe('AdminApiService', () => {
  let service: AdminApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(AdminApiService);
  });

  it('evaluates RBAC permissions accurately for OWNER and specific roles', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.hasPermission('catalog:write')).toBe(false);

    service.currentUser.set({
      id: 'u-admin',
      username: 'admin1',
      fullName: 'Administrador Operativo',
      roleCode: 'ADMIN',
      permissions: ['catalog:read', 'catalog:write', 'inventory:read'],
    });
    expect(service.isAuthenticated()).toBe(true);
    expect(service.hasPermission('catalog:write')).toBe(true);
    expect(service.hasPermission('users:manage')).toBe(false);

    service.currentUser.set({
      id: 'u-owner',
      username: 'owner',
      fullName: 'Propietario Tavera',
      roleCode: 'OWNER',
      permissions: [],
    });
    expect(service.hasPermission('users:manage')).toBe(true);
    expect(service.hasPermission('reports:read')).toBe(true);
  });

  it('defines contracts for review queue, bulk prices and reports export (Fase 8.3)', () => {
    expect(typeof service.listReviewQueue).toBe('function');
    expect(typeof service.approveReviewQueueItem).toBe('function');
    expect(typeof service.rejectReviewQueueItem).toBe('function');
    expect(typeof service.adjustBulkPrices).toBe('function');
    expect(typeof service.exportReportCsv).toBe('function');
  });
});

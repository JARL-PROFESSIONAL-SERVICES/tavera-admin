import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { AdminApiService } from './admin-api.service';

describe('AdminApiService', () => {
  let service: AdminApiService;

  beforeEach(() => {
    service = new AdminApiService({} as any);
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
});

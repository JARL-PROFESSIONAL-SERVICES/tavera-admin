import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App (Admin Panel)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient()],
    }).compileComponents();
  });

  it('should create the Admin Panel app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render dedicated login view (ADM-01) when unauthenticated', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.api.currentUser.set(null);
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-login')).toBeTruthy();
    expect(compiled.querySelector('app-admin-shell')).toBeFalsy();
    expect(compiled.textContent).toContain('Iniciar Sesión');
    expect(compiled.textContent).toContain('Abarrotes Tavera');
  });

  it('should render authenticated shell with 7 module navigation tabs when authenticated', async () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.api.currentUser.set({
      id: 'usr-1',
      username: 'owner',
      fullName: 'Rosario Tavera',
      roleCode: 'OWNER',
      permissions: ['*'],
    });
    fixture.detectChanges();
    await fixture.whenStable();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-login')).toBeFalsy();
    expect(compiled.querySelector('app-admin-shell')).toBeTruthy();

    const shellText = compiled.querySelector('app-admin-shell')?.textContent ?? '';
    expect(shellText).toContain('Dashboard Ejecutivo');
    expect(shellText).toContain('Catálogo y Precios');
    expect(shellText).toContain('Inventario y Kardex');
    expect(shellText).toContain('Proveedores y Compras');
    expect(shellText).toContain('Ventas y Cortes');
    expect(shellText).toContain('Usuarios y Roles');
    expect(shellText).toContain('Auditoría');
  });

  it('should switch active section across modules', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.activeSection()).toBe('DASHBOARD');

    app.selectSection('CATALOG');
    expect(app.activeSection()).toBe('CATALOG');

    app.selectSection('SUPPLIERS_PURCHASES');
    expect(app.activeSection()).toBe('SUPPLIERS_PURCHASES');
  });
});

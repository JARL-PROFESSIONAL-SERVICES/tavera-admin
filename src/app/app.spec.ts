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

  it('should render header and all 7 module navigation tabs', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Abarrotes Tavera — Panel Administrativo',
    );
    const navText = compiled.querySelector('.admin-nav')?.textContent ?? '';
    expect(navText).toContain('Dashboard Ejecutivo');
    expect(navText).toContain('Catálogo y Precios');
    expect(navText).toContain('Inventario y Kardex');
    expect(navText).toContain('Proveedores y Compras');
    expect(navText).toContain('Ventas y Cortes');
    expect(navText).toContain('Usuarios y Roles');
    expect(navText).toContain('Auditoría');
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

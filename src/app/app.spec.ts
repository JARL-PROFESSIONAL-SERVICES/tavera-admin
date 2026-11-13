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

  it('should render authenticated shell with module navigation tabs when authenticated', async () => {
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
    expect(shellText).toContain('Catálogo de Productos');
    expect(shellText).toContain('Categorías y Presentaciones');
    expect(shellText).toContain('Precios y Mayoreo');
    expect(shellText).toContain('Inventario y Kardex');
    expect(shellText).toContain('Proveedores y Compras');
    expect(shellText).toContain('Ventas y Cortes');
    expect(shellText).toContain('Usuarios y Roles');
    expect(shellText).toContain('Auditoría');
  });

  it('should switch active section across new blueprint views (ADM-05, ADM-06, ADM-07)', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.activeSection()).toBe('DASHBOARD');

    app.selectSection('CATEGORIES');
    expect(app.activeSection()).toBe('CATEGORIES');

    app.selectSection('PRICING');
    expect(app.activeSection()).toBe('PRICING');

    app.selectSection('INVENTORY');
    expect(app.activeSection()).toBe('INVENTORY');

    app.isAdjustmentModalOpen.set(true);
    expect(app.isAdjustmentModalOpen()).toBe(true);

    app.isAdjustmentModalOpen.set(false);
    expect(app.isAdjustmentModalOpen()).toBe(false);
  });

  it('should navigate to full page product form for creation and edition (ADM-04 without modal)', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    app.openCreateProductPage();
    expect(app.activeSection()).toBe('PRODUCT_FORM');
    expect(app.editingProduct()).toBeNull();

    const sampleProduct = {
      id: 'prod-test-1',
      sku: 'TEST-SKU',
      name: 'Producto de Prueba',
      description: null,
      categoryId: null,
      baseUnitId: 'u-1',
      isSoldByWeightOrBulk: false,
      retailUnitPrice: '25.00',
      wholesaleUnitPrice: null,
      wholesaleMinBaseQty: null,
      currentCostPerBaseUnit: '18.00',
      ivaRate: '0.1600',
      iepsRate: '0.0000',
      stockQuantity: '10',
      minStockAlert: '5',
      allowNegativeStock: false,
      isActive: true,
      barcodes: [],
      presentations: [],
    };

    app.openEditProductPage(sampleProduct);
    expect(app.activeSection()).toBe('PRODUCT_FORM');
    expect(app.editingProduct()?.id).toBe('prod-test-1');

    app.closeProductFormPage();
    expect(app.activeSection()).toBe('CATALOG');
    expect(app.editingProduct()).toBeNull();
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

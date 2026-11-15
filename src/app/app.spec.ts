import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { App } from './app';
import { AdminApiService } from './core/services/admin-api.service';
import { ProductRecord } from './core/models/admin.models';

const mockProducts: ProductRecord[] = [
  {
    id: 'prod-1',
    sku: 'ARROZ-1KG',
    name: 'Arroz Extra 1kg',
    description: null,
    categoryId: 'cat-abarrotes',
    baseUnitId: 'u-pza',
    isSoldByWeightOrBulk: false,
    retailUnitPrice: '25.00',
    wholesaleUnitPrice: '22.00',
    wholesaleMinBaseQty: '6',
    currentCostPerBaseUnit: '18.00',
    ivaRate: '0.00',
    iepsRate: '0.00',
    stockQuantity: '20',
    minStockAlert: '5',
    allowNegativeStock: false,
    isActive: true,
    barcodes: [{ id: 'b1', code: '7501055300012', productId: 'prod-1', presentationId: null, isPrimary: true }],
    presentations: [],
  },
  {
    id: 'prod-2',
    sku: 'FRIJOL-1KG',
    name: 'Frijol Negro 1kg',
    description: null,
    categoryId: 'cat-abarrotes',
    baseUnitId: 'u-pza',
    isSoldByWeightOrBulk: false,
    retailUnitPrice: '38.00',
    wholesaleUnitPrice: '34.00',
    wholesaleMinBaseQty: '5',
    currentCostPerBaseUnit: '28.00',
    ivaRate: '0.00',
    iepsRate: '0.00',
    stockQuantity: '3', // En alerta de stock bajo
    minStockAlert: '10',
    allowNegativeStock: false,
    isActive: true,
    barcodes: [],
    presentations: [],
  },
];

describe('VELORA Admin V2 — Controlador y Lógica Operativa (Fase 8.3)', () => {
  let app: App;
  let api: AdminApiService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    api = TestBed.inject(AdminApiService);

    // Mock API queries to avoid real network attempts during unit testing
    vi.spyOn(api, 'getDashboardSummary').mockReturnValue(of({
      salesSummary: {
        completedTicketsCount: 12,
        cancelledTicketsCount: 0,
        totalRevenueGross: '12500.00',
        totalRefunded: '0.00',
        netRevenueAfterReturns: '12500.00',
        subtotalNet: '10775.86',
        ivaAmount: '1724.14',
        iepsAmount: '0.00',
        estimatedCostOfGoodsSold: '8500.00',
        estimatedGrossProfit: '4000.00',
      },
      paymentBreakdown: { CASH: '8000.00', CARD: '4000.00', TRANSFER: '500.00' },
      cashSummary: { openSessionsCount: 1, openSessions: [] },
      inventoryAlerts: { lowStockCount: 1, lowStockItems: [] },
      recentAuditEvents: [],
    }));
    vi.spyOn(api, 'listUnits').mockReturnValue(of([]));
    vi.spyOn(api, 'listCategories').mockReturnValue(of([]));
    vi.spyOn(api, 'listProducts').mockReturnValue(of(mockProducts));
    vi.spyOn(api, 'listReviewQueue').mockReturnValue(of([]));
    vi.spyOn(api, 'listSuppliers').mockReturnValue(of([]));
    vi.spyOn(api, 'listPurchaseReceipts').mockReturnValue(of([]));
    vi.spyOn(api, 'listSales').mockReturnValue(of([]));
    vi.spyOn(api, 'listUsers').mockReturnValue(of([]));
    vi.spyOn(api, 'listRoles').mockReturnValue(of([]));
    vi.spyOn(api, 'listAuditLogs').mockReturnValue(of([]));
    vi.spyOn(api, 'getKardex').mockReturnValue(of({
      product: {
        id: 'prod-1',
        sku: 'ARROZ-1KG',
        name: 'Arroz Extra 1kg',
        baseUnitCode: 'PZA',
        currentStock: '20',
        minStockAlert: '5',
      },
      movements: [],
    }));

    app = TestBed.runInInjectionContext(() => new App());
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debe inicializar con el título oficial de VELORA Admin y sección DASHBOARD', () => {
    expect(app.title()).toBe('VELORA — Panel de Administración');
    expect(app.storeBranch()).toBe('Abarrotes Tavera — Matriz');
    expect(app.activeSection()).toBe('DASHBOARD');
  });

  it('debe navegar fluidamente entre los 9 módulos comerciales oficiales', () => {
    const sections = [
      'DASHBOARD',
      'CATALOG',
      'INVENTORY',
      'REVIEW_QUEUE',
      'KARDEX',
      'PURCHASES',
      'SALES',
      'BULK_PRICES',
      'CONFIG',
    ] as const;

    for (const section of sections) {
      app.selectSection(section);
      expect(app.activeSection()).toBe(section);
      expect(app.sectionTitle()).toBeTruthy();
    }
  });

  it('debe calcular correctamente el valor total del inventario y alertas de stock bajo', () => {
    app.products.set(mockProducts);

    // Valuación: (20 * 18.00) + (3 * 28.00) = 360 + 84 = 444
    expect(app.totalInventoryValue()).toBe(444);
    // Unidades totales: 20 + 3 = 23
    expect(app.totalBaseUnitsInStock()).toBe(23);
    // Stock bajo: prod-2 tiene 3 <= minStockAlert 10 -> 1 producto en alerta
    expect(app.lowStockCount()).toBe(1);
  });

  it('debe filtrar productos en catálogo por búsqueda de texto y código de barras', () => {
    app.products.set(mockProducts);

    app.productSearchQuery.set('Frijol');
    expect(app.filteredProducts().length).toBe(1);
    expect(app.filteredProducts()[0].sku).toBe('FRIJOL-1KG');

    // Búsqueda por código de barras
    app.productSearchQuery.set('7501055300012');
    expect(app.filteredProducts().length).toBe(1);
    expect(app.filteredProducts()[0].sku).toBe('ARROZ-1KG');

    app.productSearchQuery.set('');
    expect(app.filteredProducts().length).toBe(2);
  });

  it('debe aprobar conteo físico de la cola de revisión con política APPLY_DELTA', () => {
    const spy = vi.spyOn(api, 'approveReviewQueueItem').mockReturnValue(
      of({
        success: true,
        item: {
          id: 'item-rev-1',
          idempotencyKey: 'idem-1',
          productId: 'prod-1',
          capturedByUserId: 'u-inv',
          reviewedByUserId: 'u-owner',
          status: 'APPROVED',
          discrepancyType: 'PHYSICAL_COUNT',
          countedStock: '25',
          systemStockSnapshot: '20',
          varianceDelta: '5',
          notes: 'Conteo físico verificado',
          rejectionReason: null,
          reviewedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      }),
    );

    app.approveReviewItem(
      {
        id: 'item-rev-1',
        idempotencyKey: 'idem-1',
        productId: 'prod-1',
        capturedByUserId: 'u-inv',
        reviewedByUserId: null,
        status: 'PENDING',
        discrepancyType: 'PHYSICAL_COUNT',
        countedStock: '25',
        systemStockSnapshot: '20',
        varianceDelta: '5',
        notes: null,
        rejectionReason: null,
        reviewedAt: null,
        createdAt: new Date().toISOString(),
        product: mockProducts[0],
      },
      'APPLY_DELTA',
    );

    expect(spy).toHaveBeenCalledWith('item-rev-1', 'APPLY_DELTA');
    expect(app.feedback().type).toBe('success');
    expect(app.feedback().text).toContain('APPLY_DELTA');
  });

  it('debe rechazar conteo físico de la cola de revisión registrando el motivo', () => {
    const spy = vi.spyOn(api, 'rejectReviewQueueItem').mockReturnValue(
      of({
        success: true,
        item: {
          id: 'item-rev-2',
          idempotencyKey: 'idem-2',
          productId: 'prod-2',
          capturedByUserId: 'u-inv',
          reviewedByUserId: 'u-owner',
          status: 'REJECTED',
          discrepancyType: 'PHYSICAL_COUNT',
          countedStock: '0',
          systemStockSnapshot: '3',
          varianceDelta: '-3',
          notes: null,
          rejectionReason: 'Recuento ordenado',
          reviewedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      }),
    );

    app.activeRejectModalItem.set({
      id: 'item-rev-2',
      idempotencyKey: 'idem-2',
      productId: 'prod-2',
      capturedByUserId: 'u-inv',
      reviewedByUserId: null,
      status: 'PENDING',
      discrepancyType: 'PHYSICAL_COUNT',
      countedStock: '0',
      systemStockSnapshot: '3',
      varianceDelta: '-3',
      notes: null,
      rejectionReason: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
      product: mockProducts[1],
    });
    app.rejectReasonInput.set('Recuento ordenado');

    app.confirmRejectReviewItem();

    expect(spy).toHaveBeenCalledWith('item-rev-2', 'Recuento ordenado');
    expect(app.feedback().type).toBe('info');
    expect(app.activeRejectModalItem()).toBeNull();
  });

  it('debe ejecutar ajuste masivo de precios con motivo de auditoría y reglas de redondeo', () => {
    const spy = vi.spyOn(api, 'adjustBulkPrices').mockReturnValue(
      of({
        affectedCount: 2,
        reason: 'Ajuste anual por inflación',
        details: [
          {
            productId: 'prod-1',
            sku: 'ARROZ-1KG',
            oldRetailPrice: '25.00',
            newRetailPrice: '26.50',
            oldWholesalePrice: '22.00',
            newWholesalePrice: '23.50',
          },
        ],
      }),
    );

    app.bulkPriceType.set('PERCENTAGE');
    app.bulkPriceValue.set(6);
    app.bulkPriceRounding.set('ROUND_UP_50_CENTS');
    app.bulkPriceReason.set('Ajuste anual por inflación');

    app.submitBulkPrices();

    expect(spy).toHaveBeenCalledWith({
      type: 'PERCENTAGE',
      value: 6,
      targetTier: 'BOTH',
      roundingRule: 'ROUND_UP_50_CENTS',
      categoryId: undefined,
      reason: 'Ajuste anual por inflación',
    });
    expect(app.bulkPriceResult()?.affectedCount).toBe(2);
    expect(app.feedback().type).toBe('success');
  });

  it('debe invocar la exportación de reportes CSV con BOM UTF-8 para Excel', () => {
    const fakeBlob = new Blob(['\uFEFFfolio,total\n1,100'], { type: 'text/csv' });
    const spy = vi.spyOn(api, 'exportReportCsv').mockReturnValue(of(fakeBlob));

    // Mock DOM download trigger
    const createElementSpy = vi.spyOn(document, 'createElement');
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
    window.URL.revokeObjectURL = vi.fn();

    app.exportReportType.set('SALES');
    app.exportFromDate.set('2026-11-01');
    app.exportToDate.set('2026-11-15');

    app.downloadExportReport();

    expect(spy).toHaveBeenCalledWith('SALES', '2026-11-01', '2026-11-15');
    expect(app.feedback().type).toBe('success');
    expect(app.feedback().text).toContain('Excel');
  });
});

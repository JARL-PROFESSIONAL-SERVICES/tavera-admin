import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideBoxes,
  lucideCheckCircle2,
  lucideChevronRight,
  lucideClipboardCheck,
  lucideDownload,
  lucideEdit,
  lucideHistory,
  lucideLaptop,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideMoon,
  lucidePackage,
  lucidePlus,
  lucideReceipt,
  lucideRefreshCw,
  lucideSearch,
  lucideSettings,
  lucideShieldCheck,
  lucideSun,
  lucideTags,
  lucideTrash2,
  lucideTruck,
  lucideUser,
  lucideUsers,
  lucideX,
} from '@ng-icons/lucide';
import {
  AuditLogRecord,
  BulkPriceAdjustmentRequest,
  BulkPriceAdjustmentResponse,
  BulkPriceAdjustmentType,
  BulkPriceRoundingRule,
  BulkPriceTargetTier,
  CategoryRecord,
  DashboardSummaryResponse,
  ExportReportType,
  InventoryReviewItemRecord,
  KardexResponse,
  ProductRecord,
  ProductSupplierComparisonResponse,
  PurchaseReceiptRecord,
  ReviewQueueStatus,
  RoleRecord,
  SaleTicketSummary,
  SupplierRecord,
  UnitOfMeasure,
  UserAccountRecord,
} from './core/models/admin.models';
import { AdminApiService } from './core/services/admin-api.service';
import { ThemeService } from './core/services/theme.service';

export type AdminSection =
  | 'DASHBOARD'
  | 'CATALOG'
  | 'INVENTORY'
  | 'REVIEW_QUEUE'
  | 'KARDEX'
  | 'PURCHASES'
  | 'SALES'
  | 'BULK_PRICES'
  | 'CONFIG';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideBoxes,
      lucideCheckCircle2,
      lucideChevronRight,
      lucideClipboardCheck,
      lucideDownload,
      lucideEdit,
      lucideHistory,
      lucideLaptop,
      lucideLayoutDashboard,
      lucideLogOut,
      lucideMoon,
      lucidePackage,
      lucidePlus,
      lucideReceipt,
      lucideRefreshCw,
      lucideSearch,
      lucideSettings,
      lucideShieldCheck,
      lucideSun,
      lucideTags,
      lucideTrash2,
      lucideTruck,
      lucideUser,
      lucideUsers,
      lucideX,
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly Number = Number;
  readonly api = inject(AdminApiService);
  readonly theme = inject(ThemeService);

  readonly title = signal('VELORA — Panel de Administración');
  readonly storeBranch = signal('Abarrotes Tavera — Matriz');
  readonly activeSection = signal<AdminSection>('DASHBOARD');
  readonly isLoading = signal<boolean>(false);
  readonly feedback = signal<{
    type: 'info' | 'success' | 'warning' | 'error';
    text: string;
  }>({
    type: 'info',
    text: 'Bienvenido a VELORA Admin. Inicie sesión para gestionar su comercio.',
  });

  // Auth form
  readonly loginUsername = signal<string>('owner');
  readonly loginPassword = signal<string>('TaveraOwner2026!');

  // Dashboard state
  readonly dashboard = signal<DashboardSummaryResponse | null>(null);

  // Catalog state
  readonly units = signal<UnitOfMeasure[]>([]);
  readonly categories = signal<CategoryRecord[]>([]);
  readonly products = signal<ProductRecord[]>([]);
  readonly productSearchQuery = signal<string>('');
  readonly categoryFilterId = signal<string>('');
  readonly selectedProductForModal = signal<ProductRecord | null>(null);

  // New product form
  readonly isNewProductModalOpen = signal<boolean>(false);
  readonly newCategoryName = signal<string>('');
  readonly newProductSku = signal<string>('');
  readonly newProductName = signal<string>('');
  readonly newProductBaseUnit = signal<string>('PZA');
  readonly newProductCategoryId = signal<string>('');
  readonly newProductRetailPrice = signal<string>('25.00');
  readonly newProductWholesalePrice = signal<string>('22.50');
  readonly newProductWholesaleMinQty = signal<string>('6');
  readonly newProductCost = signal<string>('18.00');
  readonly newProductIvaRate = signal<string>('0.1600');
  readonly newProductMinStockAlert = signal<string>('5');
  readonly newProductBarcode = signal<string>('');
  readonly newPresentationName = signal<string>('');
  readonly newPresentationFactor = signal<string>('12');
  readonly newPresentationPrice = signal<string>('252.00');
  readonly newPresentationBarcode = signal<string>('');

  // Inventory & Kardex state
  readonly inventoryFilter = signal<'ALL' | 'LOW_STOCK' | 'NORMAL'>('ALL');
  readonly selectedKardexProductId = signal<string>('');
  readonly currentKardex = signal<KardexResponse | null>(null);
  readonly adjMovementType = signal<
    'INITIAL_LOAD' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'WASTE_OUT'
  >('INITIAL_LOAD');
  readonly adjQuantity = signal<string>('24');
  readonly adjUnitCost = signal<string>('18.00');
  readonly adjReason = signal<string>('Ajuste operativo de inventario');

  // Review Queue state (Fase 8.1 / 8.3)
  readonly reviewQueue = signal<InventoryReviewItemRecord[]>([]);
  readonly reviewQueueFilter = signal<ReviewQueueStatus | 'ALL'>('PENDING');
  readonly activeRejectModalItem = signal<InventoryReviewItemRecord | null>(null);
  readonly rejectReasonInput = signal<string>('');

  // Suppliers & Purchases state
  readonly suppliers = signal<SupplierRecord[]>([]);
  readonly purchaseReceipts = signal<PurchaseReceiptRecord[]>([]);
  readonly supplierComparison =
    signal<ProductSupplierComparisonResponse | null>(null);
  readonly newSupplierCode = signal<string>('');
  readonly newSupplierName = signal<string>('');
  readonly newSupplierPhone = signal<string>('');
  readonly quoteSupplierId = signal<string>('');
  readonly quoteProductId = signal<string>('');
  readonly quoteUnitCost = signal<string>('14.50');
  readonly quoteIsPreferred = signal<boolean>(true);
  readonly receiptSupplierId = signal<string>('');
  readonly receiptInvoice = signal<string>('');
  readonly receiptProductId = signal<string>('');
  readonly receiptPresentationId = signal<string>('');
  readonly receiptQuantity = signal<string>('2');
  readonly receiptLineCost = signal<string>('432.00');

  // Sales state
  readonly salesList = signal<SaleTicketSummary[]>([]);
  readonly selectedSaleForModal = signal<SaleTicketSummary | null>(null);

  // Bulk Price Adjustments (Fase 8.1 / 8.3)
  readonly bulkPriceType = signal<BulkPriceAdjustmentType>('PERCENTAGE');
  readonly bulkPriceValue = signal<number>(5);
  readonly bulkPriceTargetTier = signal<BulkPriceTargetTier>('BOTH');
  readonly bulkPriceRounding = signal<BulkPriceRoundingRule>('ROUND_UP_50_CENTS');
  readonly bulkPriceCategoryId = signal<string>('');
  readonly bulkPriceReason = signal<string>('Ajuste general de precios por inflación');
  readonly bulkPriceResult = signal<BulkPriceAdjustmentResponse | null>(null);

  // Reports Export (Fase 8.1 / 8.3)
  readonly exportReportType = signal<ExportReportType>('SALES');
  readonly exportFromDate = signal<string>('');
  readonly exportToDate = signal<string>('');
  readonly isExporting = signal<boolean>(false);

  // Users & RBAC state
  readonly users = signal<UserAccountRecord[]>([]);
  readonly roles = signal<RoleRecord[]>([]);
  readonly newUserUsername = signal<string>('');
  readonly newUserFullName = signal<string>('');
  readonly newUserPassword = signal<string>('');
  readonly newUserRoleCode = signal<string>('CASHIER');

  // Audit logs state
  readonly auditModuleFilter = signal<string>('');
  readonly auditLogs = signal<AuditLogRecord[]>([]);

  // Computed metrics
  readonly filteredProducts = computed(() => {
    let prods = this.products();
    const q = this.productSearchQuery().trim().toLowerCase();
    if (q) {
      prods = prods.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.barcodes.some((b) => b.code.toLowerCase().includes(q)),
      );
    }
    const cat = this.categoryFilterId();
    if (cat) {
      prods = prods.filter((p) => p.categoryId === cat);
    }
    if (this.inventoryFilter() === 'LOW_STOCK') {
      prods = prods.filter(
        (p) => Number(p.stockQuantity) <= Number(p.minStockAlert),
      );
    }
    return prods;
  });

  readonly totalInventoryValue = computed(() => {
    return this.products().reduce((acc, p) => {
      const stock = Number(p.stockQuantity || 0);
      const cost = Number(p.currentCostPerBaseUnit || 0);
      return acc + (stock > 0 ? stock * cost : 0);
    }, 0);
  });

  readonly lowStockCount = computed(() => {
    return this.products().filter(
      (p) => Number(p.stockQuantity || 0) <= Number(p.minStockAlert || 0),
    ).length;
  });

  readonly totalBaseUnitsInStock = computed(() => {
    return this.products().reduce(
      (acc, p) => acc + Number(p.stockQuantity || 0),
      0,
    );
  });

  readonly sectionTitle = computed(() => {
    switch (this.activeSection()) {
      case 'DASHBOARD':
        return 'Inicio / Resumen Ejecutivo';
      case 'CATALOG':
        return 'Catálogo de Productos y Ficha';
      case 'INVENTORY':
        return 'Existencias y Valorización de Inventario';
      case 'REVIEW_QUEUE':
        return 'Ajustes y Cola de Revisión de Conteo Físico';
      case 'KARDEX':
        return 'Historial de Movimientos de Inventario (Kardex)';
      case 'PURCHASES':
        return 'Compras, Recepciones y Proveedores';
      case 'SALES':
        return 'Ventas y Sesiones de Caja';
      case 'BULK_PRICES':
        return 'Ajustes Masivos de Precios y Reglas de Redondeo';
      case 'CONFIG':
        return 'Configuración, Usuarios RBAC y Exportación';
    }
  });

  selectSection(section: AdminSection): void {
    this.activeSection.set(section);
    if (!this.api.isAuthenticated()) {
      return;
    }
    switch (section) {
      case 'DASHBOARD':
        this.loadDashboard();
        break;
      case 'CATALOG':
      case 'INVENTORY':
        this.loadCatalogData();
        break;
      case 'REVIEW_QUEUE':
        this.loadReviewQueue();
        break;
      case 'KARDEX':
        this.loadCatalogData();
        if (this.selectedKardexProductId()) {
          this.loadProductKardex(this.selectedKardexProductId());
        }
        break;
      case 'PURCHASES':
        this.loadSuppliersAndPurchases();
        break;
      case 'SALES':
        this.loadSalesList();
        break;
      case 'BULK_PRICES':
        this.loadCatalogData();
        break;
      case 'CONFIG':
        this.loadUsersAndRoles();
        this.loadAuditLogs();
        break;
    }
  }

  submitLogin(): void {
    const u = this.loginUsername().trim();
    const p = this.loginPassword();
    if (!u || !p) {
      return;
    }
    this.isLoading.set(true);
    this.api.login(u, p).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.feedback.set({
          type: 'success',
          text: `Sesión iniciada como ${res.user.fullName} (${res.user.roleCode}).`,
        });
        this.loadDashboard();
        this.loadCatalogData();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.feedback.set({
          type: 'error',
          text: err?.error?.message ?? 'Credenciales inválidas o servidor inalcanzable.',
        });
      },
    });
  }

  loadDashboard(): void {
    this.isLoading.set(true);
    this.api.getDashboardSummary().subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.dashboard.set(data);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.feedback.set({
          type: 'error',
          text: err?.error?.message ?? 'No se pudo cargar el resumen ejecutivo.',
        });
      },
    });
  }

  loadCatalogData(): void {
    this.api.listUnits().subscribe({ next: (u) => this.units.set(u) });
    this.api.listCategories().subscribe({ next: (c) => this.categories.set(c) });
    this.api.listProducts(this.productSearchQuery()).subscribe({
      next: (prods) => {
        this.products.set(prods);
        if (prods.length > 0 && !this.selectedKardexProductId()) {
          this.selectedKardexProductId.set(prods[0].id);
          this.quoteProductId.set(prods[0].id);
          this.receiptProductId.set(prods[0].id);
        }
      },
    });
  }

  submitCreateCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) return;
    this.api.createCategory({ name }).subscribe({
      next: () => {
        this.newCategoryName.set('');
        this.loadCatalogData();
        this.feedback.set({
          type: 'success',
          text: `Categoría "${name}" creada exitosamente.`,
        });
      },
    });
  }

  submitCreateProduct(): void {
    const sku = this.newProductSku().trim();
    const name = this.newProductName().trim();
    if (!sku || !name) return;

    const barcodes = this.newProductBarcode().trim()
      ? [this.newProductBarcode().trim()]
      : [];
    const presentations = this.newPresentationName().trim()
      ? [
          {
            name: this.newPresentationName().trim(),
            conversionFactor: this.newPresentationFactor(),
            price: this.newPresentationPrice(),
            barcode: this.newPresentationBarcode().trim() || undefined,
          },
        ]
      : [];

    this.api
      .createProduct({
        sku,
        name,
        baseUnitCode: this.newProductBaseUnit(),
        categoryId: this.newProductCategoryId() || undefined,
        retailUnitPrice: this.newProductRetailPrice(),
        wholesaleUnitPrice: this.newProductWholesalePrice() || undefined,
        wholesaleMinBaseQty: this.newProductWholesaleMinQty() || undefined,
        currentCostPerBaseUnit: this.newProductCost(),
        ivaRate: this.newProductIvaRate(),
        minStockAlert: this.newProductMinStockAlert(),
        barcodes,
        presentations,
      })
      .subscribe({
        next: (created) => {
          this.newProductSku.set('');
          this.newProductName.set('');
          this.newProductBarcode.set('');
          this.newPresentationName.set('');
          this.newPresentationBarcode.set('');
          this.isNewProductModalOpen.set(false);
          this.loadCatalogData();
          this.feedback.set({
            type: 'success',
            text: `Producto "${created.name}" (${created.sku}) dado de alta con éxito.`,
          });
        },
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al dar de alta el producto.',
          });
        },
      });
  }

  loadProductKardex(productId: string): void {
    if (!productId) return;
    this.selectedKardexProductId.set(productId);
    this.api.getKardex(productId).subscribe({
      next: (k) => this.currentKardex.set(k),
    });
  }

  submitInventoryAdjustment(): void {
    const productId = this.selectedKardexProductId();
    if (!productId) return;
    this.api
      .recordInventoryAdjustment({
        productId,
        movementType: this.adjMovementType(),
        quantity: this.adjQuantity(),
        unitCostApplied: this.adjUnitCost(),
        reason: this.adjReason(),
      })
      .subscribe({
        next: () => {
          this.loadProductKardex(productId);
          this.loadCatalogData();
          this.feedback.set({
            type: 'success',
            text: `Ajuste ${this.adjMovementType()} registrado en Kardex.`,
          });
        },
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al registrar ajuste.',
          });
        },
      });
  }

  // --- Review Queue Handlers (Fase 8.1 / 8.3) ---
  loadReviewQueue(): void {
    this.isLoading.set(true);
    const filter = this.reviewQueueFilter();
    const status = filter === 'ALL' ? undefined : filter;
    this.api.listReviewQueue(status).subscribe({
      next: (items) => {
        this.isLoading.set(false);
        this.reviewQueue.set(items);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.feedback.set({
          type: 'error',
          text: err?.error?.message ?? 'Error al consultar cola de revisión.',
        });
      },
    });
  }

  approveReviewItem(
    item: InventoryReviewItemRecord,
    policy: 'APPLY_DELTA' | 'OVERWRITE_ABSOLUTE',
  ): void {
    this.api.approveReviewQueueItem(item.id, policy).subscribe({
      next: () => {
        this.loadReviewQueue();
        this.loadCatalogData();
        this.feedback.set({
          type: 'success',
          text: `Conteo de ${item.product?.name ?? 'producto'} aprobado con política ${policy}. Kardex sincronizado.`,
        });
      },
      error: (err) => {
        this.feedback.set({
          type: 'error',
          text: err?.error?.message ?? 'Error al autorizar ajuste de inventario.',
        });
      },
    });
  }

  openRejectModal(item: InventoryReviewItemRecord): void {
    this.activeRejectModalItem.set(item);
    this.rejectReasonInput.set('Recuento ordenado: discrepancia no justificada');
  }

  confirmRejectReviewItem(): void {
    const item = this.activeRejectModalItem();
    const reason = this.rejectReasonInput().trim();
    if (!item || !reason) return;

    this.api.rejectReviewQueueItem(item.id, reason).subscribe({
      next: () => {
        this.activeRejectModalItem.set(null);
        this.loadReviewQueue();
        this.feedback.set({
          type: 'info',
          text: `Conteo físico de ${item.product?.name} rechazado. El stock permanece inalterado.`,
        });
      },
      error: (err) => {
        this.feedback.set({
          type: 'error',
          text: err?.error?.message ?? 'Error al rechazar conteo de inventario.',
        });
      },
    });
  }

  // --- Bulk Prices Handlers (Fase 8.1 / 8.3) ---
  submitBulkPrices(): void {
    const reason = this.bulkPriceReason().trim();
    if (!reason) {
      this.feedback.set({
        type: 'error',
        text: 'Debe ingresar una justificación para el ajuste masivo de precios.',
      });
      return;
    }
    this.isLoading.set(true);
    this.api
      .adjustBulkPrices({
        type: this.bulkPriceType(),
        value: Number(this.bulkPriceValue()),
        targetTier: this.bulkPriceTargetTier(),
        roundingRule: this.bulkPriceRounding(),
        categoryId: this.bulkPriceCategoryId() || undefined,
        reason,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          this.bulkPriceResult.set(res);
          this.loadCatalogData();
          this.feedback.set({
            type: 'success',
            text: `Ajuste masivo completado: ${res.affectedCount} productos actualizados.`,
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al ejecutar ajuste masivo de precios.',
          });
        },
      });
  }

  // --- Reports Export Handler (Fase 8.1 / 8.3) ---
  downloadExportReport(): void {
    this.isExporting.set(true);
    this.api
      .exportReportCsv(
        this.exportReportType(),
        this.exportFromDate() || undefined,
        this.exportToDate() || undefined,
      )
      .subscribe({
        next: (blob) => {
          this.isExporting.set(false);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `velora-reporte-${this.exportReportType().toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.feedback.set({
            type: 'success',
            text: 'Reporte CSV con BOM UTF-8 descargado exitosamente para Microsoft Excel.',
          });
        },
        error: (err) => {
          this.isExporting.set(false);
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al exportar reporte CSV.',
          });
        },
      });
  }

  // Suppliers & Purchases
  loadSuppliersAndPurchases(): void {
    this.loadCatalogData();
    this.api.listSuppliers().subscribe({
      next: (list) => {
        this.suppliers.set(list);
        if (list.length > 0 && !this.quoteSupplierId()) {
          this.quoteSupplierId.set(list[0].id);
          this.receiptSupplierId.set(list[0].id);
        }
      },
    });
    this.api.listPurchaseReceipts().subscribe({
      next: (r) => this.purchaseReceipts.set(r),
    });
  }

  submitCreateSupplier(): void {
    const code = this.newSupplierCode().trim();
    const name = this.newSupplierName().trim();
    if (!code || !name) return;
    this.api
      .createSupplier({
        code,
        name,
        phone: this.newSupplierPhone().trim() || undefined,
      })
      .subscribe({
        next: (sup) => {
          this.newSupplierCode.set('');
          this.newSupplierName.set('');
          this.newSupplierPhone.set('');
          this.loadSuppliersAndPurchases();
          this.feedback.set({
            type: 'success',
            text: `Proveedor "${sup.name}" registrado correctamente.`,
          });
        },
      });
  }

  submitSupplierProductQuote(): void {
    const supId = this.quoteSupplierId();
    const prodId = this.quoteProductId();
    if (!supId || !prodId) return;
    this.api
      .upsertSupplierProduct(supId, {
        productId: prodId,
        unitCostPerBaseUnit: this.quoteUnitCost(),
        isPreferred: this.quoteIsPreferred(),
      })
      .subscribe({
        next: () => {
          this.loadSupplierComparison(prodId);
          this.feedback.set({
            type: 'success',
            text: 'Cotización por unidad base registrada.',
          });
        },
      });
  }

  loadSupplierComparison(productId: string): void {
    if (!productId) return;
    this.quoteProductId.set(productId);
    this.api.getProductSupplierComparison(productId).subscribe({
      next: (comp) => this.supplierComparison.set(comp),
    });
  }

  submitPurchaseReceipt(): void {
    const supplierId = this.receiptSupplierId();
    const productId = this.receiptProductId();
    if (!supplierId || !productId) return;
    this.api
      .createPurchaseReceipt({
        supplierId,
        invoiceNumber: this.receiptInvoice().trim() || undefined,
        items: [
          {
            productId,
            presentationId: this.receiptPresentationId() || undefined,
            quantityReceived: this.receiptQuantity(),
            lineCostTotal: this.receiptLineCost(),
          },
        ],
      })
      .subscribe({
        next: (receipt) => {
          this.loadSuppliersAndPurchases();
          this.loadSupplierComparison(productId);
          this.feedback.set({
            type: 'success',
            text: `Compra ${receipt.folio} ingresada al inventario ($${receipt.totalCost}).`,
          });
        },
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al registrar compra.',
          });
        },
      });
  }

  // Sales
  loadSalesList(): void {
    this.api.listSales(40).subscribe({
      next: (sales) => this.salesList.set(sales),
    });
  }

  // Users & RBAC
  loadUsersAndRoles(): void {
    this.api.listUsers().subscribe({ next: (u) => this.users.set(u) });
    this.api.listRoles().subscribe({ next: (r) => this.roles.set(r) });
  }

  submitCreateUser(): void {
    const username = this.newUserUsername().trim();
    const fullName = this.newUserFullName().trim();
    const password = this.newUserPassword();
    if (!username || !fullName || !password) return;
    this.api
      .createUser({
        username,
        fullName,
        password,
        roleCode: this.newUserRoleCode(),
      })
      .subscribe({
        next: (created) => {
          this.newUserUsername.set('');
          this.newUserFullName.set('');
          this.newUserPassword.set('');
          this.loadUsersAndRoles();
          this.feedback.set({
            type: 'success',
            text: `Usuario ${created.username} (${created.roleCode}) creado con éxito.`,
          });
        },
      });
  }

  toggleUserActive(user: UserAccountRecord): void {
    this.api.updateUserStatus(user.id, !user.isActive).subscribe({
      next: () => {
        this.loadUsersAndRoles();
        this.feedback.set({
          type: 'success',
          text: `Estado de ${user.username} modificado.`,
        });
      },
    });
  }

  // Audit
  loadAuditLogs(): void {
    this.api.listAuditLogs(this.auditModuleFilter(), 50).subscribe({
      next: (logs) => this.auditLogs.set(logs),
    });
  }
}

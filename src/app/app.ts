import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AuditLogRecord,
  CategoryRecord,
  DashboardSummaryResponse,
  KardexResponse,
  ProductRecord,
  ProductSupplierComparisonResponse,
  PurchaseReceiptRecord,
  RoleRecord,
  SaleTicketSummary,
  SupplierRecord,
  UnitOfMeasure,
  UserAccountRecord,
} from './core/models/admin.models';
import { AdminApiService } from './core/services/admin-api.service';

export type AdminSection =
  | 'DASHBOARD'
  | 'CATALOG'
  | 'INVENTORY'
  | 'SUPPLIERS_PURCHASES'
  | 'SALES_CASH'
  | 'USERS_RBAC'
  | 'AUDIT';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly api = inject(AdminApiService);

  readonly title = signal('Abarrotes Tavera — Panel Administrativo');
  readonly activeSection = signal<AdminSection>('DASHBOARD');
  readonly isLoading = signal<boolean>(false);
  readonly feedback = signal<{
    type: 'info' | 'success' | 'error';
    text: string;
  }>({
    type: 'info',
    text: 'Inicie sesión con su cuenta de Propietario (OWNER) o Administrador (ADMIN).',
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
  readonly newCategoryName = signal<string>('');
  readonly newProductSku = signal<string>('');
  readonly newProductName = signal<string>('');
  readonly newProductBaseUnit = signal<string>('PZA');
  readonly newProductRetailPrice = signal<string>('25.00');
  readonly newProductWholesalePrice = signal<string>('22.50');
  readonly newProductWholesaleMinQty = signal<string>('6');
  readonly newProductCost = signal<string>('18.00');
  readonly newProductIvaRate = signal<string>('0.1600');
  readonly newProductBarcode = signal<string>('');
  readonly newPresentationName = signal<string>('');
  readonly newPresentationFactor = signal<string>('12');
  readonly newPresentationPrice = signal<string>('252.00');
  readonly newPresentationBarcode = signal<string>('');

  // Inventory & Kardex state
  readonly selectedKardexProductId = signal<string>('');
  readonly currentKardex = signal<KardexResponse | null>(null);
  readonly adjMovementType = signal<
    'INITIAL_LOAD' | 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT' | 'WASTE_OUT'
  >('INITIAL_LOAD');
  readonly adjQuantity = signal<string>('24');
  readonly adjUnitCost = signal<string>('18.00');
  readonly adjReason = signal<string>('Carga o ajuste operativo de inventario');

  // Suppliers, Comparison & Purchases state
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
        this.loadCatalogData();
        break;
      case 'INVENTORY':
        this.loadCatalogData();
        break;
      case 'SUPPLIERS_PURCHASES':
        this.loadSuppliersAndPurchases();
        break;
      case 'SALES_CASH':
        this.loadSalesList();
        break;
      case 'USERS_RBAC':
        this.loadUsersAndRoles();
        break;
      case 'AUDIT':
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
          text: `Bienvenido ${res.user.fullName} (${res.user.roleCode})`,
        });
        this.loadDashboard();
        this.loadCatalogData();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.feedback.set({
          type: 'error',
          text: err?.error?.message ?? 'Credenciales inválidas o API no disponible.',
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
          text: err?.error?.message ?? 'No se pudo cargar el dashboard ejecutivo.',
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
    if (!name) {
      return;
    }
    this.api.createCategory({ name }).subscribe({
      next: () => {
        this.newCategoryName.set('');
        this.loadCatalogData();
        this.feedback.set({
          type: 'success',
          text: `Categoría "${name}" creada.`,
        });
      },
    });
  }

  submitCreateProduct(): void {
    const sku = this.newProductSku().trim();
    const name = this.newProductName().trim();
    if (!sku || !name) {
      return;
    }

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
        retailUnitPrice: this.newProductRetailPrice(),
        wholesaleUnitPrice: this.newProductWholesalePrice() || undefined,
        wholesaleMinBaseQty: this.newProductWholesaleMinQty() || undefined,
        currentCostPerBaseUnit: this.newProductCost(),
        ivaRate: this.newProductIvaRate(),
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
          this.loadCatalogData();
          this.feedback.set({
            type: 'success',
            text: `Producto "${created.name}" (${created.sku}) registrado en catálogo.`,
          });
        },
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al crear producto.',
          });
        },
      });
  }

  quickUpdateRetailPrice(product: ProductRecord, newPrice: string): void {
    this.api
      .updateProductPricing(product.id, { retailUnitPrice: newPrice })
      .subscribe({
        next: () => {
          this.loadCatalogData();
          this.feedback.set({
            type: 'success',
            text: `Precio de ${product.name} actualizado a $${newPrice} (tickets históricos permanecen inmutables).`,
          });
        },
      });
  }

  loadProductKardex(productId: string): void {
    if (!productId) {
      return;
    }
    this.selectedKardexProductId.set(productId);
    this.api.getKardex(productId).subscribe({
      next: (k) => this.currentKardex.set(k),
    });
  }

  submitInventoryAdjustment(): void {
    const productId = this.selectedKardexProductId();
    if (!productId) {
      return;
    }
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
            text: `Movimiento ${this.adjMovementType()} registrado en Kardex.`,
          });
        },
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al registrar movimiento.',
          });
        },
      });
  }

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
    if (!code || !name) {
      return;
    }
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
            text: `Proveedor ${sup.name} registrado.`,
          });
        },
      });
  }

  submitSupplierProductQuote(): void {
    const supId = this.quoteSupplierId();
    const prodId = this.quoteProductId();
    if (!supId || !prodId) {
      return;
    }
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
            text: 'Cotización por unidad base actualizada en historial de proveedor.',
          });
        },
      });
  }

  loadSupplierComparison(productId: string): void {
    if (!productId) {
      return;
    }
    this.quoteProductId.set(productId);
    this.api.getProductSupplierComparison(productId).subscribe({
      next: (comp) => this.supplierComparison.set(comp),
    });
  }

  submitPurchaseReceipt(): void {
    const supplierId = this.receiptSupplierId();
    const productId = this.receiptProductId();
    if (!supplierId || !productId) {
      return;
    }
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
            text: `Compra ${receipt.folio} recibida ($${receipt.totalCost}). Stock y Last Cost actualizados.`,
          });
        },
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al registrar recepción de compra.',
          });
        },
      });
  }

  loadSalesList(): void {
    this.api.listSales(30).subscribe({
      next: (sales) => this.salesList.set(sales),
    });
  }

  loadUsersAndRoles(): void {
    this.api.listUsers().subscribe({ next: (u) => this.users.set(u) });
    this.api.listRoles().subscribe({ next: (r) => this.roles.set(r) });
  }

  submitCreateUser(): void {
    const username = this.newUserUsername().trim();
    const fullName = this.newUserFullName().trim();
    const password = this.newUserPassword();
    if (!username || !fullName || !password) {
      return;
    }
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
            text: `Usuario ${created.username} (${created.roleCode}) creado.`,
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
          text: `Estado de ${user.username} actualizado.`,
        });
      },
    });
  }

  loadAuditLogs(): void {
    this.api.listAuditLogs(this.auditModuleFilter(), 50).subscribe({
      next: (logs) => this.auditLogs.set(logs),
    });
  }
}

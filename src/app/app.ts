import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideBoxes,
  lucideCheckCircle2,
  lucideEdit,
  lucideLaptop,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideMoon,
  lucidePackage,
  lucidePlus,
  lucideReceipt,
  lucideSearch,
  lucideShieldCheck,
  lucideSun,
  lucideTrash2,
  lucideTruck,
  lucideUser,
  lucideUsers,
} from '@ng-icons/lucide';
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
import { ThemeService } from './core/services/theme.service';
import { AdminSection, AdminShellComponent } from './layout/admin-shell.component';
import { CatalogListComponent } from './views/catalog/catalog-list.component';
import {
  ProductFormData,
  ProductFormModalComponent,
} from './views/catalog/product-form-modal.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { LoginComponent } from './views/login/login.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    LoginComponent,
    AdminShellComponent,
    DashboardComponent,
    CatalogListComponent,
    ProductFormModalComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideBoxes,
      lucideCheckCircle2,
      lucideEdit,
      lucideLaptop,
      lucideLayoutDashboard,
      lucideLogOut,
      lucideMoon,
      lucidePackage,
      lucidePlus,
      lucideReceipt,
      lucideSearch,
      lucideShieldCheck,
      lucideSun,
      lucideTrash2,
      lucideTruck,
      lucideUser,
      lucideUsers,
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly api = inject(AdminApiService);
  readonly theme = inject(ThemeService);

  readonly title = signal('Abarrotes Tavera — Panel Administrativo');
  readonly activeSection = signal<AdminSection>('DASHBOARD');
  readonly isLoading = signal<boolean>(false);
  readonly feedback = signal<{
    type: 'info' | 'success' | 'error';
    text: string;
  } | null>(null);

  // Dashboard state
  readonly dashboard = signal<DashboardSummaryResponse | null>(null);

  // Catalog state
  readonly units = signal<UnitOfMeasure[]>([]);
  readonly categories = signal<CategoryRecord[]>([]);
  readonly products = signal<ProductRecord[]>([]);
  readonly productSearchQuery = signal<string>('');

  // Modal / Drawer state for ADM-04
  readonly isProductModalOpen = signal(false);
  readonly editingProduct = signal<ProductRecord | null>(null);
  readonly isSavingProduct = signal(false);

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

  onLoginSuccess(): void {
    this.feedback.set({
      type: 'success',
      text: `Sesión iniciada correctamente como ${this.api.currentUser()?.fullName}`,
    });
    this.loadDashboard();
    this.loadCatalogData();
  }

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

  openCreateProductModal(): void {
    this.editingProduct.set(null);
    this.isProductModalOpen.set(true);
  }

  openEditProductModal(p: ProductRecord): void {
    this.editingProduct.set(p);
    this.isProductModalOpen.set(true);
  }

  openKardexForProduct(productId: string): void {
    this.selectedKardexProductId.set(productId);
    this.selectSection('INVENTORY');
    this.loadProductKardex(productId);
  }

  handleSaveProduct(formData: ProductFormData): void {
    const edit = this.editingProduct();
    this.isSavingProduct.set(true);

    if (edit) {
      // Update
      this.api
        .updateProductPricing(edit.id, {
          name: formData.name,
          retailUnitPrice: formData.retailUnitPrice,
          wholesaleUnitPrice: formData.wholesaleUnitPrice || null,
          wholesaleMinBaseQty: formData.wholesaleMinBaseQty || null,
          currentCostPerBaseUnit: formData.currentCostPerBaseUnit,
          minStockAlert: formData.minStockAlert,
          allowNegativeStock: formData.allowNegativeStock,
        })
        .subscribe({
          next: () => {
            this.isSavingProduct.set(false);
            this.isProductModalOpen.set(false);
            this.loadCatalogData();
            this.feedback.set({
              type: 'success',
              text: `Producto "${formData.name}" actualizado exitosamente.`,
            });
          },
          error: (err) => {
            this.isSavingProduct.set(false);
            this.feedback.set({
              type: 'error',
              text: err?.error?.message ?? 'Error al actualizar producto.',
            });
          },
        });
    } else {
      // Create
      this.api
        .createProduct({
          sku: formData.sku,
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId,
          baseUnitCode: formData.baseUnitCode,
          isSoldByWeightOrBulk: formData.isSoldByWeightOrBulk,
          retailUnitPrice: formData.retailUnitPrice,
          wholesaleUnitPrice: formData.wholesaleUnitPrice,
          wholesaleMinBaseQty: formData.wholesaleMinBaseQty,
          currentCostPerBaseUnit: formData.currentCostPerBaseUnit,
          ivaRate: formData.ivaRate,
          iepsRate: formData.iepsRate,
          minStockAlert: formData.minStockAlert,
          allowNegativeStock: formData.allowNegativeStock,
          barcodes: formData.barcodes,
          presentations: formData.presentations,
        })
        .subscribe({
          next: (created) => {
            this.isSavingProduct.set(false);
            this.isProductModalOpen.set(false);
            this.loadCatalogData();
            this.feedback.set({
              type: 'success',
              text: `Producto "${created.name}" (${created.sku}) creado en catálogo.`,
            });
          },
          error: (err) => {
            this.isSavingProduct.set(false);
            this.feedback.set({
              type: 'error',
              text: err?.error?.message ?? 'Error al crear producto.',
            });
          },
        });
    }
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
        error: (err) => {
          this.feedback.set({
            type: 'error',
            text: err?.error?.message ?? 'Error al actualizar precio rápido.',
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

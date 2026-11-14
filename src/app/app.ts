import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideBan,
  lucideBoxes,
  lucideCheckCircle2,
  lucideClock,
  lucideDollarSign,
  lucideEdit,
  lucideFolderTree,
  lucideInfo,
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
  lucideX,
} from '@ng-icons/lucide';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ToastService } from './core/services/toast.service';
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
import { AdminSection, AdminShellComponent, SuppliersTab } from './layout/admin-shell.component';
import { CategoriesViewComponent } from './views/categories/categories-view.component';
import { CatalogListComponent } from './views/catalog/catalog-list.component';
import { ProductFormData } from './views/catalog/product-form-modal.component';
import {
  ProductFormPageComponent,
  SaveProductEvent,
} from './views/catalog/product-form-page.component';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import {
  InventoryAdjustmentData,
  InventoryAdjustmentModalComponent,
} from './views/inventory/inventory-adjustment-modal.component';
import { InventoryKardexComponent } from './views/inventory/inventory-kardex.component';
import { LoginComponent } from './views/login/login.component';
import { PricingViewComponent } from './views/pricing/pricing-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgIconComponent,
    NgxSonnerToaster,
    LoginComponent,
    AdminShellComponent,
    DashboardComponent,
    CatalogListComponent,
    ProductFormPageComponent,
    CategoriesViewComponent,
    PricingViewComponent,
    InventoryKardexComponent,
    InventoryAdjustmentModalComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideBan,
      lucideBoxes,
      lucideCheckCircle2,
      lucideClock,
      lucideDollarSign,
      lucideEdit,
      lucideFolderTree,
      lucideInfo,
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
      lucideX,
    }),
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  readonly api = inject(AdminApiService);
  readonly theme = inject(ThemeService);
  readonly toast = inject(ToastService);
  readonly location = inject(Location);

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
  readonly isLoadingCatalog = signal<boolean>(false);
  readonly catalogError = signal<string | null>(null);

  // Full-page Product Form state (ADM-04)
  readonly editingProduct = signal<ProductRecord | null>(null);
  readonly isSavingProduct = signal(false);
  readonly productFormSignalReset = signal<number>(0);

  // Inventory & Kardex state (ADM-07 & ADM-08)
  readonly selectedKardexProductId = signal<string>('');
  readonly kardexError = signal(false);
  readonly currentKardex = signal<KardexResponse | null>(null);
  readonly isAdjustmentModalOpen = signal(false);
  readonly isSavingAdjustment = signal(false);

  // Suppliers, Comparison & Purchases state
  readonly suppliers = signal<SupplierRecord[]>([]);
  readonly purchaseReceipts = signal<PurchaseReceiptRecord[]>([]);
  readonly pendingPurchases = computed(() =>
    this.purchaseReceipts().filter(
      (r: PurchaseReceiptRecord & { status?: string }) => r.status === 'PENDING',
    ),
  );
  readonly cancelledPurchases = computed(() =>
    this.purchaseReceipts().filter(
      (r: PurchaseReceiptRecord & { status?: string }) => r.status === 'CANCELLED',
    ),
  );
  readonly suppliersActiveTab = signal<SuppliersTab>('SUPPLIERS');
  readonly showCreateSupplierModal = signal(false);
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

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/products/new') {
        this.openCreateProductPage();
      } else if (path.startsWith('/products/') && path.endsWith('/edit')) {
        this.activeSection.set('PRODUCT_FORM');
      } else if (path === '/catalog') {
        this.activeSection.set('CATALOG');
      } else if (path === '/categories') {
        this.activeSection.set('CATEGORIES');
      } else if (path === '/pricing') {
        this.activeSection.set('PRICING');
      } else if (path === '/inventory') {
        this.activeSection.set('INVENTORY');
      }
    }
  }

  onLoginSuccess(): void {
    const user = this.api.currentUser();
    this.toast.success(
      'Sesión iniciada',
      `Bienvenido(a) ${user?.fullName ?? 'al sistema'} (${user?.roleCode ?? 'Administrador'}).`,
    );
    this.loadDashboard();
    this.loadCatalogData();
  }

  selectSection(section: AdminSection): void {
    this.activeSection.set(section);
    if (typeof window !== 'undefined') {
      if (section === 'CATALOG') this.location.go('/catalog');
      else if (section === 'CATEGORIES') this.location.go('/categories');
      else if (section === 'PRICING') this.location.go('/pricing');
      else if (section === 'INVENTORY') this.location.go('/inventory');
      else if (section === 'DASHBOARD') this.location.go('/');
    }
    if (!this.api.isAuthenticated()) {
      return;
    }
    switch (section) {
      case 'DASHBOARD':
        this.loadDashboard();
        break;
      case 'CATALOG':
      case 'CATEGORIES':
      case 'PRICING':
        this.loadCatalogData();
        break;
      case 'INVENTORY':
        this.closeProductKardex();
        this.loadCatalogData('');
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
        this.toast.error(
          'Error de carga',
          err?.error?.message ?? 'No se pudo cargar el dashboard ejecutivo.',
        );
      },
    });
  }

  loadCatalogData(query = this.productSearchQuery()): void {
    this.isLoadingCatalog.set(true);
    this.catalogError.set(null);
    this.api.listUnits().subscribe({ next: (u) => this.units.set(u) });
    this.api.listCategories().subscribe({ next: (c) => this.categories.set(c) });
    this.api.listProducts(query).subscribe({
      next: (prods) => {
        this.isLoadingCatalog.set(false);
        this.products.set(prods);
        if (prods.length > 0 && !this.quoteProductId()) {
          this.quoteProductId.set(prods[0].id);
          this.receiptProductId.set(prods[0].id);
        }
        if (typeof window !== 'undefined') {
          const match = window.location.pathname.match(/^\/products\/([^/]+)\/edit$/);
          if (match && match[1]) {
            const found = prods.find((p) => p.id === match[1]);
            if (found) {
              this.editingProduct.set(found);
              this.activeSection.set('PRODUCT_FORM');
            }
          }
        }
      },
      error: (err) => {
        this.isLoadingCatalog.set(false);
        this.catalogError.set(
          err?.error?.message ?? 'No se pudo conectar con el catálogo de productos.'
        );
      },
    });
  }

  openCreateProductPage(): void {
    this.editingProduct.set(null);
    this.activeSection.set('PRODUCT_FORM');
    this.location.go('/products/new');
  }

  openEditProductPage(p: ProductRecord): void {
    this.editingProduct.set(p);
    this.activeSection.set('PRODUCT_FORM');
    this.location.go(`/products/${p.id}/edit`);
  }

  closeProductFormPage(): void {
    this.editingProduct.set(null);
    this.activeSection.set('CATALOG');
    this.location.go('/catalog');
  }

  openCreateProductModal(): void {
    this.openCreateProductPage();
  }

  openEditProductModal(p: ProductRecord): void {
    this.openEditProductPage(p);
  }

  openKardexForProduct(productId: string): void {
    this.selectSection('INVENTORY');
    this.loadProductKardex(productId);
  }

  handleCreateCategory(payload: { name: string; description?: string }): void {
    this.api.createCategory(payload).subscribe({
      next: (cat) => {
        this.loadCatalogData();
        this.toast.success(
          'Categoría creada',
          `Categoría "${cat.name}" creada exitosamente.`,
        );
      },
      error: (err) => {
        this.toast.error(
          'Error al crear categoría',
          err?.error?.message ?? 'Error al registrar categoría.',
        );
      },
    });
  }

  handleUpdatePricing(event: {
    productId: string;
    retailUnitPrice: string;
    wholesaleUnitPrice?: string | null;
    wholesaleMinBaseQty?: string | null;
  }): void {
    this.api
      .updateProductPricing(event.productId, {
        retailUnitPrice: event.retailUnitPrice,
        wholesaleUnitPrice: event.wholesaleUnitPrice,
        wholesaleMinBaseQty: event.wholesaleMinBaseQty,
      })
      .subscribe({
        next: (updated) => {
          this.loadCatalogData();
          this.toast.success(
            'Precios actualizados',
            `Precios y escala de mayoreo para ${updated.name} actualizados correctamente.`,
          );
        },
        error: (err) => {
          this.toast.error(
            'Error al actualizar precios',
            err?.error?.message ?? 'Error al actualizar precios.',
          );
        },
      });
  }

  handleSaveProduct(event: ProductFormData | SaveProductEvent): void {
    const formData = 'formData' in event ? event.formData : event;
    const andRegisterAnother = 'andRegisterAnother' in event ? Boolean(event.andRegisterAnother) : false;
    const edit = this.editingProduct();
    this.isSavingProduct.set(true);

    if (edit) {
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
            this.closeProductFormPage();
            this.loadCatalogData();
            this.toast.success(
              'Producto actualizado',
              `Producto "${formData.name}" actualizado exitosamente.`,
            );
          },
          error: (err) => {
            this.isSavingProduct.set(false);
            this.toast.error(
              'Error al actualizar',
              err?.error?.message ?? 'Error al actualizar producto.',
            );
          },
        });
    } else {
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
            this.loadCatalogData();
            if (andRegisterAnother) {
              this.toast.success(
                'Producto registrado',
                `"${created.name}" guardado en catálogo. Listo para el siguiente.`,
              );
              this.productFormSignalReset.set(Date.now());
            } else {
              this.closeProductFormPage();
              this.toast.success(
                'Producto creado',
                `Producto "${created.name}" (${created.sku}) creado en catálogo.`,
              );
            }
          },
          error: (err) => {
            this.isSavingProduct.set(false);
            this.toast.error(
              'Error al crear producto',
              err?.error?.message ?? 'Error al crear producto.',
            );
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
          this.toast.success(
            'Precio actualizado',
            `Precio de ${product.name} actualizado a $${newPrice}.`,
          );
        },
        error: (err) => {
          this.toast.error(
            'Error de precio',
            err?.error?.message ?? 'Error al actualizar precio rápido.',
          );
        },
      });
  }

  closeProductKardex(): void {
    this.selectedKardexProductId.set('');
    this.currentKardex.set(null);
    this.kardexError.set(false);
  }

  loadProductKardex(productId: string): void {
    if (!productId) {
      return;
    }
    this.selectedKardexProductId.set(productId);
    this.currentKardex.set(null);
    this.kardexError.set(false);
    this.api.getKardex(productId).subscribe({
      next: (k) => {
        if (this.selectedKardexProductId() === productId) this.currentKardex.set(k);
      },
      error: () => {
        if (this.selectedKardexProductId() === productId) this.kardexError.set(true);
      },
    });
  }

  handleApplyAdjustment(data: InventoryAdjustmentData): void {
    this.isSavingAdjustment.set(true);
    this.api
      .recordInventoryAdjustment({
        productId: data.productId,
        movementType: data.movementType,
        quantity: data.quantity,
        unitCostApplied: data.unitCostApplied,
        reason: data.reason,
      })
      .subscribe({
        next: () => {
          this.isSavingAdjustment.set(false);
          this.isAdjustmentModalOpen.set(false);
          this.loadProductKardex(data.productId);
          this.loadCatalogData('');
          this.toast.success(
            'Inventario actualizado',
            `Movimiento ${data.movementType} registrado exitosamente en el Kardex físico.`,
          );
        },
        error: (err) => {
          this.isSavingAdjustment.set(false);
          this.toast.error(
            'Error en ajuste',
            err?.error?.message ?? 'Error al aplicar movimiento a Kardex.',
          );
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

  openSuppliersTab(tab: SuppliersTab): void {
    this.suppliersActiveTab.set(tab);
    this.selectSection('SUPPLIERS_PURCHASES');
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
          this.showCreateSupplierModal.set(false);
          this.loadSuppliersAndPurchases();
          this.toast.success('Proveedor registrado', `Proveedor ${sup.name} registrado exitosamente.`);
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
          this.toast.success(
            'Cotización actualizada',
            'Cotización por unidad base actualizada en historial de proveedor.',
          );
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
          this.toast.success(
            'Recepción registrada',
            `Compra ${receipt.folio} recibida ($${receipt.totalCost}). Stock y Last Cost actualizados.`,
          );
        },
        error: (err) => {
          this.toast.error(
            'Error en recepción',
            err?.error?.message ?? 'Error al registrar recepción de compra.',
          );
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
          this.toast.success(
            'Usuario creado',
            `Usuario ${created.username} (${created.roleCode}) creado exitosamente.`,
          );
        },
      });
  }

  toggleUserActive(user: UserAccountRecord): void {
    this.api.updateUserStatus(user.id, !user.isActive).subscribe({
      next: () => {
        this.loadUsersAndRoles();
        this.toast.success(
          'Estado actualizado',
          `Estado de ${user.username} actualizado a ${!user.isActive ? 'Activo' : 'Inactivo'}.`,
        );
      },
    });
  }

  loadAuditLogs(): void {
    this.api.listAuditLogs(this.auditModuleFilter(), 50).subscribe({
      next: (logs) => this.auditLogs.set(logs),
    });
  }
}

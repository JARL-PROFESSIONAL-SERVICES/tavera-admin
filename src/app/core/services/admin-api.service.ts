import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import {
  AuditLogRecord,
  AuthenticatedUser,
  AuthTokensResponse,
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
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http: HttpClient;

  constructor(customHttp?: HttpClient) {
    this.http = (customHttp ??
      inject(HttpClient, { optional: true })) as HttpClient;
  }

  readonly apiBaseUrl = signal<string>('http://localhost:3000/api/v1');
  readonly accessToken = signal<string | null>(null);
  readonly currentUser = signal<AuthenticatedUser | null>(null);

  readonly isAuthenticated = computed(() => Boolean(this.currentUser()));

  hasPermission(permissionCode: string): boolean {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    return (
      user.roleCode === 'OWNER' || user.permissions.includes(permissionCode)
    );
  }

  private headers(): HttpHeaders {
    const token = this.accessToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  login(username: string, password: string): Observable<AuthTokensResponse> {
    return this.http
      .post<AuthTokensResponse>(`${this.apiBaseUrl()}/auth/login`, {
        username,
        password,
      })
      .pipe(
        tap((res) => {
          this.accessToken.set(res.accessToken);
          this.currentUser.set(res.user);
        }),
      );
  }

  logout(): void {
    this.accessToken.set(null);
    this.currentUser.set(null);
  }

  // Dashboard
  getDashboardSummary(): Observable<DashboardSummaryResponse> {
    return this.http.get<DashboardSummaryResponse>(
      `${this.apiBaseUrl()}/reports/dashboard`,
      { headers: this.headers() },
    );
  }

  // Catalog
  listUnits(): Observable<UnitOfMeasure[]> {
    return this.http.get<UnitOfMeasure[]>(`${this.apiBaseUrl()}/catalog/units`, {
      headers: this.headers(),
    });
  }

  listCategories(): Observable<CategoryRecord[]> {
    return this.http.get<CategoryRecord[]>(
      `${this.apiBaseUrl()}/catalog/categories`,
      { headers: this.headers() },
    );
  }

  createCategory(payload: {
    name: string;
    description?: string;
  }): Observable<CategoryRecord> {
    return this.http.post<CategoryRecord>(
      `${this.apiBaseUrl()}/catalog/categories`,
      payload,
      { headers: this.headers() },
    );
  }

  listProducts(q?: string): Observable<ProductRecord[]> {
    const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : '';
    return this.http.get<ProductRecord[]>(
      `${this.apiBaseUrl()}/catalog/products${query}`,
      { headers: this.headers() },
    );
  }

  createProduct(payload: {
    sku: string;
    name: string;
    description?: string;
    categoryId?: string;
    baseUnitCode: string;
    isSoldByWeightOrBulk?: boolean;
    retailUnitPrice: string | number;
    wholesaleUnitPrice?: string | number;
    wholesaleMinBaseQty?: string | number;
    currentCostPerBaseUnit?: string | number;
    ivaRate?: string | number;
    iepsRate?: string | number;
    minStockAlert?: string | number;
    allowNegativeStock?: boolean;
    barcodes?: string[];
    presentations?: Array<{
      name: string;
      conversionFactor: string | number;
      price: string | number;
      barcode?: string;
    }>;
  }): Observable<ProductRecord> {
    return this.http.post<ProductRecord>(
      `${this.apiBaseUrl()}/catalog/products`,
      payload,
      { headers: this.headers() },
    );
  }

  updateProductPricing(
    productId: string,
    payload: {
      name?: string;
      retailUnitPrice?: string | number;
      wholesaleUnitPrice?: string | number | null;
      wholesaleMinBaseQty?: string | number | null;
      currentCostPerBaseUnit?: string | number;
      minStockAlert?: string | number;
      allowNegativeStock?: boolean;
    },
  ): Observable<ProductRecord> {
    return this.http.patch<ProductRecord>(
      `${this.apiBaseUrl()}/catalog/products/${productId}`,
      payload,
      { headers: this.headers() },
    );
  }

  // Inventory & Kardex
  getKardex(productId: string, limit = 50): Observable<KardexResponse> {
    return this.http.get<KardexResponse>(
      `${this.apiBaseUrl()}/inventory/kardex/${productId}?limit=${limit}`,
      { headers: this.headers() },
    );
  }

  recordInventoryAdjustment(payload: {
    productId: string;
    movementType:
      | 'INITIAL_LOAD'
      | 'ADJUSTMENT_IN'
      | 'ADJUSTMENT_OUT'
      | 'WASTE_OUT';
    quantity: string | number;
    presentationId?: string;
    unitCostApplied?: string | number;
    reason: string;
  }): Observable<unknown> {
    return this.http.post(
      `${this.apiBaseUrl()}/inventory/adjustments`,
      payload,
      { headers: this.headers() },
    );
  }

  // Suppliers & Purchases
  listSuppliers(): Observable<SupplierRecord[]> {
    return this.http.get<SupplierRecord[]>(`${this.apiBaseUrl()}/suppliers`, {
      headers: this.headers(),
    });
  }

  createSupplier(payload: {
    code: string;
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    taxId?: string;
    notes?: string;
  }): Observable<SupplierRecord> {
    return this.http.post<SupplierRecord>(
      `${this.apiBaseUrl()}/suppliers`,
      payload,
      { headers: this.headers() },
    );
  }

  upsertSupplierProduct(
    supplierId: string,
    payload: {
      productId: string;
      supplierSku?: string;
      unitCostPerBaseUnit: string;
      leadTimeDays?: number;
      isPreferred?: boolean;
    },
  ): Observable<unknown> {
    return this.http.post(
      `${this.apiBaseUrl()}/suppliers/${supplierId}/products`,
      payload,
      { headers: this.headers() },
    );
  }

  getProductSupplierComparison(
    productId: string,
  ): Observable<ProductSupplierComparisonResponse> {
    return this.http.get<ProductSupplierComparisonResponse>(
      `${this.apiBaseUrl()}/suppliers/product/${productId}/comparison`,
      { headers: this.headers() },
    );
  }

  createPurchaseReceipt(payload: {
    supplierId: string;
    invoiceNumber?: string;
    notes?: string;
    items: Array<{
      productId: string;
      presentationId?: string;
      quantityReceived: string;
      lineCostTotal: string;
    }>;
  }): Observable<PurchaseReceiptRecord> {
    return this.http.post<PurchaseReceiptRecord>(
      `${this.apiBaseUrl()}/purchases/receipts`,
      payload,
      { headers: this.headers() },
    );
  }

  listPurchaseReceipts(limit = 30): Observable<PurchaseReceiptRecord[]> {
    return this.http.get<PurchaseReceiptRecord[]>(
      `${this.apiBaseUrl()}/purchases/receipts?limit=${limit}`,
      { headers: this.headers() },
    );
  }

  // Sales & Cash
  listSales(limit = 30): Observable<SaleTicketSummary[]> {
    return this.http.get<SaleTicketSummary[]>(
      `${this.apiBaseUrl()}/sales?limit=${limit}`,
      { headers: this.headers() },
    );
  }

  // Users & Roles
  listUsers(): Observable<UserAccountRecord[]> {
    return this.http.get<UserAccountRecord[]>(`${this.apiBaseUrl()}/users`, {
      headers: this.headers(),
    });
  }

  listRoles(): Observable<RoleRecord[]> {
    return this.http.get<RoleRecord[]>(`${this.apiBaseUrl()}/users/roles`, {
      headers: this.headers(),
    });
  }

  createUser(payload: {
    username: string;
    fullName: string;
    password: string;
    roleCode: string;
  }): Observable<UserAccountRecord> {
    return this.http.post<UserAccountRecord>(
      `${this.apiBaseUrl()}/users`,
      payload,
      { headers: this.headers() },
    );
  }

  updateUserStatus(
    userId: string,
    isActive: boolean,
  ): Observable<UserAccountRecord> {
    return this.http.patch<UserAccountRecord>(
      `${this.apiBaseUrl()}/users/${userId}/status`,
      { isActive },
      { headers: this.headers() },
    );
  }

  // Audit
  listAuditLogs(module?: string, limit = 50): Observable<AuditLogRecord[]> {
    const query = module?.trim()
      ? `?module=${encodeURIComponent(module.trim())}&limit=${limit}`
      : `?limit=${limit}`;
    return this.http.get<AuditLogRecord[]>(
      `${this.apiBaseUrl()}/audit${query}`,
      { headers: this.headers() },
    );
  }
}

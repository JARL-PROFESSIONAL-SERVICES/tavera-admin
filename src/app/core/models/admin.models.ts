export interface AuthenticatedUser {
  id: string;
  username: string;
  fullName: string;
  roleCode: string;
  permissions: string[];
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: AuthenticatedUser;
}

export interface UnitOfMeasure {
  id: string;
  code: string;
  name: string;
  allowsDecimals: boolean;
}

export interface CategoryRecord {
  id: string;
  name: string;
  description: string | null;
}

export interface ProductPresentation {
  id: string;
  productId: string;
  name: string;
  conversionFactor: string;
  price: string;
  isActive: boolean;
}

export interface ProductBarcode {
  id: string;
  code: string;
  productId: string;
  presentationId: string | null;
  isPrimary: boolean;
}

export interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  category?: CategoryRecord | null;
  baseUnitId: string;
  baseUnit?: UnitOfMeasure;
  isSoldByWeightOrBulk: boolean;
  retailUnitPrice: string;
  wholesaleUnitPrice: string | null;
  wholesaleMinBaseQty: string | null;
  currentCostPerBaseUnit: string;
  ivaRate: string;
  iepsRate: string;
  stockQuantity: string;
  minStockAlert: string;
  allowNegativeStock: boolean;
  isActive: boolean;
  barcodes: ProductBarcode[];
  presentations: ProductPresentation[];
}

export interface KardexMovementRecord {
  id: string;
  productId: string;
  movementType: string;
  quantityDelta: string;
  previousStock: string;
  newStock: string;
  unitCostApplied: string | null;
  reason: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface KardexResponse {
  product: {
    id: string;
    sku: string;
    name: string;
    baseUnit: string;
    currentStock: string;
    minStockAlert: string;
  };
  movements: KardexMovementRecord[];
}

export interface SupplierRecord {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  taxId: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface SupplierComparisonOffer {
  supplierProductId: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  supplierSku: string | null;
  unitCostPerBaseUnit: string;
  leadTimeDays: number | null;
  isPreferred: boolean;
  lastQuotedAt: string;
  priceHistory: Array<{
    id: string;
    unitCostPerBaseUnit: string;
    source: string;
    recordedAt: string;
  }>;
}

export interface ProductSupplierComparisonResponse {
  product: {
    id: string;
    sku: string;
    name: string;
    baseUnitCode: string;
    currentCostPerBaseUnit: string;
    retailUnitPrice: string;
  };
  bestCostPerBaseUnit: string | null;
  suppliersCount: number;
  offers: SupplierComparisonOffer[];
}

export interface PurchaseReceiptRecord {
  id: string;
  folio: string;
  supplierId: string;
  invoiceNumber: string | null;
  totalCost: string;
  notes: string | null;
  receivedAt: string;
  supplier?: {
    id: string;
    code: string;
    name: string;
  };
  items: Array<{
    id: string;
    productId: string;
    presentationId: string | null;
    quantityReceived: string;
    conversionFactorApplied: string;
    baseUnitsReceived: string;
    lineCostTotal: string;
    unitCostPerBaseUnit: string;
  }>;
}

export interface DashboardSummaryResponse {
  salesSummary: {
    completedTicketsCount: number;
    cancelledTicketsCount: number;
    totalRevenueGross: string;
    totalRefunded: string;
    netRevenueAfterReturns: string;
    subtotalNet: string;
    ivaAmount: string;
    iepsAmount: string;
    estimatedCostOfGoodsSold: string;
    estimatedGrossProfit: string;
  };
  paymentBreakdown: {
    CASH: string;
    CARD: string;
    TRANSFER: string;
  };
  cashSummary: {
    openSessionsCount: number;
    openSessions: Array<{
      id: string;
      registerCode: string;
      openingBalance: string;
      openedAt: string;
      openedByUser?: {
        id: string;
        username: string;
        fullName: string;
      };
    }>;
  };
  inventoryAlerts: {
    lowStockCount: number;
    lowStockItems: Array<{
      id: string;
      sku: string;
      name: string;
      stockQuantity: string;
      minStockAlert: string;
    }>;
  };
  recentAuditEvents: AuditLogRecord[];
}

export interface SaleTicketSummary {
  id: string;
  folio: string;
  status: string;
  subtotalNet: string;
  ivaAmount: string;
  iepsAmount: string;
  totalGross: string;
  totalTendered: string;
  changeGiven: string;
  createdAt: string;
  items: Array<{
    id: string;
    productNameSnapshot: string;
    skuSnapshot: string;
    presentationNameSnapshot: string | null;
    quantity: string;
    returnedQuantity: string;
    priceTierApplied: string;
    unitPriceApplied: string;
    unitCostSnapshot: string;
    lineTotalGross: string;
  }>;
}

export interface UserAccountRecord {
  id: string;
  username: string;
  fullName: string;
  isActive: boolean;
  roleCode: string;
  roleName: string;
  createdAt: string;
}

export interface RoleRecord {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: string[];
}

export interface AuditLogRecord {
  id: string;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
  actorUser?: {
    id: string;
    username: string;
    fullName: string;
  } | null;
}

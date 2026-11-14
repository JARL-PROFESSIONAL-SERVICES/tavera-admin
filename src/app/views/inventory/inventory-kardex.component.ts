import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideChevronRight, lucidePlus, lucideSearch } from '@ng-icons/lucide';
import {
  KardexMovementRecord,
  KardexResponse,
  ProductRecord,
} from '../../core/models/admin.models';

@Component({
  selector: 'app-inventory-kardex',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({ lucideArrowLeft, lucideChevronRight, lucidePlus, lucideSearch }),
  ],
  templateUrl: './inventory-kardex.component.html',
})
export class InventoryKardexComponent {
  @Input() products: ProductRecord[] = [];
  @Input() kardex: KardexResponse | null = null;
  @Input() kardexError = false;
  @Input() productsLoading = false;
  @Input() productsError: string | null = null;
  @Input() canAdjust = false;
  @Input() selectedProductId = '';

  @Output() closeHistory = new EventEmitter<void>();
  @Output() retryProducts = new EventEmitter<void>();
  @Output() selectProduct = new EventEmitter<string>();
  @Output() openAdjustmentWizard = new EventEmitter<void>();

  productSearch = '';
  stockStatusFilter: 'ALL' | 'LOW' | 'OUT' = 'ALL';
  movementFilter = 'ALL';
  readonly stockFilters = [
    { value: 'ALL', label: 'Todos' },
    { value: 'LOW', label: 'Stock bajo' },
    { value: 'OUT', label: 'Agotados' },
  ] as const;

  onSelectProduct(id: string): void {
    this.movementFilter = 'ALL';
    this.selectProduct.emit(id);
  }

  getLowStockCount(): number {
    return this.products.filter((p) => {
      const stock = Number(p.stockQuantity || 0);
      const min = Number(p.minStockAlert || 0);
      return stock > 0 && stock <= min;
    }).length;
  }

  getOutOfStockCount(): number {
    return this.products.filter((p) => Number(p.stockQuantity || 0) <= 0).length;
  }

  filteredProducts(): ProductRecord[] {
    const query = this.productSearch.trim().toLowerCase();
    return this.products.filter((p) => {
      const stock = Number(p.stockQuantity || 0);
      const min = Number(p.minStockAlert || 0);

      if (this.stockStatusFilter === 'LOW' && !(stock > 0 && stock <= min)) {
        return false;
      }
      if (this.stockStatusFilter === 'OUT' && stock > 0) {
        return false;
      }
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query) ||
        p.barcodes?.some((barcode) => barcode.code.toLowerCase().includes(query))
      );
    });
  }

  formatQty(value: string | number | undefined | null): string {
    if (value === undefined || value === null || value === '') return '0';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return Number.isInteger(num) ? String(num) : String(Number(num.toFixed(4)));
  }

  stockAlert(product: ProductRecord): string {
    const stock = Number(product.stockQuantity);
    if (stock <= 0) return 'Agotado';
    return stock <= Number(product.minStockAlert) ? 'Stock bajo' : '';
  }

  movementTypes(): string[] {
    return [...new Set(this.kardex?.movements.map((movement) => movement.movementType))];
  }

  filteredMovements(): KardexMovementRecord[] {
    if (!this.kardex) return [];
    if (this.movementFilter === 'ALL') return this.kardex.movements;
    return this.kardex.movements.filter(
      (m) => m.movementType === this.movementFilter,
    );
  }

  formatMovementLabel(type: string): string {
    switch (type) {
      case 'INITIAL_LOAD':
        return 'Stock Inicial';
      case 'PURCHASE_RECEIPT':
        return 'Compra a Proveedor';
      case 'SALE_OUT':
        return 'Venta en Caja';
      case 'SALE_RETURN_IN':
        return 'Devolución';
      case 'ADJUSTMENT_IN':
        return 'Entrada Manual';
      case 'ADJUSTMENT_OUT':
        return 'Salida Manual';
      case 'WASTE_OUT':
        return 'Merma / Daño';
      default:
        return type;
    }
  }

}

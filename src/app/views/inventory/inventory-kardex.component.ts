import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideArrowDownRight,
  lucideArrowUpRight,
  lucideBoxes,
  lucideCheckCircle2,
  lucideClock,
  lucideFilter,
  lucidePackage,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
} from '@ng-icons/lucide';
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
    provideIcons({
      lucideAlertTriangle,
      lucideArrowDownRight,
      lucideArrowUpRight,
      lucideBoxes,
      lucideCheckCircle2,
      lucideClock,
      lucideFilter,
      lucidePackage,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
    }),
  ],
  templateUrl: './inventory-kardex.component.html',
})
export class InventoryKardexComponent {
  @Input() products: ProductRecord[] = [];
  @Input() kardex: KardexResponse | null = null;
  @Input() selectedProductId = '';

  @Output() selectProduct = new EventEmitter<string>();
  @Output() openAdjustmentWizard = new EventEmitter<void>();

  productSearch = '';
  stockStatusFilter: 'ALL' | 'LOW' | 'OUT' = 'ALL';
  movementFilter = 'ALL';

  onSelectProduct(id: string): void {
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
        p.sku.toLowerCase().includes(query)
      );
    });
  }

  formatQty(value: string | number | undefined | null): string {
    if (value === undefined || value === null || value === '') return '0';
    const num = Number(value);
    if (Number.isNaN(num)) return String(value);
    return Number.isInteger(num) ? String(num) : String(Number(num.toFixed(3)));
  }

  getStockBadgeClass(prod: ProductRecord): string {
    const stock = Number(prod.stockQuantity || 0);
    const min = Number(prod.minStockAlert || 0);
    if (stock <= 0) {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    }
    if (stock <= min) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
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

  getMovementTypeBadge(type: string): string {
    switch (type) {
      case 'INITIAL_LOAD':
      case 'PURCHASE_RECEIPT':
      case 'SALE_RETURN_IN':
      case 'ADJUSTMENT_IN':
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
      case 'SALE_OUT':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20';
      case 'ADJUSTMENT_OUT':
      case 'WASTE_OUT':
        return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
  }
}

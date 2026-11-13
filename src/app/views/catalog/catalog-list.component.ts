import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideArrowUpDown,
  lucideBoxes,
  lucideCheck,
  lucideCheckCircle2,
  lucideEdit,
  lucideEye,
  lucideFilter,
  lucidePackage,
  lucidePlus,
  lucideSearch,
  lucideX,
} from '@ng-icons/lucide';
import { TableModule } from 'primeng/table';
import {
  CategoryRecord,
  ProductRecord,
  UnitOfMeasure,
} from '../../core/models/admin.models';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideArrowUpDown,
      lucideBoxes,
      lucideCheck,
      lucideCheckCircle2,
      lucideEdit,
      lucideEye,
      lucideFilter,
      lucidePackage,
      lucidePlus,
      lucideSearch,
      lucideX,
    }),
  ],
  templateUrl: './catalog-list.component.html',
})
export class CatalogListComponent {
  @Input() products: ProductRecord[] = [];
  @Input() categories: CategoryRecord[] = [];
  @Input() units: UnitOfMeasure[] = [];

  @Output() createProduct = new EventEmitter<void>();
  @Output() editProduct = new EventEmitter<ProductRecord>();
  @Output() viewKardex = new EventEmitter<string>();
  @Output() updatePrice = new EventEmitter<{
    product: ProductRecord;
    newPrice: string;
  }>();

  readonly searchQuery = signal('');
  readonly selectedCategory = signal('');
  readonly stockFilter = signal<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  readonly editingProductId = signal<string | null>(null);
  readonly tempPrice = signal<string>('');

  startQuickEdit(p: ProductRecord): void {
    this.editingProductId.set(p.id);
    this.tempPrice.set(p.retailUnitPrice);
  }

  saveQuickPrice(p: ProductRecord): void {
    const price = this.tempPrice().trim();
    if (price && Number(price) > 0) {
      this.updatePrice.emit({ product: p, newPrice: price });
    }
    this.editingProductId.set(null);
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('');
    this.stockFilter.set('ALL');
  }

  filteredProducts(): ProductRecord[] {
    const q = this.searchQuery().toLowerCase().trim();
    const cat = this.selectedCategory();
    const sf = this.stockFilter();

    return this.products.filter((p) => {
      // Search text match
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchBarcode = p.barcodes?.some((b) =>
          b.code.toLowerCase().includes(q),
        );
        if (!matchName && !matchSku && !matchBarcode) return false;
      }

      // Category match
      if (cat && p.categoryId !== cat) {
        return false;
      }

      // Stock status match
      const stock = Number(p.stockQuantity ?? 0);
      const minStock = Number(p.minStockAlert ?? 0);

      if (sf === 'IN_STOCK' && stock <= 0) return false;
      if (sf === 'LOW_STOCK' && (stock > minStock || stock <= 0)) return false;
      if (sf === 'OUT_OF_STOCK' && stock > 0) return false;

      return true;
    });
  }

  formatMoney(val: string | number | undefined | null): string {
    const num = Number(val ?? 0);
    return isNaN(num)
      ? '0.00'
      : num.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }

  getStockStatusLabel(p: ProductRecord): string {
    const s = Number(p.stockQuantity ?? 0);
    const m = Number(p.minStockAlert ?? 0);
    if (s <= 0) return 'Agotado';
    if (s <= m) return 'Stock Bajo';
    return 'Óptimo';
  }

  getStockBadgeClass(p: ProductRecord): string {
    const s = Number(p.stockQuantity ?? 0);
    const m = Number(p.minStockAlert ?? 0);
    if (s <= 0) {
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    }
    if (s <= m) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
  }

  getStockTextColor(p: ProductRecord): string {
    const s = Number(p.stockQuantity ?? 0);
    const m = Number(p.minStockAlert ?? 0);
    if (s <= 0) return 'text-red-600 dark:text-red-400';
    if (s <= m) return 'text-amber-600 dark:text-amber-400';
    return 'text-[var(--foreground)]';
  }
}

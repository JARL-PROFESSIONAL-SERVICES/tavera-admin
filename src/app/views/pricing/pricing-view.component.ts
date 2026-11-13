import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideArrowUpRight,
  lucideCheck,
  lucideDollarSign,
  lucideEdit,
  lucideSearch,
  lucideTrendingUp,
  lucideX,
} from '@ng-icons/lucide';
import { ProductRecord } from '../../core/models/admin.models';

@Component({
  selector: 'app-pricing-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideArrowUpRight,
      lucideCheck,
      lucideDollarSign,
      lucideEdit,
      lucideSearch,
      lucideTrendingUp,
      lucideX,
    }),
  ],
  templateUrl: './pricing-view.component.html',
})
export class PricingViewComponent {
  @Input() products: ProductRecord[] = [];
  @Output() updatePricing = new EventEmitter<{
    productId: string;
    retailUnitPrice: string;
    wholesaleUnitPrice?: string | null;
    wholesaleMinBaseQty?: string | null;
  }>();

  searchQuery = '';
  marginFilter: 'ALL' | 'HEALTHY' | 'TIGHT' | 'CRITICAL' = 'ALL';

  readonly editingProduct = signal<ProductRecord | null>(null);
  readonly isSaving = signal(false);

  editRetailPrice = '';
  editWholesalePrice = '';
  editWholesaleMinQty = '';

  filteredProducts(): ProductRecord[] {
    const q = this.searchQuery.toLowerCase().trim();
    const mf = this.marginFilter;

    return this.products.filter((p) => {
      if (q) {
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        if (!matchName && !matchSku) return false;
      }

      const cost = Number(p.currentCostPerBaseUnit || 0);
      const price = Number(p.retailUnitPrice || 0);
      const margin = price > 0 ? ((price - cost) / price) * 100 : 0;

      if (mf === 'HEALTHY' && margin < 20) return false;
      if (mf === 'TIGHT' && (margin < 10 || margin >= 20)) return false;
      if (mf === 'CRITICAL' && margin >= 10) return false;

      return true;
    });
  }

  calculateMargin(costStr: string, priceStr: string): string {
    const cost = Number(costStr || 0);
    const price = Number(priceStr || 0);
    if (!price || price <= 0) return '0.0';
    return (((price - cost) / price) * 100).toFixed(1);
  }

  getMarginBadgeClass(costStr: string, priceStr: string): string {
    const margin = Number(this.calculateMargin(costStr, priceStr));
    if (margin >= 20) {
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    } else if (margin >= 10) {
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20';
    } else {
      return 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20';
    }
  }

  getMarginTextColor(costStr: string, priceStr: string): string {
    const margin = Number(this.calculateMargin(costStr, priceStr));
    if (margin >= 20) return 'text-emerald-600 dark:text-emerald-400';
    if (margin >= 10) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  getMarginIcon(costStr: string, priceStr: string): string {
    const margin = Number(this.calculateMargin(costStr, priceStr));
    if (margin >= 10) return 'lucideTrendingUp';
    return 'lucideAlertTriangle';
  }

  openPriceEditor(p: ProductRecord): void {
    this.editingProduct.set(p);
    this.editRetailPrice = p.retailUnitPrice;
    this.editWholesalePrice = p.wholesaleUnitPrice ?? '';
    this.editWholesaleMinQty = p.wholesaleMinBaseQty ?? '';
  }

  savePricingChanges(p: ProductRecord): void {
    const retail = this.editRetailPrice.trim();
    if (!retail || Number(retail) <= 0) return;

    this.isSaving.set(true);
    this.updatePricing.emit({
      productId: p.id,
      retailUnitPrice: retail,
      wholesaleUnitPrice: this.editWholesalePrice.trim() || null,
      wholesaleMinBaseQty: this.editWholesaleMinQty.trim() || null,
    });
    this.isSaving.set(false);
    this.editingProduct.set(null);
  }
}

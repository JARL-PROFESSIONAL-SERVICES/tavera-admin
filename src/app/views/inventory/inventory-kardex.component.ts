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

  movementFilter = 'ALL';

  onSelectProduct(id: string): void {
    this.selectProduct.emit(id);
  }

  getTotalStock(): number {
    return this.products.reduce(
      (acc, p) => acc + Number(p.stockQuantity || 0),
      0,
    );
  }

  getLowStockCount(): number {
    return this.products.filter(
      (p) => Number(p.stockQuantity || 0) <= Number(p.minStockAlert || 0),
    ).length;
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
        return 'Carga Inicial';
      case 'PURCHASE_RECEIPT':
        return 'Recepción Compra';
      case 'SALE_OUT':
        return 'Salida por Venta';
      case 'SALE_RETURN_IN':
        return 'Devolución Cliente';
      case 'ADJUSTMENT_IN':
        return 'Ajuste Positivo';
      case 'ADJUSTMENT_OUT':
        return 'Ajuste Negativo';
      case 'WASTE_OUT':
        return 'Merma / Merma Faltante';
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

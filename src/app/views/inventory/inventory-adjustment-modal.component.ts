import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideCheck,
  lucidePackage,
  lucideX,
} from '@ng-icons/lucide';
import { ProductRecord } from '../../core/models/admin.models';

export type AdjustmentMovementType =
  | 'INITIAL_LOAD'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'WASTE_OUT';

export interface InventoryAdjustmentData {
  productId: string;
  movementType: AdjustmentMovementType;
  quantity: string;
  unitCostApplied: string;
  reason: string;
}

@Component({
  selector: 'app-inventory-adjustment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideCheck,
      lucidePackage,
      lucideX,
    }),
  ],
  templateUrl: './inventory-adjustment-modal.component.html',
})
export class InventoryAdjustmentModalComponent implements OnChanges {
  @Input() products: ProductRecord[] = [];
  @Input() defaultProductId = '';
  @Input() isSaving = false;

  @Output() applyAdjustment = new EventEmitter<InventoryAdjustmentData>();
  @Output() cancel = new EventEmitter<void>();

  readonly selectedProductId = signal('');
  readonly movementType = signal<AdjustmentMovementType>('ADJUSTMENT_IN');
  readonly quantity = signal('10');
  readonly unitCost = signal('18.00');
  readonly reason = signal('Ajuste de inventario por conteo físico en tienda');

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultProductId'] && this.defaultProductId) {
      this.selectedProductId.set(this.defaultProductId);
      this.syncCostFromProduct(this.defaultProductId);
    } else if (!this.selectedProductId() && this.products.length > 0) {
      this.selectedProductId.set(this.products[0].id);
      this.syncCostFromProduct(this.products[0].id);
    }
  }

  onProductChange(id: string): void {
    this.selectedProductId.set(id);
    this.syncCostFromProduct(id);
  }

  private syncCostFromProduct(id: string): void {
    const p = this.products.find((prod) => prod.id === id);
    if (p) {
      this.unitCost.set(p.currentCostPerBaseUnit || '18.00');
    }
  }

  currentStock(): number {
    const p = this.products.find((prod) => prod.id === this.selectedProductId());
    return p ? Number(p.stockQuantity || 0) : 0;
  }

  isReduction(): boolean {
    const t = this.movementType();
    return t === 'ADJUSTMENT_OUT' || t === 'WASTE_OUT';
  }

  projectedStock(): number {
    const current = this.currentStock();
    const qty = Number(this.quantity() || 0);
    return this.isReduction() ? current - qty : current + qty;
  }

  isValid(): boolean {
    return Boolean(
      this.selectedProductId() &&
        Number(this.quantity()) > 0 &&
        Number(this.unitCost()) >= 0 &&
        this.reason().trim(),
    );
  }

  submitAdjustment(): void {
    if (!this.isValid()) return;
    this.applyAdjustment.emit({
      productId: this.selectedProductId(),
      movementType: this.movementType(),
      quantity: this.quantity().trim(),
      unitCostApplied: this.unitCost().trim(),
      reason: this.reason().trim(),
    });
  }
}

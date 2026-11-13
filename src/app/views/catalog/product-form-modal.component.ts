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
  lucideAlertCircle,
  lucideAlertTriangle,
  lucideBarcode,
  lucideCheckCircle2,
  lucideDollarSign,
  lucideInfo,
  lucideLayers,
  lucidePackage,
  lucidePlus,
  lucideSave,
  lucideTag,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import {
  CategoryRecord,
  ProductRecord,
  UnitOfMeasure,
} from '../../core/models/admin.models';

export interface ProductFormData {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  baseUnitCode: string;
  isSoldByWeightOrBulk: boolean;
  retailUnitPrice: string;
  wholesaleUnitPrice?: string;
  wholesaleMinBaseQty?: string;
  currentCostPerBaseUnit: string;
  ivaRate: string;
  iepsRate: string;
  minStockAlert: string;
  allowNegativeStock: boolean;
  barcodes: string[];
  presentations: Array<{
    name: string;
    conversionFactor: string;
    price: string;
    barcode?: string;
  }>;
}

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideBarcode,
      lucideCheckCircle2,
      lucideDollarSign,
      lucideInfo,
      lucideLayers,
      lucidePackage,
      lucidePlus,
      lucideSave,
      lucideTag,
      lucideTrash2,
      lucideX,
    }),
  ],
  templateUrl: './product-form-modal.component.html',
})
export class ProductFormModalComponent implements OnChanges {
  @Input() product: ProductRecord | null = null;
  @Input() categories: CategoryRecord[] = [];
  @Input() units: UnitOfMeasure[] = [];
  @Input() isSaving = false;

  @Output() save = new EventEmitter<ProductFormData>();
  @Output() cancel = new EventEmitter<void>();

  activeTab: 'IDENTITY' | 'PRESENTATIONS' | 'PRICING' | 'INVENTORY' = 'IDENTITY';

  readonly formSku = signal('ACE-123');
  readonly formName = signal('Aceite Vegetal 123 1L');
  readonly formDescription = signal('');
  readonly formCategoryId = signal('');
  readonly formBaseUnitCode = signal('PZA');
  readonly formIsSoldByWeight = signal(false);
  readonly formCost = signal('18.00');
  readonly formRetailPrice = signal('25.00');
  readonly formWholesalePrice = signal('22.50');
  readonly formWholesaleMinQty = signal('6');
  readonly formIvaRate = signal('0.1600');
  readonly formIepsRate = signal('0.0000');
  readonly formMinStockAlert = signal('10');
  readonly formAllowNegativeStock = signal(false);

  readonly formBarcodes = signal<string[]>([]);
  readonly newBarcodeDraft = signal('');

  readonly formPresentations = signal<
    Array<{
      name: string;
      conversionFactor: string;
      price: string;
      barcode?: string;
    }>
  >([]);
  readonly newPresName = signal('');
  readonly newPresFactor = signal('12');
  readonly newPresPrice = signal('252.00');

  get isEditMode(): boolean {
    return Boolean(this.product);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product'] && this.product) {
      this.populateFromProduct(this.product);
    }
  }

  populateFromProduct(p: ProductRecord): void {
    this.formSku.set(p.sku);
    this.formName.set(p.name);
    this.formDescription.set(p.description ?? '');
    this.formCategoryId.set(p.categoryId ?? '');
    this.formBaseUnitCode.set(p.baseUnit?.code ?? 'PZA');
    this.formIsSoldByWeight.set(p.isSoldByWeightOrBulk);
    this.formCost.set(p.currentCostPerBaseUnit);
    this.formRetailPrice.set(p.retailUnitPrice);
    this.formWholesalePrice.set(p.wholesaleUnitPrice ?? '');
    this.formWholesaleMinQty.set(p.wholesaleMinBaseQty ?? '');
    this.formIvaRate.set(p.ivaRate);
    this.formIepsRate.set(p.iepsRate);
    this.formMinStockAlert.set(p.minStockAlert);
    this.formAllowNegativeStock.set(p.allowNegativeStock);
    this.formBarcodes.set(p.barcodes?.map((b) => b.code) ?? []);
    this.formPresentations.set(
      p.presentations?.map((pr) => ({
        name: pr.name,
        conversionFactor: pr.conversionFactor,
        price: pr.price,
      })) ?? [],
    );
  }

  addBarcode(): void {
    const code = this.newBarcodeDraft().trim();
    if (!code) return;
    if (!this.formBarcodes().includes(code)) {
      this.formBarcodes.update((b) => [...b, code]);
    }
    this.newBarcodeDraft.set('');
  }

  removeBarcode(idx: number): void {
    this.formBarcodes.update((b) => b.filter((_, i) => i !== idx));
  }

  addPresentation(): void {
    const name = this.newPresName().trim();
    const factor = this.newPresFactor().trim();
    const price = this.newPresPrice().trim();
    if (!name || !factor || !price) return;

    this.formPresentations.update((list) => [
      ...list,
      { name, conversionFactor: factor, price },
    ]);
    this.newPresName.set('');
    this.newPresFactor.set('12');
    this.newPresPrice.set('');
  }

  removePresentation(idx: number): void {
    this.formPresentations.update((list) => list.filter((_, i) => i !== idx));
  }

  readonly liveMarginPercentage = computed(() => {
    const c = Number(this.formCost() || 0);
    const p = Number(this.formRetailPrice() || 0);
    if (!p || p <= 0) return '0.0';
    return (((p - c) / p) * 100).toFixed(1);
  });

  readonly liveProfitAmount = computed(() => {
    const c = Number(this.formCost() || 0);
    const p = Number(this.formRetailPrice() || 0);
    return Math.max(0, p - c).toFixed(2);
  });

  marginCardClass(): string {
    const margin = Number(this.liveMarginPercentage());
    if (margin >= 20) {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300';
    } else if (margin >= 10) {
      return 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300';
    } else {
      return 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300';
    }
  }

  isValid(): boolean {
    return Boolean(
      this.formSku().trim() &&
        this.formName().trim() &&
        this.formBaseUnitCode() &&
        Number(this.formRetailPrice()) > 0,
    );
  }

  submitForm(): void {
    if (!this.isValid()) return;

    const payload: ProductFormData = {
      sku: this.formSku().trim(),
      name: this.formName().trim(),
      description: this.formDescription().trim() || undefined,
      categoryId: this.formCategoryId() || undefined,
      baseUnitCode: this.formBaseUnitCode(),
      isSoldByWeightOrBulk: this.formIsSoldByWeight(),
      retailUnitPrice: this.formRetailPrice(),
      wholesaleUnitPrice: this.formWholesalePrice() || undefined,
      wholesaleMinBaseQty: this.formWholesaleMinQty() || undefined,
      currentCostPerBaseUnit: this.formCost(),
      ivaRate: this.formIvaRate(),
      iepsRate: this.formIepsRate(),
      minStockAlert: this.formMinStockAlert(),
      allowNegativeStock: this.formAllowNegativeStock(),
      barcodes: this.formBarcodes(),
      presentations: this.formPresentations(),
    };

    this.save.emit(payload);
  }
}

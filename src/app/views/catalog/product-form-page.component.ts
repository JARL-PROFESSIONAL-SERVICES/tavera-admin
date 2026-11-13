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
  lucideArrowLeft,
  lucideBarcode,
  lucideBoxes,
  lucideCheck,
  lucideCheckCircle2,
  lucideDollarSign,
  lucideHelpCircle,
  lucideInfo,
  lucideLayers,
  lucidePackage,
  lucidePlus,
  lucideSave,
  lucideScale,
  lucideTag,
  lucideTrash2,
  lucideTrendingUp,
  lucideX,
} from '@ng-icons/lucide';
import {
  CategoryRecord,
  ProductRecord,
  UnitOfMeasure,
} from '../../core/models/admin.models';
import { ProductFormData } from './product-form-modal.component';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertCircle,
      lucideAlertTriangle,
      lucideArrowLeft,
      lucideBarcode,
      lucideBoxes,
      lucideCheck,
      lucideCheckCircle2,
      lucideDollarSign,
      lucideHelpCircle,
      lucideInfo,
      lucideLayers,
      lucidePackage,
      lucidePlus,
      lucideSave,
      lucideScale,
      lucideTag,
      lucideTrash2,
      lucideTrendingUp,
      lucideX,
    }),
  ],
  templateUrl: './product-form-page.component.html',
})
export class ProductFormPageComponent implements OnChanges {
  @Input() product: ProductRecord | null = null;
  @Input() categories: CategoryRecord[] = [];
  @Input() units: UnitOfMeasure[] = [];
  @Input() isSaving = false;

  @Output() save = new EventEmitter<ProductFormData>();
  @Output() backToCatalog = new EventEmitter<void>();

  // Dialog for unsaved changes confirmation
  readonly showUnsavedModal = signal(false);

  // Form signals
  readonly formSku = signal('');
  readonly formName = signal('');
  readonly formDescription = signal('');
  readonly formCategoryId = signal('');
  readonly formBaseUnitCode = signal('PZA');
  readonly formIsSoldByWeight = signal(false);
  readonly formCost = signal('0.00');
  readonly formRetailPrice = signal('0.00');
  readonly formWholesalePrice = signal('');
  readonly formWholesaleMinQty = signal('');
  readonly formIvaRate = signal('0.0000');
  readonly formIepsRate = signal('0.0000');
  readonly formMinStockAlert = signal('5');
  readonly formAllowNegativeStock = signal(false);

  // Barcodes
  readonly formBarcodes = signal<string[]>([]);
  readonly newBarcodeDraft = signal('');

  // Presentations
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
  readonly newPresPrice = signal('');

  // Initial snapshot to track if form is dirty
  private initialFormHash = signal<string>('');

  get isEditMode(): boolean {
    return Boolean(this.product);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      if (this.product) {
        this.populateFromProduct(this.product);
      } else {
        this.resetToDefaults();
      }
      this.snapshotInitialState();
    }
  }

  resetToDefaults(): void {
    this.formSku.set('');
    this.formName.set('');
    this.formDescription.set('');
    this.formCategoryId.set(this.categories.length > 0 ? this.categories[0].id : '');
    this.formBaseUnitCode.set('PZA');
    this.formIsSoldByWeight.set(false);
    this.formCost.set('15.00');
    this.formRetailPrice.set('20.00');
    this.formWholesalePrice.set('');
    this.formWholesaleMinQty.set('');
    this.formIvaRate.set('0.0000');
    this.formIepsRate.set('0.0000');
    this.formMinStockAlert.set('5');
    this.formAllowNegativeStock.set(false);
    this.formBarcodes.set([]);
    this.formPresentations.set([]);
    this.newBarcodeDraft.set('');
    this.newPresName.set('');
    this.newPresFactor.set('12');
    this.newPresPrice.set('');
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

  private snapshotInitialState(): void {
    this.initialFormHash.set(this.computeCurrentHash());
  }

  private computeCurrentHash(): string {
    return JSON.stringify({
      sku: this.formSku(),
      name: this.formName(),
      desc: this.formDescription(),
      cat: this.formCategoryId(),
      unit: this.formBaseUnitCode(),
      bulk: this.formIsSoldByWeight(),
      cost: this.formCost(),
      price: this.formRetailPrice(),
      wsPrice: this.formWholesalePrice(),
      wsMin: this.formWholesaleMinQty(),
      iva: this.formIvaRate(),
      ieps: this.formIepsRate(),
      stockMin: this.formMinStockAlert(),
      neg: this.formAllowNegativeStock(),
      barcodes: this.formBarcodes(),
      presentations: this.formPresentations(),
    });
  }

  readonly isDirty = computed(() => {
    return this.computeCurrentHash() !== this.initialFormHash();
  });

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

  marginHealthTitle(): string {
    const margin = Number(this.liveMarginPercentage());
    if (margin >= 20) {
      return 'Margen Saludable (≥ 20%)';
    } else if (margin >= 10) {
      return 'Margen Moderado (10% a 19.9%)';
    } else {
      return 'Margen Bajo o Pérdida (< 10%)';
    }
  }

  marginHealthMessage(): string {
    const margin = Number(this.liveMarginPercentage());
    if (margin >= 20) {
      return 'Excelente rentabilidad comercial. Protege tu negocio y cubre tus costos fijos.';
    } else if (margin >= 10) {
      return 'Margen ajustado. Procura monitorear el costo de adquisición de tus proveedores.';
    } else {
      return 'Atención: Estás ganando muy poco o perdiendo dinero. Considera ajustar el precio de venta.';
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

  onCancel(): void {
    if (this.isDirty()) {
      this.showUnsavedModal.set(true);
    } else {
      this.backToCatalog.emit();
    }
  }

  confirmDiscardAndLeave(): void {
    this.showUnsavedModal.set(false);
    this.backToCatalog.emit();
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

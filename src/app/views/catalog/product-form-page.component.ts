import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  computed,
  inject,
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
  lucideChevronDown,
  lucideChevronUp,
  lucideDollarSign,
  lucideHelpCircle,
  lucideInfo,
  lucideLayers,
  lucidePackage,
  lucidePlus,
  lucideSave,
  lucideScale,
  lucideSparkles,
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
import { ToastService } from '../../core/services/toast.service';
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
      lucideChevronDown,
      lucideChevronUp,
      lucideDollarSign,
      lucideHelpCircle,
      lucideInfo,
      lucideLayers,
      lucidePackage,
      lucidePlus,
      lucideSave,
      lucideScale,
      lucideSparkles,
      lucideTag,
      lucideTrash2,
      lucideTrendingUp,
      lucideX,
    }),
  ],
  templateUrl: './product-form-page.component.html',
})
export class ProductFormPageComponent implements OnChanges {
  readonly toast = inject(ToastService);

  @Input() product: ProductRecord | null = null;
  @Input() categories: CategoryRecord[] = [];
  @Input() units: UnitOfMeasure[] = [];
  @Input() isSaving = false;

  @Output() save = new EventEmitter<ProductFormData>();
  @Output() backToCatalog = new EventEmitter<void>();

  // Dialog for unsaved changes confirmation
  readonly showUnsavedModal = signal(false);

  // Progressive disclosure toggles
  readonly enableWholesale = signal(false);
  readonly showAdvancedFiscal = signal(false);

  // Form signals
  readonly formSku = signal('');
  readonly formName = signal('');
  readonly formDescription = signal('');
  readonly formCategoryId = signal('');
  readonly formBaseUnitCode = signal('PZA');
  readonly formIsSoldByWeight = signal(false);
  readonly formCost = signal('');
  readonly formRetailPrice = signal('');
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
    if (changes['product'] || changes['categories']) {
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
    this.formCost.set('');
    this.formRetailPrice.set('');
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
    this.enableWholesale.set(false);
    this.showAdvancedFiscal.set(false);
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
    this.enableWholesale.set(Boolean(p.wholesaleUnitPrice && Number(p.wholesaleUnitPrice) > 0));
    this.showAdvancedFiscal.set(Boolean(Number(p.ivaRate) > 0 || Number(p.iepsRate) > 0));
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
      wholesaleOn: this.enableWholesale(),
    });
  }

  readonly isDirty = computed(() => {
    return this.computeCurrentHash() !== this.initialFormHash();
  });

  generateSuggestedSku(): void {
    const rawName = this.formName().trim();
    if (!rawName) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      this.formSku.set(`PROD-${randomSuffix}`);
      this.toast.info('Clave generada', `Se asignó la clave "PROD-${randomSuffix}".`);
      return;
    }

    const clean = rawName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .trim();

    const parts = clean.split(/\s+/).filter(Boolean);
    let sku = '';
    if (parts.length === 1) {
      sku = parts[0].slice(0, 8);
    } else if (parts.length === 2) {
      sku = `${parts[0].slice(0, 5)}-${parts[1].slice(0, 5)}`;
    } else {
      sku = `${parts[0].slice(0, 4)}-${parts[1].slice(0, 4)}-${parts[parts.length - 1].slice(0, 4)}`;
    }

    this.formSku.set(sku);
    this.toast.info('Clave sugerida', `Se generó la clave "${sku}". Puedes editarla si lo requieres.`);
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

  readonly hasPricingData = computed(() => {
    const c = Number(this.formCost() || 0);
    const p = Number(this.formRetailPrice() || 0);
    return c > 0 && p > 0;
  });

  readonly liveMarginPercentage = computed(() => {
    const c = Number(this.formCost() || 0);
    const p = Number(this.formRetailPrice() || 0);
    if (!p || p <= 0 || c <= 0) return '0.0';
    return (((p - c) / p) * 100).toFixed(1);
  });

  readonly liveProfitAmount = computed(() => {
    const c = Number(this.formCost() || 0);
    const p = Number(this.formRetailPrice() || 0);
    if (!p || p <= 0 || c <= 0) return '0.00';
    return (p - c).toFixed(2);
  });

  readonly liveMarginNumeric = computed(() => Number(this.liveMarginPercentage()));

  readonly marginBadgeLabel = computed(() => {
    const m = this.liveMarginNumeric();
    if (m >= 20) return 'Saludable';
    if (m >= 10) return 'Ajustado';
    return 'Bajo';
  });

  marginHealthTitle(): string {
    if (!this.hasPricingData()) return 'Pendiente de datos';
    const margin = Number(this.liveMarginPercentage());
    if (margin >= 20) return 'Margen Saludable (≥ 20%)';
    if (margin >= 10) return 'Margen Moderado (10% - 19%)';
    return 'Margen Bajo (< 10%)';
  }

  marginHealthMessage(): string {
    if (!this.hasPricingData()) {
      return 'Ingrese el costo de compra y el precio de venta para proyectar el margen bruto.';
    }
    const margin = Number(this.liveMarginPercentage());
    if (margin >= 20) {
      return 'Excelente rentabilidad bruta. Protege la operación comercial de la tienda.';
    }
    if (margin >= 10) {
      return 'Margen moderado. Monitoree el costo de adquisición de sus proveedores.';
    }
    return 'Margen reducido. Considere revisar el precio al público respecto al costo base.';
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
    if (!this.isValid()) {
      this.toast.warn(
        'Campos obligatorios requeridos',
        'Por favor complete el nombre, clave SKU, unidad de venta y un precio al público mayor a $0.',
      );
      return;
    }

    const payload: ProductFormData = {
      sku: this.formSku().trim(),
      name: this.formName().trim(),
      description: this.formDescription().trim() || undefined,
      categoryId: this.formCategoryId() || undefined,
      baseUnitCode: this.formBaseUnitCode(),
      isSoldByWeightOrBulk: this.formIsSoldByWeight(),
      retailUnitPrice: this.formRetailPrice(),
      wholesaleUnitPrice: this.enableWholesale() ? this.formWholesalePrice() || undefined : undefined,
      wholesaleMinBaseQty: this.enableWholesale() ? this.formWholesaleMinQty() || undefined : undefined,
      currentCostPerBaseUnit: this.formCost() || '0.00',
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

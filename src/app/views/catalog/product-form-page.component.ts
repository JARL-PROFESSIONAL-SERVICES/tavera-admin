import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
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

export interface SaveProductEvent {
  formData: ProductFormData;
  andRegisterAnother?: boolean;
}

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
export class ProductFormPageComponent implements OnChanges, AfterViewInit {
  readonly toast = inject(ToastService);

  @Input() product: ProductRecord | null = null;
  @Input() categories: CategoryRecord[] = [];
  @Input() units: UnitOfMeasure[] = [];
  @Input() isSaving = false;
  @Input() resetTrigger = 0;

  @Output() save = new EventEmitter<SaveProductEvent>();
  @Output() backToCatalog = new EventEmitter<void>();

  // Element references for fast scanner & keyboard flow
  @ViewChild('barcodeInput') barcodeInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('nameInput') nameInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('costInput') costInputRef?: ElementRef<HTMLInputElement>;
  @ViewChild('priceInput') priceInputRef?: ElementRef<HTMLInputElement>;

  // Dialog for unsaved changes confirmation
  readonly showUnsavedModal = signal(false);

  // Progressive disclosure sections
  readonly showWholesaleSection = signal(false);
  readonly showPresentationsSection = signal(false);
  readonly showUnitBulkSection = signal(false);
  readonly showStockSection = signal(false);
  readonly showFiscalSection = signal(false);
  readonly showNotesSection = signal(false);
  readonly showSkuManualEdit = signal(false);

  // Core fast register signals
  readonly primaryBarcodeDraft = signal('');
  readonly formBarcodes = signal<string[]>([]);
  readonly formName = signal('');
  readonly formSku = signal('');
  readonly isSkuUserEdited = signal(false);
  readonly formCategoryId = signal('');
  readonly formCost = signal('');
  readonly formRetailPrice = signal('');

  // Advanced fields
  readonly formDescription = signal('');
  readonly formBaseUnitCode = signal('PZA');
  readonly formIsSoldByWeight = signal(false);
  readonly formWholesalePrice = signal('');
  readonly formWholesaleMinQty = signal('');
  readonly formIvaRate = signal('0.0000');
  readonly formIepsRate = signal('0.0000');
  readonly formMinStockAlert = signal('5');
  readonly formAllowNegativeStock = signal(false);

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

  // Suffix for auto SKU generation to ensure uniqueness
  private autoSkuSuffix = Math.floor(1000 + Math.random() * 9000).toString();

  // Initial snapshot to track if form is dirty
  private initialFormHash = signal<string>('');

  get isEditMode(): boolean {
    return Boolean(this.product);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetTrigger'] && !changes['resetTrigger'].firstChange) {
      this.resetForNextProduct();
      return;
    }

    if (changes['product'] || changes['categories']) {
      if (this.product) {
        this.populateFromProduct(this.product);
      } else {
        this.resetToDefaults();
      }
      this.snapshotInitialState();
    }
  }

  ngAfterViewInit(): void {
    if (!this.isEditMode) {
      setTimeout(() => this.barcodeInputRef?.nativeElement?.focus(), 150);
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent): void {
    // F10 or Ctrl+S: Guardar producto habitual
    if (event.key === 'F10' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's')) {
      event.preventDefault();
      this.submitForm(false);
      return;
    }

    // F11 or Ctrl+Enter or Alt+G: Guardar y registrar otro inmediatamente
    if (
      event.key === 'F11' ||
      ((event.ctrlKey || event.metaKey) && event.key === 'Enter') ||
      (event.altKey && event.key.toLowerCase() === 'g')
    ) {
      event.preventDefault();
      this.submitForm(true);
      return;
    }

    // Escape: Cancelar / Salir
    if (event.key === 'Escape') {
      if (this.showUnsavedModal()) {
        this.showUnsavedModal.set(false);
      } else {
        this.onCancel();
      }
      return;
    }
  }

  resetToDefaults(): void {
    this.primaryBarcodeDraft.set('');
    this.formBarcodes.set([]);
    this.formSku.set('');
    this.isSkuUserEdited.set(false);
    this.showSkuManualEdit.set(false);
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
    this.formPresentations.set([]);
    this.newPresName.set('');
    this.newPresFactor.set('12');
    this.newPresPrice.set('');

    // Collapse advanced sections for clean fast register
    this.showWholesaleSection.set(false);
    this.showPresentationsSection.set(false);
    this.showUnitBulkSection.set(false);
    this.showStockSection.set(false);
    this.showFiscalSection.set(false);
    this.showNotesSection.set(false);

    this.autoSkuSuffix = Math.floor(1000 + Math.random() * 9000).toString();
  }

  resetForNextProduct(): void {
    this.resetToDefaults();
    this.snapshotInitialState();
    setTimeout(() => this.barcodeInputRef?.nativeElement?.focus(), 80);
  }

  populateFromProduct(p: ProductRecord): void {
    this.formSku.set(p.sku);
    this.isSkuUserEdited.set(true);
    this.formName.set(p.name);
    this.formDescription.set(p.description ?? '');
    this.formCategoryId.set(p.categoryId ?? (this.categories.length > 0 ? this.categories[0].id : ''));
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
    this.primaryBarcodeDraft.set('');
    this.formPresentations.set(
      p.presentations?.map((pr) => ({
        name: pr.name,
        conversionFactor: pr.conversionFactor,
        price: pr.price,
      })) ?? [],
    );

    // Progressive disclosure: auto-expand sections that actually have data
    const hasWholesale = Boolean(p.wholesaleUnitPrice && Number(p.wholesaleUnitPrice) > 0);
    const hasPres = Boolean(p.presentations && p.presentations.length > 0);
    const hasBulkOrUnit = Boolean(p.isSoldByWeightOrBulk || (p.baseUnit?.code && p.baseUnit.code !== 'PZA'));
    const hasStock = Boolean(p.allowNegativeStock || (p.minStockAlert && p.minStockAlert !== '5'));
    const hasFiscal = Boolean(Number(p.ivaRate) > 0 || Number(p.iepsRate) > 0);
    const hasDesc = Boolean(p.description && p.description.trim().length > 0);

    this.showWholesaleSection.set(hasWholesale);
    this.showPresentationsSection.set(hasPres);
    this.showUnitBulkSection.set(hasBulkOrUnit);
    this.showStockSection.set(hasStock);
    this.showFiscalSection.set(hasFiscal);
    this.showNotesSection.set(hasDesc);
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
      barcodeDraft: this.primaryBarcodeDraft(),
      presentations: this.formPresentations(),
    });
  }

  readonly isDirty = computed(() => {
    return this.computeCurrentHash() !== this.initialFormHash();
  });

  // Fast keyboard navigation handlers
  onBarcodeScanEnter(event: Event): void {
    event.preventDefault();
    this.addBarcodeFromDraft();
    this.nameInputRef?.nativeElement?.focus();
  }

  onNameEnter(event: Event): void {
    event.preventDefault();
    this.costInputRef?.nativeElement?.focus();
  }

  onCostEnter(event: Event): void {
    event.preventDefault();
    this.priceInputRef?.nativeElement?.focus();
  }

  onPriceEnter(event: Event): void {
    event.preventDefault();
    if (this.isValid()) {
      this.submitForm(false);
    }
  }

  // Automatic safe SKU generator
  onNameInput(value: string): void {
    this.formName.set(value);
    if (!this.isSkuUserEdited() && !this.isEditMode) {
      this.updateSuggestedSku(value);
    }
  }

  updateSuggestedSku(rawName: string): void {
    const clean = (rawName || '').trim();
    if (!clean) {
      this.formSku.set('');
      return;
    }

    const normalized = clean
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .trim();

    const parts = normalized.split(/\s+/).filter(Boolean);
    let sku = '';
    if (parts.length === 1) {
      sku = parts[0].slice(0, 7);
    } else if (parts.length === 2) {
      sku = `${parts[0].slice(0, 4)}-${parts[1].slice(0, 4)}`;
    } else {
      sku = `${parts[0].slice(0, 4)}-${parts[1].slice(0, 3)}-${parts[parts.length - 1].slice(0, 3)}`;
    }

    this.formSku.set(`${sku}-${this.autoSkuSuffix}`);
  }

  onManualSkuChange(val: string): void {
    this.formSku.set(val);
    this.isSkuUserEdited.set(true);
  }

  regenerateSku(): void {
    this.isSkuUserEdited.set(false);
    this.autoSkuSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    this.updateSuggestedSku(this.formName());
    this.toast.info('Clave actualizada', `Se generó automáticamente la clave "${this.formSku()}".`);
  }

  // Barcode management
  addBarcodeFromDraft(): void {
    const code = this.primaryBarcodeDraft().trim();
    if (!code) return;
    if (!this.formBarcodes().includes(code)) {
      this.formBarcodes.update((b) => [...b, code]);
    }
    this.primaryBarcodeDraft.set('');
  }

  removeBarcode(idx: number): void {
    this.formBarcodes.update((b) => b.filter((_, i) => i !== idx));
  }

  // Presentation management
  addPresentation(): void {
    const name = this.newPresName().trim();
    const factor = this.newPresFactor().trim();
    const price = this.newPresPrice().trim();
    if (!name || !factor || !price) {
      this.toast.warn('Datos incompletos', 'Ingrese nombre, piezas y precio de la presentación.');
      return;
    }

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

  // Real-time financial calculations (STRICTLY NO FAKE NUMBERS)
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
    if (m >= 20) return 'Margen Saludable';
    if (m >= 10) return 'Margen Moderado';
    return 'Margen Bajo';
  });

  // Validation
  isValid(): boolean {
    return Boolean(
      this.formName().trim() &&
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

  submitForm(andRegisterAnother = false): void {
    // If draft barcode exists, add it automatically
    if (this.primaryBarcodeDraft().trim()) {
      this.addBarcodeFromDraft();
    }

    // Ensure SKU is never empty
    if (!this.formSku().trim()) {
      this.updateSuggestedSku(this.formName());
      if (!this.formSku().trim()) {
        this.formSku.set(`PROD-${Math.floor(10000 + Math.random() * 90000)}`);
      }
    }

    if (!this.isValid()) {
      this.toast.warn(
        'Campos requeridos',
        'Ingrese el nombre del producto y un precio de venta mayor a $0.',
      );
      if (!this.formName().trim()) {
        this.nameInputRef?.nativeElement?.focus();
      } else {
        this.priceInputRef?.nativeElement?.focus();
      }
      return;
    }

    const payload: ProductFormData = {
      sku: this.formSku().trim(),
      name: this.formName().trim(),
      description: this.formDescription().trim() || undefined,
      categoryId: this.formCategoryId() || undefined,
      baseUnitCode: this.formBaseUnitCode() || 'PZA',
      isSoldByWeightOrBulk: this.formIsSoldByWeight(),
      retailUnitPrice: this.formRetailPrice(),
      wholesaleUnitPrice: this.showWholesaleSection() && this.formWholesalePrice()
        ? this.formWholesalePrice()
        : undefined,
      wholesaleMinBaseQty: this.showWholesaleSection() && this.formWholesaleMinQty()
        ? this.formWholesaleMinQty()
        : undefined,
      currentCostPerBaseUnit: this.formCost() || '0.00',
      ivaRate: this.formIvaRate() || '0.0000',
      iepsRate: this.formIepsRate() || '0.0000',
      minStockAlert: this.formMinStockAlert() || '5',
      allowNegativeStock: this.formAllowNegativeStock(),
      barcodes: this.formBarcodes(),
      presentations: this.formPresentations(),
    };

    this.save.emit({ formData: payload, andRegisterAnother });
  }
}

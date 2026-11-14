import { TestBed } from '@angular/core/testing';
import { InventoryAdjustmentModalComponent } from './inventory-adjustment-modal.component';

describe('InventoryAdjustmentModalComponent', () => {
  it('submits edited decimal inputs and omits a cleared optional cost', async () => {
    const fixture = TestBed.createComponent(InventoryAdjustmentModalComponent);
    fixture.componentRef.setInput('products', [{
      id: 'flour',
      name: 'Harina',
      sku: 'HARINA',
      currentCostPerBaseUnit: '1.50',
      stockQuantity: '4.75',
    }]);
    fixture.detectChanges();
    await fixture.whenStable();

    const view = fixture.nativeElement as HTMLElement;
    const [quantity, cost] = view.querySelectorAll<HTMLInputElement>('input[type="number"]');
    quantity.value = '0.2501';
    quantity.dispatchEvent(new Event('input'));
    cost.value = '';
    cost.dispatchEvent(new Event('input'));

    const modal = fixture.componentInstance;
    modal.reason.set('Conteo físico');
    const received: unknown[] = [];
    modal.applyAdjustment.subscribe((adjustment) => received.push(adjustment));
    modal.submitAdjustment();

    expect(received).toEqual([{
      productId: 'flour',
      movementType: 'ADJUSTMENT_IN',
      quantity: '0.2501',
      reason: 'Conteo físico',
    }]);
  });
});

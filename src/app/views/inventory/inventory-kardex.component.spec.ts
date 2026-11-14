import { TestBed } from '@angular/core/testing';
import { InventoryKardexComponent } from './inventory-kardex.component';

describe('InventoryKardexComponent', () => {
  it('renders decimal stock movements using the API response fields', () => {
    const fixture = TestBed.createComponent(InventoryKardexComponent);
    fixture.componentRef.setInput('selectedProductId', 'flour');
    fixture.componentRef.setInput('kardex', {
      product: {
        id: 'flour',
        name: 'Harina',
        sku: 'HARINA',
        baseUnit: 'KG',
        currentStock: '5.0001',
        minStockAlert: '1.0000',
      },
      movements: [{
        id: 'entry',
        productId: 'flour',
        movementType: 'ADJUSTMENT_IN',
        quantityDelta: '0.2501',
        previousStock: '4.7500',
        newStock: '5.0001',
        unitCostApplied: null,
        reason: 'Conteo',
        referenceType: null,
        referenceId: null,
        createdAt: '2026-11-14T12:00:00Z',
      }],
    });

    fixture.detectChanges();

    const view = fixture.nativeElement as HTMLElement;
    expect(view.textContent).toContain('+0.2501 KG');
    expect(view.textContent).toContain('Saldo 5.0001');
    expect(view.querySelector('details')?.textContent).toContain('4.75 KG');
  });
});

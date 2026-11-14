import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideAlertTriangle,
  lucideArrowUpRight,
  lucideBoxes,
  lucideCheckCircle2,
  lucideClock,
  lucideCreditCard,
  lucideDollarSign,
  lucidePackage,
  lucideReceipt,
  lucideRefreshCw,
  lucideTrendingUp,
  lucideUser,
  lucideWallet,
} from '@ng-icons/lucide';
import { DashboardSummaryResponse } from '../../core/models/admin.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideAlertTriangle,
      lucideArrowUpRight,
      lucideBoxes,
      lucideCheckCircle2,
      lucideClock,
      lucideCreditCard,
      lucideDollarSign,
      lucidePackage,
      lucideReceipt,
      lucideRefreshCw,
      lucideTrendingUp,
      lucideUser,
      lucideWallet,
    }),
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  @Input() data: DashboardSummaryResponse | null = null;
  @Input() isLoading = false;
  @Output() refresh = new EventEmitter<void>();
  @Output() viewCatalog = new EventEmitter<void>();

  formatMoney(val: string | number | undefined | null): string {
    const num = Number(val ?? 0);
    return isNaN(num)
      ? '0.00'
      : num.toLocaleString('es-MX', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }

  calculateMargin(revStr: string, profStr: string): string {
    const rev = Number(revStr ?? 0);
    const prof = Number(profStr ?? 0);
    if (!rev || rev <= 0) return '0.0';
    return ((prof / rev) * 100).toFixed(1);
  }

  getMarginNumber(revStr: string, profStr: string): number {
    const rev = Number(revStr ?? 0);
    const prof = Number(profStr ?? 0);
    if (!rev || rev <= 0) return 0;
    const margin = (prof / rev) * 100;
    return Math.min(100, Math.max(0, margin));
  }

  getPaymentPct(methodStr: string, totalStr: string): number {
    const m = Number(methodStr ?? 0);
    const t = Number(totalStr ?? 0);
    if (!t || t <= 0) return 0;
    return Math.min(100, Math.max(0, (m / t) * 100));
  }
}

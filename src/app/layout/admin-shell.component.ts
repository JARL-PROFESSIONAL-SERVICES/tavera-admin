import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBan,
  lucideBoxes,
  lucideChevronDown,
  lucideChevronRight,
  lucideClock,
  lucideDollarSign,
  lucideFolderTree,
  lucideLaptop,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideMenu,
  lucideMoon,
  lucidePackage,
  lucideReceipt,
  lucideShieldCheck,
  lucideStore,
  lucideSun,
  lucideTruck,
  lucideUser,
  lucideUsers,
} from '@ng-icons/lucide';
import { AdminApiService } from '../core/services/admin-api.service';
import { ThemeService } from '../core/services/theme.service';

export type AdminSection =
  | 'DASHBOARD'
  | 'CATALOG'
  | 'PRODUCT_FORM'
  | 'CATEGORIES'
  | 'PRICING'
  | 'INVENTORY'
  | 'SUPPLIERS_PURCHASES'
  | 'SALES_CASH'
  | 'USERS_RBAC'
  | 'AUDIT';

export type SuppliersTab = 'SUPPLIERS' | 'PENDING' | 'CANCELLED' | 'HISTORY';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideBan,
      lucideBoxes,
      lucideChevronDown,
      lucideChevronRight,
      lucideClock,
      lucideDollarSign,
      lucideFolderTree,
      lucideLaptop,
      lucideLayoutDashboard,
      lucideLogOut,
      lucideMenu,
      lucideMoon,
      lucidePackage,
      lucideReceipt,
      lucideShieldCheck,
      lucideStore,
      lucideSun,
      lucideTruck,
      lucideUser,
      lucideUsers,
    }),
  ],
  templateUrl: './admin-shell.component.html',
})
export class AdminShellComponent implements OnChanges {
  readonly api = inject(AdminApiService);
  readonly theme = inject(ThemeService);

  @Input({ required: true }) activeSection: AdminSection = 'DASHBOARD';
  @Input() activeSuppliersTab: SuppliersTab = 'SUPPLIERS';

  @Output() sectionChange = new EventEmitter<AdminSection>();
  @Output() selectSuppliersTab = new EventEmitter<SuppliersTab>();

  readonly isExpanded = signal(true);
  readonly mobileMenuOpen = signal(false);
  readonly productosMenuOpen = signal(false);
  readonly proveedoresMenuOpen = signal(false);

  onSelectSection(section: AdminSection): void {
    this.sectionChange.emit(section);
    this.mobileMenuOpen.set(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activeSection']) {
      this.productosMenuOpen.set(this.isProductGroupActive());
      this.proveedoresMenuOpen.set(this.activeSection === 'SUPPLIERS_PURCHASES');
    }
  }

  onSelectSuppliersTab(tab: SuppliersTab): void {
    this.selectSuppliersTab.emit(tab);
    this.mobileMenuOpen.set(false);
  }

  isProductGroupActive(): boolean {
    return (
      this.activeSection === 'CATALOG' ||
      this.activeSection === 'PRODUCT_FORM' ||
      this.activeSection === 'CATEGORIES' ||
      this.activeSection === 'PRICING' ||
      this.activeSection === 'INVENTORY'
    );
  }

  getSectionTitle(sec: AdminSection): string {
    switch (sec) {
      case 'DASHBOARD':
        return 'Inicio';
      case 'CATALOG':
        return 'Catálogo de Productos';
      case 'PRODUCT_FORM':
        return 'Formulario de Producto';
      case 'CATEGORIES':
        return 'Categorías y Presentaciones';
      case 'PRICING':
        return 'Precios y Mayoreo';
      case 'INVENTORY':
        return 'Inventario y Kardex';
      case 'SUPPLIERS_PURCHASES':
        return 'Proveedores y Compras';
      case 'SALES_CASH':
        return 'Ventas y Cortes de Caja';
      case 'USERS_RBAC':
        return 'Usuarios y Roles';
      case 'AUDIT':
        return 'Registro de Auditoría';
      default:
        return 'Administración';
    }
  }
}

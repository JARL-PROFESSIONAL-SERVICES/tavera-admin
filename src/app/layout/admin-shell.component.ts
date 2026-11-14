import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBan,
  lucideBoxes,
  lucideChevronDown,
  lucideChevronRight,
  lucideClock,
  lucideDollarSign,
  lucideEdit,
  lucideFolderTree,
  lucideLaptop,
  lucideLayoutDashboard,
  lucideLogOut,
  lucideMenu,
  lucideMoon,
  lucidePackage,
  lucidePlus,
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
      lucideEdit,
      lucideFolderTree,
      lucideLaptop,
      lucideLayoutDashboard,
      lucideLogOut,
      lucideMenu,
      lucideMoon,
      lucidePackage,
      lucidePlus,
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
export class AdminShellComponent {
  readonly api = inject(AdminApiService);
  readonly theme = inject(ThemeService);

  @Input({ required: true }) activeSection: AdminSection = 'DASHBOARD';
  @Input() activeSuppliersTab: SuppliersTab = 'SUPPLIERS';
  @Input() isEditingProduct = false;

  @Output() sectionChange = new EventEmitter<AdminSection>();
  @Output() createProduct = new EventEmitter<void>();
  @Output() selectSuppliersTab = new EventEmitter<SuppliersTab>();

  readonly isExpanded = signal(true);
  readonly mobileMenuOpen = signal(false);
  readonly productosMenuOpen = signal(true);
  readonly proveedoresMenuOpen = signal(true);

  onSelectSection(section: AdminSection): void {
    this.sectionChange.emit(section);
    this.mobileMenuOpen.set(false);
  }

  onCreateProduct(): void {
    this.createProduct.emit();
    this.mobileMenuOpen.set(false);
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
        return 'Dashboard Ejecutivo';
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

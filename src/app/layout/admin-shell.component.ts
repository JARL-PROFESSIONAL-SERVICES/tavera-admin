import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideBoxes,
  lucideChevronLeft,
  lucideChevronRight,
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

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideBoxes,
      lucideChevronLeft,
      lucideChevronRight,
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
export class AdminShellComponent {
  readonly api = inject(AdminApiService);
  readonly theme = inject(ThemeService);

  @Input({ required: true }) activeSection: AdminSection = 'DASHBOARD';
  @Output() sectionChange = new EventEmitter<AdminSection>();

  readonly isExpanded = signal(true);
  readonly mobileMenuOpen = signal(false);

  onSelectSection(section: AdminSection): void {
    this.sectionChange.emit(section);
    this.mobileMenuOpen.set(false);
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

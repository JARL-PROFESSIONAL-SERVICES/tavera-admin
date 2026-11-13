import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideEdit,
  lucideFolderTree,
  lucideLayers,
  lucidePackage,
  lucidePlus,
  lucideSearch,
  lucideTag,
  lucideTrash2,
  lucideX,
} from '@ng-icons/lucide';
import {
  CategoryRecord,
  ProductRecord,
  UnitOfMeasure,
} from '../../core/models/admin.models';

@Component({
  selector: 'app-categories-view',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideCheck,
      lucideEdit,
      lucideFolderTree,
      lucideLayers,
      lucidePackage,
      lucidePlus,
      lucideSearch,
      lucideTag,
      lucideTrash2,
      lucideX,
    }),
  ],
  templateUrl: './categories-view.component.html',
})
export class CategoriesViewComponent {
  @Input() categories: CategoryRecord[] = [];
  @Input() units: UnitOfMeasure[] = [];
  @Input() products: ProductRecord[] = [];

  @Output() createCategory = new EventEmitter<{
    name: string;
    description?: string;
  }>();

  categoryFilter = '';
  readonly selectedCategoryId = signal<string>('');
  readonly showCreateCategoryModal = signal(false);

  newCategoryName = '';
  newCategoryDesc = '';

  filteredCategories(): CategoryRecord[] {
    const q = this.categoryFilter.toLowerCase().trim();
    if (!q) return this.categories;
    return this.categories.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      (c.description && c.description.toLowerCase().includes(q)),
    );
  }

  getProductCountForCategory(catId: string): number {
    return this.products.filter((p) => p.categoryId === catId).length;
  }

  getSelectedCategoryName(): string {
    const id = this.selectedCategoryId();
    if (!id) return 'Todas las categorías';
    const found = this.categories.find((c) => c.id === id);
    return found ? found.name : 'Todas';
  }

  selectedCategoryProducts(): ProductRecord[] {
    const id = this.selectedCategoryId();
    if (!id) return this.products;
    return this.products.filter((p) => p.categoryId === id);
  }

  handleCreateCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.createCategory.emit({
      name,
      description: this.newCategoryDesc.trim() || undefined,
    });
    this.newCategoryName = '';
    this.newCategoryDesc = '';
    this.showCreateCategoryModal.set(false);
  }
}

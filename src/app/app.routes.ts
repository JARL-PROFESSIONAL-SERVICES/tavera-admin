import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'products/new', redirectTo: '' },
  { path: 'products/:id/edit', redirectTo: '' },
  { path: '**', redirectTo: '' },
];

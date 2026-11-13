# Progreso del Proyecto — `tavera-admin`

## Sprint 01 — Fase 4: Panel Web del Propietario y Administración Operativa (2026-11-12)

### Completado
- Creación de la rama `feat/admin-management-portal` desde `origin/develop`.
- Implementación de modelos tipados (`admin.models.ts`) y cliente `AdminApiService` (`admin-api.service.ts`) conectado a todos los módulos de `tavera-api`.
- Construcción de los 7 módulos administrativos y de supervisión en `src/app/app.ts` y `src/app/app.html`:
  1. **Dashboard Ejecutivo:** Ventas netas, utilidad bruta estimada, desglose por método de pago, turnos de caja abiertos y alertas de bajo stock.
  2. **Catálogo y Precios:** Alta de productos con presentaciones/códigos y edición rápida de precios menudeo en línea.
  3. **Inventario y Kardex:** Consulta de movimientos por producto y registro de cargas/ajustes/mermas.
  4. **Proveedores y Compras:** Catálogo interno de proveedores, comparador de costo normalizado por unidad base (`GET /suppliers/product/:productId/comparison`) y recepción de compras (`POST /purchases/receipts`).
  5. **Ventas y Cortes:** Consulta de tickets históricos con snapshots inmutables.
  6. **Usuarios y Roles (RBAC):** Alta de usuarios y activación/suspensión inmediata.
  7. **Auditoría:** Visor filtrable por módulo de `audit_logs`.
- Pruebas unitarias con Vitest (`admin-api.service.spec.ts` y `app.spec.ts`) y compilación de producción (`pnpm run build`).


## Sprint 02 — Contenerización de Producción (2026-11-12)

### Completado
- Creación de rama `feat/containerization` desde `origin/develop`.
- Implementación de `Dockerfile` multi-stage (Node.js 22 Alpine, pnpm, `ng build --configuration production` y servidor estático `nginx:1.27-alpine`).
- Configuración de `docker/nginx.conf` con fallback SPA (`try_files $uri $uri/ /index.html`) y encabezados de caché para activos estáticos.
- Configuración de `.dockerignore`.

## Sprint 03 — Design System: Tailwind CSS, Lucide Icons y ThemeService (2026-11-12)

### Completado
- Creación de rama `feat/design-system-tailwind-lucide-theme` desde `origin/develop`.
- Instalación y configuración de Tailwind CSS (`v3.4.19`), PostCSS y Autoprefixer con paleta corporativa Tavera:
  - Verde Comercial (`#166534`, 50-950)
  - Grafito Elegante (`#27272A`, 50-950)
  - Naranja Comercial (`#EA580C`, 50-950)
- Integración de tipografía `Inter` (Google Fonts) con soporte `tabular-nums` para importes y cantidades.
- Instalación de `@ng-icons/core` y `@ng-icons/lucide` (`v36.1.0`) para iconografía unificada.
- Implementación de `ThemeService` reactivo con señales Angular (`signal<ThemeMode>`), persistencia en `localStorage` y detección de `prefers-color-scheme` (soporta 'light', 'dark' y 'system').
- Pruebas unitarias completas de `ThemeService` (`theme.service.spec.ts`) y validación de compilación limpia de producción.

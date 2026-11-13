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

## Sprint 04 — Estilización Visual del Panel Administrativo con Design System Tavera (2026-11-12)

### Completado
- Creación de rama `feat/admin-ui-design-system` desde `origin/develop`.
- Rediseño de la cabecera ejecutiva y barra de sesión:
  - Badge distintivo de propietario en Verde Comercial (`#166534`).
  - Selector de temas (Light / Dark / System) con iconos Lucide (`lucideSun`, `lucideMoon`, `lucideLaptop`).
  - Chip de usuario autenticado con badge de rol y botón de cierre de sesión con icono `lucideLogOut`.
- Modernización de la barra de navegación de los 7 módulos con iconografía Lucide:
  - Dashboard Ejecutivo (`lucideLayoutDashboard`)
  - Catálogo y Precios (`lucidePackage`)
  - Inventario y Kardex (`lucideBoxes`)
  - Proveedores y Compras (`lucideTruck`)
  - Ventas y Cortes (`lucideReceipt`)
  - Usuarios y Roles (`lucideUsers`)
  - Auditoría (`lucideShieldCheck`)

## Sprint 05 — Modernización UI/UX con PrimeNG, Spartan-NG y Tokens Semánticos CSS (2026-11-13)

### Completado
- Creación de rama `feat/ui-ux-modernization-admin` desde `origin/develop`.
- Verificación técnica de compatibilidad e instalación de dependencias en Angular 22:
  - PrimeNG `22.1.5` y `@angular/cdk: 22.2.7`.
  - Spartan-NG Brain `1.9.0` (`@spartan-ng/brain`), `clsx: 2.1.1`, `tailwind-merge: 3.7.0` y `class-variance-authority: 0.7.1`.
- Sustitución de colores hexadecimales hardcodeados por tokens semánticos CSS (`--tavera-bg`, `--tavera-surface`, `--tavera-border`, `--tavera-primary`, `--tavera-accent`, `--tavera-graphite`, `--tavera-text`, `--tavera-text-muted`) garantizando soporte nativo para temas Light, Dark y System.
- Modernización del Catálogo y Precios:
  - Integración de PrimeNG `p-table` con ordenamiento por columnas (`pSortableColumn`), paginación integrada con selector de filas por página (`[rowsPerPageOptions]="[5, 10, 25, 50]"`), estado vacío controlado y edición ágil de precio menudeo.
- Modernización de Inventario y Kardex:
  - Visualización del historial inmutable de movimientos en PrimeNG `p-table` con deltas numéricos destacados en verde comercial (`+`) o advertencia (`-`) con fuentes tabulares (`.tabular-nums`).
- Armonización visual de tarjetas ejecutivas KPI y formularios con estilo Spartan-NG.
- 3/3 suites de pruebas unitarias superadas (7 tests pasados) y compilación de producción exitosa.
  - Inventario y Kardex (`lucideBoxes`)
  - Proveedores y Compras (`lucideTruck`)
  - Ventas y Cortes (`lucideReceipt`)
  - Usuarios y Roles (`lucideUsers`)
  - Auditoría (`lucideShieldCheck`)
- Estilización de tarjetas KPI del Dashboard Ejecutivo con números tabulares (`.tabular-nums`), destacado de utilidad bruta en Verde Comercial y stock bajo en Naranja Comercial.
- Refactorización de tablas de datos (catálogo, kardex, recepciones, tickets, usuarios y logs) con encabezados sticky, alineación numérica tabular y badges de estado.
- Verificación completa: 3 suites, 7/7 pruebas unitarias pasadas y compilación de producción limpia sin advertencias (`363.11 kB`).

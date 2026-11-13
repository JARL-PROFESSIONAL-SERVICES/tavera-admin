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
- Estilización de tarjetas KPI del Dashboard Ejecutivo con números tabulares (`.tabular-nums`), destacado de utilidad bruta en Verde Comercial y stock bajo en Naranja Comercial.
- Refactorización de tablas de datos (catálogo, kardex, recepciones, tickets, usuarios y logs) con encabezados sticky, alineación numérica tabular y badges de estado.
- Verificación completa: 3 suites, 7/7 pruebas unitarias pasadas y compilación de producción limpia sin advertencias (`363.11 kB`).

## Sprint 05 — Implementación UI/UX Blueprint: Fundación y Primeras 4 Vistas (2026-11-13)

### Completado
- Creación de rama `feature/ui-admin-blueprint-foundation` desde `origin/develop`.
- Configuración de tokens semánticos CSS oficiales (`--background`, `--surface`, `--surface-muted`, `--foreground`, `--muted-foreground`, `--border`, `--brand`, `--brand-solid`, `--accent`, `--sidebar`, `--danger`, `--success`, `--warning`) en `tailwind.config.js` y `src/styles.scss`.
- Integración de PrimeNG (`v22.1.5`) y Spartan-NG Brain (`v1.9.0`) sin duplicación de responsabilidades.
- **ADM-01 Inicio de sesión independiente (`LoginComponent`):**
  - Layout dividido 45/55 en escritorio (columna izquierda de identidad y beneficios con iluminación ambiental / columna derecha con tarjeta centrada de acceso).
  - Aislamiento estricto: ningún shell privado o menú se renderiza antes de autenticarse.
  - Alternador de visibilidad de contraseña (`lucideEye` / `lucideEyeOff`), selector de credenciales de desarrollo rápido (owner/admin) y manejo accesible de errores.
- **Shell Autenticado (`AdminShellComponent`):**
  - Barra lateral colapsable (248px expandida / 72px compacta) con iconos Lucide y drawer responsive para pantallas móviles.
  - Barra superior de 64px con breadcrumbs dinámicos, selector de tema (Light / Dark / System) y chip de usuario con rol y botón de logout.
- **ADM-02 Dashboard Ejecutivo (`DashboardComponent`):**
  - Selector de periodo (Hoy, Esta semana, Este mes) y botón de actualización en tiempo real.
  - 4 tarjetas KPI (Ventas Netas, Utilidad Bruta Estimada, Cajas en Operación, Alertas de Stock Bajo).
  - Desglose financiero con barras de proporción visual (Costo de adquisición vs Margen comercial).
  - Desglose por método de pago (Efectivo, Tarjeta, Transferencia SPEI) con barras de porcentaje.
  - Tablas operativas de cajas/turnos abiertos y existencias bajo el mínimo.
- **ADM-03 Catálogo de Productos (`CatalogListComponent`):**
  - Barra de herramientas con buscador con limpieza rápida, selector de categorías y filtro por nivel de existencias.
  - PrimeNG `p-table` con ordenamiento por columnas, paginación configurable (10, 25, 50), edición rápida de precio de menudeo en línea y badges de estado de inventario (Óptimo, Stock Bajo, Agotado).
- **ADM-04 Formulario de Crear y Editar Producto (`ProductFormModalComponent`):**
  - Modal estructurado en 4 secciones por pestañas:
    1. Identificación y códigos de barras (SKU, Nombre comercial, Categoría, códigos de barras EAN/UPC múltiples).
    2. Unidades y presentaciones (Unidad base, venta a granel/pesaje, presentaciones adicionales con factor de conversión numérico y precio propio).
    3. Costos, precios y cálculo de margen en tiempo real (Cálculo automático de margen porcentual con alerta visual, precio y mínimo de mayoreo).
    4. Impuestos y existencias (Tasa IVA, Tasa IEPS, Alerta de stock mínimo, switch de permiso de venta en negativo).
  - Barra inferior con resumen instantáneo de margen y botones Cancelar / Guardar Producto.
- Pruebas y verificación:
  - 3 suites, 8/8 pruebas unitarias pasadas con Vitest (`pnpm run test`).
  - Compilación de producción limpia (`pnpm run build`) generando bundle de 1.20 MB raw / 234 kB transferido.
  - Capturas reales automatizadas en Light y Dark de las 4 vistas generadas en `docs/screenshots/`.

## Sprint 06 — Implementación UI/UX Blueprint: Bloque 2 (ADM-05 a ADM-08) (2026-11-13)

### Completado
- Creación de rama `feature/ui-admin-catalog-inventory` desde `feature/ui-admin-blueprint-foundation`.
- **ADM-05: Categorías y Presentaciones (`CategoriesViewComponent`):**
  - Panel maestro-detalle con árbol/lista de categorías y conteo de artículos activos.
  - Buscador interno de categorías y modal para creación de nueva familia de productos.
  - Tabla de unidades de medida (Base/Granel) con clave SAT y tipo de magnitud.
  - Tabla de factores de empaque y presentaciones comerciales con códigos de barras y precios específicos.
- **ADM-06: Precios y Mayoreo (`PricingViewComponent`):**
  - Matriz integral de precios y márgenes con supervisor de rentabilidad.
  - Cálculo automático en tiempo real del margen comercial: `((Precio - Costo) / Precio) * 100%`.
  - Badges semánticos de salud del margen:
    - Saludable (≥ 25%): Verde esmeralda.
    - Moderado (15% - 24%): Ámbar.
    - Crítico (< 15%): Rojo de advertencia.
  - Editor modal rápido de escala de mayoreo (Precio Mayoreo y Cantidad Mínima) con recálculo dinámico de margen y guardado auditado hacia la API.
- **ADM-07: Inventario y Kardex Físico (`InventoryKardexComponent`):**
  - 3 KPIs ejecutivos superiores: Total Artículos Activos, Existencias Físicas Totales en piezas base y Valor Comercial del Inventario.
  - Selector de producto con buscador rápido de catálogo.
  - Resumen del artículo seleccionado: stock actual, stock mínimo y alerta de reabastecimiento.
  - Tabla del Kardex inmutable cronológico con tipo de movimiento, referencia/documento, delta numérico (`+N` en verde / `-N` en rojo) y existencias resultantes.
- **ADM-08: Modal de Ajuste Operativo de Inventario (`InventoryAdjustmentModalComponent`):**
  - Formulario modal operativo con selección de tipo de movimiento:
    - Carga Inicial (`INITIAL_LOAD`)
    - Ajuste Positivo / Conteo Físico (`ADJUSTMENT_IN`)
    - Ajuste Negativo (`ADJUSTMENT_OUT`)
    - Merma / Desperdicio / Caducidad (`WASTE_OUT`)
  - Selector de producto y resumen de stock actual.
  - Campo de cantidad y proyección matemática de stock resultante antes de confirmar.
  - Justificación obligatoria del ajuste con validación estricta y costo unitario aplicado.
  - Persistencia transaccional a través de `POST /inventory/adjustments` y actualización automática del Kardex.
- **Navegación e Integración (`AdminShellComponent` & `App`):**
  - Inclusión de los tabs de navegación "Categorías y Presentaciones" y "Precios y Mayoreo" con iconos Lucide (`lucideFolderTree` y `lucideDollarSign`).
  - Actualización de `App` para orquestar la apertura del modal de ajuste desde el visor de Kardex y la actualización de precios y categorías.
- Pruebas y verificación:
  - 3 suites, 9/9 pruebas unitarias pasadas con Vitest (`pnpm run test`).
  - Compilación de producción limpia (`pnpm run build`) generando bundle de 1.21 MB raw / 235 kB transferido sin advertencias.
  - Capturas reales automatizadas en Light y Dark de las 4 vistas (ADM-05, ADM-06, ADM-07, ADM-08) generadas en `docs/screenshots/`.

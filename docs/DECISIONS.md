# Decisiones Técnicas y de Arquitectura — `tavera-admin`

## ADR-001: Panel Web Administrativo Responsive Unificado (Escritorio y Móvil del Propietario)

- **Fecha:** 2026-11-12
- **Estado:** Aprobado (Fase 4)

### Decisiones
1. **Interfaz web única y responsive para el propietario y administración operativa:**
   - Conforme al plan maestro (`PROJECT_MASTER_PLAN.md`), no se crea una app Owner separada ni portal externo de proveedores. `tavera-admin` adapta su barra de navegación y cuadrículas (`kpi-grid`, `two-col-grid`) tanto a escritorio como a consulta móvil del dueño en red local o Tailscale.
2. **Módulos conectados a contratos reales de `tavera-api`:**
   - **Dashboard Ejecutivo (`GET /api/v1/reports/dashboard`):** Ventas netas tras devoluciones, utilidad bruta estimada sobre `unitCostSnapshot`, desglose por método de pago (`CASH`, `CARD`, `TRANSFER`), sesiones de caja abiertas y alertas de bajo stock.
   - **Catálogo y Precios (`/api/v1/catalog/*`):** Alta de productos con unidad base única (`PZA`, `KG`, `LT`, `M`), presentaciones con factor de conversión explícito y edición en línea de precios sin alterar tickets históricos.
   - **Inventario y Kardex (`/api/v1/inventory/*`):** Consulta de movimientos históricos inmutables y registro de ajustes auditables (`INITIAL_LOAD`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `WASTE_OUT`).
   - **Proveedores, Comparador y Compras (`/api/v1/suppliers/*`, `/api/v1/purchases/receipts`):** Directorio interno de proveedores, cotización y comparador de costos por unidad base (`GET /suppliers/product/:productId/comparison`) y recepción de compras con actualización de **Costo de Última Compra (Last Cost)**.
   - **Ventas, Usuarios RBAC y Auditoría (`/api/v1/sales`, `/api/v1/users`, `/api/v1/audit`):** Supervisión de tickets, control de cuentas/roles y bitácora transversal.
3. **Control de permisos en UI respaldado por autoridad en Backend:**
   - `AdminApiService.hasPermission(code)` valida permisos en cliente para habilitar controles de escritura (`catalog:write`, `purchases:manage`, `users:manage`), manteniendo a `tavera-api` como autoridad definitiva.

## ADR-002: Identidad Visual y Design System Compartido (Tailwind, Lucide y Temas)

- **Fecha:** 2026-11-12
- **Estado:** Aprobado

### Decisiones
1. **Tokens de color corporativos:**
   - Primario: Verde comercial (`#166534`) para acciones primarias, ventas, estado positivo e identidad central.
   - Superficie y estructura: Grafito neutro (`#27272A`) para contrastes altos, textos legibles y fondos dark mode.
   - Acento y alertas: Naranja comercial (`#EA580C`) para badges de atención, stock crítico y advertencias operativas.
2. **Tipografía y números tabulares:**
   - Tipografía Inter aplicada globalmente con soporte de la clase `.tabular-nums` (`font-feature-settings: 'tnum' 1`) para evitar saltos visuales en tablas financieras, cortes y kardex.
3. **Gestor de temas Light, Dark y System:**
   - Implementado mediante `ThemeService` usando Angular Signals. Agrega/remueve el atributo `data-theme="dark"` en el elemento raíz `<html>` y escucha eventos `change` en `window.matchMedia('(prefers-color-scheme: dark)')` cuando el modo seleccionado es `'system'`. Persistido en `localStorage`.

## ADR-003: Estilización Ejecutiva del Panel de Administración y Dashboard

- **Fecha:** 2026-11-12
- **Estado:** Aprobado

### Decisiones
1. **Jerarquía visual ejecutiva en tarjetas KPI:**
   - Ventas netas y utilidad bruta se diferencian inmediatamente de los ingresos brutos, con la utilidad destacada en Verde Comercial y las alertas de inventario en Naranja Comercial.
2. **Navegación unificada con iconografía Lucide:**
   - Cada uno de los 7 módulos cuenta con iconografía consistente que facilita la navegación tanto en pantallas de escritorio como en smartphones del propietario en red local o Tailscale.
3. **Consistencia numérica financiera:**
   - Toda cifra de dinero, cantidad base, porcentaje de margen e identificador de ticket o sesión de caja implementa la clase `.tabular-nums` para alineación vertical estricta.

## ADR-004: Integración de PrimeNG y Spartan-NG con Tokens Semánticos CSS

- **Fecha:** 2026-11-13
- **Estado:** Aprobado (Sprint de Modernización UI/UX)

### Decisiones
1. **Adopción de PrimeNG 22 para tablas de datos avanzadas:**
   - Para resolver la necesidad de ordenamiento de columnas, paginación local y responsividad en el Catálogo de Productos y en el Kardex Histórico, se incorpora `primeng/table` (`TableModule`). Los estilos de PrimeNG se reasignan mediante variables CSS (`--p-primary-color`, `--p-surface-0`, `--p-surface-border`, etc.) para heredar los tokens semánticos corporativos sin dependencias de fuentes externas ni temas pesados.
2. **Tokens semánticos CSS obligatorios y eliminación de colores hexadecimales duros:**
   - Los componentes, botones y superficies se basan en variables semánticas (`--tavera-bg`, `--tavera-surface`, `--tavera-border`, `--tavera-primary`, `--tavera-accent`, `--tavera-graphite`, `--tavera-text`), asegurando que tanto el modo claro como el modo oscuro se adapten armónicamente sin alterar plantillas.
3. **Presupuesto de compilación ajustado:**
   - Con la inclusión de `primeng` y componentes avanzados de datos, el bundle inicial comprimido es de ~217 kB (1.09 MB sin comprimir). Se actualiza el presupuesto en `angular.json` a `maximumWarning: 1.5MB` y `maximumError: 2MB` para mantener el control estricto de peso.

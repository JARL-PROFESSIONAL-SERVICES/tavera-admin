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

## ADR-004: Implementación del UI/UX Blueprint Oficial (ADM-01 a ADM-04)

- **Fecha:** 2026-11-13
- **Estado:** Aprobado

### Decisiones
1. **Aislamiento estricto de inicio de sesión (ADM-01):**
   - Conforme a la ficha ADM-01 y el Blueprint oficial, la pantalla de inicio de sesión es una ruta pública completamente aislada con un split layout 45/55 en escritorio. No se renderiza la barra de navegación ni ningún componente del shell privado antes de autenticar credenciales.
2. **Integración armónica de PrimeNG y Tailwind Tokens:**
   - Para el catálogo de productos (ADM-03), se aprovecha el componente `p-table` de PrimeNG para ordenamiento multi-columna y paginación accesible, vinculando sus variables de estilo a los tokens semánticos CSS (`--background`, `--surface`, `--border`, `--brand-solid`). Se evita duplicar librerías UI para los mismos controles.
3. **Cálculo de margen en vivo en formulario de producto (ADM-04):**
   - El modal de creación y edición calcula el margen comercial en tiempo real usando señales Angular calculadas (`computed`): `((Precio - Costo) / Precio) * 100%`, mostrando retroalimentación de color para proteger la rentabilidad del negocio antes de persistir cambios.
4. **Shell administrativo modular y persistencia de tema:**
   - La barra lateral admite colapso a 72px para maximizar el área de trabajo en pantallas medianas y cajón móvil en resoluciones inferiores a 1024px. El selector de tema soporta modo claro, oscuro y automático sincronizado con el sistema operativo sin parpadeos.

## ADR-005: Catálogo Avanzado, Precios de Mayoreo y Kardex Físico Inmutable (ADM-05 a ADM-08)

- **Fecha:** 2026-11-13
- **Estado:** Aprobado

### Decisiones
1. **Desacoplamiento modular de Categorías y Precios (ADM-05 y ADM-06):**
   - Aunque el catálogo central (ADM-03) permite búsqueda y alta general, la gestión jerárquica de familias, unidades SAT y presentaciones comerciales se desacopla en `CategoriesViewComponent` (ADM-05).
   - La supervisión global de rentabilidad y precios escalonados se ubica en `PricingViewComponent` (ADM-06), ofreciendo una matriz financiera con alertas visuales inmediatas según umbrales de margen comercial: Verde (≥25%), Ámbar (15-24%) y Rojo (<15%).
2. **Kardex Físico Inmutable y Auditoría Estricta (ADM-07):**
   - Cada renglón del Kardex refleja el movimiento operativo con marca de tiempo, tipo de evento, referencia documental, delta numérico estricto y balance resultante.
   - El historial es de sólo lectura y preserva auditoría para inventarios cíclicos y arqueos contables.
3. **Flujo de Ajuste Operativo con Proyección Previa (ADM-08):**
   - El modal de ajuste de inventario no permite modificaciones arbitrarias de saldo final; requiere seleccionar el tipo de transacción comercial (`INITIAL_LOAD`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `WASTE_OUT`), capturar la cantidad en unidades base, ingresar obligatoriamente una justificación comercial válida y validar la proyección matemática resultante antes de invocar la mutación en `POST /inventory/adjustments`.
4. **Plantillas HTML separadas en Angular 22:**
   - Para evitar colisiones sintácticas entre los template literals de ES6 (`${...}`) e interpolaciones en Angular, todos los componentes de vistas mantienen archivos `.html` independientes (`templateUrl`).
   - El binding de señales de formulario usa enlaces explícitos `[ngModel]="sig()"` y `(ngModelChange)="sig.set($event)"`.

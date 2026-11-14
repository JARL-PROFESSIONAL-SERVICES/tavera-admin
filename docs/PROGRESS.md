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

## Sprint 07 — Corrección de UX en Catálogo y Formulario de Productos en Página Completa (2026-11-13)

### Completado
- Creación de rama `feature/ui-admin-catalog-ux-redesign` desde `feature/ui-admin-catalog-inventory`.
- **Diagnóstico y Corrección de Renderizado en Catálogo (ADM-03):**
  - Identificación de causa raíz en PrimeNG v22: `p-table` consulta plantillas vía `contentChild("header")` y `contentChild("body")` por variable de referencia. Se agregaron `#header` y `#body` a las etiquetas `<ng-template>` además de `pTemplate`.
  - Implementación de 5 estados diferenciados de interfaz:
    1. **LOADING:** Esqueleto visual animado con filas titilantes que mantiene el orden de columnas y evita saltos de pantalla.
    2. **ERROR:** Alerta amigable con botón de reintento (`retryLoad`).
    3. **EMPTY:** Estado sin productos con ilustración `lucidePackagePlus` y llamado a crear el primer artículo comercial.
    4. **NO_RESULTS:** Mensaje cuando los filtros no coinciden, mostrando el término buscado y botón para limpiar filtros.
    5. **SUCCESS:** Tabla completa con datos reales renderizados, ordenamiento multi-columna, edición rápida de precios y paginación condicional oculta cuando $\le 10$ artículos.
- **Rediseño Completo a Página Dedicada para Productos (ADM-04):**
  - **Eliminación total del modal** para creación y edición de productos, migrando a rutas y vistas de página completa: `/products/new` y `/products/:id/edit`.
  - Componente autónomo `ProductFormPageComponent` estructurado en 7 secciones progresivas con lenguaje comercial accesible:
    1. Identificación básica (Nombre comercial, SKU, notas explicativas).
    2. Categoría y códigos de barras múltiples con chips interactivos.
    3. Precios y margen de rentabilidad en vivo con alertas de salud de ganancia (Saludable, Moderado, Crítico).
    4. Unidades de medida y presentaciones derivadas (cajas/paquetes) con cálculo de factor.
    5. Inventario inicial y alertas de existencias mínimas.
    6. Configuración avanzada opcional (Impuestos SAT IVA/IEPS colapsados de forma predeterminada).
    7. Barra superior e inferior de guardado con retorno seguro.
- **Protección Contra Pérdida Accidental de Cambios:**
  - Rastreo reactivo de cambios pendientes (`isDirty`).
  - Modal amigable de confirmación ante intentos de salida no guardada ("Continuar editando" vs "Salir y descartar cambios").
- **Pruebas y Verificación:**
  - 3 suites, 10/10 pruebas unitarias aprobadas con Vitest (`pnpm run test`).
  - Compilación de producción limpia (`ng build`) generando bundle de 1.23 MB raw / 238 kB transferido.
  - Generación de capturas de pantalla reales automatizadas en Light y Dark para todos los estados de catálogo, páginas de creación/edición y diálogo de cambios sin guardar en `docs/screenshots/`.

## Sprint 08 — Sistema de Notificaciones Temporales mediante Toasts PrimeNG (2026-11-13)

### Completado
- Creación de rama `feature/ui-admin-toast-notifications` desde `feature/ui-admin-catalog-ux-redesign`.
- **Eliminación de Banners Estáticos Intrusivos:**
  - Se removió el antiguo banner estático en línea `<div class="mb-6 p-4 rounded-xl border flex ...">` que empujaba hacia abajo el contenido de las vistas y provocaba desplazamientos de diseño (*layout shift*).
- **Implementación de ToastService Reactivo:**
  - Servicio singleton autónomo `ToastService` (`src/app/core/services/toast.service.ts`) que encapsula `MessageService` de PrimeNG con métodos semánticos tipados:
    - `success(summary, detail, life = 4000)`: verde corporativo Tavera (`#166534` / `#4ADE80`) e icono `lucideCheckCircle2`.
    - `error(summary, detail, life = 5500)`: rojo advertencia (`#B91C1C` / `#F87171`) e icono `lucideAlertTriangle`.
    - `warn(summary, detail, life = 4500)`: naranja comercial (`#EA580C` / `#FB923C`) e icono `lucideAlertCircle`.
    - `info(summary, detail, life = 4000)`: azul informativo (`#0284C7` / `#38BDF8`) e icono `lucideInfo`.
    - `show(options)` y `clear()`.
- **Integración Global de PrimeNG Toast con Plantilla Headless:**
  - Integración de `<p-toast position="top-right">` a nivel raíz en `app.html` con plantilla `#headless`, asegurando visibilidad tanto en la pantalla de login como en todas las vistas operativas autenticadas.
  - Estilización personalizada con Tailwind y tokens semánticos del Blueprint:
    - Contenedor flotante `fixed` con z-index 99999 y `pointer-events: none` global para no bloquear clics.
    - Tarjeta de notificación con barra lateral de acento de color, backdrop-blur, sombras suaves (`shadow-xl`), tipografía Inter y botón de cierre táctil accesible con icono `lucideX`.
- **Sustitución Integral de Notificaciones en toda la Aplicación:**
  - **Login:** Notificación de bienvenida tras autenticación exitosa ("Sesión iniciada: Bienvenido(a) Rosario Tavera...") y error flotante ante credenciales no válidas.
  - **Catálogo y Formulario de Productos:** Toasts para producto creado exitosamente, producto actualizado, advertencia de campos requeridos y errores de persistencia.
  - **Inventario y Kardex:** Notificación de confirmación al aplicar ajustes de existencias (`INITIAL_LOAD`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `WASTE_OUT`).
  - **Precios y Categorías:** Notificación de actualización de tarifas y creación de categorías.
  - **Proveedores y Compras:** Notificación de cotizaciones y recepción de compras con folio.
  - **Usuarios y Roles:** Notificación de creación de cuentas y alternancia de estado activo/inactivo.
- **Pruebas y Verificación:**
  - 6 pruebas unitarias específicas para `ToastService` (`toast.service.spec.ts`) aprobadas al 100%.
  - Compilación de producción limpia (`ng build`) sin advertencias ni errores.
  - Capturas de pantalla reales automatizadas en Light y Dark generadas en `docs/screenshots/`:
    - `adm-toast-error-login-light.png`: Toast de error de autenticación con credenciales erróneas.
    - `adm-toast-success-login-light.png` / `adm-toast-success-login-dark.png`: Toast de bienvenida al iniciar sesión.
    - `adm-toast-warn-validation-light.png`: Toast de advertencia por campos requeridos en el formulario de producto.
    - `adm-toast-success-product-light.png` / `adm-toast-success-product-dark.png`: Toast de producto registrado en catálogo.

## Sprint 09 — Rediseño Enterprise del Formulario, Layout y Toasts Sobrios (2026-11-13)

### Completado
- Creación de rama `feature/ui-admin-enterprise-redesign` desde `feature/ui-admin-toast-notifications`.
- **Refactorización de Layout y Sidebar:**
  - Solución definitiva al recorte del logotipo en sidebar colapsado: el logotipo ahora se centra limpiamente como un botón con icono `lucideStore` y tooltip explicativo que permite expandir al hacer clic.
  - Botón de alternancia de menú lateral colocado en el TopBar junto a los breadcrumbs, garantizando visibilidad permanente sin empalmarse con la marca comercial.
  - Ancho reactivo del área de contenido sincronizado (`w-64` / 256px expandido vs `w-20` / 80px colapsado) evitando desbordamientos horizontales en todas las resoluciones.
- **Barra de Acciones Inferior:**
  - Eliminación de transparencias, reflejos y desenfoques que dificultaban la lectura de controles.
  - Fondo de superficie sólido `bg-[var(--surface)]` con borde superior sutil `border-t border-[var(--border)]` y sombra ligera.
  - Consolidación en una única zona de acción de guardado/cancelación, eliminando botones redundantes en la cabecera.
  - Garantía de espacio con padding inferior en el contenedor para evitar que los campos queden ocultos tras la barra flotante.
- **Rediseño Enterprise del Formulario de Productos (Inspiración Apollo PrimeNG):**
  - Página completa (`/products/new` y `/products/:id/edit`), libre de modales y de tarjetas pesadas saturadas.
  - Composición asimétrica a 2 columnas (`lg:col-span-8` información principal, `lg:col-span-4` estado, categoría, existencias y rentabilidad).
  - Divisores horizontales y espaciado generoso con jerarquía visual sobria en lugar de múltiples contenedores encimados.
  - Generación asistida de clave SKU comercial con botón "Sugerir clave" que normaliza el nombre y genera códigos estándar.
  - Revelación progresiva (*progressive disclosure*) para la escala de precios de mayoreo e impuestos fiscales SAT (IVA/IEPS).
  - Corrección financiera y terminológica:
    - Términos oficiales "Ganancia Bruta" y "Margen Bruto" por unidad.
    - Eliminación de datos ficticios previos a la captura; cuando los campos están en cero se muestra el estado neutral "Pendiente de captura".
    - Resumen de rentabilidad compacto y discreto en columna lateral.
- **Toasts y Notificaciones Sobrias:**
  - Rediseño minimalista de la plantilla `#headless` de PrimeNG Toast: fondos sólidos, bordes sutiles y franja indicadora semántica de 4px.
  - Limpieza preventiva de duplicados (`clear()`) antes de emitir un nuevo mensaje para evitar saturación de la interfaz.
- **Pruebas y Verificación:**
  - 4 suites de pruebas unitarias con Vitest (`16/16` pruebas aprobadas al 100%).
  - Compilación de producción con Angular CLI (`ng build`) completada con éxito (`0` errores, `0` advertencias).
  - Verificación visual completa mediante script automatizado con capturas en Light y Dark en resoluciones 1920x1080, 1366x768 y 1024x768 (Tablet):
    - `adm-layout-expanded-light.png`
    - `adm-layout-collapsed-light.png`
    - `adm-layout-collapsed-dark.png`
    - `adm-product-new-light-1920.png`
    - `adm-product-new-dark-1920.png`
    - `adm-product-new-light-1366.png`
    - `adm-product-new-dark-1366.png`
    - `adm-product-new-tablet-1024.png`
    - `adm-product-new-configured-light.png`
    - `adm-product-new-configured-dark.png`


## Sprint 10 — Registro Rápido Eleventa + Divulgación Progresiva Enterprise (2026-11-13)

### Completado
- Creación de rama `feature/ui-admin-progressive-product-form` desde `feature/ui-admin-enterprise-redesign`.
- **Principio Fundamental Implementado: "Minimalismo visual no significa simplicidad funcional".**
- **Registro Rápido de Producto (Inspiración Rapidez Operativa Eleventa):**
  - Vista inicial ultra limpia y compacta enfocada en los 5 campos comerciales esenciales para dar de alta cualquier abarrotes en segundos:
    1. Código de barras principal (optimizado para escáner, con foco automático al abrir el formulario y salto inmediato con Enter).
    2. Categoría comercial (selector con valor por defecto listo para operar).
    3. Nombre comercial del producto (marca, contenido y presentación, con salto con Enter a costos).
    4. Costo de compra (sin impuestos).
    5. Precio de venta al público (menudeo).
  - Integración de panel de rentabilidad bruta en tiempo real: cálculo de Ganancia Bruta (`+$X.XX / u`) y Margen Bruto (`XX.X%`) con alertas de salud comercial únicamente cuando hay datos reales (estrictamente sin números ficticios).
- **Generación Automática y Segura de Clave SKU:**
  - Si el usuario no ingresa clave manual, el sistema deriva automáticamente una clave segura y libre de colisiones a partir del nombre comercial con sufijo único numérico (ej. `MARIA-170G-8421`).
  - La clave se presenta en un chip discreto con indicador "Auto-generada", permitiendo personalizarla en cualquier momento con un solo clic sin estorbar la captura rápida.
- **Divulgación Progresiva (Hub de Funciones Avanzadas):**
  - Mantiene al 100% accesibles todas las funciones avanzadas y complejas sin saturar la pantalla inicial mediante chips interactivos con acordeones integrados:
    - `[+ Precio Mayoreo]`: Escala de precio por volumen y piezas mínimas requeridas.
    - `[+ Presentaciones / Cajas]`: Alta de empaques derivados (cajas, paquetes, charolas) con factor multiplicador y precio propio.
    - `[+ Granel y Unidad]`: Selección de unidad base (PZA, KG, LT, M) y switch de producto pesado en báscula.
    - `[+ Control de Stock]`: Alerta de stock mínimo de reposición y permiso para vender en caja con existencias en cero.
    - `[+ Impuestos Fiscales SAT]`: Selección de tasas oficiales de IVA (0%, 16%) e IEPS (0%, 8%).
    - `[+ Descripción y Notas]`: Textarea para observaciones y proveedor habitual.
  - En modo edición (`isEditMode`), cualquier sección que contenga datos reales se despliega automáticamente para asegurar visibilidad total.
- **Acciones y Flujo Continuo:**
  - Botón «Guardar Producto» (`F10` / `Ctrl+S`): Guarda y regresa al catálogo con notificación toast.
  - Botón «Guardar y Registrar Otro» (`F11` / `Ctrl+Enter` / `Alt+G`): Guarda el producto en la API, actualiza el catálogo en segundo plano, emite toast de confirmación, limpia el formulario a sus valores por defecto y enfoca de inmediato el campo de código de barras para el siguiente artículo.
  - Botón «Cancelar» (`Esc`): Solo solicita confirmación si el usuario introdujo datos sin guardar (`isDirty`); si está limpio, regresa al catálogo inmediatamente sin pasos innecesarios.
- **Pruebas y Verificación:**
  - 4 suites de pruebas unitarias con Vitest (`16/16` pruebas aprobadas al 100%).
  - Compilación de producción con Angular CLI (`ng build`) completada con éxito (`0` errores, `0` advertencias).
  - Capturas de pantalla reales automatizadas en Light y Dark generadas en `docs/screenshots/`:
    - `adm-fast-register-initial-light.png`
    - `adm-fast-register-initial-dark.png`
    - `adm-fast-register-filled-light.png`
    - `adm-progressive-advanced-open-light.png`
    - `adm-progressive-advanced-open-dark.png`
    - `adm-save-and-another-ready.png`
    - `adm-unsaved-changes-modal.png`

## Claridad de las vistas del Admin (2026-11-13)

- Inicio muestra ventas acumuladas, cajas abiertas y alertas de stock antes del detalle financiero plegable. El selector de periodos queda pendiente de un contrato con filtros en la API.
- La navegación expande el grupo de la sección activa. Las acciones para registrar y editar productos están en el catálogo.
- El catálogo reúne nombre, SKU y códigos de barras en una columna y deja visible la edición rápida de precio.
- El alta abre con los datos esenciales. Las opciones avanzadas se pueden desplegar y se repliegan al guardar y registrar otro. En edición aparecen abiertas.
- La rama parte de origin/develop e incorpora por avance rápido 9adcaa5 para aplicar los cambios sobre el rediseño del PR #13 y los ajustes locales que lo continúan.

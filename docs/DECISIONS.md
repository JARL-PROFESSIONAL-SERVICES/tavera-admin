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

## ADR-006: Rediseño de UX en Catálogo y Formularios Extensos de Productos (ADM-03 y ADM-04)

- **Fecha:** 2026-11-13
- **Estado:** Aprobado

### Contexto y Problema
1. **Fallo de Renderizado en Catálogo:** El catálogo de productos reportaba existencia de registros y mostraba el paginador, pero las filas de la tabla aparecían vacías (0 filas). El análisis a nivel de paquete en PrimeNG v22 reveló que `p-table` utiliza consultas de señal `contentChild("header")` y `contentChild("body")`, requiriendo variables de referencia `#header` y `#body` en las etiquetas `<ng-template>` además del atributo `pTemplate`. Asimismo, el estado reactivo `viewState` se desacopló de `computed` estático para evaluar limpiamente los 5 estados de vista durante los ciclos de detección de cambios de Angular.
2. **Experiencia de Usuario en Formularios Extensos:** La gestión de productos comerciales con múltiples códigos de barras, presentaciones derivadas, costos base, precios de mayoreo e inventario resulta abrumadora y propensa a errores dentro de un modal emergente con pestañas y scroll interno.

### Decisiones
1. **Estados Diferenciados en Catálogo (ADM-03):**
   - **LOADING:** Esqueleto visual animado con filas titilantes que preserva la estructura de la tabla y evita saltos de layout.
   - **ERROR:** Contenedor de alerta con descripción accesible y botón para reintentar la carga sin recargar la página.
   - **EMPTY:** Estado de bienvenida comercial cuando el sistema no tiene productos registrados, con ilustración/icono `lucidePackagePlus` y llamado a la acción prioritario "+ Registrar mi primer producto".
   - **NO_RESULTS:** Estado cuando la búsqueda o filtros no encuentran coincidencias, con visualización de los términos buscados y botón para limpiar filtros y ver todos los artículos con un solo clic.
   - **SUCCESS:** Tabla completa con datos reales renderizados, ordenamiento multi-columna, edición rápida de precio de menudeo y paginación condicional que se oculta automáticamente cuando la lista filtrada es menor o igual al tamaño de página (≤ 10 artículos).
2. **Eliminación de Modales Extensos y Páginas Completas Dedicadas (ADM-04):**
   - Se crearon rutas y vistas de página completa independientes para `/products/new` y `/products/:id/edit` (`ProductFormPageComponent`).
   - El formulario se organiza en 7 bloques comerciales progresivos con lenguaje sencillo y libre de jerga técnica:
     1. Información básica del producto (Nombre comercial claro, código interno SKU, notas).
     2. Categoría y códigos de barras (Familia y chips interactivos para lectores de código de barras).
     3. Precios y margen de ganancia (Costo base de compra, precio de venta al público y cálculo en vivo de rentabilidad con alertas visuales de salud de margen).
     4. Unidades de medida y presentaciones comerciales (Unidad base, venta a granel/pesaje y presentaciones adicionales por caja o docena con factor multiplicador).
     5. Inventario y alertas de existencias (Stock mínimo para reabastecimiento y permiso para vender en negativo).
     6. Configuración avanzada opcional (Impuestos SAT IVA/IEPS colapsados de forma predeterminada para evitar confusión en usuarios no técnicos).
     7. Barras de acción superior e inferior con navegación de retorno al catálogo.
3. **Protección Contra Pérdida Accidental de Cambios:**
   - Detección reactiva de estado "dirty" comparando el snapshot inicial del formulario contra el estado actual.
   - Si el usuario tiene modificaciones sin guardar e intenta salir mediante "Cancelar" o "Volver al Catálogo", se despliega un diálogo de advertencia amigable que le permite elegir entre "Continuar editando" o "Salir y descartar cambios".
4. **Regla Arquitectural de Diálogos vs Páginas en Tavera Suite:**
   - Procesos de alta/edición extensos o de varios pasos: **Páginas completas**.
   - Confirmaciones, advertencias breves y acciones rápidas: **Modales**.
   - Consultas rápidas: **Paneles flotantes o drawers**.

## ADR-007: Notificaciones Temporales Flotantes con PrimeNG Toast y Lucide Icons

- **Fecha:** 2026-11-13
- **Estado:** Aprobado

### Contexto y Problema
Anteriormente, los avisos de sesión iniciada, errores de autenticación, éxito en la creación/edición de productos y actualizaciones de inventario se mostraban mediante un bloque estático de retroalimentación dentro de la cabecera del shell (`feedback = signal(...)`).
Este enfoque presentaba inconvenientes de UX:
1. Al aparecer o desaparecer, empujaba verticalmente el contenido de las páginas, provocando molestos desplazamientos de diseño (*layout shifts*).
2. Permanecía estático indefinidamente en pantalla hasta que el usuario localizaba y presionaba el botón de cerrar.
3. No era visible en la pantalla de inicio de sesión previa a la autenticación.

### Decisiones
1. **Adopción Universal de Toasts para Información Temporal:**
   - Todo mensaje temporal informativo, de éxito comercial, advertencia o error se canaliza exclusivamente a través de notificaciones flotantes tipo **Toast**.
2. **Ubicación Global y Plantilla Headless en `app.html`:**
   - Se integró `<p-toast position="top-right">` a nivel raíz de la aplicación, por fuera de la condición de autenticación. Esto garantiza que las alertas de error de credenciales en el login y la bienvenida inmediata tras autenticarse se muestren de forma uniforme.
   - Se utilizó la plantilla `#headless` de PrimeNG v22 para mantener control absoluto sobre el HTML y las clases de Tailwind, evitando dependencias en fuentes de iconos externas (como PrimeIcons) y asegurando concordancia estética con los iconos Lucide (`@ng-icons/lucide`).
3. **Servicio Reactivo Centralizado (`ToastService`):**
   - Se creó `ToastService` (`src/app/core/services/toast.service.ts`) como wrapper tipado sobre `MessageService` de PrimeNG, exponiendo métodos semánticos con duraciones optimizadas:
     - `success`: 4000 ms con color verde comercial (`#166534` / `#4ADE80`).
     - `error`: 5500 ms con color rojo advertencia (`#B91C1C` / `#F87171`).
     - `warn`: 4500 ms con color naranja comercial (`#EA580C` / `#FB923C`).
     - `info`: 4000 ms con color azul operativo (`#0284C7` / `#38BDF8`).
4. **Diseño Visual y Accesibilidad:**
   - Cada tarjeta toast cuenta con:
     - Borde translúcido y fondo desenfocado (`backdrop-blur-md`).
     - Barra lateral distintiva del color de la severidad.
     - Icono semántico distintivo en caja con tinte temático.
     - Título en negrita y descripción detallada en texto legible.
     - Botón de cierre manual accesible por teclado (`role="status"`, `aria-label="Cerrar"`).
     - Contenedor con `pointer-events: none` y tarjetas con `pointer-events: auto` para no obstruir clics en la interfaz cuando no haya notificaciones activas.


## ADR-008: Rediseño Enterprise del Formulario de Productos (Apollo PrimeNG Composition), Layout Dinámico y Toasts Sobrios

- **Fecha:** 2026-11-13
- **Estado:** Aprobado

### Contexto y Problema
Tras la implementación de páginas completas y toasts iniciales, la interfaz de administración requería un salto cualitativo hacia un estándar enterprise (tomando como referencia compositiva la plantilla Apollo PrimeNG E-Commerce):
1. **Layout y Marca:** El sidebar en estado colapsado cortaba el nombre y logotipo de Abarrotes Tavera horizontalmente; además, el botón de alternancia se superponía con elementos del menú y el ancho del área principal no se adaptaba armónicamente.
2. **Barra de Acciones Inferior:** Presentaba fondos translúcidos y desenfoques (*backdrop-blur*) que dificultaban la lectura, coexistía con botones redundantes de guardar en la parte superior y corría el riesgo de tapar los campos inferiores del formulario.
3. **Saturación en el Formulario:** Existía una acumulación de tarjetas grandes encimadas con excesivo ruido visual, cálculos de rentabilidad ficticios mostrados con números artificiales antes de capturar datos, y el uso erróneo del término contable "ganancia neta" en lugar de "ganancia bruta".
4. **Toasts Intrusivos:** Efectos visuales excesivos y acumulación de múltiples notificaciones repetidas al navegar entre vistas.

### Decisiones
1. **Composición Asimétrica Enterprise (Referencia Apollo PrimeNG):**
   - Estructuración en 2 columnas principales con rejilla responsive (`grid-cols-1 lg:grid-cols-12`):
     - **Columna Primaria (8 columnas):** Datos generales del producto (nombre, descripción, clave SKU con botón asistido "Sugerir clave"), precios base y escala de mayoreo progresiva (*progressive disclosure*), unidades y presentaciones comerciales derivadas.
     - **Columna Secundaria (4 columnas):** Clasificación por categorías con badge de estado, control de existencias mínimas y tarjeta sobria de rentabilidad proyectada.
   - Reemplazo de cajas y tarjetas pesadas por divisores limpios (`divide-y divide-[var(--border)]`) y espacios de respiro consistentes.
2. **Corrección Financiera y Terminológica:**
   - Adopción estricta de **Ganancia Bruta** y **Margen Bruto**.
   - Supresión de números ficticios o estimaciones simuladas: mientras el costo o el precio estén en cero o sin capturar, la tarjeta de rentabilidad se mantiene en estado neutral ("Pendiente de captura: Ingrese costo y precio para proyectar").
3. **Consolidación de Acciones en Barra Inferior Sólida:**
   - Eliminación de los botones secundarios duplicados en la cabecera.
   - Barra fija inferior (`sticky bottom-0`) con superficie sólida opaca (`bg-[var(--surface)]`), borde superior de 1px y padding inferior en el formulario para asegurar visibilidad total de los campos.
4. **Layout Dinámico y Logotipo Adaptativo:**
   - En estado colapsado (`w-20` / 80px), el logotipo se contrae elegantemente a un botón cuadrado centrado con icono `lucideStore` y tooltip explicativo, que expande el menú al hacer clic.
   - El botón de colapso/expansión se reubicó en el TopBar junto a los breadcrumbs, manteniéndose siempre accesible sin obstruir el contenido.
5. **Toasts Sobrios y Descarte Preventivo:**
   - Rediseño minimalista de la notificación toast sin sombras pesadas ni brillos artificiales.
   - Invocación preventiva de `clear()` en `ToastService` previo a emitir cualquier nuevo mensaje para impedir acumulaciones ruidosas en pantalla.


## ADR-009: Divulgación Progresiva y Registro Rápido Eleventa + Apollo PrimeNG en Catálogo de Productos

- **Fecha:** 2026-11-13
- **Estado:** Aprobado

### Contexto y Problema
El formulario de alta de productos requería equilibrar dos necesidades operativas críticas:
1. **Rapidez Operativa (Eleventa Speed):** Un cajero o encargado de tienda necesita registrar decenas de productos con lector de código de barras en pocos segundos, capturando únicamente nombre, código de barras, categoría, costo y precio, sin desplazamientos verticales extensos, sin fricción y sin configurar manualmente claves técnicas o parámetros fiscales innecesarios para abarrotes habituales.
2. **Capacidad Comercial Compleja (Enterprise Depth):** El minimalismo visual no debe sacrificar la potencia funcional del sistema. Las reglas de negocio de `tavera-api` y las funciones comerciales avanzadas (mayoreo, empaques/cajas, pesaje en báscula, unidades métricas, control de existencias, permisos de venta en negativo e impuestos SAT) deben permanecer 100% disponibles y accesibles sin saturar la vista inicial.

### Decisiones
1. **Principio de Divulgación Progresiva (*Progressive Disclosure*):**
   - La pantalla inicial muestra única y exclusivamente los 5 campos indispensables para comercializar un producto común.
   - Las funciones comerciales avanzadas se organizan en un Hub de Divulgación Progresiva mediante chips selectores con acordeones integrados:
     - `[+ Precio Mayoreo]`
     - `[+ Presentaciones / Cajas]`
     - `[+ Granel y Unidad]`
     - `[+ Control de Stock]`
     - `[+ Impuestos Fiscales SAT]`
     - `[+ Descripción y Notas]`
   - Los campos avanzados solo se renderizan y ocupan espacio cuando el operador decide utilizarlos o cuando un producto existente en edición ya contiene datos en dichos módulos.
2. **Generación Automática y Segura de SKU:**
   - Para no entorpecer la captura rápida, el sistema genera automáticamente un SKU limpio a partir de las palabras clave del nombre comercial más un sufijo numérico único que previene colisiones (ej. `MARIA-170G-8421`).
   - El operador puede inspeccionar la clave generada y, si requiere un código interno específico de su empresa, puede personalizarla con un solo clic en "Personalizar", manteniendo compatibilidad total con inventarios legados.
3. **Flujo Optimizado para Escáner y Teclado:**
   - Foco automático en el campo de código de barras al ingresar a la vista.
   - Al escanear con lector óptico o presionar Enter, el código se registra y el foco salta automáticamente al nombre comercial, luego al costo y al precio de venta.
   - Atajos globales del teclado: `F10` o `Ctrl+S` para Guardar; `F11` o `Ctrl+Enter` para Guardar y registrar otro; `Esc` para Cancelar.
4. **Acción «Guardar y Registrar Otro»:**
   - Permite dar de alta múltiples artículos de forma continua: envía el registro a la API, actualiza el catálogo reactivamente, emite un toast de confirmación temporal y resetea el formulario reenfocando de inmediato el código de barras sin recargar la página.
5. **Confirmación Condicional sin Interrupciones Innecesarias:**
   - Solo se muestra advertencia de confirmación al presionar "Cancelar" si el formulario contiene modificaciones no guardadas (`isDirty`). Si el usuario no ha capturado datos, la salida es inmediata.

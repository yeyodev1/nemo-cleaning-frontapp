# CLAUDE.md

Guía para Claude Code (y personas) que trabajen en este repo.

## Qué es esto

Frontend de **Nemo Cleaning Services** (limpieza a domicilio en Guayaquil: sucursales Samborondón y
Vía a la Costa). Vue 3 + Vite 7 + TypeScript + Pinia + vue-router + axios + SCSS propio. Desplegado en Vercel
(SPA, `vercel.json` reescribe todo a `index.html`). El backend vive en `../nemo-cleaning-backapp`
(Express, puerto 8100). **La fuente de verdad del API es `../CONTRATO-API.md`.**

Dos superficies en la misma app:
- **Sitio público** (`/`, `/reservar`, `/cotizar-oficina`, `/pedido/:code?token=`, `/pay-response`, `/ingresar`,
  `/mi-cuenta`). `/pago/respuesta` es una redirección a `/pay-response` que conserva la query.
- **Panel** (`/admin/*`) con roles `admin` (gerencia), `manager` (sucursal) y `operator` (lavador → solo
  `/admin/mis-servicios`).

## Comandos

```sh
pnpm install
pnpm dev          # :5173 — necesita el backapp en :8100 (VITE_API_URL en .env.local)
pnpm build        # vue-tsc -b && vite build (el type-check corre aquí)
pnpm typecheck
pnpm format
```

No hay suite de tests: la verificación es `pnpm build` + revisión en navegador a 360–420 px y en escritorio.

## Reglas duras

- **Mobile first.** Se diseña a 360–420 px y se escala con `@include from('md' | 'lg')`. Barras fijas
  inferiores respetan `env(safe-area-inset-bottom)`. Objetivos táctiles ≥ 44 px, foco visible siempre.
- **Ningún `.vue` pasa de ~300 líneas.** La lógica sale a composables (`src/composables/**`).
- **Nada de librerías UI ni Tailwind, ni CDNs de iconos.** Iconos inline con `<AppIcon name="…" />`
  (`src/components/ui/icons.ts`, estilo Lucide). Sin emojis en la UI.
- **Dinero en centavos enteros** en todo el código; solo se formatea al pintar con `money()` (`$15.00`)
  y se convierte en formularios con `toCents()` / `fromCents()` (`src/utils/format.ts`).
- **Fechas del negocio en `America/Guayaquil`**: usa `todayISO()`, `addDays()`, `shortDate()`… nunca
  `new Date().toISOString().slice(0,10)` (da el día UTC).
- **Copy en español (Ecuador), identificadores en inglés.** Etiquetas de enums en `src/config/labels.ts`.
- `localStorage`/`sessionStorage` siempre con try/catch (`src/utils/storage.ts`).
- Todo `VITE_*` es público: nunca un secreto con ese prefijo. `.env*` está en `.gitignore` salvo `.env.example`.

## Estilos: la trampa de `additionalData`

`vite.config.ts` antepone `@/styles/index.scss` a **cada** `<style lang="scss">`. Ese archivo solo
reexporta `_tokens.scss` (colores, tipografía, radios) y `_mixins.scss` (`from`, `container`, `flex`,
`flex-cards`, `card`, `eyebrow`, `display`, `truncate`…): **nada que emita CSS**. Lo que emite CSS
(reset, `.btn`, `.field`, `.badge`, `.card`, `.skeleton`, transiciones, `v-reveal`) está en `global.scss`,
importado una vez desde `main.ts`. En componentes se usan `$navy`, `$orange`, `@include from('md')` sin `@use`.

Marca REAL = identidad de Instagram (fuente de verdad: `../recursos/MARCA.md`; **no inventar copy, cifras, testimonios
ni garantías**). Marino `$navy #12263F` dominante, naranja `$orange #E8743B` solo como acento (subrayados, flechas, CTA),
celeste `$sky-blue #6FB1DE`, blanco; carbón `$charcoal` solo secundario. Naranja sobre blanco solo texto grande; texto
pequeño naranja → `$orange-ink`. Botón naranja (`.btn--accent`) con texto marino. Fuentes: **Fraunces** para titulares
(`$font-display`, `@include display`, sin mayúsculas forzadas) y **Poppins** para texto/botones/etiquetas (`$font-ui`).
Mixins: `dark-pattern` (marino con degradado sutil), `orange-underline` (subrayado corto bajo títulos, como los posts),
`photo-frame`. Logo: `components/brand/NemoLogo.vue` con los SVG oficiales de `public/brand/` (`dark` = sobre oscuro,
`light` = sobre claro); nunca redibujarlo ni usar `recursos/logo/version-catalogo-anterior/`. Favicon/íconos/OG vienen
tal cual de `recursos/logo/`. Fotos reales en `public/fotos/` (pares antes/después recortados en `public/fotos/antes-despues/`).
Contacto y cobertura en `config/site.ts`; copy del landing, paquetes, tamaños de vehículo y FAQ en `config/landing.ts`.

Movimiento: tokens `$ease-out` (cubic-bezier(.2,.8,.2,1)), `$dur-fast/$dur/$dur-slow` (200/280/350 ms); solo
transform/opacity (y `grid-template-rows` para alturas, p. ej. el FAQ). Transiciones globales en `global.scss`
(`page`, `step-next|prev`, `fade-up`, `.bump`, `v-reveal`); `prefers-reduced-motion` las apaga.

Catálogo: variantes (tamaño/medida/plan), rangos (`priceMax`, se cobra el menor), tramos por cantidad y m² con decimales.
`utils/pricing.ts` replica EXACTO `pricing.service.ts#priceLine` del back; el carrito usa claves `id::variante`
(`composables/booking/cart.ts`). `composables/office/officePricing.ts` replica `computeEstimate` del back.

## Arquitectura

- **Router** (`src/router/`): lazy imports, `meta.title`, `meta.layout` (`public` | `admin` | `bare`),
  `meta.focus` (oculta el footer en wizards), `meta.requiresAuth`, `meta.roles`, `meta.requiresCustomer`,
  `meta.customerGuestOnly`. El guard restaura la sesión con `/auth/me` y manda a cada rol a su inicio (`userStore.home`).
- **Acceso sin contraseña**: `/admin/login` (personal) e `/ingresar` (clientes) usan `components/auth/CodeLoginForm.vue`
  + `composables/auth/useCodeLogin.ts` (correo → código de 6 dígitos, reenvío cada 60 s).
- **Dos sesiones separadas**: personal en `localStorage.nemo_access_token` (store `user`) y cliente en
  `localStorage.nemo_customer_token` (store `customer`). Cada servicio declara `authAs` (`staff` | `customer` | `none`)
  y `httpBase` adjunta solo ese token; `public.service` y `customer.service` usan el del cliente. Un 401 emite
  `auth:token-expired` o `customer:token-expired` según el token que se mandó.
- **Services** (`src/services/`): `class XService extends APIBase` + singleton. `httpBase.ts` resuelve
  `VITE_API_URL`, pone el Bearer que corresponde al servicio (ver "Dos sesiones"), limpia query vacías y normaliza
  errores a `ApiError { status, message }` (el `message` viene en español del back y se muestra tal cual).
  - `public.service` (web pública), `auth.service`, `bookings.service` (dashboard, agenda, pedidos, pagos),
    `finance.service` (gastos, reportes, caja), `management.service` (catálogo, sucursales, personal,
    clientes, cotizaciones, configuración, uploads) y `operatorService`.
- **Tipos** (`src/types/api.ts`): espejo del contrato.
- **Stores** (Pinia): `user` (sesión/rol del personal), `customer` (Mi cuenta), `toast`, `catalog` (sucursales, servicios y settings públicos;
  se cargan una vez), `adminScope` (sucursal global del panel; `''` = todas, solo gerencia).
- **Componentes**: `ui/` (AppIcon, BaseSheet, QuantityStepper, FileDrop, StatusBadge, ToastList),
  `booking/` (asistente; `ServicePicker.vue` + `ServiceOption.vue` los reutiliza el panel), `home/`, `office/`, `tracking/`,
  `admin/layout` (sidebar escritorio, tab bar + drawer móvil, selector de sucursal), `admin/common`
  (KpiCard, Pagination, BookingBadges) y una carpeta por módulo del panel.
- **Grillas que escribe gerencia** (Nómina "Sueldos base", Comisiones): `components/admin/grid/` (`MonthGrid` ENE…DIC en
  escritorio / chips de mes + lista en celular, `MoneyCell` con guardado por celda, Enter = celda de abajo, `$1,234.56`
  fuera de foco, vacío = null; `AddPersonSheet`) + `composables/admin/useMonthGrid.ts` (totales en vivo, estado
  guardando/guardado/error). Metas usan `MoneyCell` en `GoalCard` (`useGoalEntry`). La pestaña "Calculadora FEE
  (referencia)" no alimenta reportes: "Usar este valor" copia el FEE a la hoja manual.
- **Payphone (Cajita v2.0)**: `composables/booking/usePayphoneBox.ts` carga CSS+JS del CDN solo al pagar;
  `PayphoneBox.vue` lo enmarca; Payphone vuelve a `/pay-response?id=&clientTransactionId=` (URL configurada en Payphone, no en la Cajita) y
  `usePaymentConfirm.ts` llama a `/public/payphone/confirm` (idempotente).

## Convenciones

- `<script setup lang="ts">`; orden script → template → style; `<style scoped lang="scss">`; BEM.
- Sin punto y coma, comillas simples, 2 espacios, ancho 100–120 (Prettier).
- Componentes PascalCase; vistas con sufijo `View`; composables `useX`.
- Comentarios en español y explican el porqué.

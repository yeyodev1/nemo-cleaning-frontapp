# CLAUDE.md

Guía para Claude Code (y personas) que trabajen en este repo.

## Qué es esto

Frontend de **Nemo Cleaning Services** (limpieza a domicilio en Guayaquil: sucursales Samborondón y
Vía a la Costa). Vue 3 + Vite 7 + TypeScript + Pinia + vue-router + axios + SCSS propio. Desplegado en Vercel
(SPA, `vercel.json` reescribe todo a `index.html`). El backend vive en `../nemo-cleaning-backapp`
(Express, puerto 8100). **La fuente de verdad del API es `../CONTRATO-API.md`.**

Dos superficies en la misma app:
- **Sitio público** (`/`, `/reservar`, `/cotizar-oficina`, `/pedido/:code?token=`, `/pago/respuesta`).
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
importado una vez desde `main.ts`. En componentes se usan `$navy`, `$aqua`, `@include from('md')` sin `@use`.

Marca: primario `$navy #0B4F8A`, acento `$aqua #19C3B8` (para texto sobre blanco usar `$aqua-ink`),
fondos `$paper` / `$sky`. Fuente: Plus Jakarta Sans (cargada con `<link>` en `index.html`).

## Arquitectura

- **Router** (`src/router/`): lazy imports, `meta.title`, `meta.layout` (`public` | `admin` | `bare`),
  `meta.focus` (oculta el footer en wizards), `meta.requiresAuth`, `meta.roles`. El guard restaura la
  sesión con `/auth/me` y manda a cada rol a su inicio (`userStore.home`).
- **Services** (`src/services/`): `class XService extends APIBase` + singleton. `httpBase.ts` resuelve
  `VITE_API_URL`, pone el Bearer (`localStorage.nemo_access_token`), limpia query vacías y normaliza
  errores a `ApiError { status, message }` (el `message` viene en español del back y se muestra tal cual).
  Un 401 con sesión emite `auth:token-expired` → `main.ts` cierra sesión y lleva al login.
  - `public.service` (web pública), `auth.service`, `bookings.service` (dashboard, agenda, pedidos, pagos),
    `finance.service` (gastos, reportes, caja), `management.service` (catálogo, sucursales, personal,
    clientes, cotizaciones, configuración, uploads) y `operatorService`.
- **Tipos** (`src/types/api.ts`): espejo del contrato.
- **Stores** (Pinia): `user` (sesión/rol), `toast`, `catalog` (sucursales, servicios y settings públicos;
  se cargan una vez), `adminScope` (sucursal global del panel; `''` = todas, solo gerencia).
- **Componentes**: `ui/` (AppIcon, BaseSheet, QuantityStepper, FileDrop, StatusBadge, ToastList),
  `booking/` (asistente; `ServicePicker.vue` lo reutiliza el panel), `home/`, `office/`, `tracking/`,
  `admin/layout` (sidebar escritorio, tab bar + drawer móvil, selector de sucursal), `admin/common`
  (KpiCard, Pagination, BookingBadges) y una carpeta por módulo del panel.
- **Payphone (Cajita v2.0)**: `composables/booking/usePayphoneBox.ts` carga CSS+JS del CDN solo al pagar;
  `PayphoneBox.vue` lo enmarca; Payphone vuelve a `/pago/respuesta?id=&clientTransactionId=` y
  `usePaymentConfirm.ts` llama a `/public/payphone/confirm` (idempotente).

## Convenciones

- `<script setup lang="ts">`; orden script → template → style; `<style scoped lang="scss">`; BEM.
- Sin punto y coma, comillas simples, 2 espacios, ancho 100–120 (Prettier).
- Componentes PascalCase; vistas con sufijo `View`; composables `useX`.
- Comentarios en español y explican el porqué.

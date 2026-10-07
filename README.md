# Nemo Cleaning — Frontapp

Web pública (reservas en línea, cotizador de oficinas, seguimiento de pedidos, pago con Payphone) y panel
administrativo (agenda, pedidos, conciliación, gastos, reportes, catálogo, personal) de **Nemo Cleaning
Services**, Guayaquil. Mobile first.

## Stack

Vue 3 · Vite 7 · TypeScript · Pinia · vue-router · axios · SCSS propio (sin librerías UI).

## Arranque

```sh
cp .env.example .env.local   # VITE_API_URL=http://localhost:8100/api
pnpm install
pnpm dev                     # http://localhost:5173
```

Necesita el backend (`../nemo-cleaning-backapp`) corriendo en `:8100`. El contrato del API está en
`../CONTRATO-API.md`.

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base del API, con `/api`. Producción: `https://api.nemocleaning.ec/api` |

## Scripts

- `pnpm build` — type-check (`vue-tsc -b`) + build de producción en `dist/`.
- `pnpm typecheck` — solo type-check.
- `pnpm format` — Prettier.

## Rutas

**Públicas:** `/` · `/reservar` · `/cotizar-oficina` · `/pedido/:code?token=` · `/pay-response` (`/pago/respuesta` redirige) · `/ingresar` · `/mi-cuenta`

**Panel:** `/admin/login` · `/admin` (dashboard) · `/admin/agenda` · `/admin/pedidos` (+ `/nuevo`, `/:id`) ·
`/admin/pagos` · `/admin/gastos` · `/admin/caja` · `/admin/reportes` · `/admin/cotizaciones` ·
`/admin/clientes` (+ `/:id`) · `/admin/catalogo` · `/admin/personal` · `/admin/sucursales` ·
`/admin/configuracion` · `/admin/mis-servicios` (operador) · `/admin/cuenta`

## Despliegue

Vercel (framework Vite). `vercel.json` reescribe todo a `index.html` (SPA) y cachea `/assets`.
Configurar `VITE_API_URL` en el proyecto de Vercel. Payphone debe tener como URL de respuesta
`https://nemocleaning.ec/pay-response`.

Más detalle de arquitectura y convenciones en `CLAUDE.md`.

import type { IconName } from '@/components/ui/icons'
import type { Role } from '@/types/api'

export interface NavItem {
  to: string
  label: string
  icon: IconName
  roles: Role[]
  /** Aparece en la barra inferior móvil. */
  tab?: boolean
  /** Etiqueta corta para la barra inferior. */
  short?: string
  /** Encabezado de sección en el menú (se pinta cuando cambia respecto al ítem anterior). */
  group?: string
  /** Burbuja con un conteo en vivo (p. ej. pedidos por WhatsApp sin confirmar). */
  badge?: 'whatsapp'
}

const AM: Role[] = ['admin', 'manager']
const A: Role[] = ['admin']

/**
 * Orden del menú: Inicio; Operación (lo del día a día); Finanzas; Comercial; Configuración.
 * Barra inferior móvil (`tab`): Inicio, Registrar (lo más usado, a un toque), Base y Pagos;
 * el resto vive en "Más". El operador solo ve Mis servicios.
 */
export const adminNav: NavItem[] = [
  { to: '/admin', label: 'Inicio', icon: 'grid', roles: AM, tab: true },
  // Operación (la Base, Calendario, Metas, FEE y Novedades del Excel)
  { to: '/admin/produccion/registrar', label: 'Registrar servicio', short: 'Registrar', icon: 'plus', roles: AM, tab: true, group: 'Operación' },
  { to: '/admin/whatsapp', label: 'Pedidos por WhatsApp', short: 'WhatsApp', icon: 'whatsapp', roles: AM, group: 'Operación', badge: 'whatsapp' },
  { to: '/admin/produccion', label: 'Producción (Base)', short: 'Base', icon: 'layers', roles: AM, tab: true, group: 'Operación' },
  { to: '/admin/agenda', label: 'Agenda', icon: 'calendar', roles: AM, group: 'Operación' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'list', roles: AM, group: 'Operación' },
  { to: '/admin/novedades', label: 'Novedades', icon: 'alert', roles: AM, group: 'Operación' },
  { to: '/admin/turnos', label: 'Turnos', icon: 'clock', roles: AM, group: 'Operación' },
  { to: '/admin/metas', label: 'Metas mensuales', icon: 'flag', roles: AM, group: 'Operación' },
  { to: '/admin/comisiones', label: 'Comisiones', icon: 'briefcase', roles: AM, group: 'Operación' },
  // Finanzas (reportes del Excel de gerencia)
  { to: '/admin/pagos', label: 'Pagos por confirmar', short: 'Pagos', icon: 'wallet', roles: AM, tab: true, group: 'Finanzas' },
  { to: '/admin/finanzas/cuentas-por-cobrar', label: 'Cuentas por cobrar', icon: 'clock', roles: AM, group: 'Finanzas' },
  { to: '/admin/caja', label: 'Registro de caja', icon: 'cash', roles: AM, group: 'Finanzas' },
  { to: '/admin/gastos', label: 'Gastos', icon: 'receipt', roles: AM, group: 'Finanzas' },
  { to: '/admin/finanzas/pagos', label: 'Pagos por realizar', icon: 'check-circle', roles: A, group: 'Finanzas' },
  { to: '/admin/finanzas/nomina', label: 'Nómina', icon: 'users', roles: A, group: 'Finanzas' },
  { to: '/admin/finanzas/quincenal', label: 'Reporte quincenal', icon: 'layers', roles: A, group: 'Finanzas' },
  { to: '/admin/finanzas/estado-de-resultados', label: 'Estado de resultados', icon: 'chart', roles: A, group: 'Finanzas' },
  { to: '/admin/finanzas/conciliacion', label: 'Conciliación bancaria', icon: 'bank', roles: AM, group: 'Finanzas' },
  { to: '/admin/reportes', label: 'Producción por servicio', icon: 'chart', roles: AM, group: 'Finanzas' },
  // Comercial
  { to: '/admin/clientes', label: 'Clientes', icon: 'users', roles: AM, group: 'Comercial' },
  { to: '/admin/comercial', label: 'Zonas, frecuencia y cartera', short: 'Comercial', icon: 'star', roles: AM, group: 'Comercial' },
  { to: '/admin/cotizaciones', label: 'Cotizaciones de oficina', icon: 'building', roles: AM, group: 'Comercial' },
  // Configuración
  { to: '/admin/personal', label: 'Personal', icon: 'user', roles: A, group: 'Configuración' },
  { to: '/admin/catalogo', label: 'Catálogo', icon: 'tag', roles: A, group: 'Configuración' },
  { to: '/admin/sucursales', label: 'Sucursales', icon: 'store', roles: A, group: 'Configuración' },
  { to: '/admin/configuracion', label: 'Ajustes', icon: 'settings', roles: A, group: 'Configuración' },
  { to: '/admin/mis-servicios', label: 'Mis servicios', icon: 'route', roles: ['operator'], tab: true },
  { to: '/admin/cuenta', label: 'Mi cuenta', icon: 'lock', roles: ['admin', 'manager', 'operator'], group: 'Configuración' },
]

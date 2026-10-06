import type { IconName } from '@/components/ui/icons'
import type { Role } from '@/types/api'

export interface NavItem {
  to: string
  label: string
  icon: IconName
  roles: Role[]
  /** Aparece en la barra inferior móvil. */
  tab?: boolean
}

const AM: Role[] = ['admin', 'manager']
const A: Role[] = ['admin']

export const adminNav: NavItem[] = [
  { to: '/admin', label: 'Inicio', icon: 'grid', roles: AM, tab: true },
  { to: '/admin/agenda', label: 'Agenda', icon: 'calendar', roles: AM, tab: true },
  { to: '/admin/pedidos', label: 'Pedidos', icon: 'list', roles: AM, tab: true },
  { to: '/admin/pagos', label: 'Pagos', icon: 'wallet', roles: AM, tab: true },
  { to: '/admin/gastos', label: 'Gastos', icon: 'receipt', roles: AM },
  { to: '/admin/caja', label: 'Caja del día', icon: 'cash', roles: AM },
  { to: '/admin/reportes', label: 'Reportes', icon: 'chart', roles: AM },
  { to: '/admin/cotizaciones', label: 'Cotizaciones', icon: 'building', roles: AM },
  { to: '/admin/clientes', label: 'Clientes', icon: 'users', roles: AM },
  { to: '/admin/catalogo', label: 'Catálogo', icon: 'tag', roles: A },
  { to: '/admin/personal', label: 'Personal', icon: 'user', roles: A },
  { to: '/admin/sucursales', label: 'Sucursales', icon: 'store', roles: A },
  { to: '/admin/configuracion', label: 'Configuración', icon: 'settings', roles: A },
  { to: '/admin/mis-servicios', label: 'Mis servicios', icon: 'route', roles: ['operator'], tab: true },
  { to: '/admin/cuenta', label: 'Mi cuenta', icon: 'lock', roles: ['admin', 'manager', 'operator'] },
]

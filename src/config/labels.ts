// Etiquetas en español para los enums del contrato y su tono de badge.
import type {
  BookingStatus,
  ExpenseCategory,
  OfficePlan,
  OfficeQuoteStatus,
  PaidFrom,
  PaymentMethod,
  PaymentRecordStatus,
  PaymentStatus,
  Role,
  ServiceCategory,
  ServiceUnit,
} from '@/types/api'

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'navy' | 'aqua' | ''

interface Label {
  label: string
  tone: Tone
}

export const bookingStatus: Record<BookingStatus, Label> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  confirmed: { label: 'Confirmado', tone: 'info' },
  on_the_way: { label: 'En camino', tone: 'aqua' },
  in_progress: { label: 'En curso', tone: 'navy' },
  completed: { label: 'Terminado', tone: 'success' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
  no_show: { label: 'No se presentó', tone: 'danger' },
}

export const paymentStatus: Record<PaymentStatus, Label> = {
  pending: { label: 'Por pagar', tone: 'warning' },
  review: { label: 'En revisión', tone: 'info' },
  partial: { label: 'Abono parcial', tone: 'aqua' },
  paid: { label: 'Pagado', tone: 'success' },
  refunded: { label: 'Reembolsado', tone: '' },
}

export const paymentRecordStatus: Record<PaymentRecordStatus, Label> = {
  pending: { label: 'Pendiente', tone: 'warning' },
  review: { label: 'Por revisar', tone: 'info' },
  approved: { label: 'Aprobado', tone: 'success' },
  rejected: { label: 'Rechazado', tone: 'danger' },
  refunded: { label: 'Reembolsado', tone: '' },
}

export const paymentMethod: Record<PaymentMethod, string> = {
  card: 'Tarjeta',
  cash: 'Efectivo',
  transfer: 'Transferencia',
}

export const serviceCategory: Record<ServiceCategory, string> = {
  autos: 'Autos',
  alfombras: 'Alfombras',
  muebles: 'Muebles',
  colchones: 'Colchones',
  especializados: 'Especializados',
  oficinas: 'Oficinas',
  infantiles: 'Accesorios infantiles',
}

export const serviceUnit: Record<ServiceUnit, string> = {
  unidad: 'c/u',
  m2: 'por m²',
  servicio: 'por vehículo',
}

export const expenseCategory: Record<ExpenseCategory, string> = {
  insumos: 'Insumos',
  sueldos: 'Sueldos',
  transporte: 'Transporte',
  servicios_basicos: 'Servicios básicos',
  arriendo: 'Alquiler',
  mantenimiento: 'Mantenimiento',
  marketing: 'Marketing',
  impuestos: 'Impuestos',
  otros: 'Otros',
  combustible: 'Combustible',
  quimicos: 'Químicos',
  anticipos: 'Anticipos',
  usuarios_adicionales: 'Usuarios adicionales + días extra',
  importaciones: 'Importaciones',
  productos_importados: 'Productos importados',
  recargas: 'Recargas',
  propinas: 'Propinas (sale de caja, entra por cuenta)',
  internet: 'Internet',
  luz: 'Luz',
  agua: 'Agua',
  gastos_mecanicos: 'Gastos mecánicos',
  rodapies: 'Rodapiés',
  reparaciones: 'Reparaciones',
  uniformes: 'Uniformes',
  imprevistos: 'Imprevistos',
}

export const paidFrom: Record<PaidFrom, string> = {
  petty_cash: 'Caja menor',
  management: 'Gerencia',
}

export const officePlan: Record<OfficePlan, string> = {
  basico: 'Básico',
  profundo: 'Profundo',
  mensual: 'Plan mensual',
}

export const officeQuoteStatus: Record<OfficeQuoteStatus, Label> = {
  new: { label: 'Nueva', tone: 'info' },
  contacted: { label: 'Contactada', tone: 'aqua' },
  won: { label: 'Ganada', tone: 'success' },
  lost: { label: 'Perdida', tone: 'danger' },
}

export const roleLabel: Record<Role, string> = {
  admin: 'Gerencia',
  manager: 'Administrador',
  operator: 'Operador',
}

export function options<K extends string>(map: Record<K, string | Label>): { value: K; label: string }[] {
  return (Object.keys(map) as K[]).map((value) => {
    const v = map[value]
    return { value, label: typeof v === 'string' ? v : v.label }
  })
}

/** Acciones del historial del pedido (`history[].action`). Los cambios de estado usan la clave del estado. */
export const historyAction: Record<string, string> = {
  created: 'Pedido creado',
  updated: 'Pedido editado',
  rescheduled: 'Reprogramado',
  transfer_proof: 'Comprobante subido',
  payment: 'Pago registrado',
  payment_approved: 'Pago aprobado',
  payment_rejected: 'Pago rechazado',
  ...Object.fromEntries(Object.entries(bookingStatus).map(([k, v]) => [k, v.label])),
}

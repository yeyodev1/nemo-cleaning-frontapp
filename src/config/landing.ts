// Copy del landing. Los precios nunca van aquí: salen del catálogo del API.
import type { IconName } from '@/components/ui/icons'
import type { ServiceCategory } from '@/types/api'

export interface CategoryCopy {
  slug: ServiceCategory
  title: string
  blurb: string
  icon: IconName
}

export const landingCategories: CategoryCopy[] = [
  { slug: 'vehiculos', title: 'Vehículos', blurb: 'Tapicería, alfombras y techo de tu auto como el primer día.', icon: 'car' },
  { slug: 'colchones', title: 'Colchones', blurb: 'Limpieza profunda y desinfección contra ácaros para dormir mejor.', icon: 'bed' },
  { slug: 'muebles', title: 'Muebles', blurb: 'Sofás, sillas de comedor y de oficina sin manchas ni olores.', icon: 'sofa' },
  { slug: 'hogar', title: 'Hogar', blurb: 'Limpieza profunda de tu casa o departamento, de arriba abajo.', icon: 'home' },
  { slug: 'alfombras', title: 'Alfombras y cortinas', blurb: 'Lavado por m² que recupera colores y elimina el polvo.', icon: 'rug' },
  { slug: 'oficinas', title: 'Oficinas', blurb: 'Planes únicos o recurrentes con cotización al instante.', icon: 'building' },
]

export const heroChips: { icon: IconName; label: string }[] = [
  { icon: 'shield', label: 'Personal verificado' },
  { icon: 'droplet', label: 'Productos seguros para niños y mascotas' },
  { icon: 'clock', label: 'Agenda en 2 minutos' },
]

export const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'list',
    title: 'Arma tu pedido',
    text: 'Elige servicios y adicionales con sus cantidades. Ves el total al instante, sin sorpresas.',
  },
  {
    icon: 'calendar',
    title: 'Elige día y hora',
    text: 'Escoge tu sucursal más cercana y el horario que te quede mejor.',
  },
  {
    icon: 'sparkles',
    title: 'Nosotros limpiamos',
    text: 'Llegamos a tu puerta con equipo profesional. Sigue tu pedido en línea en todo momento.',
  },
]

export const paymentMethods: { icon: IconName; title: string; text: string }[] = [
  { icon: 'card', title: 'Tarjeta', text: 'Débito o crédito, Visa y Mastercard, con pago seguro por Payphone.' },
  { icon: 'bank', title: 'Transferencia', text: 'Transfiere a nuestras cuentas y sube el comprobante al reservar.' },
  { icon: 'cash', title: 'Efectivo', text: 'Paga al terminar el servicio, directamente a nuestro equipo.' },
]

export const faqs: { q: string; a: string }[] = [
  {
    q: '¿En qué zonas atienden?',
    a: 'Atendemos Guayaquil, Samborondón y Vía a la Costa desde nuestras dos sucursales. Al reservar eliges la sucursal más cercana a ti.',
  },
  {
    q: '¿Cuánto tiempo tarda en secar la tapicería o el colchón?',
    a: 'Normalmente entre 4 y 6 horas, según la ventilación del lugar. Te damos recomendaciones al terminar.',
  },
  {
    q: '¿Los productos son seguros para niños y mascotas?',
    a: 'Sí. Usamos productos biodegradables y de grado profesional, seguros para toda la familia una vez secos.',
  },
  {
    q: '¿Puedo cambiar la fecha o cancelar?',
    a: 'Puedes cancelar desde el link de seguimiento de tu pedido hasta 12 horas antes. Para reprogramar, escríbenos por WhatsApp.',
  },
  {
    q: '¿Cómo pago por transferencia?',
    a: 'Al reservar te mostramos nuestras cuentas bancarias. Subes la foto o PDF del comprobante y lo validamos en minutos.',
  },
  {
    q: '¿Emiten factura?',
    a: 'Sí. Al reservar puedes marcar que necesitas factura e ingresar los datos de facturación.',
  },
]

// Copy del landing. Todo sale de recursos/MARCA.md o de cómo funciona la app; nada inventado.
// Los precios de servicios nunca van aquí: salen del catálogo del API.
import type { IconName } from '@/components/ui/icons'
import type { ServiceCategory } from '@/types/api'

export type LineId = 'car' | 'home'

export interface LineCopy {
  id: LineId
  title: string
  tagline: string
  categories: ServiceCategory[]
  photo: string
  photoAlt: string
}

/** Las dos submarcas del catálogo. */
export const lines: LineCopy[] = [
  {
    id: 'car',
    title: 'NEMO CAR',
    tagline: 'Lavado, detailing y recubrimientos cerámicos para tu vehículo.',
    categories: ['autos'],
    photo: '/fotos/auto-detailing-pro.webp',
    photoAlt: 'Técnico de Nemo haciendo detailing a una camioneta negra',
  },
  {
    id: 'home',
    title: 'NEMO HOME & OFFICE',
    tagline: 'Alfombras, muebles, colchones, oficinas y servicios especializados.',
    categories: ['alfombras', 'muebles', 'colchones', 'especializados', 'oficinas', 'infantiles'],
    photo: '/fotos/oficina.webp',
    photoAlt: 'Limpieza de un escritorio de oficina',
  },
]

/** Clasificación de vehículos del catálogo NEMO CAR (se muestra al elegir tamaño). */
export const vehicleSizes: { label: string; examples: string }[] = [
  { label: 'Pequeño', examples: 'Kia Rio, Hyundai Accent, Chevrolet Spark' },
  { label: 'Mediano', examples: 'Hyundai Tucson, Kia Sportage, Nissan Xtrail' },
  { label: 'Grande (SUV)', examples: 'Toyota Prado, Fortuner, Explorer' },
  { label: 'Extra Grande (XL)', examples: 'Vans, Pick Up, Ford F150' },
]

/** Paquetes mensuales NEMO CAR (fase 2 = suscripción; hoy se piden por WhatsApp). Centavos. */
export const monthlyPackages: { name: string; includes: string; prices: { size: string; price: number }[] }[] = [
  {
    name: 'Mantenimiento Básico',
    includes: '4 lavados clásicos + 1 encerada gratis',
    prices: [
      { size: 'Pequeño', price: 3000 },
      { size: 'Mediano', price: 3500 },
      { size: 'Grande', price: 4200 },
      { size: 'Extra Grande', price: 5500 },
    ],
  },
  {
    name: 'Mantenimiento Premium',
    includes: '2 lavados premium',
    prices: [
      { size: 'Pequeño', price: 6000 },
      { size: 'Mediano', price: 7500 },
      { size: 'Grande', price: 8500 },
      { size: 'Extra Grande', price: 10000 },
    ],
  },
]

/** Comparativas reales del catálogo (cada par viene recortado de la foto original). */
export const beforeAfter: { id: string; title: string; before: string; after: string; ratio: string }[] = [
  {
    id: 'sofa',
    title: 'Sofá',
    before: '/fotos/antes-despues/sofa-antes.webp',
    after: '/fotos/antes-despues/sofa-despues.webp',
    ratio: '972 / 484',
  },
  {
    id: 'alfombra',
    title: 'Alfombra',
    before: '/fotos/antes-despues/alfombra-antes.webp',
    after: '/fotos/antes-despues/alfombra-despues.webp',
    ratio: '736 / 344',
  },
  {
    id: 'colchon',
    title: 'Colchón',
    before: '/fotos/antes-despues/colchon-antes.webp',
    after: '/fotos/antes-despues/colchon-despues.webp',
    ratio: '350 / 736',
  },
  {
    id: 'auto',
    title: 'Auto',
    before: '/fotos/antes-despues/auto-antes.webp',
    after: '/fotos/antes-despues/auto-despues.webp',
    ratio: '344 / 736',
  },
]

/** Cómo funciona la reserva en esta web (comportamiento real de la app). */
export const steps: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'list',
    title: 'Arma tu pedido',
    text: 'Elige servicios, tamaño u opción y cantidades. Ves el subtotal al instante.',
  },
  {
    icon: 'calendar',
    title: 'Elige día y hora',
    text: 'Escoge la sucursal y un horario disponible.',
  },
  {
    icon: 'sparkles',
    title: 'Vamos a tu domicilio',
    text: 'Sigue el estado de tu pedido en línea con tu enlace de seguimiento.',
  },
]

export const paymentMethods: { icon: IconName; title: string; text: string }[] = [
  { icon: 'card', title: 'Tarjeta', text: 'Débito o crédito con la pasarela segura de Payphone.' },
  { icon: 'bank', title: 'Transferencia', text: 'Transfiere a nuestras cuentas y sube el comprobante al reservar.' },
  { icon: 'cash', title: 'Efectivo', text: 'Pagas el día del servicio.' },
]

/** Solo respuestas que salen del catálogo o del funcionamiento real de la web. */
export const faqs: { q: string; a: string }[] = [
  {
    q: '¿En qué zonas atienden?',
    a: 'Nuestro catálogo cubre Vía Samborondón y Ceibos / Vía a la Costa. También atendemos Vías Sambo, Salitre, Aurora y Daule. El servicio es a domicilio.',
  },
  {
    q: '¿Cómo reservo?',
    a: 'En “Reservar” eliges los servicios (con el tamaño u opción que corresponda), la sucursal, el día y la hora, dejas tus datos y eliges cómo pagar. Recibes un enlace para seguir tu pedido.',
  },
  {
    q: '¿Qué formas de pago aceptan?',
    a: 'Tarjeta de débito o crédito (Payphone), transferencia bancaria subiendo el comprobante al reservar, o efectivo el día del servicio.',
  },
  {
    q: '¿Qué tamaño es mi vehículo?',
    a: 'Pequeño: Kia Rio, Hyundai Accent, Chevrolet Spark. Mediano: Hyundai Tucson, Kia Sportage, Nissan Xtrail. Grande (SUV): Toyota Prado, Fortuner, Explorer. Extra Grande (XL): Vans, Pick Up, Ford F150.',
  },
  {
    q: '¿Cuánto tarda la entrega de una alfombra?',
    a: 'El tiempo de entrega de la limpieza de alfombras es de 24 a 48 horas.',
  },
  {
    q: '¿El precio del colchón incluye las almohadas?',
    a: 'Sí. El precio de la limpieza de colchones incluye la limpieza de 2 almohadas.',
  },
  {
    q: '¿Por qué los sofás tienen dos precios?',
    a: 'El catálogo da un rango por pieza. Al reservar se toma el valor menor como base y el valor final se confirma según el estado/material del mueble.',
  },
  {
    q: '¿Cómo cotizo la limpieza de mi oficina?',
    a: 'En “Cotizar oficina” indicas los m² y el plan (Básico $2,50/m² o Profundo $3,00/m²), y puedes sumar sillas, ventanales y sanitarios. El plan mensual tiene tarifa especial: te contactamos para cotizarlo.',
  },
  {
    q: '¿Puedo cancelar mi pedido?',
    a: 'Sí, desde tu enlace de seguimiento mientras falten más de 12 horas para el servicio y no esté pagado con tarjeta. Para cualquier cambio escríbenos por WhatsApp.',
  },
]

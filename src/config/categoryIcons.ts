import type { IconName } from '@/components/ui/icons'
import type { ServiceCategory } from '@/types/api'

export const categoryIcon: Record<ServiceCategory, IconName> = {
  vehiculos: 'car',
  colchones: 'bed',
  muebles: 'sofa',
  hogar: 'home',
  alfombras: 'rug',
  oficinas: 'building',
  otros: 'sparkles',
}

import type { IconName } from '@/components/ui/icons'
import type { ServiceCategory } from '@/types/api'

export const categoryIcon: Record<ServiceCategory, IconName> = {
  autos: 'car',
  alfombras: 'rug',
  muebles: 'sofa',
  colchones: 'bed',
  especializados: 'window',
  oficinas: 'building',
  infantiles: 'baby',
}

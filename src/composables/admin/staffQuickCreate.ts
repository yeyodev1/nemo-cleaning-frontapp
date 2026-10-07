import { managementService } from '@/services/management.service'
import type { StaffOption } from '@/types/grid'

const POSITION_KEYS: Record<string, 'supervisor' | 'base_assistant' | 'washer'> = {
  supervisor: 'supervisor',
  'asistente de base': 'base_assistant',
  lavador: 'washer',
}

/**
 * Persona nueva desde Nómina: se crea en Personal sin correo (sin acceso al panel), igual
 * que desde Personal. El cargo libre se guarda en la nómina; en Personal solo si es uno de
 * los tres cargos del negocio. Su sueldo queda como sueldo base para los meses nuevos.
 */
export async function createStaff(p: { name: string; position: string; branch: string; salary: number }): Promise<StaffOption> {
  const position = POSITION_KEYS[p.position.trim().toLowerCase()] ?? ''
  const u = await managementService.createUser({
    name: p.name,
    email: '',
    phone: '',
    role: 'operator',
    branches: p.branch ? [p.branch] : [],
    active: true,
    position,
    monthlySalary: p.salary,
    commissions: position === 'washer',
    supervisor: null,
  })
  return { _id: u._id, name: u.name, position: p.position, branches: u.branches }
}

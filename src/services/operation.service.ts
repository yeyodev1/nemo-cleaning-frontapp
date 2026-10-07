import APIBase from './httpBase'
import type { ID } from '@/types/api'
import type { Booking } from '@/types/api'
import type {
  CommissionRule,
  CommissionSheet,
  GoalMonth,
  NovedadRow,
  ProductionInput,
  ProductionList,
  ProductionOptions,
  ShiftMonth,
  ShiftStatus,
} from '@/types/operation'

export interface ProductionFilters {
  branch?: string
  from?: string
  to?: string
  operator?: string
  zone?: string
  account?: string
  confirmation?: string
  q?: string
  page?: number
  limit?: number
  all?: '1'
}

/** Módulo "Operación": producción del día, novedades, turnos, metas y comisiones (FEE). */
class OperationService extends APIBase {
  productionOptions() {
    return this.get<ProductionOptions>('admin/production/options')
  }
  production(q: ProductionFilters) {
    return this.get<ProductionList>('admin/production', { ...q })
  }
  register(body: ProductionInput) {
    return this.post<Booking>('admin/production', body)
  }
  setConfirmation(id: ID, paymentConfirmation: string, paymentAccount?: string) {
    return this.patch<Booking>(`admin/bookings/${id}/confirmation`, { paymentConfirmation, paymentAccount })
  }

  novedades(q: { branch?: string; from?: string; to?: string; operator?: string }) {
    return this.get<{ from: string; to: string; items: NovedadRow[]; total: number }>('admin/novedades', q)
  }
  addNovedad(bookingId: ID, body: { text: string; operator?: ID }) {
    return this.post(`admin/bookings/${bookingId}/novedades`, body)
  }
  deleteNovedad(bookingId: ID, id: ID) {
    return this.delete(`admin/bookings/${bookingId}/novedades/${id}`)
  }

  shifts(month: string, branch?: string) {
    return this.get<ShiftMonth>('admin/shifts', { month, branch })
  }
  saveShifts(changes: { operator: ID; date: string; status: ShiftStatus }[]) {
    return this.put<{ ok: boolean; saved: number }>('admin/shifts', { changes })
  }

  goals(month: string, branch?: string) {
    return this.get<GoalMonth>('admin/goals', { month, branch })
  }
  saveGoal(body: { operator: ID; month: string; amount: number; notes?: string }) {
    return this.put('admin/goals', body)
  }
  copyGoals(from: string, to: string) {
    return this.post<{ ok: boolean; copied: number }>('admin/goals/copy', { from, to })
  }

  commissions(month: string, branch?: string) {
    return this.get<CommissionSheet>('admin/commissions', { month, branch })
  }
  commissionRule() {
    return this.get<CommissionRule>('admin/commissions/rules')
  }
  saveCommissionRule(body: Partial<CommissionRule>) {
    return this.put<CommissionRule>('admin/commissions/rules', body)
  }
  addAdjustment(body: { date: string; operator: ID; kind: 'operator' | 'supervisor'; amount: number; note: string }) {
    return this.post('admin/commissions/adjustments', body)
  }
  deleteAdjustment(id: ID) {
    return this.delete(`admin/commissions/adjustments/${id}`)
  }
}

export const operationService = new OperationService()

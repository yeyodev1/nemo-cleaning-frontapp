import APIBase from './httpBase'
import type {
  AnnualStatement,
  BankReconciliation,
  CashMovementInput,
  CashRegister,
  FollowUpResult,
  FortnightReport,
  FrequencyReport,
  MonthlyDetail,
  Payable,
  PayableInput,
  PayableList,
  PayrollList,
  PayrollPay,
  PayrollRow,
  Portfolio,
  ReceivablesAging,
  ZoneReport,
} from '@/types/finance'

type Branch = string | undefined

/** Finanzas y gestión (fase 2): /admin/finance/* y /admin/commercial/*. */
class LedgerService extends APIBase {
  fortnight(month: string, branch: Branch) {
    return this.get<FortnightReport>('admin/finance/fortnight', { month, branch })
  }

  annual(year: number, branch: Branch) {
    return this.get<AnnualStatement>('admin/finance/annual', { year, branch })
  }

  monthly(month: string, branch: Branch) {
    return this.get<MonthlyDetail>('admin/finance/monthly', { month, branch })
  }

  repeatFixed(month: string, branch: Branch) {
    return this.post<{ created: number; skipped: number; names: string[] }>('admin/finance/expenses/repeat-fixed', { month, branch })
  }

  payables(month: string, branch: Branch) {
    return this.get<PayableList>('admin/finance/payables', { month, branch })
  }

  createPayable(body: Partial<PayableInput>) {
    return this.post<Payable>('admin/finance/payables', body)
  }

  updatePayable(id: string, body: Partial<PayableInput> & { status?: 'paid' | 'pending' }) {
    return this.patch<Payable>(`admin/finance/payables/${id}`, body)
  }

  deletePayable(id: string) {
    return this.delete<{ ok: boolean }>(`admin/finance/payables/${id}`)
  }

  copyPayables(month: string, branch: Branch) {
    return this.post<{ created: number; skipped: number }>('admin/finance/payables/copy', { month, branch })
  }

  payroll(month: string, branch: Branch) {
    return this.get<PayrollList>('admin/finance/payroll', { month, branch })
  }

  addPayroll(body: { month: string; user: string; salary?: number }) {
    return this.post<PayrollRow>('admin/finance/payroll', body)
  }

  updatePayroll(id: string, body: { salary?: number; notes?: string; q1?: Partial<PayrollPay>; q2?: Partial<PayrollPay> }) {
    return this.patch<PayrollRow>(`admin/finance/payroll/${id}`, body)
  }

  deletePayroll(id: string) {
    return this.delete<{ ok: boolean }>(`admin/finance/payroll/${id}`)
  }

  cash(from: string, to: string, branch: Branch) {
    return this.get<CashRegister>('admin/finance/cash', { from, to, branch })
  }

  updateCashStart(body: { branch: string; startDate: string; openingBalance: number }) {
    return this.patch('admin/finance/cash/start', body)
  }

  createMovement(body: CashMovementInput) {
    return this.post('admin/finance/cash/movements', body)
  }

  deleteMovement(id: string) {
    return this.delete<{ ok: boolean }>(`admin/finance/cash/movements/${id}`)
  }

  receivables(branch: Branch) {
    return this.get<ReceivablesAging>('admin/finance/receivables', { branch })
  }

  bank(from: string, to: string, branch: Branch) {
    return this.get<BankReconciliation>('admin/finance/bank', { from, to, branch })
  }

  verifyPayment(id: string, verified: boolean) {
    return this.patch<{ verified: boolean; verifiedBy: string }>(`admin/finance/bank/payments/${id}`, { verified })
  }

  saveStatement(body: { account: string; from: string; to: string; branch: Branch; amount: number | null }) {
    return this.patch('admin/finance/bank/statement', body)
  }

  zones(year: number, branch: Branch) {
    return this.get<ZoneReport>('admin/commercial/zones', { year, branch })
  }

  frequency(from: string, to: string, branch: Branch) {
    return this.get<FrequencyReport>('admin/commercial/frequency', { from, to, branch })
  }

  portfolio(branch: Branch, result?: FollowUpResult | '') {
    return this.get<Portfolio>('admin/commercial/portfolio', { branch, result })
  }

  updateFollowUp(customerId: string, body: { contact1?: boolean; contact2?: boolean; contact3?: boolean; result?: FollowUpResult; notes?: string }) {
    return this.patch(`admin/commercial/portfolio/${customerId}`, body)
  }
}

export const ledgerService = new LedgerService()

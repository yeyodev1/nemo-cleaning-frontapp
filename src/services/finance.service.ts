import APIBase from './httpBase'
import type {
  CashReport,
  Expense,
  ExpenseCategory,
  ExpenseKind,
  IncomeStatement,
  Paginated,
  PaidFrom,
  ProductionReport,
} from '@/types/api'

export interface ExpenseFilters {
  branch?: string
  from?: string
  to?: string
  category?: ExpenseCategory | ''
  paidFrom?: PaidFrom | ''
  kind?: ExpenseKind | ''
  page?: number
  limit?: number
}

export type ExpenseInput = Omit<Expense, '_id' | 'createdAt' | 'createdBy'>

export interface ExpensePage extends Paginated<Expense> {
  totalAmount: number
  totals?: { fixed: number; variable: number; pettyCash: number; management: number }
}

class FinanceService extends APIBase {
  expenses(q: ExpenseFilters) {
    return this.get<ExpensePage>('admin/expenses', { ...q })
  }

  createExpense(body: ExpenseInput) {
    return this.post<Expense>('admin/expenses', body)
  }

  updateExpense(id: string, body: Partial<ExpenseInput>) {
    return this.patch<Expense>(`admin/expenses/${id}`, body)
  }

  /** `series` borra todas las cuotas de un diferido. */
  deleteExpense(id: string, series = false) {
    return this.delete<{ ok?: boolean; deleted?: number }>(`admin/expenses/${id}${series ? '?scope=series' : ''}`)
  }

  incomeStatement(month: string, branch?: string) {
    return this.get<IncomeStatement>('admin/reports/income-statement', { month, branch })
  }

  production(q: { from?: string; to?: string; branch?: string }) {
    return this.get<ProductionReport>('admin/reports/production', q)
  }

  cash(date: string, branch?: string) {
    return this.get<CashReport>('admin/reports/cash', { date, branch })
  }
}

export const financeService = new FinanceService()

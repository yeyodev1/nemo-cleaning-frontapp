import APIBase from './httpBase'
import type {
  CashReport,
  Expense,
  ExpenseCategory,
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
  page?: number
  limit?: number
}

export type ExpenseInput = Omit<Expense, '_id' | 'createdAt' | 'createdBy'>

class FinanceService extends APIBase {
  expenses(q: ExpenseFilters) {
    return this.get<Paginated<Expense>>('admin/expenses', { ...q })
  }

  createExpense(body: ExpenseInput) {
    return this.post<Expense>('admin/expenses', body)
  }

  updateExpense(id: string, body: Partial<ExpenseInput>) {
    return this.patch<Expense>(`admin/expenses/${id}`, body)
  }

  deleteExpense(id: string) {
    return this.delete<{ ok?: boolean }>(`admin/expenses/${id}`)
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

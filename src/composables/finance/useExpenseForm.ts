import { computed, reactive, ref, watch } from 'vue'
import { financeService, type ExpenseInput } from '@/services/finance.service'
import { useAdminScope } from '@/stores/adminScope'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { errorMessage, money, todayISO } from '@/utils/format'
import type { Expense, ExpenseCategory } from '@/types/api'

/** Categorías que nacen como gasto fijo (igual que el back: FIXED_BY_DEFAULT). */
const FIXED_BY_DEFAULT: ExpenseCategory[] = ['arriendo']

export type ExpenseFormState = ExpenseInput & {
  kind: 'variable' | 'fixed'
  recurring: boolean
  employee: string | null
  deferred: boolean
  count: number
  first: number
}

/** Estado y guardado del formulario de gasto (incluye diferidos en cuotas y gastos fijos que se repiten). */
export function useExpenseForm(props: { open: boolean; expense: Expense | null }, onSaved: () => void) {
  const scope = useAdminScope()
  const user = useUserStore()
  const toast = useToastStore()
  const saving = ref(false)

  function blank(): ExpenseFormState {
    return {
      branch: scope.branch || (user.isAdmin ? null : scope.visibleBranches[0]?._id || null),
      date: todayISO(),
      category: 'combustible',
      description: '',
      amount: 0,
      paymentMethod: 'cash',
      paidFrom: user.isAdmin ? 'management' : 'petty_cash',
      supplier: '',
      receiptUrl: '',
      kind: 'variable',
      recurring: false,
      employee: null,
      deferred: false,
      count: 12,
      first: 1,
    }
  }
  const form = reactive<ExpenseFormState>(blank())

  watch(
    () => props.open,
    (open) => {
      if (!open) return
      const e = props.expense
      Object.assign(
        form,
        blank(),
        e
          ? {
              branch: e.branch ?? null,
              date: e.date.slice(0, 10),
              category: e.category,
              description: e.description,
              amount: e.amount,
              paymentMethod: e.paymentMethod,
              paidFrom: e.paidFrom,
              supplier: e.supplier || '',
              receiptUrl: e.receiptUrl || '',
              kind: e.kind || 'variable',
              recurring: !!e.recurring,
              employee: e.employee || null,
            }
          : {},
      )
    },
  )

  // Al cambiar la categoría se sugiere el tipo (el usuario puede cambiarlo).
  watch(
    () => form.category,
    (c) => {
      if (props.expense) return
      form.kind = FIXED_BY_DEFAULT.includes(c) ? 'fixed' : 'variable'
      form.recurring = form.kind === 'fixed'
    },
  )

  const isAdvance = computed(() => form.category === 'anticipos')
  const perInstallment = computed(() => (form.count > 1 ? Math.floor(form.amount / form.count) : form.amount))
  const deferredHint = computed(() =>
    form.deferred
      ? `Se crearán ${Math.max(0, form.count - form.first + 1)} cuotas mensuales de ${money(perInstallment.value)} (de la ${form.first}/${form.count} a la ${form.count}/${form.count}).`
      : '',
  )

  async function save() {
    if (form.amount <= 0) return toast.error('Ingresa un monto mayor a cero')
    if (isAdvance.value && !form.employee) return toast.error('Elige a quién se le dio el anticipo')
    saving.value = true
    try {
      const { deferred, count, first, ...rest } = form
      const body = {
        ...rest,
        paidFrom: user.isAdmin ? form.paidFrom : 'petty_cash',
        employee: isAdvance.value ? form.employee : null,
        recurring: form.kind === 'fixed' && form.recurring,
        ...(deferred && !props.expense ? { installments: { count, first } } : {}),
      } as ExpenseInput
      if (props.expense) await financeService.updateExpense(props.expense._id, body)
      else await financeService.createExpense(body)
      toast.success(props.expense ? 'Gasto actualizado' : deferred ? 'Diferido creado con todas sus cuotas' : 'Gasto registrado')
      onSaved()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      saving.value = false
    }
  }

  return { form, saving, save, isAdvance, deferredHint, scope, user }
}

import { computed, reactive, ref, watch } from 'vue'
import { bookingsService } from '@/services/bookings.service'
import { managementService } from '@/services/management.service'
import { operationService } from '@/services/operation.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { readJSON, writeJSON } from '@/utils/storage'
import { errorMessage, todayISO } from '@/utils/format'
import type { Booking, Customer, PaymentConfirmation, Service } from '@/types/api'
import type { ProductionItemInput, ProductionOptions } from '@/types/operation'

/** Línea del servicio: del catálogo (con variante) o valor libre como en la Base. */
export interface EntryLine {
  key: number
  service?: Service
  variant?: string
  name: string
  unitPrice: number
  quantity: number
}

const SESSION_KEY = 'nemo_quick_entry'

/** Confirmación que normalmente corresponde a cada forma de pago (se puede cambiar). */
export function defaultConfirmation(account: string): PaymentConfirmation {
  const a = account.toLowerCase()
  if (a.startsWith('transferencia')) return 'pending_confirmation'
  if (a === 'canje') return 'exchange'
  return 'confirmed'
}

/**
 * Registro rápido de producción: fecha, sucursal y operadores se quedan fijos entre
 * registros (como bajar de fila en el Excel); lo del cliente se limpia al guardar.
 */
export function useQuickEntry() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const saved = readJSON<{ date?: string; branch?: string; operators?: string[]; account?: string }>(SESSION_KEY, {})

  const options = ref<ProductionOptions | null>(null)
  const services = ref<Service[]>([])
  const busy = ref(false)
  const session = ref<Booking[]>([])
  const scheduled = ref<Booking[]>([])
  let nextKey = 1

  const form = reactive({
    date: saved.date && saved.date <= todayISO() ? saved.date : todayISO(),
    branch: saved.branch || scope.branch || '',
    operators: (saved.operators || []) as string[],
    bookingId: '',
    customerId: '',
    customerName: '',
    customerPhone: '',
    zone: '',
    otherZone: false,
    lines: [] as EntryLine[],
    discount: 0,
    account: saved.account || 'Efectivo',
    confirmation: defaultConfirmation(saved.account || 'Efectivo'),
    tip: 0,
    notes: '',
  })

  Promise.all([operationService.productionOptions(), managementService.services()])
    .then(([o, s]) => {
      options.value = o
      services.value = s.filter((x) => x.active !== false).sort((a, b) => a.order - b.order)
      if (!form.branch || !o.branches.some((b) => b._id === form.branch)) form.branch = o.branches[0]?._id || ''
      form.operators = form.operators.filter((id) => o.operators.some((op) => op._id === id))
    })
    .catch((e) => toast.error(errorMessage(e)))

  const branchInfo = computed(() => options.value?.branches.find((b) => b._id === form.branch))
  const zones = computed(() => branchInfo.value?.zones || [])
  const operators = computed(() => (options.value?.operators || []).filter((o) => !form.branch || o.branches.includes(form.branch)))
  const subtotal = computed(() => form.lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0))
  const total = computed(() => Math.max(0, subtotal.value - form.discount))

  watch(() => form.account, (a) => (form.confirmation = defaultConfirmation(a)))
  watch(
    () => [form.date, form.branch, form.operators.join(','), form.account],
    () => writeJSON(SESSION_KEY, { date: form.date, branch: form.branch, operators: form.operators, account: form.account }),
  )

  // Servicios agendados del operador ese día que aún no se cierran: se completan con un toque.
  watch(
    () => [form.date, form.branch, form.operators.join(',')],
    async () => {
      scheduled.value = []
      if (!form.operators.length) return
      try {
        const res = await bookingsService.list({
          date: form.date,
          branch: form.branch,
          operator: form.operators[0],
          status: 'pending,confirmed,on_the_way,in_progress' as never,
          limit: 20,
        })
        scheduled.value = res.items
      } catch {
        /* sin agenda no se bloquea el registro */
      }
    },
    { immediate: true },
  )

  function addService(service: Service, variant?: string) {
    const v = service.variants?.find((x) => x.label === variant)
    const same = form.lines.find((l) => l.service?._id === service._id && l.variant === (variant || ''))
    if (same) return void same.quantity++
    form.lines.push({ key: nextKey++, service, variant: variant || '', name: service.name, unitPrice: v?.price ?? service.price, quantity: 1 })
  }

  function addFree(name: string, amount: number) {
    form.lines.push({ key: nextKey++, name: name || 'Servicio', unitPrice: amount, quantity: 1 })
  }

  function removeLine(key: number) {
    form.lines = form.lines.filter((l) => l.key !== key)
  }

  function pickCustomer(c: Customer | null, name = '') {
    form.customerId = c?._id || ''
    form.customerName = c?.name || name
    form.customerPhone = c?.phone || ''
  }

  /** Completa un servicio de la agenda: trae cliente, servicios y urbanización. */
  function useScheduled(b: Booking) {
    form.bookingId = b._id
    pickCustomer(b.customer as unknown as Customer)
    form.zone = b.zone || ''
    form.otherZone = !!b.zone && !zones.value.includes(b.zone)
    form.lines = b.items.map((i) => ({
      key: nextKey++,
      service: services.value.find((s) => s._id === i.service),
      variant: i.variant || '',
      name: i.name,
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    }))
    form.discount = b.discount || 0
  }

  function resetClient() {
    Object.assign(form, { bookingId: '', customerId: '', customerName: '', customerPhone: '', lines: [], discount: 0, tip: 0, notes: '' })
  }

  function validate(): string {
    if (!form.branch) return 'Elige la sucursal'
    if (!form.operators.length) return 'Elige el operador que hizo el servicio'
    if (!form.customerName.trim()) return 'Escribe el nombre del cliente'
    if (!form.lines.length) return 'Agrega el servicio que se hizo'
    if (form.discount > subtotal.value) return 'El descuento no puede ser mayor que el total'
    return ''
  }

  function itemsPayload(): ProductionItemInput[] {
    return form.lines.map((l) =>
      l.service
        ? { service: l.service._id, variant: l.variant || undefined, quantity: l.quantity }
        : { name: l.name, unitPrice: l.unitPrice, quantity: l.quantity },
    )
  }

  async function submit(): Promise<boolean> {
    const err = validate()
    if (err) {
      toast.error(err)
      return false
    }
    busy.value = true
    try {
      const booking = await operationService.register({
        bookingId: form.bookingId || undefined,
        branch: form.branch,
        date: form.date,
        operators: form.operators,
        customer: form.customerId ? { _id: form.customerId } : { name: form.customerName.trim(), phone: form.customerPhone.trim() || undefined },
        zone: form.zone,
        items: itemsPayload(),
        discount: form.discount || undefined,
        paymentAccount: form.account,
        paymentConfirmation: form.confirmation,
        tip: form.tip || undefined,
        notes: form.notes || undefined,
      })
      session.value.unshift(booking)
      scheduled.value = scheduled.value.filter((b) => b._id !== booking._id)
      toast.success(`${booking.code} guardado. Listo para el siguiente`)
      resetClient()
      return true
    } catch (e) {
      toast.error(errorMessage(e))
      return false
    } finally {
      busy.value = false
    }
  }

  return { form, options, services, zones, operators, subtotal, total, busy, session, scheduled, addService, addFree, removeLine, pickCustomer, useScheduled, submit, resetClient }
}

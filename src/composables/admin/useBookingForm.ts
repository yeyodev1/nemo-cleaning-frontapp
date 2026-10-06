import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { bookingsService } from '@/services/bookings.service'
import { managementService } from '@/services/management.service'
import { publicService } from '@/services/public.service'
import { useAdminScope } from '@/stores/adminScope'
import { useToastStore } from '@/stores/toast'
import { cartItems, localSubtotal, type Cart } from '@/composables/booking/cart'
import { errorMessage, toCents, todayISO } from '@/utils/format'
import type { BookingStatus, PaymentMethod, QuoteResult, Service } from '@/types/api'

/** Estado y envío del formulario "Nuevo pedido" del panel. */
export function useBookingForm() {
  const scope = useAdminScope()
  const toast = useToastStore()
  const router = useRouter()

  const services = ref<Service[]>([])
  const cart = ref<Cart>({})
  const quote = ref<QuoteResult | null>(null)
  const busy = ref(false)
  const uploading = ref(false)

  const form = reactive({
    branch: scope.branch || '',
    date: todayISO(1),
    time: '09:00',
    customer: { name: '', email: '', phone: '', documentId: '' },
    address: '',
    reference: '',
    notes: '',
    paymentMethod: 'cash' as PaymentMethod,
    transferProofUrl: '',
    discount: '',
    operators: [] as string[],
    status: 'confirmed' as BookingStatus,
    invoice: { required: false, name: '', documentId: '', email: '', address: '' },
  })

  managementService
    .services()
    .then((list) => (services.value = list.filter((s) => s.active !== false).sort((a, b) => a.order - b.order)))
    .catch((e) => toast.error(errorMessage(e)))

  watch(
    () => scope.visibleBranches,
    (list) => {
      if (!form.branch && list[0]) form.branch = list[0]._id
    },
    { immediate: true },
  )

  // Totales: subtotal local al instante y confirmación del servidor con debounce.
  let timer: ReturnType<typeof setTimeout> | undefined
  watch(
    cart,
    (c) => {
      clearTimeout(timer)
      const items = cartItems(c)
      if (!items.length) return (quote.value = null)
      timer = setTimeout(async () => {
        try {
          quote.value = await publicService.quote(items)
        } catch {
          quote.value = null
        }
      }, 350)
    },
    { deep: true },
  )

  const subtotal = computed(() => quote.value?.subtotal ?? localSubtotal(cart.value, services.value))
  const discountCents = computed(() => Math.max(0, toCents(form.discount || 0)))
  const total = computed(() => Math.max(0, subtotal.value - discountCents.value))

  async function uploadProof(file: File) {
    uploading.value = true
    try {
      form.transferProofUrl = (await managementService.uploadFile(file)).url
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      uploading.value = false
    }
  }

  function validate(): string {
    if (!form.branch) return 'Elige la sucursal'
    if (!cartItems(cart.value).length) return 'Agrega al menos un servicio'
    if (!form.date || !form.time) return 'Indica fecha y hora'
    if (!form.customer.name.trim() || !form.customer.phone.trim()) return 'Nombre y teléfono del cliente son obligatorios'
    if (!form.address.trim()) return 'Indica la dirección del servicio'
    return ''
  }

  async function submit() {
    const err = validate()
    if (err) return toast.error(err)
    busy.value = true
    try {
      const booking = await bookingsService.create({
        branch: form.branch,
        items: cartItems(cart.value),
        date: form.date,
        time: form.time,
        customer: { ...form.customer },
        address: form.address,
        reference: form.reference,
        notes: form.notes,
        paymentMethod: form.paymentMethod,
        transferProofUrl: form.transferProofUrl || undefined,
        invoice: form.invoice.required ? { ...form.invoice } : undefined,
        operators: form.operators,
        discount: discountCents.value || undefined,
        status: form.status,
      })
      toast.success(`Pedido ${booking.code} creado`)
      router.replace(`/admin/pedidos/${booking._id}`)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      busy.value = false
    }
  }

  return { form, cart, services, quote, subtotal, discountCents, total, busy, uploading, uploadProof, submit }
}

import { computed, reactive, ref, watch, type Ref } from 'vue'
import { whatsappService } from '@/services/whatsapp.service'
import { useToastStore } from '@/stores/toast'
import { useWhatsappInbox } from '@/stores/whatsappInbox'
import { errorMessage, whatsappUrl } from '@/utils/format'
import { copyText, greetingMessage, paymentLinkMessage } from '@/utils/whatsapp'
import { emptyPay, useWaOptions } from './useWaOptions'
import type { WaHandleInput, WaOrder } from '@/types/whatsapp'

/** Acciones de un toque sobre un pedido por WhatsApp (confirmar, pago, operador, mensajes). */
export function useWaOrderSheet(order: Ref<WaOrder | null>, onSaved: (o: WaOrder) => void) {
  const toast = useToastStore()
  const inbox = useWhatsappInbox()
  const wa = useWaOptions()
  const saving = ref(false)
  const pay = ref(emptyPay())
  const form = reactive({ operators: [] as string[] })

  watch(
    order,
    (o) => {
      if (!o) return
      pay.value = emptyPay(o.paymentMethod === 'whatsapp' ? '' : o.paymentAccount)
      form.operators = o.operators.map((x) => x._id)
    },
    { immediate: true },
  )

  const operatorChoices = computed(() =>
    wa.operatorsOf(order.value?.branch || '').map((o) => ({ value: o._id, label: o.name, color: o.color })),
  )
  const phone = computed(() => order.value?.customer?.phone || '')
  const chatUrl = computed(() => (phone.value ? whatsappUrl(phone.value) : ''))
  const greetUrl = computed(() =>
    order.value && phone.value
      ? whatsappUrl(phone.value, greetingMessage({ code: order.value.code, customerName: order.value.customer?.name }))
      : '',
  )
  const payText = computed(() =>
    order.value?.trackingUrl
      ? paymentLinkMessage({
          code: order.value.code,
          balance: order.value.balance || order.value.total,
          customerName: order.value.customer?.name,
          trackingUrl: order.value.trackingUrl,
        })
      : '',
  )
  const payUrl = computed(() => (phone.value && payText.value ? whatsappUrl(phone.value, payText.value) : ''))
  const canPayLink = computed(() => Boolean(order.value && order.value.balance > 0 && order.value.trackingUrl))

  async function copyPayText() {
    if (await copyText(payText.value)) toast.success('Mensaje con el link de pago copiado')
    else toast.error('No se pudo copiar. Mantén presionado el texto para copiarlo')
  }

  /** Solo manda lo que cambió: así "Confirmar" no reescribe la forma de pago. */
  function changes(confirm: boolean): WaHandleInput {
    const o = order.value!
    const body: WaHandleInput = {}
    const currentAccount = o.paymentMethod === 'whatsapp' ? '' : o.paymentAccount
    if (pay.value.account !== currentAccount) body.paymentAccount = pay.value.account
    const ops = [...form.operators].sort().join(',')
    if (ops !== o.operators.map((x) => x._id).sort().join(',')) body.operators = form.operators
    const payment = wa.paymentPayload(pay.value)
    if (payment) {
      body.paymentAccount = pay.value.account
      body.payment = payment
    }
    if (confirm) body.confirm = true
    return body
  }

  async function save(confirm: boolean) {
    if (!order.value) return
    const body = changes(confirm)
    if (!Object.keys(body).length) return toast.info('No hay cambios para guardar')
    saving.value = true
    try {
      const fresh = await whatsappService.handle(order.value._id, body)
      const msg = body.payment
        ? `${fresh.code}: pago registrado${fresh.status === 'confirmed' ? ' y pedido confirmado' : ''}`
        : confirm
          ? `${fresh.code} confirmado`
          : `${fresh.code} actualizado`
      toast.success(msg)
      onSaved(fresh)
      inbox.refresh()
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      saving.value = false
    }
  }

  return { wa, pay, form, saving, operatorChoices, chatUrl, greetUrl, payUrl, payText, canPayLink, copyPayText, save }
}

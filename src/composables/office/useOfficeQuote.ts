import { computed, reactive, ref, watch } from 'vue'
import { publicService } from '@/services/public.service'
import { useCatalogStore } from '@/stores/catalog'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { OfficeFrequency, OfficeQuote } from '@/types/api'
import { estimateOffice } from './officePricing'

export function useOfficeQuote() {
  const catalog = useCatalogStore()
  const toast = useToastStore()
  catalog.load()

  const form = reactive({
    branch: '',
    squareMeters: 100,
    chairs: 0,
    desks: 0,
    bathrooms: 1,
    frequency: 'unica' as OfficeFrequency,
    notes: '',
    contact: { name: '', email: '', phone: '', company: '' },
  })
  const errors = reactive<Record<string, string>>({})
  const sending = ref(false)
  const result = ref<OfficeQuote | null>(null)

  // Con una sola sucursal (o al cargar) se preselecciona la primera.
  watch(
    () => catalog.branches,
    (list) => {
      if (!form.branch && list[0]) form.branch = list[0]._id
    },
    { immediate: true },
  )

  const pricing = computed(() => catalog.settings?.officePricing || null)
  const preview = computed(() => (pricing.value ? estimateOffice(form, pricing.value) : null))

  function validate() {
    for (const k of Object.keys(errors)) delete errors[k]
    if (!form.branch) errors.branch = 'Elige una sucursal'
    if (!(form.squareMeters > 0)) errors.squareMeters = 'Ingresa los m² aproximados'
    if (form.contact.name.trim().length < 3) errors.name = 'Ingresa tu nombre'
    if (!/^\S+@\S+\.\S+$/.test(form.contact.email.trim())) errors.email = 'Ingresa un correo válido'
    if (form.contact.phone.replace(/\D/g, '').length < 9) errors.phone = 'Ingresa un teléfono válido'
    return Object.keys(errors).length === 0
  }

  async function submit() {
    if (!validate()) {
      toast.error('Revisa los campos marcados')
      return
    }
    sending.value = true
    try {
      result.value = await publicService.createOfficeQuote({
        branch: form.branch,
        squareMeters: Math.round(form.squareMeters),
        chairs: Math.max(0, Math.round(form.chairs)),
        desks: Math.max(0, Math.round(form.desks)),
        bathrooms: Math.max(0, Math.round(form.bathrooms)),
        frequency: form.frequency,
        notes: form.notes.trim() || undefined,
        contact: {
          name: form.contact.name.trim(),
          email: form.contact.email.trim(),
          phone: form.contact.phone.trim(),
          company: form.contact.company.trim() || undefined,
        },
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      toast.error(errorMessage(e, 'No pudimos enviar tu cotización. Inténtalo de nuevo.'))
    } finally {
      sending.value = false
    }
  }

  function reset() {
    result.value = null
  }

  return { catalog, form, errors, sending, result, preview, submit, reset }
}

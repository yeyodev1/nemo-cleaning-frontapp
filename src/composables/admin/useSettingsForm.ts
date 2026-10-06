import { onMounted, reactive, ref } from 'vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'
import type { Settings } from '@/types/api'

const blank = (): Settings => ({
  businessName: '',
  notifyEmails: [],
  bankAccounts: [],
  officePricing: {
    pricePerM2: 0,
    pricePerChair: 0,
    pricePerDesk: 0,
    pricePerBathroom: 0,
    minimum: 0,
    frequencyDiscounts: { semanal: 0, quincenal: 0, mensual: 0 },
  },
  bookingLeadHours: 12,
})

export function useSettingsForm() {
  const form = reactive<Settings>(blank())
  const loading = ref(true)
  const saving = ref(false)
  const toast = useToastStore()

  function fill(s: Settings) {
    const b = blank()
    Object.assign(form, {
      businessName: s.businessName || '',
      notifyEmails: [...(s.notifyEmails || [])],
      bankAccounts: (s.bankAccounts || []).map((a) => ({ ...a })),
      officePricing: {
        ...b.officePricing,
        ...s.officePricing,
        frequencyDiscounts: { ...b.officePricing.frequencyDiscounts, ...s.officePricing?.frequencyDiscounts },
      },
      bookingLeadHours: s.bookingLeadHours ?? 12,
    })
  }

  async function load() {
    loading.value = true
    try {
      fill(await managementService.settings())
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      loading.value = false
    }
  }

  async function save() {
    saving.value = true
    try {
      const body: Partial<Settings> = JSON.parse(JSON.stringify(form))
      fill(await managementService.updateSettings(body))
      toast.success('Configuración guardada')
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      saving.value = false
    }
  }

  onMounted(load)
  return { form, loading, saving, save }
}

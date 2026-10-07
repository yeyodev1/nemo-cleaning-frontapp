import { reactive, ref, watch } from 'vue'
import { useCustomerStore } from '@/stores/customer'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'

/** Formulario de "Mis datos": copia local de la ficha para editar sin tocar el store. */
export function useProfileForm() {
  const customer = useCustomerStore()
  const toast = useToastStore()
  const form = reactive({ name: '', phone: '', documentId: '', address: '' })
  const saving = ref(false)
  const error = ref('')

  watch(
    () => customer.customer,
    (c) => {
      if (!c) return
      Object.assign(form, { name: c.name, phone: c.phone, documentId: c.documentId, address: c.address })
    },
    { immediate: true },
  )

  async function save() {
    error.value = ''
    if (!form.name.trim()) return (error.value = 'Escribe tu nombre')
    const doc = form.documentId.replace(/\s/g, '')
    if (doc && !/^\d{10}(\d{3})?$/.test(doc)) return (error.value = 'La cédula debe tener 10 dígitos o el RUC 13')
    saving.value = true
    try {
      await customer.update({
        name: form.name.trim(),
        phone: form.phone.trim(),
        documentId: doc,
        address: form.address.trim(),
      })
      toast.success('Tus datos quedaron guardados')
    } catch (e) {
      error.value = errorMessage(e, 'No pudimos guardar tus datos')
    } finally {
      saving.value = false
    }
  }

  return { form, saving, error, save }
}

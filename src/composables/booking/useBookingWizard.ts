import { computed, nextTick, onMounted, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCatalogStore } from '@/stores/catalog'
import { draft } from './useBookingDraft'
import { STEPS, useStepValidation } from './useBookingSteps'
import { useBookingSubmit } from './useBookingSubmit'

/** Navegación del asistente: pasos, validación, foco y ?paso= en la URL. */
export function useBookingWizard(heading: Readonly<Ref<HTMLElement | null>>) {
  const route = useRoute()
  const router = useRouter()
  const catalog = useCatalogStore()
  const { validate, firstInvalid, canSubmit } = useStepValidation()
  const { submit, sending, error: submitError, result, clearResult } = useBookingSubmit()

  const error = ref('')
  const isLast = computed(() => draft.step === STEPS.length)
  const title = computed(() => STEPS[draft.step - 1]?.title || '')
  const actionLabel = computed(() => (isLast.value ? 'Confirmar reserva' : 'Continuar'))

  async function focusHeading() {
    await nextTick()
    heading.value?.focus()
  }

  function go(step: number) {
    draft.step = Math.min(STEPS.length, Math.max(1, step))
    error.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
    focusHeading()
  }

  async function next() {
    const msg = validate(draft.step)
    if (msg) {
      error.value = msg
      return
    }
    if (!isLast.value) return go(draft.step + 1)
    error.value = ''
    const res = await submit()
    if (!res) error.value = submitError.value
    else window.scrollTo({ top: 0 })
  }

  function back() {
    if (draft.step > 1) go(draft.step - 1)
    else router.push('/')
  }

  function again() {
    clearResult()
    go(1)
  }

  // Al escribir/elegir se borra el error del paso actual.
  watch(
    () => validate(draft.step),
    (msg) => {
      if (!msg) error.value = ''
    },
  )

  watch(
    () => draft.step,
    (s) => {
      if (String(route.query.paso || '') !== String(s))
        router.replace({ query: { ...route.query, paso: String(s) } })
    },
  )

  onMounted(async () => {
    await catalog.load()
    const asked = Number(route.query.paso) || draft.step
    // No se puede saltar a un paso con los anteriores incompletos.
    draft.step = Math.min(asked, firstInvalid())
    // Con una sola sucursal no hay nada que elegir.
    const only = catalog.branches.length === 1 ? catalog.branches[0] : undefined
    if (only && !draft.branch) draft.branch = only._id
    if (route.query.paso !== String(draft.step))
      router.replace({ query: { ...route.query, paso: String(draft.step) } })
  })

  return { error, isLast, title, actionLabel, next, back, go, again, sending, result, canSubmit }
}

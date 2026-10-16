import { onBeforeUnmount, onMounted, ref } from 'vue'

const CHECK_EVERY_MS = 60 * 1000

/**
 * Avisa cuando se publicó una versión nueva: compara el id de este build con
 * /version.json (cada minuto y al volver a la pestaña). Si un chunk viejo ya no
 * existe tras el deploy, también avisa en vez de dejar la pantalla rota.
 */
export function useAppUpdate() {
  const available = ref(false)
  let timer: ReturnType<typeof setInterval> | undefined

  async function check() {
    if (available.value || import.meta.env.DEV) return
    try {
      const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
      if (!res.ok) return
      const { id } = (await res.json()) as { id?: string }
      if (id && id !== __BUILD_ID__) available.value = true
    } catch {
      /* sin red: se vuelve a intentar en el próximo ciclo */
    }
  }

  function onVisible() {
    if (document.visibilityState === 'visible') check()
  }

  function onPreloadError(e: Event) {
    e.preventDefault()
    available.value = true
  }

  function reload() {
    window.location.reload()
  }

  onMounted(() => {
    timer = setInterval(check, CHECK_EVERY_MS)
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('vite:preloadError', onPreloadError)
    check()
  })

  onBeforeUnmount(() => {
    clearInterval(timer)
    document.removeEventListener('visibilitychange', onVisible)
    window.removeEventListener('vite:preloadError', onPreloadError)
  })

  return { available, reload, dismiss: () => (available.value = false) }
}

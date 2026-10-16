import { ref, type Ref } from 'vue'
import { toBlob } from 'html-to-image'
import { useToastStore } from '@/stores/toast'

/**
 * Captura la agenda como imagen PNG para mandarla por WhatsApp a quien aún no tiene
 * acceso. En el celular abre "Compartir"; en la computadora la descarga.
 */
export function useAgendaShot(target: Ref<HTMLElement | null>) {
  const toast = useToastStore()
  const busy = ref(false)

  async function capture(fileName: string) {
    const el = target.value
    if (!el) return
    busy.value = true
    // Sin scroll interno: la imagen sale completa, con todas las columnas.
    el.classList.add('is-capturing')
    try {
      await new Promise((r) => requestAnimationFrame(() => r(null)))
      const blob = await toBlob(el, {
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: el.scrollWidth,
        height: el.scrollHeight,
        cacheBust: true,
      })
      if (!blob) throw new Error('empty')
      const file = new File([blob], fileName, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Agenda Nemo Cleaning' })
          return
        } catch (e) {
          if ((e as DOMException).name === 'AbortError') return
        }
      }
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('Imagen de la agenda descargada')
    } catch {
      toast.error('No se pudo crear la imagen. Inténtalo de nuevo.')
    } finally {
      el.classList.remove('is-capturing')
      busy.value = false
    }
  }

  return { busy, capture }
}

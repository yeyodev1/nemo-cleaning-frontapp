import { ref } from 'vue'
import { managementService } from '@/services/management.service'
import { useToastStore } from '@/stores/toast'
import { errorMessage } from '@/utils/format'

/** Sube un archivo a /admin/uploads (Cloudinary) y devuelve la URL. */
export function useUpload() {
  const uploading = ref(false)
  const toast = useToastStore()

  async function upload(file: File): Promise<string | null> {
    uploading.value = true
    try {
      const { url } = await managementService.uploadFile(file)
      return url
    } catch (e) {
      toast.error(errorMessage(e, 'No se pudo subir el archivo'))
      return null
    } finally {
      uploading.value = false
    }
  }

  return { uploading, upload }
}

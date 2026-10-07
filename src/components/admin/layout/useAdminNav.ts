import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { adminNav } from '@/config/adminNav'
import { useUserStore } from '@/stores/user'
import { useAdminScope } from '@/stores/adminScope'
import { useWhatsappInbox } from '@/stores/whatsappInbox'
import type { NavItem } from '@/config/adminNav'

export function useAdminNav() {
  const user = useUserStore()
  const scope = useAdminScope()
  const router = useRouter()
  const whatsapp = useWhatsappInbox()

  const items = computed(() => adminNav.filter((i) => user.hasRole(i.roles)))
  const tabs = computed(() => items.value.filter((i) => i.tab))
  const rest = computed(() => items.value.filter((i) => !i.tab))

  function isActive(to: string) {
    const path = router.currentRoute.value.path
    if (to === '/admin') return path === '/admin'
    const hit = (t: string) => path === t || path.startsWith(`${t}/`)
    // Gana la ruta más específica: "Registrar servicio" no enciende también "Producción".
    return hit(to) && !items.value.some((i) => i.to.length > to.length && hit(i.to))
  }

  /** Conteo de la burbuja del ítem (0 = no se pinta). */
  function badgeOf(item: NavItem): number {
    return item.badge === 'whatsapp' ? whatsapp.pending : 0
  }
  // "Más" avisa si algo de adentro tiene pendientes (en el celular la bandeja vive allí).
  const restBadge = computed(() => rest.value.reduce((n, i) => n + badgeOf(i), 0))

  function logout() {
    user.clear()
    scope.reset()
    router.replace({ name: 'Login' })
  }

  return { items, tabs, rest, isActive, logout, user, badgeOf, restBadge }
}

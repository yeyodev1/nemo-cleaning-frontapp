import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { adminNav } from '@/config/adminNav'
import { useUserStore } from '@/stores/user'
import { useAdminScope } from '@/stores/adminScope'

export function useAdminNav() {
  const user = useUserStore()
  const scope = useAdminScope()
  const router = useRouter()

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

  function logout() {
    user.clear()
    scope.reset()
    router.replace({ name: 'Login' })
  }

  return { items, tabs, rest, isActive, logout, user }
}

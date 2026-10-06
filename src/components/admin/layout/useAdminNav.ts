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
    return to === '/admin' ? path === '/admin' : path.startsWith(to)
  }

  function logout() {
    user.clear()
    scope.reset()
    router.replace({ name: 'Login' })
  }

  return { items, tabs, rest, isActive, logout, user }
}

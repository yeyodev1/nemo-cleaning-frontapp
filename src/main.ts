import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/user'
import { useCustomerStore } from './stores/customer'
import { useAdminScope } from './stores/adminScope'
import { vReveal } from './directives/reveal'
import '@/styles/global.scss'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.directive('reveal', vReveal)

const user = useUserStore(pinia)
const scope = useAdminScope(pinia)

// 401 con sesión → logout y al login conservando a dónde iba.
window.addEventListener('auth:token-expired', () => {
  user.clear()
  scope.reset()
  if (router.currentRoute.value.meta.requiresAuth) {
    router.replace({ name: 'Login', query: { next: router.currentRoute.value.fullPath } })
  }
})

// 401 con sesión de cliente → se cierra solo esa sesión; si estaba en "Mi cuenta", a /ingresar.
window.addEventListener('customer:token-expired', () => {
  useCustomerStore(pinia).clear()
  if (router.currentRoute.value.meta.requiresCustomer) {
    router.replace({ name: 'CustomerLogin', query: { next: router.currentRoute.value.fullPath } })
  }
})

app.mount('#app')

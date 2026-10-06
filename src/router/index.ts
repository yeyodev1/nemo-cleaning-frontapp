import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { site } from '@/config/site'
import adminRoutes from './admin.routes'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('@/views/HomeView.vue') },
  {
    path: '/reservar',
    name: 'Booking',
    component: () => import('@/views/BookingView.vue'),
    meta: { title: 'Reserva tu limpieza', focus: true },
  },
  {
    path: '/cotizar-oficina',
    name: 'OfficeQuote',
    component: () => import('@/views/OfficeQuoteView.vue'),
    meta: { title: 'Cotiza la limpieza de tu oficina' },
  },
  {
    path: '/pedido/:code',
    name: 'Tracking',
    component: () => import('@/views/TrackingView.vue'),
    meta: { title: 'Seguimiento de tu pedido', focus: true },
  },
  {
    path: '/pago/respuesta',
    name: 'PaymentResponse',
    component: () => import('@/views/PaymentResponseView.vue'),
    meta: { title: 'Confirmando pago', focus: true },
  },
  ...adminRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, behavior: 'smooth', top: 80 }
    if (to.path === from.path) return false
    return { left: 0, top: 0 }
  },
})

router.beforeEach(async (to) => {
  const user = useUserStore()
  if (to.meta.requiresAuth || to.meta.guestOnly) await user.restore()

  if (to.meta.requiresAuth && !user.isAuthenticated) {
    return { name: 'Login', query: { next: to.fullPath }, replace: true }
  }
  if (to.meta.guestOnly && user.isAuthenticated) return { path: user.home, replace: true }
  // Rol sin acceso: a su inicio (el operador cae en "Mis servicios").
  if (to.meta.roles && !user.hasRole(to.meta.roles)) {
    return to.path === user.home ? true : { path: user.home, replace: true }
  }
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} | ${site.name}`
    : 'Nemo Cleaning | Limpieza profesional a domicilio en Guayaquil y Samborondón'
  // El panel y las páginas privadas fuera del índice.
  const privatePage = to.path.startsWith('/admin') || ['Tracking', 'PaymentResponse'].includes(String(to.name))
  let robots = document.head.querySelector('meta[name="robots"]')
  if (!robots) {
    robots = document.createElement('meta')
    robots.setAttribute('name', 'robots')
    document.head.appendChild(robots)
  }
  robots.setAttribute('content', privatePage ? 'noindex,nofollow' : 'index,follow')
})

export default router

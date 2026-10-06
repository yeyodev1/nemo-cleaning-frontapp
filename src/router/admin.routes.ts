import type { RouteRecordRaw } from 'vue-router'
import type { Role } from '@/types/api'
import AdminLayout from '@/components/admin/layout/AdminLayout.vue'

const AM: Role[] = ['admin', 'manager']
const A: Role[] = ['admin']

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'Login',
    component: () => import('@/views/admin/LoginView.vue'),
    meta: { title: 'Ingresar', layout: 'bare', guestOnly: true },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { layout: 'admin', requiresAuth: true },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { title: 'Inicio', roles: AM } },
      { path: 'agenda', name: 'AdminAgenda', component: () => import('@/views/admin/AgendaView.vue'), meta: { title: 'Agenda', roles: AM } },
      { path: 'pedidos', name: 'AdminBookings', component: () => import('@/views/admin/BookingsView.vue'), meta: { title: 'Pedidos', roles: AM } },
      { path: 'pedidos/nuevo', name: 'AdminBookingNew', component: () => import('@/views/admin/BookingNewView.vue'), meta: { title: 'Nuevo pedido', roles: AM } },
      { path: 'pedidos/:id', name: 'AdminBooking', component: () => import('@/views/admin/BookingDetailView.vue'), meta: { title: 'Pedido', roles: AM } },
      { path: 'pagos', name: 'AdminPayments', component: () => import('@/views/admin/PaymentsView.vue'), meta: { title: 'Pagos y conciliación', roles: AM } },
      { path: 'gastos', name: 'AdminExpenses', component: () => import('@/views/admin/ExpensesView.vue'), meta: { title: 'Gastos', roles: AM } },
      { path: 'caja', name: 'AdminCash', component: () => import('@/views/admin/CashView.vue'), meta: { title: 'Caja del día', roles: AM } },
      { path: 'reportes', name: 'AdminReports', component: () => import('@/views/admin/ReportsView.vue'), meta: { title: 'Reportes', roles: AM } },
      { path: 'cotizaciones', name: 'AdminOfficeQuotes', component: () => import('@/views/admin/OfficeQuotesView.vue'), meta: { title: 'Cotizaciones de oficina', roles: AM } },
      { path: 'clientes', name: 'AdminCustomers', component: () => import('@/views/admin/CustomersView.vue'), meta: { title: 'Clientes', roles: AM } },
      { path: 'clientes/:id', name: 'AdminCustomer', component: () => import('@/views/admin/CustomerDetailView.vue'), meta: { title: 'Cliente', roles: AM } },
      { path: 'catalogo', name: 'AdminServices', component: () => import('@/views/admin/ServicesView.vue'), meta: { title: 'Catálogo', roles: A } },
      { path: 'personal', name: 'AdminStaff', component: () => import('@/views/admin/StaffView.vue'), meta: { title: 'Personal', roles: A } },
      { path: 'sucursales', name: 'AdminBranches', component: () => import('@/views/admin/BranchesView.vue'), meta: { title: 'Sucursales', roles: A } },
      { path: 'configuracion', name: 'AdminSettings', component: () => import('@/views/admin/SettingsView.vue'), meta: { title: 'Configuración', roles: A } },
      { path: 'mis-servicios', name: 'OperatorJobs', component: () => import('@/views/admin/MyJobsView.vue'), meta: { title: 'Mis servicios', roles: ['operator'] } },
      { path: 'cuenta', name: 'AdminAccount', component: () => import('@/views/admin/AccountView.vue'), meta: { title: 'Mi cuenta' } },
    ],
  },
]

export default adminRoutes

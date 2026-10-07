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
      // Operación (fase 2)
      { path: 'produccion', name: 'AdminProduction', component: () => import('@/views/admin/operation/ProductionBaseView.vue'), meta: { title: 'Producción del día', roles: AM } },
      { path: 'produccion/registrar', name: 'AdminQuickEntry', component: () => import('@/views/admin/operation/QuickEntryView.vue'), meta: { title: 'Registrar servicio', roles: AM } },
      { path: 'turnos', name: 'AdminShifts', component: () => import('@/views/admin/operation/ShiftsView.vue'), meta: { title: 'Turnos', roles: AM } },
      { path: 'metas', name: 'AdminGoals', component: () => import('@/views/admin/operation/GoalsView.vue'), meta: { title: 'Metas mensuales', roles: AM } },
      { path: 'comisiones', name: 'AdminCommissions', component: () => import('@/views/admin/operation/CommissionsView.vue'), meta: { title: 'Comisiones (FEE)', roles: AM } },
      { path: 'novedades', name: 'AdminNovedades', component: () => import('@/views/admin/operation/NovedadesView.vue'), meta: { title: 'Novedades', roles: AM } },
      { path: 'pagos', name: 'AdminPayments', component: () => import('@/views/admin/PaymentsView.vue'), meta: { title: 'Pagos y conciliación', roles: AM } },
      { path: 'gastos', name: 'AdminExpenses', component: () => import('@/views/admin/ExpensesView.vue'), meta: { title: 'Gastos', roles: AM } },
      { path: 'caja', name: 'AdminCash', component: () => import('@/views/admin/CashView.vue'), meta: { title: 'Registro de caja', roles: AM } },
      // Finanzas y gestión (fase 2)
      { path: 'finanzas/quincenal', name: 'AdminFortnight', component: () => import('@/views/admin/finance/FortnightReportView.vue'), meta: { title: 'Reporte quincenal', roles: A } },
      { path: 'finanzas/estado-de-resultados', name: 'AdminStatement', component: () => import('@/views/admin/finance/StatementView.vue'), meta: { title: 'Estado de resultados', roles: A } },
      { path: 'finanzas/pagos', name: 'AdminPayables', component: () => import('@/views/admin/finance/PayablesView.vue'), meta: { title: 'Pagos por realizar', roles: A } },
      { path: 'finanzas/nomina', name: 'AdminPayroll', component: () => import('@/views/admin/finance/PayrollView.vue'), meta: { title: 'Nómina', roles: A } },
      { path: 'finanzas/cuentas-por-cobrar', name: 'AdminAging', component: () => import('@/views/admin/finance/ReceivablesAgingView.vue'), meta: { title: 'Cuentas por cobrar', roles: AM } },
      { path: 'finanzas/conciliacion', name: 'AdminBankRec', component: () => import('@/views/admin/finance/BankReconciliationView.vue'), meta: { title: 'Conciliación bancaria', roles: AM } },
      { path: 'comercial', name: 'AdminCommercial', component: () => import('@/views/admin/CommercialView.vue'), meta: { title: 'Comercial', roles: AM } },
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

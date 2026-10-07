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
      { path: '', name: 'AdminDashboard', component: () => import('@/views/admin/DashboardView.vue'), meta: { title: 'Inicio', purpose: 'Producción, cobros y pendientes de un vistazo.', roles: AM } },
      { path: 'agenda', name: 'AdminAgenda', component: () => import('@/views/admin/AgendaView.vue'), meta: { title: 'Agenda', purpose: 'Servicios agendados del día por operador. Toca uno para asignarlo o cambiar su estado.', roles: AM } },
      { path: 'pedidos', name: 'AdminBookings', component: () => import('@/views/admin/BookingsView.vue'), meta: { title: 'Pedidos', purpose: 'Todos los pedidos: web, panel e historial del Excel. Busca por cliente o código.', roles: AM } },
      { path: 'pedidos/nuevo', name: 'AdminBookingNew', component: () => import('@/views/admin/BookingNewView.vue'), meta: { title: 'Agendar pedido', purpose: 'Agenda un servicio a futuro. Para uno que ya se hizo usa Registrar servicio.', roles: AM } },
      { path: 'pedidos/:id', name: 'AdminBooking', component: () => import('@/views/admin/BookingDetailView.vue'), meta: { title: 'Pedido', roles: AM } },
      // Operación (fase 2)
      { path: 'produccion', name: 'AdminProduction', component: () => import('@/views/admin/operation/ProductionBaseView.vue'), meta: { title: 'Producción (Base)', purpose: 'Cada servicio realizado con su operador, pago y confirmación, como la hoja Base. Toca una fila para confirmar el pago o anotar una novedad.', roles: AM } },
      { path: 'produccion/registrar', name: 'AdminQuickEntry', component: () => import('@/views/admin/operation/QuickEntryView.vue'), meta: { title: 'Registrar servicio', purpose: 'Carga un servicio ya hecho en una sola pantalla. Puedes registrar varios seguidos.', roles: AM } },
      { path: 'turnos', name: 'AdminShifts', component: () => import('@/views/admin/operation/ShiftsView.vue'), meta: { title: 'Turnos', purpose: 'Quién trabaja cada día: Activo, Libre o Medio día. La web solo ofrece horarios con operadores activos.', roles: AM } },
      { path: 'metas', name: 'AdminGoals', component: () => import('@/views/admin/operation/GoalsView.vue'), meta: { title: 'Metas mensuales', purpose: 'Meta del mes de cada operador contra su producción real.', roles: AM } },
      { path: 'comisiones', name: 'AdminCommissions', component: () => import('@/views/admin/operation/CommissionsView.vue'), meta: { title: 'Comisiones (FEE)', purpose: 'FEE diario de cada operador y del supervisor, calculado solo con la producción.', roles: AM } },
      { path: 'novedades', name: 'AdminNovedades', component: () => import('@/views/admin/operation/NovedadesView.vue'), meta: { title: 'Novedades', purpose: 'Incidencias de los servicios de la semana: cliente, operador y qué pasó.', roles: AM } },
      { path: 'pagos', name: 'AdminPayments', component: () => import('@/views/admin/PaymentsView.vue'), meta: { title: 'Pagos por confirmar', purpose: 'Transferencias que falta verificar y todos los cobros registrados.', roles: AM } },
      { path: 'gastos', name: 'AdminExpenses', component: () => import('@/views/admin/ExpensesView.vue'), meta: { title: 'Gastos', purpose: 'Caja menor y gastos de gerencia del mes. Los pagos por realizar marcados como pagados aparecen aquí solos.', roles: AM } },
      { path: 'caja', name: 'AdminCash', component: () => import('@/views/admin/CashView.vue'), meta: { title: 'Registro de caja', purpose: 'Efectivo de la sucursal: cobros en efectivo, gastos de caja menor y entregas a gerencia.', roles: AM } },
      // Finanzas y gestión (fase 2)
      { path: 'finanzas/quincenal', name: 'AdminFortnight', component: () => import('@/views/admin/finance/FortnightReportView.vue'), meta: { title: 'Reporte quincenal', purpose: 'Producción, cobros, gastos y utilidad por quincena del mes: Q1 del 1 al 15 y Q2 del 16 a fin de mes.', roles: A } },
      { path: 'finanzas/estado-de-resultados', name: 'AdminStatement', component: () => import('@/views/admin/finance/StatementView.vue'), meta: { title: 'Estado de resultados', purpose: 'Ventas (producción), gastos y utilidad neta mes a mes.', roles: A } },
      { path: 'finanzas/pagos', name: 'AdminPayables', component: () => import('@/views/admin/finance/PayablesView.vue'), meta: { title: 'Pagos por realizar', purpose: 'Lo que hay que pagar en el mes, por quincena. Al marcar un pago como pagado se registra solo como gasto; no lo cargues dos veces.', roles: A } },
      { path: 'finanzas/nomina', name: 'AdminPayroll', component: () => import('@/views/admin/finance/PayrollView.vue'), meta: { title: 'Nómina', purpose: 'Sueldo de cada colaborador y lo pagado en cada quincena. Los anticipos se descuentan solos.', roles: A } },
      { path: 'finanzas/cuentas-por-cobrar', name: 'AdminAging', component: () => import('@/views/admin/finance/ReceivablesAgingView.vue'), meta: { title: 'Cuentas por cobrar', purpose: 'Clientes con saldo pendiente, por antigüedad. No incluye plan mensual, canjes, cortesías ni transferencias por confirmar.', roles: AM } },
      { path: 'finanzas/conciliacion', name: 'AdminBankRec', component: () => import('@/views/admin/finance/BankReconciliationView.vue'), meta: { title: 'Conciliación bancaria', purpose: 'Lo registrado en cada cuenta bancaria contra lo que dice el banco.', roles: AM } },
      { path: 'comercial', name: 'AdminCommercial', component: () => import('@/views/admin/CommercialView.vue'), meta: { title: 'Comercial', purpose: 'Servicios por zona, frecuencia de clientes y cartera (sin servicio hace más de 60 días).', roles: AM } },
      { path: 'reportes', name: 'AdminReports', component: () => import('@/views/admin/ReportsView.vue'), meta: { title: 'Producción por servicio', purpose: 'Producción por servicio, por operador y por día en el rango que elijas.', roles: AM } },
      { path: 'cotizaciones', name: 'AdminOfficeQuotes', component: () => import('@/views/admin/OfficeQuotesView.vue'), meta: { title: 'Cotizaciones de oficina', purpose: 'Pedidos de cotización de oficinas que llegan desde la web.', roles: AM } },
      { path: 'clientes', name: 'AdminCustomers', component: () => import('@/views/admin/CustomersView.vue'), meta: { title: 'Clientes', purpose: 'Busca por nombre, teléfono o cédula y mira el historial de cada cliente.', roles: AM } },
      { path: 'clientes/:id', name: 'AdminCustomer', component: () => import('@/views/admin/CustomerDetailView.vue'), meta: { title: 'Cliente', roles: AM } },
      { path: 'catalogo', name: 'AdminServices', component: () => import('@/views/admin/ServicesView.vue'), meta: { title: 'Catálogo', purpose: 'Servicios, adicionales y precios que se ven en la web.', roles: A } },
      { path: 'personal', name: 'AdminStaff', component: () => import('@/views/admin/StaffView.vue'), meta: { title: 'Personal', purpose: 'Equipo, cargos, sueldos y quién entra al panel.', roles: A } },
      { path: 'sucursales', name: 'AdminBranches', component: () => import('@/views/admin/BranchesView.vue'), meta: { title: 'Sucursales', purpose: 'Datos, horarios y urbanizaciones de cada sucursal.', roles: A } },
      { path: 'configuracion', name: 'AdminSettings', component: () => import('@/views/admin/SettingsView.vue'), meta: { title: 'Ajustes', purpose: 'Correos de aviso, cuentas bancarias y precios de oficinas.', roles: A } },
      { path: 'mis-servicios', name: 'OperatorJobs', component: () => import('@/views/admin/MyJobsView.vue'), meta: { title: 'Mis servicios', roles: ['operator'] } },
      { path: 'cuenta', name: 'AdminAccount', component: () => import('@/views/admin/AccountView.vue'), meta: { title: 'Mi cuenta' } },
    ],
  },
]

export default adminRoutes

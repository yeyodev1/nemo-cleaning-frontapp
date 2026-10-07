import APIBase from './httpBase'
import type { ID } from '@/types/api'
import type { WaCustomerMatch, WaHandleInput, WaInbox, WaOrder, WaQuickOrderInput, WaTab } from '@/types/whatsapp'

/** "Pedidos por WhatsApp": bandeja de los asesores, búsqueda por código y pedido rápido. */
class WhatsappService extends APIBase {
  inbox(tab: WaTab, branch?: string) {
    return this.get<WaInbox>('admin/whatsapp/inbox', { tab, branch })
  }
  count(branch?: string) {
    return this.get<{ pending: number }>('admin/whatsapp/count', { branch })
  }
  lookup(code: string) {
    return this.get<WaOrder>('admin/whatsapp/lookup', { code })
  }
  customerByPhone(phone: string) {
    return this.get<WaCustomerMatch>('admin/whatsapp/customer', { phone })
  }
  createOrder(body: WaQuickOrderInput) {
    return this.post<WaOrder>('admin/whatsapp/orders', body)
  }
  handle(id: ID, body: WaHandleInput) {
    return this.patch<WaOrder>(`admin/whatsapp/orders/${id}`, body)
  }
}

export const whatsappService = new WhatsappService()

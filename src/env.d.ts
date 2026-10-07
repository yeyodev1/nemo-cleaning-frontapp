/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

import 'vue-router'
import type { Role } from '@/types/api'
declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    layout?: 'public' | 'admin' | 'bare'
    /** Oculta footer público (wizards). */
    focus?: boolean
    requiresAuth?: boolean
    roles?: Role[]
    guestOnly?: boolean
    /** Requiere sesión de cliente ("Mi cuenta"). */
    requiresCustomer?: boolean
    /** Solo sin sesión de cliente (/ingresar). */
    customerGuestOnly?: boolean
  }
}

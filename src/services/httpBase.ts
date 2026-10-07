import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'
import type { ApiError } from '@/types/api'

export const TOKEN_KEY = 'nemo_access_token'
/** Sesión del cliente ("Mi cuenta"): clave aparte para no mezclarla con la del personal. */
export const CUSTOMER_TOKEN_KEY = 'nemo_customer_token'

/** Qué token manda cada servicio: el del personal, el del cliente o ninguno. */
export type AuthAs = 'staff' | 'customer' | 'none'

declare module 'axios' {
  interface AxiosRequestConfig {
    authAs?: AuthAs
  }
}

/**
 * URL del API. VITE_API_URL manda, salvo que apunte a localhost y el visitante
 * no esté en localhost (un celular en la red no ve tu localhost).
 */
export function resolveApiBaseUrl(): string {
  const host = window.location.hostname
  const isLocal = ['localhost', '127.0.0.1'].includes(host)
  const fallback = isLocal ? 'http://localhost:8100/api' : 'https://api.nemocleaning.ec/api'
  const envUrl = (import.meta.env.VITE_API_URL as string) || ''
  const envIsLocal = envUrl.includes('localhost') || envUrl.includes('127.0.0.1')
  const raw = envUrl && (isLocal || !envIsLocal) ? envUrl : fallback
  return raw.replace(/\/+$/, '')
}

function readKey(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function readToken(): string | null {
  return readKey(TOKEN_KEY)
}

export function readCustomerToken(): string | null {
  return readKey(CUSTOMER_TOKEN_KEY)
}

function toApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error) && error.response) {
    const data = error.response.data as { message?: string } | undefined
    return { status: error.response.status, message: data?.message || error.message, data }
  }
  if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
    return { status: 408, message: 'El servidor tardó demasiado en responder' }
  }
  return { status: 0, message: 'No se pudo conectar con el servidor' }
}

const http = axios.create({ timeout: 20000 })

http.interceptors.request.use((config) => {
  const as = config.authAs ?? 'staff'
  const token = as === 'staff' ? readToken() : as === 'customer' ? readCustomerToken() : null
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

http.interceptors.response.use(
  (r) => r,
  (error) => {
    const status = error.response?.status
    const as = error.config?.authAs ?? 'staff'
    const sent = Boolean(error.config?.headers?.Authorization)
    // Solo un 401 de una petición que llevaba token es de sesión; cada sesión cierra la suya.
    if (status === 401 && sent && as === 'staff' && readToken()) {
      window.dispatchEvent(new CustomEvent('auth:token-expired'))
    }
    if (status === 401 && sent && as === 'customer' && readCustomerToken()) {
      window.dispatchEvent(new CustomEvent('customer:token-expired'))
    }
    return Promise.reject(error)
  },
)

type Query = Record<string, string | number | boolean | undefined | null>

/** Quita vacíos para no mandar `?status=&branch=` al API. */
export function cleanQuery(q?: Query): Record<string, string | number | boolean> | undefined {
  if (!q) return undefined
  const out: Record<string, string | number | boolean> = {}
  for (const [k, v] of Object.entries(q)) {
    if (v !== undefined && v !== null && v !== '') out[k] = v
  }
  return out
}

export default class APIBase {
  protected baseUrl = resolveApiBaseUrl()
  /** Token que adjunta este servicio; por defecto el del personal. */
  protected authAs: AuthAs = 'staff'

  private url(endpoint: string) {
    return `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`
  }

  protected async get<T>(endpoint: string, query?: Query, config?: AxiosRequestConfig): Promise<T> {
    try {
      const { data } = await http.get<T>(this.url(endpoint), { params: cleanQuery(query), authAs: this.authAs, ...config })
      return data
    } catch (e) {
      throw toApiError(e)
    }
  }

  protected async post<T>(endpoint: string, body?: unknown, query?: Query): Promise<T> {
    try {
      const { data } = await http.post<T>(this.url(endpoint), body ?? {}, { params: cleanQuery(query), authAs: this.authAs })
      return data
    } catch (e) {
      throw toApiError(e)
    }
  }

  protected async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    try {
      const { data } = await http.patch<T>(this.url(endpoint), body ?? {}, { authAs: this.authAs })
      return data
    } catch (e) {
      throw toApiError(e)
    }
  }

  protected async put<T>(endpoint: string, body?: unknown): Promise<T> {
    try {
      const { data } = await http.put<T>(this.url(endpoint), body ?? {}, { authAs: this.authAs })
      return data
    } catch (e) {
      throw toApiError(e)
    }
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    try {
      const { data } = await http.delete<T>(this.url(endpoint), { authAs: this.authAs })
      return data
    } catch (e) {
      throw toApiError(e)
    }
  }

  /** multipart con campo `file`; axios pone el boundary solo. */
  protected async upload<T>(endpoint: string, file: File, query?: Query): Promise<T> {
    const form = new FormData()
    form.append('file', file)
    try {
      const { data } = await http.post<T>(this.url(endpoint), form, {
        params: cleanQuery(query),
        timeout: 60000,
        authAs: this.authAs,
      })
      return data
    } catch (e) {
      throw toApiError(e)
    }
  }
}

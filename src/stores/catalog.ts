import { defineStore } from 'pinia'
import { publicService } from '@/services/public.service'
import type { Branch, PublicSettings, Service, ServiceCategory } from '@/types/api'

/** Datos públicos que casi no cambian: sucursales, catálogo y configuración. Se cargan una vez. */
export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    branches: [] as Branch[],
    services: [] as Service[],
    settings: null as PublicSettings | null,
    loading: false,
    loaded: false,
    error: '',
  }),

  getters: {
    mainServices: (s) => s.services.filter((x) => !x.isExtra),
    extras: (s) => s.services.filter((x) => x.isExtra),
    byId: (s) => (id: string) => s.services.find((x) => x._id === id),
    branchById: (s) => (id: string) => s.branches.find((b) => b._id === id),
    categories(): ServiceCategory[] {
      const set = new Set<ServiceCategory>()
      this.mainServices.forEach((x) => set.add(x.category))
      return [...set]
    },
  },

  actions: {
    async load(force = false) {
      if ((this.loaded || this.loading) && !force) return
      this.loading = true
      this.error = ''
      try {
        const [branches, services, settings] = await Promise.all([
          publicService.branches(),
          publicService.services(),
          publicService.settings(),
        ])
        this.branches = branches
        this.services = [...services].sort((a, b) => a.order - b.order)
        this.settings = settings
        this.loaded = true
      } catch (e) {
        this.error = (e as { message?: string }).message || 'No se pudo cargar el catálogo'
      } finally {
        this.loading = false
      }
    },
  },
})

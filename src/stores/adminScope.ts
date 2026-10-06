import { defineStore } from 'pinia'
import { managementService } from '@/services/management.service'
import { useUserStore } from './user'
import type { Branch, User } from '@/types/api'

const KEY = 'nemo_admin_branch'

function readBranch() {
  try {
    return localStorage.getItem(KEY) || ''
  } catch {
    return ''
  }
}

/**
 * Selector global de sucursal del panel. '' = todas (solo gerencia).
 * El manager solo ve sus sucursales; si tiene una sola, queda fija.
 */
export const useAdminScope = defineStore('adminScope', {
  state: () => ({
    branch: readBranch(),
    branches: [] as Branch[],
    operators: [] as User[],
    loaded: false,
  }),

  getters: {
    visibleBranches(s): Branch[] {
      const user = useUserStore().user
      if (!user || user.role === 'admin') return s.branches
      return s.branches.filter((b) => user.branches.includes(b._id))
    },
    canSeeAll(): boolean {
      return useUserStore().isAdmin
    },
    branchName: (s) => (id?: string | null) => s.branches.find((b) => b._id === id)?.name || '',
    /** Para la query del API: undefined = todas. */
    query(s): string | undefined {
      return s.branch || undefined
    },
  },

  actions: {
    setBranch(id: string) {
      this.branch = id
      try {
        localStorage.setItem(KEY, id)
      } catch {
        /* nada */
      }
    },

    async load(force = false) {
      if (this.loaded && !force) return
      try {
        const [branches, operators] = await Promise.all([
          managementService.branches(),
          managementService.users('operator').catch(() => [] as User[]),
        ])
        this.branches = branches
        this.operators = operators
        this.loaded = true
        // El manager no puede quedar en "todas" ni en una sucursal ajena.
        const visible = this.visibleBranches
        if (!this.canSeeAll && visible.length && !visible.some((b) => b._id === this.branch)) {
          this.setBranch(visible[0]?._id || '')
        }
        if (this.branch && !this.branches.some((b) => b._id === this.branch)) this.setBranch('')
      } catch {
        /* el panel sigue funcionando sin selector */
      }
    },

    reset() {
      this.loaded = false
      this.branches = []
      this.operators = []
    },
  },
})

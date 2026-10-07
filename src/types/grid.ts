// Grillas anuales tipo hoja (Nómina y Comisiones): filas = colaborador, columnas = ENE…DIC.

/** Alguien del Personal que se puede agregar a la grilla. */
export interface StaffOption {
  _id: string
  name: string
  position: string
  branches: string[]
}

export interface GridRow {
  key: string
  /** Colaborador del Personal; null = nombre libre (solo comisiones). */
  user: string | null
  name: string
  position: string
  branch: string | null
  branchName: string
  /** Centavos por mes (índice 0 = enero); null = celda vacía. */
  months: (number | null)[]
  notes: string[]
  total: number
  /** Nómina: meses con pagos de quincena (no se pueden vaciar). */
  locked?: boolean[]
  active?: boolean
}

export interface MonthGridData {
  year: number
  rows: GridRow[]
  monthTotals: number[]
  total: number
  staff: StaffOption[]
}

export type CellStatus = '' | 'saving' | 'saved' | 'error'

/**
 * Regla del dueño: no se aprueba un pago sin un papel de por medio. Marcar "confirmado"
 * en una cuenta de transferencia pide el comprobante; en efectivo, confirmar que se recibió.
 */
export type EvidenceKind = 'transfer' | 'cash' | null

export function evidenceKind(account: string, confirmation: string): EvidenceKind {
  if (confirmation !== 'confirmed') return null
  const a = account.trim().toLowerCase()
  // Tarjeta registrada a mano: lleva su voucher como una transferencia.
  if (a.startsWith('transferencia') || a.startsWith('tarjeta')) return 'transfer'
  if (a.startsWith('efectivo')) return 'cash'
  return null
}

/** Mensaje de lo que falta (vacío = listo); los mismos textos que responde el back. */
export function evidenceMissing(kind: EvidenceKind, proofUrl: string, cashConfirmed: boolean): string {
  if (kind === 'transfer' && !proofUrl) return 'Sube el comprobante de la transferencia para marcarla como confirmada'
  if (kind === 'cash' && !cashConfirmed) return 'Confirma que recibiste el efectivo'
  return ''
}

/** Lo que se manda al back según el tipo (cada uno solo su papel). */
export function evidencePayload(kind: EvidenceKind, proofUrl: string, cashConfirmed: boolean) {
  if (kind === 'transfer') return { proofUrl }
  if (kind === 'cash') return { cashConfirmed }
  return {}
}

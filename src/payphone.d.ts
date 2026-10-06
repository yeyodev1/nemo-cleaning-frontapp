// Cajita de Pagos de Payphone (script de CDN). Archivo aparte y sin imports:
// env.d.ts es un módulo y ahí una declaración global no se vería.
declare class PPaymentButtonBox {
  constructor(config: Record<string, unknown>)
  render(containerId: string): void
}

interface Window {
  PPaymentButtonBox?: typeof PPaymentButtonBox
}

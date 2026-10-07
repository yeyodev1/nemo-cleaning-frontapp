<template>
  <div class="kpis"><slot /></div>
</template>

<style scoped lang="scss">
// Tarjetas resumen arriba de cada pantalla: 2 por fila en celular, en línea en escritorio.
.kpis {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
  margin-bottom: 1rem;

  @include from('md') {
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 0.85rem;
  }

  // En celular: tarjetas más bajas (sin ícono) y la última ocupa toda la fila si quedó sola.
  @include until('md') {
    :deep(.kpi) {
      padding: 0.75rem 0.85rem;
    }

    :deep(.kpi__icon) {
      display: none;
    }

    > :deep(:last-child:nth-child(odd)) {
      grid-column: 1 / -1;
    }
  }

  :deep(.kpi__value) {
    font-size: clamp(1.05rem, 0.9rem + 0.9vw, 1.45rem);
    overflow-wrap: anywhere;
  }
}
</style>

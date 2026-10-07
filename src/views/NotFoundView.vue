<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
</script>

<template>
  <section class="nf">
    <svg class="nf__art" viewBox="0 0 200 160" aria-hidden="true">
      <circle cx="100" cy="80" r="70" fill="#FFF1E9" />
      <circle cx="58" cy="44" r="12" fill="#fff" stroke="#F05E23" stroke-opacity=".5" />
      <circle cx="150" cy="120" r="9" fill="#fff" stroke="#F05E23" stroke-opacity=".5" />
      <text x="100" y="98" text-anchor="middle" font-family="Poppins, sans-serif" font-size="52" font-weight="700" fill="#1E2D3A">404</text>
    </svg>
    <h1>Página no encontrada</h1>
    <p>El enlace no existe o cambió. Te llevamos a donde necesitas.</p>
    <div class="nf__actions">
      <RouterLink to="/" class="btn btn--primary btn--lg"><AppIcon name="home" /> Ir al inicio</RouterLink>
      <RouterLink to="/reservar" class="btn btn--ghost btn--lg">Reservar limpieza</RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.nf {
  @include container(560px);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-block: 3rem 4rem;
  gap: 0.75rem;

  &__art {
    width: 200px;
    margin-bottom: 0.5rem;
  }

  h1 {
    @include display($display-sm);
  }

  p {
    color: $ink-soft;
  }

  &__actions {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
  }
}
</style>

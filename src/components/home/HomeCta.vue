<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
</script>

<template>
  <section class="cta" aria-labelledby="cta-title">
    <div v-reveal class="cta__card">
      <svg class="cta__shape" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="160" cy="40" r="60" fill="#19C3B8" opacity=".25" />
        <circle cx="30" cy="180" r="40" fill="#fff" opacity=".08" />
      </svg>
      <h2 id="cta-title">¿Listo para ver todo como nuevo?</h2>
      <p>Reserva hoy en menos de 2 minutos y elige el horario que mejor te quede.</p>
      <div class="cta__actions">
        <RouterLink to="/reservar" class="btn btn--accent btn--lg">
          Reserva tu limpieza <AppIcon name="arrow-right" />
        </RouterLink>
        <RouterLink to="/cotizar-oficina" class="btn btn--lg cta__ghost">
          <AppIcon name="building" /> Cotizar oficina
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta {
  @include container;
  padding-block: $space-section;

  &__card {
    position: relative;
    overflow: hidden;
    padding: 2.25rem 1.5rem;
    border-radius: $radius-lg;
    background: linear-gradient(135deg, $navy, $navy-deep 60%, $navy-ink);
    color: $on-dark-soft;
    text-align: center;

    @include from('md') {
      padding: 3.5rem 2rem;
    }

    h2 {
      position: relative;
      color: #fff;
      @include display($display-sm);
    }

    p {
      position: relative;
      margin: 0.75rem auto 0;
      max-width: 46ch;
    }
  }

  &__shape {
    position: absolute;
    right: -40px;
    top: -40px;
    width: 280px;
    height: 280px;
    pointer-events: none;
  }

  &__actions {
    position: relative;
    margin-top: 1.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    align-items: stretch;

    @include from('sm') {
      flex-direction: row;
      justify-content: center;
    }
  }

  &__ghost {
    color: #fff;
    border-color: rgba(#fff, 0.35);

    &:hover {
      background: rgba(#fff, 0.08);
    }
  }
}
</style>

<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import NemoLogo from '@/components/brand/NemoLogo.vue'
import { site } from '@/config/site'
import { whatsappUrl } from '@/utils/format'
import { vMagnetic } from '@/directives/magnetic'

const wa = whatsappUrl(site.whatsapp, 'Hola Nemo, quiero información de sus servicios')
</script>

<template>
  <section class="cta" aria-labelledby="cta-title">
    <img class="cta__bg" src="/fotos/auto-interior.webp" alt="" loading="lazy" decoding="async" width="736" height="736" />
    <div class="cta__inner">
      <NemoLogo variant="dark" :height="96" class="cta__logo" />
      <h2 id="cta-title" v-reveal class="cta__title">Más que limpieza, <em>restauramos valor</em></h2>
      <p class="cta__lead">Reserva en línea o escríbenos por WhatsApp.</p>
      <div class="cta__actions">
        <RouterLink v-magnetic to="/reservar" class="btn btn--accent btn--lg">Reservar ahora <AppIcon name="arrow-right" /></RouterLink>
        <a v-magnetic :href="wa" target="_blank" rel="noopener" class="btn btn--outline-light btn--lg">
          <AppIcon name="whatsapp" /> {{ site.whatsappDisplay }}
        </a>
        <a :href="site.instagram" target="_blank" rel="noopener" class="btn btn--outline-light btn--lg">
          <AppIcon name="instagram" /> {{ site.instagramHandle }}
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(4.5rem, 10vw, 8rem) 0;
  background: $navy-deep;
  color: #fff;
  text-align: center;

  &__bg {
    position: absolute;
    inset: 0;
    z-index: -2;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.35;
    filter: saturate(0.8);
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(70% 80% at 50% 100%, rgba($orange, 0.22), transparent 70%),
      linear-gradient(180deg, rgba($navy-deep, 0.92) 0%, rgba($navy, 0.8) 50%, rgba($navy-deep, 0.95) 100%);
  }

  &__inner {
    @include container(900px);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  &__logo {
    margin-bottom: 1.5rem;
  }

  &__title {
    @include display(clamp(2.3rem, 1.3rem + 4.6vw, 4.8rem), 700);
    letter-spacing: -0.03em;
    line-height: 1;

    em {
      display: block;
      font-style: italic;
      font-weight: 600;
      color: $orange;
    }
  }

  &__lead {
    margin-top: 1.1rem;
    color: $on-dark-soft;
    font-size: $text-lg;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 2rem;

    .btn {
      flex: 1 1 220px;
      transition: transform 0.35s $ease-out, background-color $dur-fast ease, border-color $dur-fast ease, color $dur-fast ease;

      @include from('md') {
        flex: 0 0 auto;
      }
    }
  }
}
</style>

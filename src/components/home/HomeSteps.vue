<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { steps } from '@/config/landing'
</script>

<template>
  <section id="como-funciona" class="steps" aria-labelledby="steps-title">
    <div class="steps__inner">
      <SectionHead
        id="steps-title"
        light
        eyebrow="Cómo funciona"
        title="Reservar es así de fácil"
        text="Sin llamadas ni esperas: todo en línea y desde el celular."
      />
      <ol class="steps__list">
        <li v-for="(s, i) in steps" :key="s.title" v-reveal="i * 90" class="step">
          <span class="step__num">{{ i + 1 }}</span>
          <span class="step__icon"><AppIcon :name="s.icon" :size="24" /></span>
          <h3>{{ s.title }}</h3>
          <p>{{ s.text }}</p>
        </li>
      </ol>
      <RouterLink to="/reservar" class="btn btn--accent btn--lg steps__cta">
        Empezar mi reserva <AppIcon name="arrow-right" />
      </RouterLink>
    </div>
  </section>
</template>

<style scoped lang="scss">
.steps {
  position: relative;
  padding: $space-section 0;
  background:
    radial-gradient(600px 300px at 90% 0%, rgba($aqua, 0.22), transparent 70%),
    linear-gradient(160deg, $navy-deep, $navy-ink);
  color: $on-dark-soft;
  overflow: hidden;

  &__inner {
    @include container;
  }

  &__list {
    list-style: none;
    @include flex-cards(260px, 1rem);
  }

  &__cta {
    margin-top: 2rem;
  }
}

.step {
  position: relative;
  padding: 1.5rem;
  border-radius: $radius-lg;
  background: rgba(#fff, 0.06);
  border: 1px solid rgba(#fff, 0.1);
  backdrop-filter: blur(6px);

  &__num {
    position: absolute;
    right: 1.25rem;
    top: 0.75rem;
    font-size: 3.2rem;
    font-weight: 800;
    line-height: 1;
    color: rgba(#fff, 0.08);
  }

  &__icon {
    width: 50px;
    height: 50px;
    border-radius: 15px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $aqua;
    color: $navy-ink;
    margin-bottom: 1rem;
  }

  h3 {
    color: #fff;
    font-size: $text-lg;
    margin-bottom: 0.4rem;
  }

  p {
    font-size: $text-sm;
  }
}
</style>

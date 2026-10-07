<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { coverage } from '@/config/site'
import { useCatalogStore } from '@/stores/catalog'

const catalog = useCatalogStore()
</script>

<template>
  <section id="cobertura" class="cov" aria-labelledby="cov-title">
    <div class="cov__inner">
      <div class="cov__copy">
        <p class="cov__eyebrow">Servicio a domicilio</p>
        <h2 id="cov-title" class="cov__title">Vamos hasta donde estás</h2>
        <ul class="cov__zones">
          <li v-for="(z, i) in coverage.catalog" :key="z" v-reveal="i * 100">
            <AppIcon name="pin" :size="22" /> <span>{{ z }}</span>
          </li>
        </ul>
        <p class="cov__also">También atendemos: <strong>{{ coverage.linktree }}</strong>.</p>
        <p v-if="catalog.branches.length" class="cov__also">
          Sucursales: <strong>{{ catalog.branches.map((b) => b.name).join(' y ') }}</strong>.
        </p>
      </div>

      <!-- Radar decorativo: anillos que se expanden desde el pin (solo transform/opacity). -->
      <div class="cov__radar" aria-hidden="true">
        <span v-for="n in 3" :key="n" class="cov__ring" :style="{ animationDelay: `${(n - 1) * 1.2}s` }"></span>
        <span class="cov__grid"></span>
        <span class="cov__pin"><AppIcon name="pin" :size="34" /></span>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cov {
  @include dark-pattern;
  color: $on-dark;
  padding: $space-section 0;
  overflow: hidden;

  &__inner {
    @include container(1240px);
    display: flex;
    flex-direction: column;
    gap: 2.5rem;

    @include from('md') {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  &__copy {
    max-width: 620px;
  }

  &__eyebrow {
    @include eyebrow;
    color: $sky-blue;
  }

  &__title {
    @include display($display-md, 700);
    margin-top: 0.5rem;
    color: #fff;
    @include orange-underline;
  }

  &__zones {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 1.5rem 0 1.25rem;

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid $dark-line;
      font-family: $font-display;
      font-size: clamp(1.5rem, 1.1rem + 2vw, 2.4rem);
      font-weight: 600;
      color: #fff;

      svg {
        flex-shrink: 0;
        color: $orange;
      }
    }
  }

  &__also {
    margin-top: 0.4rem;
    color: $on-dark-soft;

    strong {
      color: #fff;
    }
  }

  &__radar {
    position: relative;
    align-self: center;
    flex-shrink: 0;
    width: min(76vw, 340px);
    aspect-ratio: 1;
  }

  &__grid {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba($sky-blue, 0.25);
    background:
      radial-gradient(circle, transparent 32%, rgba($sky-blue, 0.14) 32.5%, transparent 33.5%),
      radial-gradient(circle, transparent 62%, rgba($sky-blue, 0.14) 62.5%, transparent 63.5%),
      radial-gradient(circle, rgba($sky-blue, 0.12), transparent 70%);
  }

  &__ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid rgba($orange, 0.7);
    transform: scale(0.15);
    opacity: 0;
    animation: cov-ping 3.6s $ease-out infinite;
  }

  &__pin {
    position: absolute;
    top: 50%;
    left: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 72px;
    height: 72px;
    margin: -36px 0 0 -36px;
    border-radius: 50%;
    background: $orange;
    color: $navy;
    box-shadow: 0 0 0 10px rgba($orange, 0.18), $shadow-lg;
  }

  @include reduced-motion {
    &__ring {
      display: none;
    }
  }
}

@keyframes cov-ping {
  0% {
    transform: scale(0.15);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}
</style>

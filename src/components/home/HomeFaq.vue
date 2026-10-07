<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import SectionHead from './SectionHead.vue'
import { faqs } from '@/config/landing'

const open = ref<number | null>(0)
const toggle = (i: number) => (open.value = open.value === i ? null : i)
</script>

<template>
  <section id="preguntas" class="faq" aria-labelledby="faq-title">
    <div class="faq__inner">
      <SectionHead id="faq-title" eyebrow="Dudas" title="Preguntas frecuentes" />
      <ul v-reveal class="faq__list">
        <li v-for="(f, i) in faqs" :key="f.q" class="qa" :class="{ 'is-open': open === i }">
          <h3>
            <button
              :id="`faq-q-${i}`"
              type="button"
              class="qa__q"
              :aria-expanded="open === i"
              :aria-controls="`faq-a-${i}`"
              @click="toggle(i)"
            >
              <span>{{ f.q }}</span>
              <AppIcon name="chevron-down" class="qa__chev" />
            </button>
          </h3>
          <!-- Altura animada con grid-template-rows 0fr → 1fr (sin medir ni tocar height). -->
          <div
            :id="`faq-a-${i}`"
            class="qa__a"
            role="region"
            :aria-labelledby="`faq-q-${i}`"
            :aria-hidden="open !== i"
            :inert="open !== i"
          >
            <div class="qa__inner"><p>{{ f.a }}</p></div>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.faq {
  padding: $space-section 0;
  background: $sky;

  &__inner {
    @include container(820px);
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
}

.qa {
  border-radius: $radius-md;
  background: #fff;
  border: 1px solid $line;
  transition:
    border-color 0.3s ease,
    box-shadow 0.3s ease;

  &.is-open {
    border-color: rgba($orange, 0.6);
    box-shadow: $shadow-sm;
  }

  h3 {
    font-size: inherit;
  }

  &__q {
    width: 100%;
    min-height: 56px;
    padding: 0.9rem 1.1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    text-align: left;
    font-weight: 700;
    font-size: $text-base;
    border-radius: $radius-md;
  }

  &__chev {
    flex-shrink: 0;
    color: $orange-ink;
    transition: transform 400ms $ease-out;
  }

  &.is-open &__chev {
    transform: rotate(180deg);
  }

  // Cerrar usa una curva pareja para que se recoja tan suave como se abre.
  &__a {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 380ms $ease-in-out;
  }

  &.is-open &__a {
    grid-template-rows: 1fr;
    transition: grid-template-rows 440ms $ease-out;
  }

  &__inner {
    overflow: hidden;
    min-height: 0;

    p {
      padding: 0 1.1rem 1.1rem;
      color: $ink-soft;
      font-size: $text-sm;
      opacity: 0;
      transform: translateY(-6px);
      transition:
        opacity 200ms $ease-in-out,
        transform 260ms $ease-in-out;
    }
  }

  &.is-open &__inner p {
    opacity: 1;
    transform: none;
    transition:
      opacity 320ms $ease-out 120ms,
      transform 380ms $ease-out 100ms;
  }

  &__q {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba($navy, 0.03);
    }
  }
}
</style>

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
      <SectionHead id="faq-title" eyebrow="Preguntas frecuentes" title="Resolvemos tus dudas" />
      <ul class="faq__list">
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
          <div :id="`faq-a-${i}`" class="qa__a" role="region" :aria-labelledby="`faq-q-${i}`" :hidden="open !== i">
            <p>{{ f.a }}</p>
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
  transition: border-color 0.2s, box-shadow 0.2s;

  &.is-open {
    border-color: rgba($aqua, 0.6);
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
    color: $navy;
    transition: transform 0.25s $ease;
  }

  &.is-open &__chev {
    transform: rotate(180deg);
  }

  &__a {
    padding: 0 1.1rem 1.1rem;
    color: $ink-soft;
    font-size: $text-sm;
  }
}
</style>

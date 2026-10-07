<script setup lang="ts">
import { computed } from 'vue'
import { money } from '@/utils/format'

/** Ranking con barra proporcional (servicios u operadores). */
const props = defineProps<{ title: string; rows: { name: string; count: number; amount: number }[]; countLabel: string }>()
const max = computed(() => Math.max(1, ...props.rows.map((r) => r.amount)))
</script>

<template>
  <section class="card rank">
    <h2 class="rank__title">{{ title }}</h2>
    <ol v-if="rows.length" class="rank__list">
      <li v-for="r in rows" :key="r.name" class="rank__row">
        <span class="rank__top">
          <strong>{{ r.name }}</strong>
          <span class="money">{{ money(r.amount) }}</span>
        </span>
        <span class="rank__bar"><span :style="{ width: `${(r.amount / max) * 100}%` }"></span></span>
        <small>{{ r.count }} {{ countLabel }}</small>
      </li>
    </ol>
    <p v-else class="empty">Aún no hay datos.</p>
  </section>
</template>

<style scoped lang="scss">
.rank {
  &__title {
    font-size: $text-base;
    margin-bottom: 0.9rem;
  }

  &__list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }

  &__row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }

  &__top {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: $text-sm;

    strong {
      @include truncate;
    }

    .money {
      font-weight: 700;
    }
  }

  &__bar {
    height: 6px;
    border-radius: 6px;
    background: $sky-2;
    overflow: hidden;

    span {
      display: block;
      height: 100%;
      border-radius: 6px;
      background: linear-gradient(90deg, $navy, $orange);
    }
  }
}
</style>

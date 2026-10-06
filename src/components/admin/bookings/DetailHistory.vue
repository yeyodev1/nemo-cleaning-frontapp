<script setup lang="ts">
import { computed } from 'vue'
import { dateTime } from '@/utils/format'
import type { HistoryEntry } from '@/types/api'

const props = defineProps<{ history?: HistoryEntry[] }>()
const entries = computed(() => [...(props.history || [])].sort((a, b) => b.at.localeCompare(a.at)))
const who = (h: HistoryEntry) => (typeof h.by === 'string' ? h.by : h.by?.name || '')
</script>

<template>
  <section class="card hist">
    <h3>Historial</h3>
    <ol v-if="entries.length" class="hist__list">
      <li v-for="(h, i) in entries" :key="i" class="hist__item">
        <span class="hist__dot" aria-hidden="true"></span>
        <div>
          <strong>{{ h.action }}</strong>
          <p v-if="h.note" class="hist__note">{{ h.note }}</p>
          <small class="muted">{{ dateTime(h.at) }}<template v-if="who(h)"> · {{ who(h) }}</template></small>
        </div>
      </li>
    </ol>
    <p v-else class="muted">Sin movimientos.</p>
  </section>
</template>

<style scoped lang="scss">
.hist {
  h3 {
    font-size: $text-base;
    margin-bottom: 0.85rem;
  }

  &__list {
    list-style: none;
    position: relative;
    padding-left: 1.1rem;

    &::before {
      content: '';
      position: absolute;
      left: 4px;
      top: 6px;
      bottom: 6px;
      width: 2px;
      background: $line;
    }
  }

  &__item {
    position: relative;
    display: flex;
    gap: 0.6rem;
    padding-bottom: 0.9rem;
    font-size: $text-sm;
  }

  &__dot {
    position: absolute;
    left: -1.1rem;
    top: 0.35rem;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: $aqua;
    box-shadow: 0 0 0 3px $surface;
  }

  &__note {
    color: $ink-soft;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { BankAccount } from '@/types/api'

defineProps<{ accounts: BankAccount[]; amount?: string }>()
const copied = ref('')

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = text
    setTimeout(() => (copied.value = ''), 1800)
  } catch {
    /* sin portapapeles: el número sigue visible */
  }
}
</script>

<template>
  <div class="banks">
    <p v-if="amount && accounts.length" class="banks__amount">
      Transfiere <strong class="money">{{ amount }}</strong> a una de estas cuentas:
    </p>
    <p v-if="!accounts.length" class="banks__empty">
      Te enviaremos los datos bancarios por correo y WhatsApp.
    </p>
    <article v-for="a in accounts" :key="a.number" class="bank">
      <header class="bank__head">
        <AppIcon name="bank" :size="18" />
        <strong>{{ a.bank }}</strong>
        <span class="badge">{{ a.type }}</span>
      </header>
      <div class="bank__row">
        <span class="bank__number">{{ a.number }}</span>
        <button
          type="button"
          class="btn btn--soft btn--sm"
          :aria-label="`Copiar cuenta ${a.number}`"
          @click="copy(a.number)"
        >
          <AppIcon :name="copied === a.number ? 'check' : 'copy'" :size="16" />
          {{ copied === a.number ? 'Copiado' : 'Copiar' }}
        </button>
      </div>
      <p class="bank__holder">
        {{ a.holder }}<template v-if="a.documentId"> · {{ a.documentId }}</template>
      </p>
    </article>
    <span class="sr-only" aria-live="polite">{{ copied ? 'Número copiado' : '' }}</span>
  </div>
</template>

<style scoped lang="scss">
.banks {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__amount,
  &__empty {
    font-size: $text-sm;
    color: $ink-soft;
  }
}

.bank {
  padding: 0.85rem 1rem;
  border-radius: $radius-md;
  background: $surface;
  border: 1px solid $line;

  &__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: $navy;
    font-size: $text-sm;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin: 0.35rem 0 0.15rem;
  }

  &__number {
    font-size: $text-lg;
    font-weight: 800;
    letter-spacing: 0.04em;
    font-variant-numeric: tabular-nums;
  }

  &__holder {
    font-size: $text-xs;
    color: $ink-muted;
  }
}
</style>

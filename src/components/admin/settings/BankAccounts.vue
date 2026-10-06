<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import type { BankAccount } from '@/types/api'

/** Filas editables de cuentas bancarias (se muestran al cliente que paga por transferencia). */
const props = defineProps<{ modelValue: BankAccount[] }>()
const emit = defineEmits<{ 'update:modelValue': [v: BankAccount[]] }>()

const add = () => emit('update:modelValue', [...props.modelValue, { bank: '', type: 'Ahorros', number: '', holder: '', documentId: '' }])
const remove = (i: number) => emit('update:modelValue', props.modelValue.filter((_, j) => j !== i))
</script>

<template>
  <div class="banks">
    <article v-for="(a, i) in modelValue" :key="i" class="acc">
      <header class="acc__head">
        <strong>Cuenta {{ i + 1 }}</strong>
        <button type="button" class="btn btn--danger btn--sm" @click="remove(i)"><AppIcon name="trash" /> Quitar</button>
      </header>
      <div class="form-row">
        <label class="field"><span class="field__label">Banco</span><input v-model="a.bank" type="text" required placeholder="Banco Pichincha" /></label>
        <label class="field">
          <span class="field__label">Tipo</span>
          <select v-model="a.type">
            <option>Ahorros</option>
            <option>Corriente</option>
          </select>
        </label>
      </div>
      <div class="form-row">
        <label class="field"><span class="field__label">Número</span><input v-model="a.number" type="text" inputmode="numeric" required /></label>
        <label class="field"><span class="field__label">Cédula / RUC del titular</span><input v-model="a.documentId" type="text" inputmode="numeric" /></label>
      </div>
      <label class="field"><span class="field__label">Titular</span><input v-model="a.holder" type="text" required /></label>
    </article>
    <button type="button" class="btn btn--ghost" @click="add"><AppIcon name="plus" /> Agregar cuenta</button>
  </div>
</template>

<style scoped lang="scss">
.banks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: stretch;

  > .btn {
    align-self: flex-start;
  }
}

.acc {
  padding: 0.9rem;
  border-radius: $radius-md;
  background: $sky;
  border: 1px solid $line;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>

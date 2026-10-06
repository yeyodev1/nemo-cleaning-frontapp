<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const props = defineProps<{ modelValue: string[] }>()
const emit = defineEmits<{ 'update:modelValue': [v: string[]] }>()
const draft = ref('')
const error = ref('')

function add() {
  const email = draft.value.trim().toLowerCase()
  if (!email) return
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.value = 'Correo no válido'
    return
  }
  error.value = ''
  if (!props.modelValue.includes(email)) emit('update:modelValue', [...props.modelValue, email])
  draft.value = ''
}

const remove = (e: string) => emit('update:modelValue', props.modelValue.filter((x) => x !== e))
</script>

<template>
  <div class="chips">
    <ul v-if="modelValue.length" class="chips__list">
      <li v-for="e in modelValue" :key="e" class="chips__chip">
        {{ e }}
        <button type="button" :aria-label="`Quitar ${e}`" @click="remove(e)"><AppIcon name="x" :size="14" /></button>
      </li>
    </ul>
    <p v-else class="field__hint">Nadie recibe avisos todavía.</p>
    <div class="chips__add">
      <label class="sr-only" for="notify-email">Agregar correo</label>
      <input id="notify-email" v-model="draft" type="email" placeholder="correo@nemocleaning.ec" :aria-invalid="Boolean(error)" @keydown.enter.prevent="add" />
      <button type="button" class="btn btn--soft" @click="add"><AppIcon name="plus" /> Agregar</button>
    </div>
    <span v-if="error" class="field__error">{{ error }}</span>
  </div>
</template>

<style scoped lang="scss">
.chips {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;

  &__list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  &__chip {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.2rem 0.2rem 0.2rem 0.75rem;
    border-radius: $radius-pill;
    background: $navy-soft;
    color: $navy;
    font-size: $text-sm;
    font-weight: 600;

    button {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: rgba($navy, 0.12);
      }
    }
  }

  &__add {
    display: flex;
    gap: 0.5rem;

    input {
      flex: 1;
      min-width: 0;
    }
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { authService } from '@/services/auth.service'
import { useUserStore } from '@/stores/user'
import { useToastStore } from '@/stores/toast'
import { roleLabel } from '@/config/labels'
import { errorMessage } from '@/utils/format'

const user = useUserStore()
const toast = useToastStore()
const current = ref('')
const next = ref('')
const confirm = ref('')
const busy = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (next.value.length < 8) return (error.value = 'La nueva contraseña debe tener al menos 8 caracteres')
  if (next.value !== confirm.value) return (error.value = 'Las contraseñas no coinciden')
  busy.value = true
  try {
    await authService.changePassword(current.value, next.value)
    toast.success('Contraseña actualizada')
    current.value = next.value = confirm.value = ''
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="account">
    <section v-if="user.user" class="card account__me">
      <span class="account__avatar">{{ user.user.name.charAt(0) }}</span>
      <div>
        <h2>{{ user.user.name }}</h2>
        <p class="muted">{{ user.user.email }} · {{ roleLabel[user.user.role] }}</p>
      </div>
    </section>

    <form class="card account__form" @submit.prevent="submit">
      <h2>Cambiar contraseña</h2>
      <label class="field">
        <span class="field__label">Contraseña actual</span>
        <input v-model="current" type="password" autocomplete="current-password" required />
      </label>
      <label class="field">
        <span class="field__label">Nueva contraseña</span>
        <input v-model="next" type="password" autocomplete="new-password" minlength="8" required />
        <span class="field__hint">Mínimo 8 caracteres.</span>
      </label>
      <label class="field">
        <span class="field__label">Repite la nueva contraseña</span>
        <input v-model="confirm" type="password" autocomplete="new-password" required />
      </label>
      <p v-if="error" class="field__error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn--primary" :disabled="busy">{{ busy ? 'Guardando…' : 'Guardar contraseña' }}</button>
    </form>
  </div>
</template>

<style scoped lang="scss">
.account {
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &__me {
    display: flex;
    align-items: center;
    gap: 1rem;

    h2 {
      font-size: $text-lg;
    }
  }

  &__avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: $aqua;
    color: $navy-ink;
    font-weight: 800;
    font-size: 1.3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 0.9rem;

    h2 {
      font-size: $text-lg;
    }

    .btn {
      align-self: flex-start;
    }
  }
}
</style>

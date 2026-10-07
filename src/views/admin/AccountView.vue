<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import { useUserStore } from '@/stores/user'
import { roleLabel } from '@/config/labels'

const user = useUserStore()
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

    <!-- Ya no hay contraseña que cambiar: el acceso es con un código al correo. -->
    <section class="card account__note">
      <AppIcon name="lock" :size="20" />
      <p>
        Ingresas con un código de 6 dígitos que te enviamos a tu correo cada vez. Si cambias de correo, pídele a
        gerencia que lo actualice en Personal.
      </p>
    </section>
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
    background: $orange;
    color: $navy-ink;
    font-weight: 800;
    font-size: 1.3rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  &__note {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    color: $ink-soft;
    font-size: $text-sm;

    svg {
      flex-shrink: 0;
      color: $navy;
    }
  }
}
</style>

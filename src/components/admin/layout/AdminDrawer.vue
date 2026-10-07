<script setup lang="ts">
import BaseSheet from '@/components/ui/BaseSheet.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { roleLabel } from '@/config/labels'
import { useAdminNav } from './useAdminNav'

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const { rest, isActive, logout, user, badgeOf } = useAdminNav()
</script>

<template>
  <BaseSheet :open="open" title="Más opciones" @close="emit('close')">
    <p v-if="user.user" class="drawer__who">
      {{ user.user.name }} · <span>{{ roleLabel[user.user.role] }}</span>
    </p>
    <nav class="drawer__grid">
      <template v-for="(i, n) in rest" :key="i.to">
      <span v-if="i.group && i.group !== rest[n - 1]?.group" class="drawer__group">{{ i.group }}</span>
      <RouterLink
        :to="i.to"
        :style="{ '--i': n }"
        class="drawer__item"
        :class="{ 'is-active': isActive(i.to) }"
        @click="emit('close')"
      >
        <AppIcon :name="i.icon" :size="22" />
        <span>{{ i.label }}</span>
        <span v-if="badgeOf(i)" class="drawer__badge">{{ badgeOf(i) }}</span>
      </RouterLink>
      </template>
    </nav>
    <div class="drawer__foot">
      <a href="/" target="_blank" rel="noopener" class="btn btn--ghost btn--block">
        <AppIcon name="external" /> Ver sitio público
      </a>
      <button type="button" class="btn btn--danger btn--block" @click="logout">
        <AppIcon name="logout" /> Cerrar sesión
      </button>
    </div>
  </BaseSheet>
</template>

<style scoped lang="scss">
.drawer {
  &__who {
    font-weight: 700;
    margin-bottom: 1rem;

    span {
      color: $ink-muted;
      font-weight: 500;
    }
  }

  &__grid {
    @include flex-cards(130px, 0.6rem);
  }

  // Encabezado de sección (Finanzas, Comercial): ocupa toda la fila de la grilla.
  &__group {
    flex: 1 1 100% !important;
    margin-top: 0.5rem;
    font-size: $text-xs;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: $ink-muted;
  }

  // Cascada al abrir (la hoja ya sube; los accesos aparecen detrás, 30 ms cada uno).
  &__item {
    animation: drawer-in $dur $ease-out both;
    animation-delay: calc(80ms + var(--i, 0) * 30ms);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.9rem;
    min-height: 84px;
    border-radius: $radius-md;
    background: $sky;
    border: 1px solid $line;
    font-weight: 700;
    font-size: $text-sm;
    color: $ink;

    svg {
      color: $navy;
    }

    &.is-active {
      border-color: $orange;
      background: $orange-soft;
    }
  }

  &__item {
    position: relative;
  }

  &__badge {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    min-width: 24px;
    height: 24px;
    padding: 0 7px;
    border-radius: $radius-pill;
    background: $whatsapp;
    color: #fff;
    font-size: $text-xs;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  &__foot {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
}

@keyframes drawer-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
</style>

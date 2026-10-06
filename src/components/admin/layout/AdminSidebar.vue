<script setup lang="ts">
import BrandLogo from '@/components/brand/BrandLogo.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { roleLabel } from '@/config/labels'
import { useAdminNav } from './useAdminNav'

const { items, isActive, logout, user } = useAdminNav()
</script>

<template>
  <aside class="side" aria-label="Menú del panel">
    <RouterLink :to="user.home" class="side__brand"><BrandLogo light :height="34" /></RouterLink>
    <nav class="side__nav">
      <RouterLink
        v-for="i in items"
        :key="i.to"
        :to="i.to"
        class="side__link"
        :class="{ 'is-active': isActive(i.to) }"
        :aria-current="isActive(i.to) ? 'page' : undefined"
      >
        <AppIcon :name="i.icon" :size="19" /> {{ i.label }}
      </RouterLink>
    </nav>
    <div v-if="user.user" class="side__user">
      <span class="side__avatar">{{ user.user.name.charAt(0) }}</span>
      <span class="side__who">
        <strong>{{ user.user.name }}</strong>
        <small>{{ roleLabel[user.user.role] }}</small>
      </span>
      <button type="button" class="side__out" aria-label="Cerrar sesión" @click="logout">
        <AppIcon name="logout" :size="18" />
      </button>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.side {
  display: none;

  @include from('lg') {
    position: sticky;
    top: 0;
    height: 100vh;
    width: 248px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: linear-gradient(180deg, $navy-deep, $navy-ink);
    color: $on-dark-soft;
    padding: 1.25rem 0.85rem;
  }

  &__brand {
    padding: 0.25rem 0.6rem 1.25rem;
  }

  &__nav {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__link {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 42px;
    padding: 0 0.75rem;
    border-radius: $radius-sm;
    font-size: $text-sm;
    font-weight: 600;
    transition: background 0.2s, color 0.2s;

    &:hover {
      background: rgba(#fff, 0.06);
      color: #fff;
    }

    &.is-active {
      background: rgba($aqua, 0.16);
      color: #fff;

      svg {
        color: $aqua;
      }
    }
  }

  &__user {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.85rem 0.5rem 0;
    margin-top: 0.75rem;
    border-top: 1px solid rgba(#fff, 0.1);
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $aqua;
    color: $navy-ink;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
  }

  &__who {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    line-height: 1.25;

    strong {
      color: #fff;
      font-size: $text-sm;
      @include truncate;
    }

    small {
      font-size: $text-xs;
    }
  }

  &__out {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(#fff, 0.08);
      color: #fff;
    }
  }
}
</style>

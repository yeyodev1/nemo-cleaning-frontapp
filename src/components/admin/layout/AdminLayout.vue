<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminSidebar from './AdminSidebar.vue'
import AdminTabBar from './AdminTabBar.vue'
import AdminDrawer from './AdminDrawer.vue'
import BranchSelect from '../common/BranchSelect.vue'
import NemoLogo from '@/components/brand/NemoLogo.vue'
import { useAdminScope } from '@/stores/adminScope'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const scope = useAdminScope()
const user = useUserStore()
const drawer = ref(false)

const title = computed(() => route.meta.title || 'Panel')
onMounted(() => {
  if (!user.isOperator) scope.load()
})
watch(() => route.path, () => (drawer.value = false))
</script>

<template>
  <div class="admin">
    <AdminSidebar />

    <div class="admin__main">
      <header class="admin__top">
        <RouterLink :to="user.home" class="admin__logo" aria-label="Inicio del panel">
          <NemoLogo variant="dark" :height="38" />
        </RouterLink>
        <h1 class="admin__title">{{ title }}</h1>
        <BranchSelect v-if="!user.isOperator" class="admin__branch" />
      </header>

      <div class="admin__content">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="page" mode="out-in">
            <div :key="r.path">
              <!-- Título y para qué sirve la pantalla (en el celular el título no cabe arriba). -->
              <div v-if="r.meta.purpose" class="admin__head">
                <h2 class="admin__h">{{ r.meta.title }}</h2>
                <p v-if="r.meta.purpose" class="admin__purpose">{{ r.meta.purpose }}</p>
              </div>
              <component :is="Component" />
            </div>
          </Transition>
        </RouterView>
      </div>
    </div>

    <AdminTabBar @more="drawer = true" />
    <AdminDrawer :open="drawer" @close="drawer = false" />
  </div>
</template>

<style scoped lang="scss">
.admin {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: $paper;

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__top {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.55rem 1rem;
    padding-top: calc(0.55rem + env(safe-area-inset-top));
    background: $navy;
    color: #fff;
    border-bottom: 3px solid $orange;

    @include from('lg') {
      padding: 0.9rem 2rem;
    }
  }

  &__logo {
    @include from('lg') {
      display: none;
    }
  }

  &__title {
    flex: 1;
    min-width: 0;
    color: #fff;
    font-family: $font-ui;
    font-weight: 600;
    font-size: $text-base;
    @include truncate;

    @include from('lg') {
      font-size: $text-xl;
    }
  }

  // En el celular la barra marina solo lleva logo + sucursal: el título va en el contenido.
  &__title {
    @include until('lg') {
      visibility: hidden;
    }
  }

  &__head {
    margin-bottom: 1rem;
  }

  &__h {
    @include display;
    font-size: $text-xl;
    line-height: 1.15;
    color: $navy;

    @include from('lg') {
      display: none;
    }
  }

  &__purpose {
    margin-top: 0.2rem;
    font-size: $text-sm;
    color: $ink-muted;
    max-width: 70ch;
  }

  &__branch {
    flex-shrink: 0;
  }

  &__content {
    flex: 1;
    width: 100%;
    max-width: 1320px;
    margin-inline: auto;
    padding: 1rem 1rem calc(84px + env(safe-area-inset-bottom));

    @include from('md') {
      padding: 1.5rem 1.75rem 96px;
    }

    @include from('lg') {
      padding: 1.75rem 2rem 3rem;
    }
  }
}
</style>

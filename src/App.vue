<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import TheHeader from '@/layout/TheHeader.vue'
import TheFooter from '@/layout/TheFooter.vue'
import ToastList from '@/components/ui/ToastList.vue'

const route = useRoute()
// "admin" y "bare" traen su propio marco; "focus" (wizards) oculta el footer.
const layout = computed(() => route.meta.layout || 'public')
const isFocus = computed(() => Boolean(route.meta.focus))
</script>

<template>
  <div class="app" :class="[`app--${layout}`, { 'app--focus': isFocus }]">
    <a href="#contenido" class="skip">Saltar al contenido</a>
    <TheHeader v-if="layout === 'public'" :minimal="isFocus" />
    <main id="contenido" class="app__main">
      <RouterView v-slot="{ Component, route: r }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="r.meta.layout === 'admin' ? 'admin' : r.path" />
        </Transition>
      </RouterView>
    </main>
    <TheFooter v-if="layout === 'public' && !isFocus" />
    <ToastList />
  </div>
</template>

<style scoped lang="scss">
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;

  &__main {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &--public &__main {
    padding-top: var(--header-h);
  }
}

.skip {
  position: absolute;
  left: 1rem;
  top: -60px;
  z-index: 300;
  padding: 0.6rem 1rem;
  border-radius: $radius-sm;
  background: $navy;
  color: #fff;
  font-weight: 700;

  &:focus {
    top: 0.75rem;
  }
}
</style>

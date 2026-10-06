<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

/** Barra fija inferior en móvil: aparece al pasar el hero y se oculta al llegar al footer. */
const visible = ref(false)

function onScroll() {
  const nearBottom = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 420
  visible.value = window.scrollY > window.innerHeight * 0.7 && !nearBottom
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="slide-up">
    <div v-if="visible" class="sticky">
      <RouterLink to="/reservar" class="btn btn--primary btn--lg btn--block">
        Reserva tu limpieza <AppIcon name="arrow-right" />
      </RouterLink>
    </div>
  </Transition>
</template>

<style scoped lang="scss">
.sticky {
  position: fixed;
  inset: auto 0 0;
  z-index: 40;
  padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
  background: rgba(#fff, 0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid $line;
  box-shadow: 0 -8px 24px rgba($navy-ink, 0.08);

  @include from('md') {
    display: none;
  }
}
</style>

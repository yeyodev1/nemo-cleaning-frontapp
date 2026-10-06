<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; text?: string; id?: string; light?: boolean }>()
</script>

<template>
  <header class="head" :class="{ 'head--light': light }">
    <p class="head__eyebrow">{{ eyebrow }}</p>
    <h2 :id="id" class="head__title">{{ title }}</h2>
    <p v-if="text" class="head__text">{{ text }}</p>
  </header>
</template>

<style scoped lang="scss">
.head {
  max-width: 640px;
  margin-bottom: 2rem;

  &__eyebrow {
    @include eyebrow;
    margin-bottom: 0.6rem;
  }

  &__title {
    @include display($display-sm);
  }

  &__text {
    margin-top: 0.75rem;
    color: $ink-soft;
  }

  &--light {
    .head__eyebrow {
      color: $aqua;
    }

    .head__title {
      color: #fff;
    }

    .head__text {
      color: $on-dark-soft;
    }
  }
}
</style>

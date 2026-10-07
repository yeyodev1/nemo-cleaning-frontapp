<script setup lang="ts">
/** Encabezado de sección al estilo del catálogo: eyebrow + título en MAYÚSCULAS. `light` = sobre fondo oscuro. */
defineProps<{ eyebrow?: string; title: string; text?: string; id?: string; light?: boolean; center?: boolean }>()
</script>

<template>
  <header v-reveal class="head" :class="{ 'head--light': light, 'head--center': center }">
    <p v-if="eyebrow" class="head__eyebrow">{{ eyebrow }}</p>
    <h2 :id="id" class="head__title">{{ title }}</h2>
    <p v-if="text" class="head__text">{{ text }}</p>
  </header>
</template>

<style scoped lang="scss">
.head {
  max-width: 680px;
  margin-bottom: 2rem;

  &__eyebrow {
    @include eyebrow;
    margin-bottom: 0.5rem;
  }

  &__title {
    @include display($display-md, 700);
    color: $navy;
    @include orange-underline;
  }

  &__text {
    margin-top: 0.75rem;
    color: $ink-soft;
  }

  &--light {
    .head__eyebrow {
      color: $on-dark-soft;
    }

    .head__title {
      color: #fff;
    }

    .head__text {
      color: $on-dark-soft;
    }
  }

  &--center {
    margin-inline: auto;
    text-align: center;

    .head__title::after {
      margin-inline: auto;
    }
  }
}
</style>

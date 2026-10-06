<template>
  <div class="filters"><slot /></div>
</template>

<style scoped lang="scss">
.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;

  > :deep(*) {
    flex: 1 1 150px;
    min-width: 0;
  }

  :deep(.field__label) {
    font-size: $text-xs;
  }
}
</style>

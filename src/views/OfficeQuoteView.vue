<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import OfficeSpaceFields from '@/components/office/OfficeSpaceFields.vue'
import OfficeContactFields from '@/components/office/OfficeContactFields.vue'
import OfficeSummary from '@/components/office/OfficeSummary.vue'
import OfficeSuccess from '@/components/office/OfficeSuccess.vue'
import { useOfficeQuote } from '@/composables/office/useOfficeQuote'

const { catalog, form, errors, sending, result, preview, submit, reset } = useOfficeQuote()
</script>

<template>
  <div class="office">
    <div class="office__inner">
      <OfficeSuccess v-if="result" :quote="result" @again="reset" />

      <template v-else>
        <header class="office__head">
          <p class="office__eyebrow"><AppIcon name="building" :size="16" /> NEMO HOME &amp; OFFICE</p>
          <h1>Cotiza la limpieza de tu oficina</h1>
          <p>Limpieza general, aspirado, desinfección de sanitarios, ozonificación, limpieza de ventanales y aromatización. Indica los m² y el plan para ver el estimado con las tarifas del catálogo.</p>
        </header>

        <div class="office__layout">
          <form class="office__form" novalidate @submit.prevent="submit">
            <section class="office__card">
              <OfficeSpaceFields
                :form="form"
                :branches="catalog.branches"
                :errors="errors"
                :pricing="catalog.settings?.officePricing || null"
              />
            </section>
            <section class="office__card">
              <OfficeContactFields :form="form" :errors="errors" />
            </section>
            <p v-if="catalog.error" class="office__warn" role="alert">
              <AppIcon name="alert" :size="18" /> {{ catalog.error }}
            </p>
            <button type="submit" class="sr-only">Enviar cotización</button>
          </form>

          <div class="office__side">
            <OfficeSummary :preview="preview" :sending="sending" @submit="submit" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.office {
  background: linear-gradient(180deg, $sky 0%, $paper 40%);
  flex: 1;

  &__inner {
    @include container;
    padding-block: 1.75rem calc(10rem + env(safe-area-inset-bottom));

    @include from('lg') {
      padding-block: 3rem 4rem;
    }
  }

  &__head {
    max-width: 640px;
    margin-bottom: 1.5rem;

    h1 {
      @include display($display-sm);
    }

    p {
      margin-top: 0.6rem;
      color: $ink-soft;
    }
  }

  &__eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    @include eyebrow;
    margin-bottom: 0.6rem;
  }

  &__layout {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    @include from('lg') {
      flex-direction: row;
      align-items: flex-start;
      gap: 2rem;
    }
  }

  &__form {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__side {
    @include from('lg') {
      width: 360px;
      flex-shrink: 0;
      align-self: stretch;
    }
  }

  &__card {
    @include card(1.25rem);
    box-shadow: $shadow-sm;

    @include from('md') {
      padding: 1.75rem;
    }
  }

  &__warn {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    padding: 0.8rem 1rem;
    border-radius: $radius-md;
    background: $warning-bg;
    color: $warning;
    font-size: $text-sm;
    font-weight: 600;
  }
}
</style>

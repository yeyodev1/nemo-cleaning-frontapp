<script setup lang="ts">
import { useTemplateRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StepProgress from '@/components/booking/StepProgress.vue'
import StepBranch from '@/components/booking/StepBranch.vue'
import StepServices from '@/components/booking/StepServices.vue'
import StepSchedule from '@/components/booking/StepSchedule.vue'
import StepDetails from '@/components/booking/StepDetails.vue'
import StepPayment from '@/components/booking/StepPayment.vue'
import BookingSummary from '@/components/booking/BookingSummary.vue'
import BookingBar from '@/components/booking/BookingBar.vue'
import BookingSuccess from '@/components/booking/BookingSuccess.vue'
import { draft } from '@/composables/booking/useBookingDraft'
import { useBookingWizard } from '@/composables/booking/useBookingWizard'

const heading = useTemplateRef<HTMLElement>('step-heading')
const { error, isLast, title, actionLabel, next, back, again, sending, result, canSubmit } =
  useBookingWizard(heading)
</script>

<template>
  <div class="wizard">
    <BookingSuccess v-if="result" :result="result" @again="again" />

    <template v-else>
      <div class="wizard__grid">
        <div class="wizard__main">
          <StepProgress :step="draft.step" />
          <header class="wizard__head">
            <button type="button" class="wizard__back" aria-label="Volver" @click="back">
              <AppIcon name="arrow-left" />
            </button>
            <h1 ref="step-heading" tabindex="-1" class="wizard__title">{{ title }}</h1>
          </header>

          <Transition name="page" mode="out-in">
            <StepBranch v-if="draft.step === 1" />
            <StepServices v-else-if="draft.step === 2" />
            <StepSchedule v-else-if="draft.step === 3" />
            <StepDetails v-else-if="draft.step === 4" />
            <StepPayment v-else />
          </Transition>

          <p v-if="error" class="wizard__error" role="alert">
            <AppIcon name="alert" :size="18" /> {{ error }}
          </p>
        </div>

        <div class="wizard__side">
          <BookingSummary>
            <button
              type="button"
              class="btn btn--primary btn--lg btn--block"
              :disabled="(isLast && !canSubmit) || sending"
              @click="next"
            >
              {{ sending ? 'Enviando…' : actionLabel }}
              <AppIcon v-if="!sending" name="arrow-right" />
            </button>
          </BookingSummary>
        </div>
      </div>

      <BookingBar
        :label="isLast ? 'Confirmar' : 'Continuar'"
        :disabled="isLast && !canSubmit"
        :busy="sending"
        @next="next"
      />
    </template>
  </div>
</template>

<style scoped lang="scss">
.wizard {
  @include container(1080px);
  padding-top: 1.25rem;
  padding-bottom: calc(110px + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, $sky 0, $paper 320px);

  @include from('lg') {
    padding-top: 2rem;
    padding-bottom: 4rem;
  }

  &__grid {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__side {
    display: none;

    @include from('lg') {
      display: block;
      width: 340px;
      flex-shrink: 0;
      position: sticky;
      top: calc(var(--header-h) + 1.5rem);
    }
  }

  &__head {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__back {
    width: $tap;
    height: $tap;
    flex-shrink: 0;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: $surface;
    border: 1px solid $line;
    color: $navy;
  }

  &__title {
    @include display($display-sm);
    outline: none;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.8rem 1rem;
    border-radius: $radius-md;
    background: $danger-bg;
    color: $danger;
    font-weight: 600;
    font-size: $text-sm;
  }
}
</style>

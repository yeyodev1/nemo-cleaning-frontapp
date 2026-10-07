<script setup lang="ts">
import AppIcon from '@/components/ui/AppIcon.vue'
import NemoLogo from '@/components/brand/NemoLogo.vue'
import { site } from '@/config/site'
import { whatsappUrl } from '@/utils/format'

const wa = whatsappUrl(site.whatsapp, 'Hola Nemo, quiero información de sus servicios')
</script>

<template>
  <section class="cta" aria-labelledby="cta-title">
    <div class="cta__inner">
      <NemoLogo variant="light" :height="130" class="cta__logo" />
      <div v-reveal class="cta__copy">
        <h2 id="cta-title">{{ site.slogan }}</h2>
        <div class="cta__actions">
          <RouterLink to="/reservar" class="btn btn--accent btn--lg">Reservar <AppIcon name="arrow-right" /></RouterLink>
          <a :href="wa" target="_blank" rel="noopener" class="btn btn--primary btn--lg">
            <AppIcon name="whatsapp" /> {{ site.whatsappDisplay }}
          </a>
          <a :href="site.instagram" target="_blank" rel="noopener" class="btn btn--ghost btn--lg">
            <AppIcon name="instagram" /> {{ site.instagramHandle }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.cta {
  background: $sky;
  border-top: 1px solid $line;
  padding: 3.5rem 0;

  &__inner {
    @include container;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;

    @include from('md') {
      flex-direction: row;
      align-items: center;
      gap: 3rem;
    }
  }

  h2 {
    @include display($display-md);
    color: $navy;
    @include orange-underline;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }
}
</style>

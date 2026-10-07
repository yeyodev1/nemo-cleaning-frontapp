<script setup lang="ts">
import HomeHero from '@/components/home/HomeHero.vue'
import HomeMarquee from '@/components/home/HomeMarquee.vue'
import HomeLines from '@/components/home/HomeLines.vue'
import HomeLine from '@/components/home/HomeLine.vue'
import HomeBeforeAfter from '@/components/home/HomeBeforeAfter.vue'
import HomePackages from '@/components/home/HomePackages.vue'
import HomeSteps from '@/components/home/HomeSteps.vue'
import HomeCoverage from '@/components/home/HomeCoverage.vue'
import HomeFaq from '@/components/home/HomeFaq.vue'
import HomeCta from '@/components/home/HomeCta.vue'
import StickyCta from '@/components/home/StickyCta.vue'
import { lines } from '@/config/landing'
import { useCatalogStore } from '@/stores/catalog'

useCatalogStore().load()
const [car, home] = lines
</script>

<template>
  <div class="home">
    <HomeHero />
    <HomeMarquee />
    <HomeLines />
    <HomeBeforeAfter />
    <HomeLine v-if="car" :line="car" />
    <HomePackages />
    <HomeLine v-if="home" :line="home" />
    <HomeSteps />
    <HomeCoverage />
    <HomeFaq />
    <HomeCta />
    <StickyCta />
  </div>
</template>

<style scoped>
/* Ninguna sección (carruseles, parallax, radar) puede ensanchar la página. */
.home {
  overflow-x: clip;
}
</style>

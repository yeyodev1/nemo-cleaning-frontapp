<script setup lang="ts">
import HomeHero from '@/components/home/HomeHero.vue'
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
    <HomeLine v-if="car" :line="car" />
    <HomeBeforeAfter />
    <HomeLine v-if="home" :line="home" />
    <HomePackages />
    <HomeSteps />
    <HomeCoverage />
    <HomeFaq />
    <HomeCta />
    <StickyCta />
  </div>
</template>

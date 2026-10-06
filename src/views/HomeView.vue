<script setup lang="ts">
import HomeHero from '@/components/home/HomeHero.vue'
import HomeCategories from '@/components/home/HomeCategories.vue'
import HomeSteps from '@/components/home/HomeSteps.vue'
import HomeBranches from '@/components/home/HomeBranches.vue'
import HomePayments from '@/components/home/HomePayments.vue'
import HomeFaq from '@/components/home/HomeFaq.vue'
import HomeCta from '@/components/home/HomeCta.vue'
import StickyCta from '@/components/home/StickyCta.vue'
import { useCatalogStore } from '@/stores/catalog'

useCatalogStore().load()
</script>

<template>
  <div class="home">
    <HomeHero />
    <HomeCategories />
    <HomeSteps />
    <HomeBranches />
    <HomePayments />
    <HomeFaq />
    <HomeCta />
    <StickyCta />
  </div>
</template>

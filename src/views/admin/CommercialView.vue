<script setup lang="ts">
import { ref } from 'vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import PageIntro from '@/components/admin/sheet/PageIntro.vue'
import ZonesTab from '@/components/admin/commercial/ZonesTab.vue'
import FrequencyTab from '@/components/admin/commercial/FrequencyTab.vue'
import PortfolioTab from '@/components/admin/commercial/PortfolioTab.vue'

const tab = ref('zonas')
const tabs = [
  { value: 'zonas', label: 'Por zona' },
  { value: 'frecuencia', label: 'Frecuencia' },
  { value: 'potenciales', label: 'Potenciales' },
  { value: 'cartera', label: 'Cartera' },
]
</script>

<template>
  <section>
    <PageIntro text="Gestión comercial: dónde atendemos más (REP ZONA), cuántas veces vuelven los clientes, a quién ofrecer plan mensual y a quién recuperar." />
    <SegTabs v-model="tab" :tabs="tabs" />
    <Transition name="fade" mode="out-in">
      <ZonesTab v-if="tab === 'zonas'" key="z" />
      <FrequencyTab v-else-if="tab === 'frecuencia'" key="f" />
      <FrequencyTab v-else-if="tab === 'potenciales'" key="p" potential />
      <PortfolioTab v-else key="c" />
    </Transition>
  </section>
</template>

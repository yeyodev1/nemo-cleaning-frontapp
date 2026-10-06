<script setup lang="ts">
import { onMounted, ref, toRef } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import Pagination from '@/components/admin/common/Pagination.vue'
import SegTabs from '@/components/admin/finance/SegTabs.vue'
import QuoteSheet from '@/components/admin/quotes/QuoteSheet.vue'
import { usePagedList } from '@/composables/admin/usePagedList'
import { managementService } from '@/services/management.service'
import { useAdminScope } from '@/stores/adminScope'
import { officeFrequency, officeQuoteStatus } from '@/config/labels'
import { dateTime, money } from '@/utils/format'
import type { OfficeQuote, OfficeQuoteStatus } from '@/types/api'

const scope = useAdminScope()
const branch = toRef(scope, 'branch')
const { filters, items, page, pages, total, loading, load } = usePagedList(
  (q) => managementService.officeQuotes({ ...q, branch: scope.query }),
  { status: '' as OfficeQuoteStatus | '' },
  [branch],
)
onMounted(() => load(1))

const tabs = [
  { value: '', label: 'Todas' },
  ...(Object.keys(officeQuoteStatus) as OfficeQuoteStatus[]).map((k) => ({ value: k, label: officeQuoteStatus[k].label })),
]
const selected = ref<OfficeQuote | null>(null)
function onChanged(q: OfficeQuote) {
  selected.value = q
  items.value = items.value.map((x) => (x._id === q._id ? q : x))
}
</script>

<template>
  <section>
    <SegTabs v-model="filters.status" :tabs="tabs" />
    <div v-if="loading && !items.length" class="rows"><span v-for="i in 4" :key="i" class="skeleton" style="height: 84px"></span></div>
    <p v-else-if="!items.length" class="empty">No hay cotizaciones.</p>
    <ul v-else class="rows">
      <li v-for="q in items" :key="q._id">
        <button type="button" class="qc" @click="selected = q">
          <span class="qc__icon" aria-hidden="true"><AppIcon name="building" /></span>
          <span class="qc__main">
            <strong>{{ q.contact.company || q.contact.name }}</strong>
            <span class="qc__meta">{{ q.code }} · {{ q.squareMeters }} m² · {{ q.chairs }} sillas · {{ officeFrequency[q.frequency] }}</span>
            <span class="qc__meta">{{ dateTime(q.createdAt) }}</span>
          </span>
          <span class="qc__end">
            <strong class="money">{{ money(q.estimate) }}</strong>
            <StatusBadge :tone="officeQuoteStatus[q.status].tone" :label="officeQuoteStatus[q.status].label" />
          </span>
        </button>
      </li>
    </ul>
    <Pagination :page="page" :pages="pages" :total="total" @go="load" />
    <QuoteSheet :quote="selected" @close="selected = null" @changed="onChanged" />
  </section>
</template>

<style scoped lang="scss">
.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.qc {
  @include card(0.85rem 0.9rem);
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-align: left;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: $navy;
    box-shadow: $shadow-sm;
  }

  &__icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    background: $navy-soft;
    color: $navy;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;

    strong {
      @include truncate;
    }
  }

  &__meta {
    font-size: $text-xs;
    color: $ink-muted;
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.25rem;
  }
}
</style>

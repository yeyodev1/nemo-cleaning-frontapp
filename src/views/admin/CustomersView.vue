<script setup lang="ts">
import { onMounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import Pagination from '@/components/admin/common/Pagination.vue'
import { usePagedList } from '@/composables/admin/usePagedList'
import { managementService } from '@/services/management.service'
import { money } from '@/utils/format'

const { filters, items, page, pages, total, loading, load } = usePagedList((q) => managementService.customers(q), { q: '' })
onMounted(() => load(1))
</script>

<template>
  <section>
    <label class="search">
      <AppIcon name="search" class="search__icon" />
      <span class="sr-only">Buscar cliente</span>
      <input v-model="filters.q" type="search" placeholder="Nombre, correo, teléfono o cédula" />
    </label>

    <div v-if="loading && !items.length" class="rows"><span v-for="i in 6" :key="i" class="skeleton" style="height: 68px"></span></div>
    <p v-else-if="!items.length" class="empty">{{ filters.q ? 'Sin resultados para esa búsqueda.' : 'Aún no hay clientes.' }}</p>
    <ul v-else class="rows">
      <li v-for="c in items" :key="c._id">
        <RouterLink :to="`/admin/clientes/${c._id}`" class="cc">
          <span class="cc__avatar" aria-hidden="true">{{ c.name.charAt(0) }}</span>
          <span class="cc__main">
            <strong>{{ c.name }}</strong>
            <span class="cc__meta">{{ c.phone }}<template v-if="c.email"> · {{ c.email }}</template></span>
          </span>
          <span class="cc__end">
            <strong class="money">{{ money(c.totalSpent) }}</strong>
            <small>{{ c.totalOrders }} pedido(s)</small>
          </span>
        </RouterLink>
      </li>
    </ul>
    <Pagination :page="page" :pages="pages" :total="total" @go="load" />
  </section>
</template>

<style scoped lang="scss">
.search {
  position: relative;
  display: block;
  margin-bottom: 1rem;

  &__icon {
    position: absolute;
    left: 0.9rem;
    top: 50%;
    transform: translateY(-50%);
    color: $ink-muted;
  }

  input {
    padding-left: 2.6rem;
    border-radius: $radius-pill;
  }
}

.rows {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cc {
  @include card(0.75rem 0.9rem);
  display: flex;
  align-items: center;
  gap: 0.75rem;

  &:hover {
    border-color: $navy;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: $aqua-soft;
    color: $aqua-ink;
    font-weight: 800;
    text-transform: uppercase;
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
    @include truncate;
  }

  &__end {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    small {
      font-size: $text-xs;
      color: $ink-muted;
    }
  }
}
</style>

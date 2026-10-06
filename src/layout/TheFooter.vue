<script setup lang="ts">
import BrandLogo from '@/components/brand/BrandLogo.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useCatalogStore } from '@/stores/catalog'
import { site } from '@/config/site'
import { whatsappUrl } from '@/utils/format'

const catalog = useCatalogStore()
catalog.load()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <BrandLogo light :height="36" />
        <p>Limpieza profesional a domicilio en Guayaquil, Samborondón y Vía a la Costa. Tapicería, colchones, muebles, alfombras, hogares y oficinas.</p>
      </div>

      <div class="footer__col">
        <h3>Sucursales</h3>
        <ul v-if="catalog.branches.length">
          <li v-for="b in catalog.branches" :key="b._id">
            <strong>{{ b.name }}</strong>
            <span v-if="b.address">{{ b.address }}</span>
            <a v-if="b.whatsapp" :href="whatsappUrl(b.whatsapp)" target="_blank" rel="noopener">
              <AppIcon name="whatsapp" :size="16" /> WhatsApp
            </a>
          </li>
        </ul>
        <ul v-else>
          <li><strong>Samborondón</strong></li>
          <li><strong>Vía a la Costa</strong></li>
        </ul>
      </div>

      <div class="footer__col">
        <h3>Enlaces</h3>
        <ul>
          <li><RouterLink to="/reservar">Reservar limpieza</RouterLink></li>
          <li><RouterLink to="/cotizar-oficina">Cotizar oficina</RouterLink></li>
          <li><RouterLink to="/#preguntas">Preguntas frecuentes</RouterLink></li>
          <li><a :href="`mailto:${site.email}`">{{ site.email }}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <span>© {{ year }} {{ site.legalName }} · {{ site.city }}</span>
      <RouterLink to="/admin/login">Personal</RouterLink>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  background: $navy-ink;
  color: $on-dark-soft;
  padding: 3rem 0 calc(1.5rem + env(safe-area-inset-bottom));
  font-size: $text-sm;

  &__inner {
    @include container;
    @include flex-cards(220px, 2rem);
  }

  &__brand {
    flex-basis: 320px !important;

    p {
      margin-top: 1rem;
      max-width: 40ch;
    }
  }

  h3 {
    color: #fff;
    font-size: $text-base;
    margin-bottom: 0.75rem;
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  li {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;

    strong {
      color: #fff;
    }
  }

  a {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-height: 32px;

    &:hover {
      color: $aqua;
    }
  }

  &__legal {
    @include container;
    margin-top: 2.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(#fff, 0.1);
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: $text-xs;
  }
}
</style>

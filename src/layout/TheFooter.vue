<script setup lang="ts">
import NemoLogo from '@/components/brand/NemoLogo.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { coverage, site } from '@/config/site'
import { whatsappUrl } from '@/utils/format'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__brand">
        <NemoLogo variant="dark" :height="104" />
        <p class="footer__slogan">{{ site.slogan }}</p>
        <p>{{ site.bio }} · Autos, muebles, colchones, oficinas y alfombras.</p>
      </div>

      <div class="footer__col">
        <h3>Contacto</h3>
        <ul>
          <li>
            <a :href="whatsappUrl(site.whatsapp)" target="_blank" rel="noopener">
              <AppIcon name="whatsapp" :size="16" /> WhatsApp {{ site.whatsappDisplay }}
            </a>
          </li>
          <li>
            <a :href="site.instagram" target="_blank" rel="noopener">
              <AppIcon name="instagram" :size="16" /> Instagram {{ site.instagramHandle }}
            </a>
          </li>
        </ul>
      </div>

      <div class="footer__col">
        <h3>Cobertura</h3>
        <ul>
          <li v-for="c in coverage.catalog" :key="c"><span><AppIcon name="pin" :size="14" /> {{ c }}</span></li>
          <li class="footer__also">También: {{ coverage.linktree }}</li>
        </ul>
      </div>

      <div class="footer__col">
        <h3>Enlaces</h3>
        <ul>
          <li><RouterLink to="/reservar">Reservar</RouterLink></li>
          <li><RouterLink to="/cotizar-oficina">Cotizar oficina</RouterLink></li>
          <li><RouterLink to="/#preguntas">Preguntas frecuentes</RouterLink></li>
          <li><RouterLink to="/ingresar">Mi cuenta</RouterLink></li>
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
  @include dark-pattern($navy-deep);
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
      margin-top: 0.75rem;
      max-width: 40ch;
    }
  }

  &__slogan {
    font-family: $font-display;
    font-size: $text-xl;
    line-height: 1.2;
    color: #fff;
    @include orange-underline;
  }

  &__also {
    font-size: $text-xs;
  }

  li span {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
  }

  h3 {
    color: #fff;
    font-size: $text-sm;
    text-transform: uppercase;
    letter-spacing: 0.06em;
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
      color: $orange;
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

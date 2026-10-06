<script setup lang="ts">
interface ContactForm {
  notes: string
  contact: { name: string; email: string; phone: string; company: string }
}

defineProps<{ form: ContactForm; errors: Record<string, string> }>()
</script>

<template>
  <fieldset class="contact">
    <legend class="contact__legend">Tus datos</legend>
    <div class="form-row">
      <label class="field">
        <span class="field__label">Nombre y apellido</span>
        <input v-model="form.contact.name" type="text" autocomplete="name" :aria-invalid="!!errors.name" />
        <span v-if="errors.name" class="field__error">{{ errors.name }}</span>
      </label>
      <label class="field">
        <span class="field__label">Empresa <small class="muted">(opcional)</small></span>
        <input v-model="form.contact.company" type="text" autocomplete="organization" />
      </label>
    </div>
    <div class="form-row">
      <label class="field">
        <span class="field__label">Correo</span>
        <input v-model="form.contact.email" type="email" autocomplete="email" inputmode="email" :aria-invalid="!!errors.email" />
        <span v-if="errors.email" class="field__error">{{ errors.email }}</span>
      </label>
      <label class="field">
        <span class="field__label">Teléfono / WhatsApp</span>
        <input v-model="form.contact.phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="09…" :aria-invalid="!!errors.phone" />
        <span v-if="errors.phone" class="field__error">{{ errors.phone }}</span>
      </label>
    </div>
    <label class="field">
      <span class="field__label">Observaciones <small class="muted">(opcional)</small></span>
      <textarea v-model="form.notes" placeholder="Horarios preferidos, tipo de piso, áreas especiales…"></textarea>
    </label>
  </fieldset>
</template>

<style scoped lang="scss">
.contact {
  border: none;
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  &__legend {
    font-size: $text-lg;
    font-weight: 800;
    margin-bottom: 0.75rem;
  }
}
</style>

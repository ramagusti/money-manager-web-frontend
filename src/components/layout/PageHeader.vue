<template>
  <header class="page-head">
    <div>
      <p v-if="pill" class="pill">{{ pill }}</p>
      <slot name="title">
        <h1>{{ title }}</h1>
      </slot>
      <p v-if="subtitle" class="page-subtitle">
        {{ subtitle }}
      </p>
    </div>
    <div class="page-head__actions">
      <slot name="actions" />
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  pill: {
    type: String,
    default: "",
  },
});
</script>

<style scoped>
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.page-head h1 {
  margin: 6px 0 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
  color: #f8fafc;
}

.page-subtitle {
  color: #94a3b8;
  margin-top: 8px;
}

.page-head__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pill {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: #a5b4fc;
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
  }
}
</style>

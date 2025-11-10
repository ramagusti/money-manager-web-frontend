<template>
  <article class="stat-card base-card" :data-tone="tone">
    <p class="stat-card__label">{{ label }}</p>
    <p class="stat-card__value">{{ value }}</p>
    <p v-if="helper" class="stat-card__helper">{{ helper }}</p>
    <slot />
  </article>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  helper: {
    type: String,
    default: "",
  },
  tone: {
    type: String,
    default: "neutral",
  },
});
</script>

<style scoped>
.stat-card {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-card__label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.stat-card__value {
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  font-weight: 600;
  margin: 6px 0;
  color: #f8fafc;
}

.stat-card__helper {
  color: #cbd5f5;
  font-size: 0.9rem;
}

.stat-card[data-tone="positive"] {
  border-color: rgba(52, 211, 153, 0.3);
}

.stat-card[data-tone="negative"] {
  border-color: rgba(248, 113, 113, 0.3);
}
</style>

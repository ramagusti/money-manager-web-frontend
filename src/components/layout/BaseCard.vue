<template>
  <component :is="tag" :class="cardClasses">
    <slot />
  </component>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  tag: {
    type: String,
    default: "section",
  },
  surface: {
    type: Boolean,
    default: false,
  },
  stretch: {
    type: Boolean,
    default: false,
  },
});

const cardClasses = computed(() => ({
  "base-card": true,
  "base-card--surface": props.surface,
  "base-card--stretch": props.stretch,
}));
</script>

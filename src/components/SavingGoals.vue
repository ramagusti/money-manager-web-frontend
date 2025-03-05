<template>
  <div class="saving-goals-card">
    <!-- <h3>🐷 Saving Goals</h3> -->

    <div class="piggy-container">
      <svg
        viewBox="0 0 200 200"
        class="piggy-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Mask for Filling -->
        <defs>
          <mask id="piggy-mask">
            <!-- Piggy Bank Logo in White (for mask) -->
            <image href="/images/PiggyBang.svg" width="200" height="200" />
            <!-- Black Rectangle to Reveal Fill -->
            <rect
              y="0"
              width="200"
              :height="200 - (isNaN(fillHeight) ? 0 : fillHeight)"
              fill="black"
            />
          </mask>
        </defs>

        <!-- Background Piggy (Unfilled) -->
        <image
          href="/images/PiggyBang.svg"
          width="200"
          height="200"
          opacity="0.3"
        />

        <!-- Filled Piggy (Masked) -->
        <rect
          width="200"
          height="200"
          fill="#ff82ba"
          mask="url(#piggy-mask)"
          class="piggy-fill"
        />
      </svg>

      <div class="savings-text">
        <p><b>Target:</b> {{ Intl.NumberFormat().format(currentSavings) }} / {{ Intl.NumberFormat().format(targetSavings) }}</p>
        <p>{{ Intl.NumberFormat().format(fillPercentage.toFixed(2))}}% of target</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps } from "vue";

const props = defineProps({
  income: {
    type: Number,
    required: true,
  },
  expenses: {
    type: Number,
    required: true,
  },
});

// Calculate savings
const currentSavings = computed(() => props.income - props.expenses);
const targetSavings = computed(() => props.income * 0.3);
const fillPercentage = computed(
  () => (currentSavings.value / targetSavings.value) * 100
);

// Calculate how much of the SVG should be filled
const fillHeight = computed(() =>
  Math.max(0, Math.min(200, (fillPercentage.value / 100) * 200))
);
</script>

<style scoped>
.saving-goals-card {
  /* background: #1e293b; */
  /* padding: 20px; */
  border-radius: 12px;
  color: white;
  text-align: center;
}

.piggy-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15px;
}

.piggy-svg {
  width: 100px;
  height: 100px;
}

.piggy-fill {
  transition: height 0.5s ease-in-out;
}

.savings-text {
  margin-top: 10px;
  font-size: 14px;
}
</style>

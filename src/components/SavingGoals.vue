<template>
  <div class="saving-goals-card">
    <!-- <h3>🐷 Saving Goals</h3> -->

    <div v-if="goal === 0" class="no-goal">
      <p class="mb-2">The group does not have a monthly goal yet.</p>
      <button class="btn-primary m-auto mb-8" @click="$emit('openGoalModal')">
        ➕ Set a Monthly Goal
      </button>
    </div>

    <div v-else class="piggy-container">
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
          opacity="0.2"
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
        <p>
          <b>Target:</b> {{ formatNumber(currentSavings) }} /
          {{ formatNumber(goal) }}
        </p>
        <p>{{ formatNumber(fillPercentage.toFixed(2)) }}% of target</p>
      </div>
      
      <button class="btn-primary m-auto mt-2" @click="$emit('openGoalModal')">
        🔄️ Modify Monthly Goal
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits } from "vue";
import api from "../services/api";

const props = defineProps({
  goal: {
    type: Number,
    required: false,
  },
  income: {
    type: Number,
    required: true,
  },
  expenses: {
    type: Number,
    required: true,
  },
  groupId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["openGoalModal"]);
const showGoalModal = ref(false);
const newGoal = ref("");

// Calculate savings
const currentSavings = computed(() => props.income - props.expenses);
const fillPercentage = computed(
  () => (currentSavings.value / props.goal) * 100
);
const fillHeight = computed(() =>
  Math.max(0, Math.min(200, (fillPercentage.value / 100) * 200))
);

// Set new goal
const setGoal = async () => {
  if (!newGoal.value || newGoal.value <= 0) {
    alert("Please enter a valid goal amount.");
    return;
  }

  try {
    await api.post(`/groups/${props.groupId}/goal`, {
      goal_amount: newGoal.value,
    });
    emit("goalUpdated", newGoal.value);
    showGoalModal.value = false;
  } catch (error) {
    console.error("Failed to set goal", error);
  }
};

// Format numbers
const formatNumber = (num) => Intl.NumberFormat().format(num);
</script>

<style scoped>
.saving-goals-card {
  /* background: #1e293b; */
  /* padding: 20px; */
  border-radius: 12px;
  color: white;
  text-align: center;
}

.no-goal {
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

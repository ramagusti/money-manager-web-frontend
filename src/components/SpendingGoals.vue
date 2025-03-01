<template>
  <div class="spending-goals-card">
    <h3>🎯 Spending Goals</h3>
    <div v-for="goal in spendingGoals" :key="goal.id" class="goal">
      <p>{{ goal.name }}</p>
      <div class="progress-bar">
        <div class="progress" :style="{ width: goal.progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const spendingGoals = ref([]);

onMounted(async () => {
  try {
    const response = await api.get("/spending-goals");
    spendingGoals.value = response.data.goals;
  } catch (error) {
    console.error("Failed to fetch spending goals:", error);
  }
});
</script>

<style scoped>
.spending-goals-card {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  color: white;
}

.goal {
  margin-bottom: 15px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #374151;
  border-radius: 4px;
  margin-top: 5px;
}

.progress {
  height: 100%;
  background: #facc15;
  border-radius: 4px;
}
</style>

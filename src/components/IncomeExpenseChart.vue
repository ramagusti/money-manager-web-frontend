<template>
  <div class="chart-card">
    <h3>📊 Income vs Expenses</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted,defineProps } from "vue";
import Chart from "chart.js/auto";

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

const chartCanvas = ref(null);

onMounted(async () => {
  try {
    new Chart(chartCanvas.value, {
      type: "doughnut",
      data: {
        labels: ["Income", "Expenses"],
        datasets: [
          {
            data: [props.income, props.expenses],
            backgroundColor: ["#22c55e", "#ef4444"],
          },
        ],
      },
    });
  } catch (error) {
    console.error("Failed to fetch income/expenses:", error);
  }
});
</script>

<style scoped>
.chart-card {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  color: white;
}
</style>

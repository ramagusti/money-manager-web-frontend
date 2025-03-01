<template>
  <div class="chart-card">
    <h3>📊 Income vs Expenses</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import Chart from "chart.js/auto";
import api from "../services/api";

const chartCanvas = ref(null);

onMounted(async () => {
  try {
    const response = await api.get("/income-expenses");
    const { income, expenses } = response.data;

    new Chart(chartCanvas.value, {
      type: "doughnut",
      data: {
        labels: ["Income", "Expenses"],
        datasets: [
          {
            data: [income, expenses],
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

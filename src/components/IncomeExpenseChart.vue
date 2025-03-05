<template>
  <div class="chart-card">
    <h3>📊 Income vs Expenses</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps } from "vue";
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
let chartInstance = null; // Store chart instance

const createChart = () => {
  if (!chartCanvas.value) return; // Ensure canvas is available

  // Destroy existing chart to avoid duplicate rendering
  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(chartCanvas.value.getContext("2d"), {
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
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};

// Watch for changes in income/expenses and update chart
watch([() => props.income, () => props.expenses], () => {
  createChart();
});

// Initialize chart when component mounts
onMounted(() => {
  createChart();
});
</script>

<style scoped>
.chart-card {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 200px;
}

/* Ensure the canvas scales properly */
canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 300px;
  max-height: 300px;
}
</style>

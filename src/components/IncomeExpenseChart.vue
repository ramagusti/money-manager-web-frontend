<template>
  <div class="chart-card">
    <div class="chart-head">
      <h3><b>Monthly Income vs Expenses</b></h3>
      <span class="legend">
        <span class="legend-dot legend-dot--income"></span> Income
        <span class="legend-dot legend-dot--expense"></span> Expense
      </span>
    </div>
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

  const ctx = chartCanvas.value.getContext("2d");

  const incomeGradient = ctx.createLinearGradient(0, 0, 0, 260);
  incomeGradient.addColorStop(0, "rgba(251, 191, 36, 0.95)");
  incomeGradient.addColorStop(1, "rgba(249, 115, 22, 0.75)");

  const expenseGradient = ctx.createLinearGradient(0, 0, 0, 260);
  expenseGradient.addColorStop(0, "rgba(125, 211, 252, 0.95)");
  expenseGradient.addColorStop(1, "rgba(59, 130, 246, 0.75)");

  chartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [props.income, props.expenses],
          backgroundColor: [incomeGradient, expenseGradient],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) =>
              `${context.label}: ${new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(context.parsed)}`,
          },
        },
      },
      cutout: "60%",
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
  min-height: 200px;
}

.chart-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.legend {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #cbd5f5;
  font-size: 0.9rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.legend-dot--income {
  background: linear-gradient(135deg, #fbbf24, #f97316);
}

.legend-dot--expense {
  background: linear-gradient(135deg, #7dd3fc, #3b82f6);
}

/* Ensure the canvas scales properly */
canvas {
  width: 100% !important;
  height: 100% !important;
  max-width: 300px;
  max-height: 300px;
}
</style>

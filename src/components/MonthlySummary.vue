<template>
  <div class="monthly-summary-card">
    <h3>
      <b>📊 Monthly Summary ({{ currentMonthLabel }})</b>
    </h3>
    <div v-if="monthlySummary.length">
      <div
        v-for="(item, index) in monthlySummary"
        :key="index"
        class="summary-user"
      >
        <h4><b>{{ item.actor }}</b></h4>
        <div class="summary-item">
          <span>Income:</span>
          <span class="text-green">{{ formatCurrency(item.income) }}</span>
        </div>
        <div class="summary-item">
          <span>Expense:</span>
          <span class="text-red">{{ formatCurrency(item.expense) }}</span>
        </div>
        <div class="summary-item">
          <span>Savings:</span>
          <span
            :class="{
              'text-green': item.savings >= 0,
              'text-red': item.savings < 0,
            }"
          >
            {{ formatCurrency(item.savings) }}
          </span>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No transactions found for this month.</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from "vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
});

// Get current month and year to filter transactions
const currentDate = new Date();
const currentMonth = currentDate.getMonth();
const currentYear = currentDate.getFullYear();

// Create a label for the current month (e.g., "April 2025")
const currentMonthLabel = computed(() => {
  return new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
});

// Process transactions to group by user for the current month
const monthlySummary = computed(() => {
  const summary = {};

  props.transactions.forEach((transaction) => {
    // Ensure the transaction_time is parsed as a Date object
    const tDate = new Date(transaction.transaction_time);
    // Only include transactions from the current month and year
    if (
      tDate.getMonth() === currentMonth &&
      tDate.getFullYear() === currentYear
    ) {
      // Group by actor if available, otherwise fallback to user_id or 'Unknown'
      const key = transaction.actor || transaction.user_id || "Unknown";
      if (!summary[key]) {
        summary[key] = {
          actor: transaction.actor || "Unknown",
          income: 0,
          expense: 0,
        };
      }
      // Sum the amounts based on transaction type
      if (transaction.type === "income") {
        summary[key].income += Number(transaction.amount);
      } else if (transaction.type === "expense") {
        summary[key].expense += Number(transaction.amount);
      }
    }
  });

  // Convert the grouped summary into an array and calculate savings for each user
  return Object.values(summary).map((item) => ({
    ...item,
    savings: item.income - item.expense,
  }));
});

// Currency formatter using Indonesian Rupiah formatting
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};
</script>

<style scoped>
.monthly-summary-card {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  color: white;
  overflow-y: auto;
}

h3 {
  margin-bottom: 16px;
}

.summary-user {
  border-bottom: 1px solid #374151;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.text-green {
  color: #22c55e;
}

.text-red {
  color: #ef4444;
}
</style>

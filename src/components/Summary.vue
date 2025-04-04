<template>
  <div class="summary-card">
    <h3>
      <b>📊 Overall Summary</b>
    </h3>
    <div v-if="summary.length">
      <div v-for="(item, index) in summary" :key="index" class="summary-user">
        <h4>
          <b>{{ item.actor }}</b>
        </h4>
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

// Process transactions to group by user for the current month
const summary = computed(() => {
  const summaryData = {};

  props.transactions.forEach((transaction) => {
    // Group by actor if available, otherwise fallback to user_id or 'Unknown'
    const key = transaction.actor || transaction.user_id || "Unknown";
    if (!summaryData[key]) {
      summaryData[key] = {
        actor: transaction.actor || "Unknown",
        income: 0,
        expense: 0,
      };
    }
    // Sum the amounts based on transaction type
    if (transaction.type === "income") {
      summaryData[key].income += Number(transaction.amount);
    } else if (transaction.type === "expense") {
      summaryData[key].expense += Number(transaction.amount);
    }
  });

  // Convert the grouped summary into an array and calculate savings for each user
  return Object.values(summaryData).map((item) => ({
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
.summary-card {
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

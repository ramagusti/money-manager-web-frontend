<template>
  <div class="summary-card">
    <h3>
      <b>Member overview</b>
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
    default: () => [],
  },
  memberOverview: {
    type: Array,
    default: () => [],
  },
});

// Build per-actor totals for the group
const summary = computed(() => {
  if (props.memberOverview.length) {
    const rows = props.memberOverview.map((member) => {
      const income = Number(member.total_income ?? member.income ?? 0);
      const expense = Number(member.total_expense ?? member.expense ?? 0);
      const savings =
        member.total_savings ??
        member.savings ??
        Number((income - expense).toFixed(2));

      return {
        actor: member.actor || "Unknown",
        income,
        expense,
        savings,
      };
    });

    const totals = rows.reduce(
      (acc, row) => {
        acc.income += row.income;
        acc.expense += row.expense;
        return acc;
      },
      { income: 0, expense: 0 }
    );

    return [
      ...rows,
      {
        actor: "Total",
        income: totals.income,
        expense: totals.expense,
        savings: totals.income - totals.expense,
      },
    ];
  }

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
  const rows = Object.values(summaryData).map((item) => ({
    ...item,
    savings: item.income - item.expense,
  }));

  const totals = rows.reduce(
    (acc, row) => {
      acc.income += row.income;
      acc.expense += row.expense;
      return acc;
    },
    { income: 0, expense: 0 }
  );

  return [
    ...rows,
    {
      actor: "Total",
      income: totals.income,
      expense: totals.expense,
      savings: totals.income - totals.expense,
    },
  ];
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

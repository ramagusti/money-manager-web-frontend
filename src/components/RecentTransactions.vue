<template>
  <div class="transactions-card">
    <h3><b>Recent Transactions</b></h3>
    <ul>
      <li
        v-for="transaction in transactions.slice(0, 10)"
        :key="transaction.id"
      >
        <span>{{ transaction.description }}</span>
        <span
          :class="{
            'text-red': transaction.type === 'expense',
            'text-green': transaction.type !== 'expense',
          }"
        >
          {{ formatCurrency(transaction.amount) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  transactions: {
    type: Array,
    required: true,
  },
});

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};
</script>

<style scoped>
.transactions-card {
  background: #1e293b;
  padding: 20px;
  border-radius: 12px;
  color: white;
}

ul {
  margin-top: 10px;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
}

.text-red {
  color: #ef4444;
}

.text-green {
  color: #22c55e;
}
</style>

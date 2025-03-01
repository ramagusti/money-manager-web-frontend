<template>
  <div class="transactions-card">
    <h3>📉 Recent Transactions</h3>
    <ul>
      <li v-for="transaction in transactions" :key="transaction.id">
        <span>{{ transaction.description }}</span>
        <span
          :class="{
            'text-red': transaction.amount < 0,
            'text-green': transaction.amount > 0,
          }"
        >
          {{ formatCurrency(transaction.amount) }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../services/api";

const transactions = ref([]);

onMounted(async () => {
  try {
    const response = await api.get("/transactions?limit=5");
    transactions.value = response.data.transactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  }
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

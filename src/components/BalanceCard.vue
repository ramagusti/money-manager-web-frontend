<template>
  <div class="balance-card">
    <!-- <h3>💰 Account Balance</h3> -->
    <p class="balance-title">💰 Account Balance</p>
    <p class="balance">{{ formatCurrency(balance) }}</p>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  balance: {
    type: Number,
    required: true,
  },
});

// Format balance based on user's locale
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};
</script>

<style scoped>
.balance-title {
  font-size: calc(24px * var(--scale-factor, 1));
  font-weight: bold;  
}

.balance-card {
  /* background: #1e293b; */
  /* padding: 20px; */
  /* border-radius: 12px; */
  color: white;
  text-align: center;
  /* box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); */
}

.balance {
  font-size: calc(24px * var(--scale-factor, 1));
  font-weight: bold;
  margin-top: 4px;
  color: #eab308;
}
</style>

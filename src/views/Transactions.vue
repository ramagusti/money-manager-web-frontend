<template>
  <div class="transactions-container">
    <!-- Header & Summary -->
    <div class="transactions-header">
      <h2 class="text-3xl font-bold text-white">📜 Transactions</h2>
      <div class="summary-cards">
        <div class="summary-item text-green">
          Income: Rp {{ totalIncome.toLocaleString() }}
        </div>
        <div class="summary-item text-red">
          Expenses: Rp {{ totalExpense.toLocaleString() }}
        </div>
        <div class="summary-item text-gold">
          Savings: Rp {{ totalSavings.toLocaleString() }}
        </div>
      </div>
      <button class="btn-primary ml-6" @click="showTransactionModal = true">
        Add Transaction
      </button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <input
        type="month"
        v-model="selectedMonth"
        @change="fetchTransactions"
        class="filter-input"
      />
      <select
        v-model="selectedCategory"
        @change="fetchTransactions"
        class="filter-input"
      >
        <option value="" style="color: black;">All Categories</option>
        <option
          v-for="category in categories"
          :key="category.id"
          :value="category.id"
          style="color: black;"
        >
          {{ category.name }}
        </option>
      </select>
      <select
        v-model="selectedType"
        @change="fetchTransactions"
        class="filter-input"
      >
        <option value="" style="color: black;">All</option>
        <option value="income" style="color: black;">Income</option>
        <option value="expense" style="color: black;">Expense</option>
      </select>
    </div>

    <!-- Transactions List -->
    <div class="transactions-list">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Actor</th>
            <th>Date</th>
            <th>Proof</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.description || "N/A" }}</td>
            <td :class="transaction.type === 'expense' ? 'text-red' : 'text-green'">
              Rp {{ transaction.amount.toLocaleString() }}
            </td>
            <td>{{ transaction.category.name }}</td>
            <td>{{ transaction.actor }}</td>
            <td>{{ transaction.transaction_time }}</td>
            <td>
              <a v-if="transaction.proof" :href="`/storage/${transaction.proof}`" target="_blank" class="text-blue-400">
                📎 View
              </a>
            </td>
            <td>
              <button @click="editTransaction(transaction)">✏️ Edit</button>
              <button @click="deleteTransaction(transaction.id)" class="text-red">🗑 Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button @click="prevPage" :disabled="page === 1">⬅ Previous</button>
      <span>Page {{ page }}</span>
      <button @click="nextPage">Next ➡</button>
    </div>

    <!-- Transaction Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showTransactionModal" class="modal-overlay" @click.self="closeModal">
          <Transition name="modal-scale">
            <div class="modal-content">
              <h2 class="text-3xl font-semibold text-gold mb-4">
                {{ isEditing ? "Edit Transaction" : "Add Transaction" }}
              </h2>
              <form @submit.prevent="saveTransaction" class="space-y-4">
                <div class="input-group">
                  <select v-model="formData.type" required class="input-field">
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div class="input-group">
                  <select v-model="formData.category_id" required class="input-field">
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>
                <input type="number" v-model="formData.amount" placeholder="Amount" required class="input-field" />
                <input type="text" v-model="formData.description" placeholder="Description (Optional)" class="input-field" />
                <input type="text" v-model="formData.actor" placeholder="Actor" required class="input-field" />
                <input type="datetime-local" v-model="formData.transaction_time" required class="input-field" />
                <input type="file" @change="handleFileUpload" class="input-field" />

                <button type="submit" class="btn-primary w-full">
                  <span v-if="isLoading" class="spinner"></span>
                  <span v-else>{{ isEditing ? "Update" : "Create" }}</span>
                </button>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import api from "../services/api";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const { appLoading, isCollapsed, currentGroup, userGroups } = storeToRefs(appStore);

const transactions = ref([]);
const categories = ref([]);
const selectedMonth = ref(new Date().toISOString().slice(0, 7));
const selectedCategory = ref("");
const selectedType = ref("");
const page = ref(1);
const totalIncome = ref(0);
const totalExpense = ref(0);
const totalSavings = ref(0);
const showTransactionModal = ref(false);
const isEditing = ref(false);
const isLoading = ref(false);
const formData = ref({
  type: "expense",
  category_id: "",
  amount: "",
  description: "",
  actor: "",
  transaction_time: new Date().toISOString().slice(0, 16),
  proof: null,
});


const fetchTransactions = async () => {
  try {
    if (!currentGroup.value) return;

    const response = await api.get("/transactions", {
      params: {
        date: selectedMonth.value,
        group_id: currentGroup.value.id,
        category_id: selectedCategory.value,
        type: selectedType.value,
        page: page.value,
      },
    });
    transactions.value = response.data.data;
    totalIncome.value = response.data.totalIncome ?? 0;
    totalExpense.value = response.data.totalExpense ?? 0;
    totalSavings.value = (totalIncome.value ?? 0) - (totalExpense.value ?? 0);
  } catch (error) {
    console.error("Failed to fetch transactions", error);
  }
};

const fetchCategories = async () => {
  if (!currentGroup.value) return;

  try {
    const response = await api.get("/categories", {
      params: {
        group_id: currentGroup.value.id,
      },
    });
    categories.value = response.data;
  } catch (error) {
    console.error("Failed to fetch categories", error);
  }
};

const saveTransaction = async () => {
  isLoading.value = true;
  const formDataObj = new FormData();
  Object.keys(formData.value).forEach((key) => {
    formDataObj.append(key, formData.value[key]);
  });

  try {
    if (isEditing.value) {
      await api.put(`/transactions/${formData.value.id}`, formDataObj);
    } else {
      await api.post("/transactions", formDataObj);
    }
    showTransactionModal.value = false;
    fetchTransactions();
  } catch (error) {
    console.error("Failed to save transaction", error);
  } finally {
    isLoading.value = false;
  }
};

const editTransaction = (transaction) => {
  console.log("Edit transaction:", transaction);
  // Implement edit logic here (open modal, populate fields, etc.)
};

const deleteTransaction = async (id) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    await api.delete(`/transactions/${id}`);
    fetchTransactions();
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    fetchTransactions();
  }
};

const nextPage = () => {
  page.value++;
  fetchTransactions();
};

watch(currentGroup, async () => {
  await fetchCategories();
  await fetchTransactions();
});

onMounted(async () => {
  await fetchTransactions();
  await fetchCategories();
});
</script>

<style scoped>
.transactions-container {
  padding: 20px;
  color: white;
}
.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.summary-cards {
  display: flex;
  gap: 20px;
}
.summary-item {
  padding: 10px 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
}
.text-green {
  color: #22c55e;
}
.text-red {
  color: #ef4444;
}
.text-gold {
  color: #eab308;
}
.filter-input {
  width: 10rem;
  padding: 10px;
  border-radius: 6px;
  border: none;
  margin-right: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
.transactions-list table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}
.transactions-list th,
.transactions-list td {
  padding: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.transactions-list th {
  text-align: left;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>

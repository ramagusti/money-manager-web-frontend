<template>
  <div v-if="isLoadingData" class="loading-container">
    <div class="loading-spinner"></div>
  </div>
  <div class="transactions-container">
    <!-- Header & Summary -->
    <div class="transactions-header">
      <h2 class="font-bold text-white">📜 Transactions</h2>
      <button class="btn-primary" @click="openModal">➕ Add Transaction</button>
    </div>
    <div class="summary-cards">
      <div class="summary-item income">
        <span class="label">Income</span>
        <span class="value"
          >{{ currency }} {{ formatAmount(totalIncome) }}</span
        >
      </div>
      <div class="summary-item expense">
        <span class="label">Expenses</span>
        <span class="value"
          >{{ currency }} {{ formatAmount(totalExpense) }}</span
        >
      </div>
      <div class="summary-item savings">
        <span class="label">Savings</span>
        <span class="value"
          >{{ currency }} {{ formatAmount(totalSavings) }}</span
        >
      </div>
    </div>

    <!-- Filters & Import/Export Buttons -->
    <div class="filters-container">
      <div class="filters">
        <input
          type="month"
          v-model="selectedMonth"
          @change="fetchTransactions"
          class="filter-input"
        />
        <select
          v-model="selectedType"
          @change="fetchTransactions"
          class="filter-input"
        >
          <option value="" style="color: black">All</option>
          <option value="income" style="color: black">Income</option>
          <option value="expense" style="color: black">Expense</option>
        </select>
        <select
          v-model="selectedCategory"
          @change="fetchTransactions"
          class="filter-input"
        >
          <option value="" style="color: black">All Categories</option>
          <option
            v-for="category in categories.filter(
              (category) =>
                selectedType === '' ||
                selectedType === null ||
                category.type === selectedType
            )"
            :key="category.id"
            :value="category.id"
            style="color: black"
          >
            {{
              selectedType === "" || selectedType === null
                ? category.name + " (" + category.type + ")"
                : category.name
            }}
          </option>
        </select>
      </div>

      <div class="export-buttons">
        <button class="btn-export" @click="exportTransactions">
          📤 Export
        </button>
        <button class="btn-template" @click="downloadTemplate">
          📥 Download Template
        </button>
        <label class="btn-import">
          📑 Import
          <input
            type="file"
            ref="fileInput"
            @change="importTransactions"
            hidden
          />
        </label>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="transactions-list">
      <table v-if="transactions.length > 0" class="responsive-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Actor</th>
            <th>Date</th>
            <!-- <th>Proof</th> -->
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in transactions" :key="transaction.id">
            <td>{{ transaction.description || "N/A" }}</td>
            <td
              :class="
                transaction.type === 'expense' ? 'text-red' : 'text-green'
              "
            >
              {{ currency }} {{ formatAmount(transaction.amount) }}
            </td>
            <td>{{ transaction.category.name }}</td>
            <td>{{ transaction.actor }}</td>
            <td>{{ transaction.transaction_time }}</td>
            <!-- <td>
              <a
                v-if="transaction.proof"
                :href="`/storage/${transaction.proof}`"
                target="_blank"
                class="text-blue-400"
              >
                📎 View
              </a>
            </td> -->
            <td>
              <button @click="editTransaction(transaction)">✏️ Edit</button>
              <br />
              <button
                @click="deleteTransaction(transaction.id)"
                class="text-red"
              >
                🗑 Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="text-center text-gray-400 mt-8">No transactions found</p>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <button v-if="page > 1" @click="prevPage">⬅ Previous</button>

      <template v-for="(p, index) in paginationPages" :key="index">
        <button
          v-if="typeof p === 'number'"
          :class="{
            'active-page': parseInt(transactionsMeta.current_page) === p,
          }"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>

        <button v-else @click="showPageInput = true" class="pagination-ellipsis">
          ...
        </button>
      </template>

      <button v-if="transactionsMeta.next_page_url" @click="nextPage">
        Next ➡
      </button>
    </div>
    <div v-if="showPageInput" class="jump-page-modal">
      <input
        v-model="jumpPageInput"
        type="number"
        min="1"
        :max="transactionsMeta.last_page"
        class="input-field w-24"
        placeholder="Page"
        @keyup.enter="handleJumpPage"
      />
      <button @click="handleJumpPage" class="btn-primary ml-2">Go</button>
      <button @click="showPageInput = false" class="ml-2">Cancel</button>
    </div>

    <!-- Transaction Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showTransactionModal"
          class="modal-overlay"
          @click.self="closeModal"
        >
          <Transition name="modal-scale">
            <div class="modal-content">
              <h2 class="text-3xl font-semibold text-gold mb-4">
                {{ isEditing ? "Edit Transaction" : "Add Transaction" }}
              </h2>
              <form
                @submit.prevent="saveTransaction"
                class="space-y-4"
                ref="transactionForm"
              >
                <select v-model="formData.type" required class="input-field">
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <select
                  v-model="formData.category_id"
                  required
                  class="input-field"
                >
                  <option
                    v-for="category in categories.filter(
                      (category) => category.type === formData.type
                    )"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
                <input
                  type="text"
                  v-model="formData.description"
                  placeholder="Description (Optional)"
                  class="input-field"
                />
                <!-- Amount Input with Calculator Button -->
                <div class="input-group">
                  <input
                    type="text"
                    v-model="formData.formattedAmount"
                    :placeholder="`Amount (${currency})`"
                    required
                    class="input-field"
                  />
                  <span class="calculator-btn-wrapper">
                    <button
                      type="button"
                      class="calculator-btn px-4"
                      @click="openCalculator"
                    >
                      🖩
                    </button>
                  </span>
                </div>
                <!-- Actor selection with "Other" option -->
                <select v-model="selectedActor" class="input-field">
                  <option value="" disabled>Select Actor</option>
                  <option
                    v-for="member in members"
                    :key="member.id"
                    :value="member.name"
                  >
                    {{ member.name }}
                  </option>
                  <option value="other">Other (Type Manually)</option>
                </select>

                <!-- Manual actor input field (shown only if "Other" is selected) -->
                <input
                  v-if="selectedActor === 'other'"
                  type="text"
                  v-model="manualActor"
                  placeholder="Enter Actor Name"
                  class="input-field"
                />
                <input
                  type="datetime-local"
                  v-model="formData.transaction_time"
                  required
                  class="input-field"
                  step="1"
                />
                <!-- <input
                  type="file"
                  @change="handleFileUpload"
                  class="input-field"
                /> -->
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

    <!-- Calculator Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showCalculator"
          class="modal-overlay"
          @click.self="closeCalculator"
          @keydown.esc="closeCalculator"
          @keydown.enter="insertCalculatorValue"
          @keydown="handleKeydown($event)"
          tabindex="0"
          @focus="focused = true"
          @blur="focused = false"
        >
          <Transition name="modal-scale">
            <div class="calculator-content calculator-modal">
              <h2 class="text-3xl font-semibold text-gold mb-4">Calculator</h2>
              <div class="calculator-display flex pl-4">
                <input
                  ref="calculatorInput"
                  class="flex-1 overflow-hidden text-lg"
                  style="
                    text-align: left;
                    border: none;
                    background: transparent;
                    outline: none;
                  "
                  :value="calculatorValue"
                  readonly
                />
                <div class="w-1/6">
                  <button @click="clearCalculator">C</button>
                </div>
              </div>
              <div class="calculator-buttons flex justify-start">
                <div></div>
                <div></div>
                <div></div>
                <button @click="deleteLastDigit">&larr;</button>
              </div>
              <div class="calculator-buttons">
                <button @click="appendToCalculator('7')">7</button>
                <button @click="appendToCalculator('8')">8</button>
                <button @click="appendToCalculator('9')">9</button>
                <button @click="appendToCalculator('+')">+</button>

                <button @click="appendToCalculator('4')">4</button>
                <button @click="appendToCalculator('5')">5</button>
                <button @click="appendToCalculator('6')">6</button>
                <button @click="appendToCalculator('-')">-</button>

                <button @click="appendToCalculator('1')">1</button>
                <button @click="appendToCalculator('2')">2</button>
                <button @click="appendToCalculator('3')">3</button>
                <button @click="appendToCalculator('*')">*</button>

                <button @click="appendToCalculator('.')">.</button>
                <button @click="appendToCalculator('0')">0</button>
                <button @click="calculateResult">=</button>
                <button @click="appendToCalculator('/')">/</button>
              </div>

              <button
                class="btn-primary w-full mt-4"
                @click="insertCalculatorValue"
              >
                Insert Amount
              </button>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import api from "../services/api";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";

const appStore = useAppStore();
const { appLoading, isCollapsed, currentGroup, userGroups } =
  storeToRefs(appStore);

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
const showCalculator = ref(false);
const calculatorInput = ref(null);
const rawExpression = ref("");
const isEditing = ref(false);
const isLoading = ref(false);
const isLoadingData = ref(true);
const members = ref([]); // Store fetched members
const selectedActor = ref(""); // Store selected actor
const manualActor = ref(""); // Store manually entered actor
const transactionsMeta = ref({});
const currency = ref("Rp");
const fileInput = ref(null);
const focused = ref(false);
const showPageInput = ref(false);
const jumpPageInput = ref("");

const calculatorValue = computed(() => formatExpression(rawExpression.value));

const formData = ref({
  type: "expense",
  category_id: categories.value[0]?.id,
  group_id: currentGroup.value.id,
  amount: "",
  formattedAmount: "",
  description: "",
  actor: "",
  transaction_time: new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16),
  proof: null,
});

const paginationPages = computed(() => {
  const totalPages = transactionsMeta.value.last_page;
  const current = parseInt(transactionsMeta.value.current_page);

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];

  // Always show the first page
  pages.push(1);

  // Add "..." if current page is far from the start
  if (current > 3) pages.push('prev-ellipsis');

  const middlePages = [];

  for (let i = current - 1; i <= current + 1; i++) {
    if (i > 1 && i < totalPages) {
      middlePages.push(i);
    }
  }

  pages.push(...middlePages);

  // Add "..." if current page is far from the end
  if (current < totalPages - 2) pages.push('next-ellipsis');

  // Always show the last page
  if (totalPages !== 1) pages.push(totalPages);

  return pages;
});

const handleJumpPage = () => {
  const p = parseInt(jumpPageInput.value);
  if (p >= 1 && p <= transactionsMeta.value.last_page) {
    page.value = p;
    fetchTransactions();
    showPageInput.value = false;
    jumpPageInput.value = '';
  }
};

const goToPage = (p) => {
  page.value = p;
  fetchTransactions();
};

const exportTransactions = async () => {
  isLoadingData.value = true;

  try {
    const response = await api.get("/transactions/export", {
      params: { group_id: currentGroup.value.id },
      responseType: "blob", // Important for downloading files
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transactions.xlsx";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Failed to export transactions", error);
  } finally {
    isLoadingData.value = false;
  }
};

const downloadTemplate = async () => {
  isLoadingData.value = true;

  try {
    const response = await api.get("/transactions/template", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "transaction_template.xlsx";
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Failed to download template", error);
  } finally {
    isLoadingData.value = false;
  }
};

const importTransactions = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("group_id", currentGroup.value.id);

  isLoadingData.value = true;

  try {
    await api.post(
      "/transactions/import?cache=" + new Date().getTime(),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    alert("Transactions imported successfully!");
    fetchTransactions();
  } catch (error) {
    console.error("Failed to import transactions", error);
  } finally {
    event.target.value = null;
    fileInput.value = null;
    isLoadingData.value = false;
  }
};

const formatAmount = (amount) => {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
};

const fetchMembers = async () => {
  try {
    if (!currentGroup.value) return;

    const response = await api.get(`/groups/${currentGroup.value.id}/members`);

    members.value = response.data.data; // Store members in reactive state
  } catch (error) {
    console.error("Failed to fetch members", error);
  }
};

const openModal = async () => {
  isEditing.value = false;
  showTransactionModal.value = true;
};

const closeModal = () => {
  showTransactionModal.value = false;
  resetForm();
};

const openCalculator = async () => {
  showCalculator.value = true;
  // rawExpression.value = "";

  await nextTick();
  calculatorInput.value?.focus();
};

const closeCalculator = () => {
  showCalculator.value = false;
};

const handleKeydown = (event) => {
  const { key } = event;
  if (key === "Enter" || key === "=") {
    insertCalculatorValue();
  } else if (key === "Backspace") {
    deleteLastDigit();
  } else if (key === "Escape") {
    closeCalculator();
  } else if (/[0-9.+\-*/]/.test(key)) {
    appendToCalculator(key);
  }
};

const appendToCalculator = (value) => {
  const lastChar = rawExpression.value.slice(-1);

  // Prevent two decimals in a number
  if (value === "." && /\d*\.\d*$/.test(rawExpression.value)) return;

  // Prevent operator chaining
  if (isOperator(value) && isOperator(lastChar)) {
    rawExpression.value = rawExpression.value.slice(0, -1) + value;
    return;
  }

  rawExpression.value += value;
};

const deleteLastDigit = () => {
  rawExpression.value = rawExpression.value.slice(0, -1);
};

const clearCalculator = () => {
  rawExpression.value = "";
};

const formatExpression = (expr) => {
  // Split expression into numbers and operators
  return expr
    .split(/([+\-*/])/)
    .map((part) => {
      if (!isNaN(part) && part !== "") {
        return Number(part).toLocaleString();
      } else {
        return part;
      }
    })
    .join(" ");
};

const isOperator = (char) => ["+", "-", "*", "/"].includes(char);

const calculateResult = () => {
  try {
    const cleaned = rawExpression.value.replace(/,/g, "");
    const result = Function(`return (${cleaned})`)();
    rawExpression.value = result.toString();
  } catch (error) {
    console.error("Invalid calculation");
  }
};

const insertCalculatorValue = () => {
  if (!rawExpression.value) return;

  calculateResult();

  const result = Number(rawExpression.value);
  formData.value.formattedAmount = formatAmount(result);
  formData.value.amount = result.toString();
  closeCalculator();
};

const resetForm = () => {
  formData.value = {
    type: "expense",
    category_id: categories.value[0]?.id,
    group_id: currentGroup.value.id,
    amount: "",
    formattedAmount: "",
    description: "",
    actor: "",
    transaction_time: new Date(
      new Date().getTime() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16),
    proof: null,
  };
};

const fetchTransactions = async () => {
  isLoadingData.value = true;

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

    transactions.value = response.data.transactions.data;
    transactionsMeta.value = response.data.transactions;
    totalIncome.value = response.data.total_income ?? 0;
    totalExpense.value = response.data.total_expense ?? 0;
    totalSavings.value = response.data.total_savings ?? 0;
  } catch (error) {
    console.error("Failed to fetch transactions", error);
  } finally {
    isLoadingData.value = false;
  }
};

const changePage = (url) => {
  const urlObj = new URL(url);
  page.value = urlObj.searchParams.get("page");
  fetchTransactions();
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

  try {
    formData.value.actor =
      selectedActor.value === "other" ? manualActor.value : selectedActor.value;

    const formDataObj = new FormData();
    Object.keys(formData.value).forEach((key) => {
      if (formData.value[key] !== null) {
        formDataObj.append(key, formData.value[key]);
      }
    });

    if (isEditing.value) {
      await api.put(`/transactions/${formData.value.id}`, formDataObj);
    } else {
      await api.post("/transactions", formDataObj);
    }

    closeModal();
    fetchTransactions();
  } catch (error) {
    console.error("Failed to save transaction", error);
  } finally {
    isLoading.value = false;
  }
};

const editTransaction = (transaction) => {
  isEditing.value = true;
  showTransactionModal.value = true;

  // Set formData with transaction details
  formData.value = {
    id: transaction.id,
    type: transaction.type,
    category_id: transaction.category.id,
    group_id: currentGroup.value.id,
    amount: transaction.amount.toString(), // Store clean numeric value
    formattedAmount: formatAmount(transaction.amount), // Store formatted amount
    description: transaction.description || "",
    transaction_time: transaction.transaction_time,
    proof: transaction.proof || null,
  };

  // Handle actor selection logic
  const memberExists = members.value.some(
    (member) => member.name === transaction.actor
  );

  if (memberExists) {
    selectedActor.value = transaction.actor; // Select actor from the dropdown
    manualActor.value = ""; // Clear manual actor
  } else {
    selectedActor.value = "other"; // Mark as manual input
    manualActor.value = transaction.actor; // Pre-fill manual input field
  }
};

const deleteTransaction = async (id) => {
  if (confirm("Are you sure you want to delete this transaction?")) {
    await api.delete(`/transactions/${id}`, {
      data: {
        group_id: currentGroup.value.id,
      },
    });
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

watch(
  () => formData.value.formattedAmount,
  async (newVal) => {
    if (!newVal) return;

    formData.value.formattedAmount = formatAmount(
      Number(newVal.replace(/[^\d.-]/g, ""))
    );

    formData.value.amount = formData.value.formattedAmount.replace(
      /[^0-9.]/g,
      ""
    );
  }
);

watch(currentGroup, async () => {
  await fetchCategories();
  await fetchTransactions();
  await fetchMembers();
  resetForm();
});

onMounted(async () => {
  await fetchTransactions();
  await fetchCategories();
  await fetchMembers();
  resetForm();
});
</script>

<style scoped>
.transactions-container {
  padding: calc(20px * var(--scale-factor, 1));
  color: white;
  font-size: calc(16px * var(--scale-factor, 1));
  margin-left: calc(80px * var(--scale-factor, 1));
}
.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(20px * var(--scale-factor, 1));
  font-size: calc(24px * var(--scale-factor, 1));
}
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  gap: calc(10px * var(--scale-factor, 1));
  justify-content: space-between;
  margin-bottom: calc(20px * var(--scale-factor, 1));
}

.summary-item {
  flex: 1;
  padding: calc(8px * var(--scale-factor, 1));
  border-radius: calc(8px * var(--scale-factor, 1));
  text-align: center;
  font-size: calc(14px * var(--scale-factor, 1));
}

.summary-item.income {
  background: #22c55e;
}

.summary-item.expense {
  background: #ef4444;
}

.summary-item.savings {
  background: #007bd3;
}

.summary-item .label {
  font-weight: bold;
}

.summary-item .value {
  margin-top: 5px;
  display: block;
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
  font-size: calc(14px * var(--scale-factor, 1));
}
.transactions-list table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: calc(12px * var(--scale-factor, 1));
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
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
  max-width: 100%;
}

.pagination button {
  padding: 6px 12px;
  flex-shrink: 0;
  min-width: 40px;
  border: 1px solid #eab308;
  background: transparent;
  color: #eab308;
  border-radius: 5px;
  cursor: pointer;
  font-size: calc(14px * var(--scale-factor, 1));
}

.pagination button.active-page {
  background: #eab308;
  color: black;
  font-weight: bold;
}

.pagination-ellipsis {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #ccc;
  font-size: 18px;
}

.input-field {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.915);
  border: 1px solid #eab308;
  border-radius: 8px;
  color: rgb(70, 70, 70);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease-in-out;
}
.input-field:focus {
  border-color: #facc15 !important;
}
.border-red-500 {
  border-color: red !important;
}
.form-required:invalid {
  border-color: red !important;
}

.form-required:invalid:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.5);
}
/* .input-group {
  display: flex;
  align-items: center;
  transition: border-color 0.2s ease-in-out;
}
.input-group > *:not(:last-child) {
  margin-right: 20px;
}
.input-group > *:last-child {
  margin-left: auto;
} */

.input-group {
  display: flex;
  gap: 10px;
}
.calculator-btn {
  width: 100%;
  border: 1px solid #eab308;
  border-radius: 8px;
  color: rgb(70, 70, 70);
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease-in-out;
  background: #eab308;
  cursor: pointer;
  font-size: 32px;
}
.calculator-modal {
  width: 300px;
  text-align: center;
}
.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 5px;
}
.calculator-buttons button {
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
}

.calculator-content {
  background: rgba(255, 255, 255);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 380px;
  text-align: center;
  overflow: hidden;
  transition: height 0.3s ease-in-out;
}

.calculator-content .calculator-display {
  height: 3rem;
  font-size: 32px;
  border: 1px solid #eab308;
  border-radius: 8px;
}

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  gap: 10px;
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2px;
}

.export-buttons {
  display: flex;
  gap: 10px;
}

.btn-export,
.btn-template,
.btn-import {
  text-align: center;
  padding: 8px 12px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-import input {
  display: none;
}

.btn-export:hover,
.btn-template:hover,
.btn-import:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Responsive Table */
.responsive-table {
  width: 100%;
  border-collapse: collapse;
  font-size: calc(14px * var(--scale-factor, 1));
}
.responsive-table th,
.responsive-table td {
  padding: calc(10px * var(--scale-factor, 1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  :root {
    --scale-factor: 0.8;
  }
  .transactions-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .summary-cards {
    flex-direction: column;
  }
  .responsive-table {
    font-size: 12px;
  }
  .filters-container {
    flex-direction: column; /* Stack items vertically */
    align-items: stretch; /* Stretch to full width */
  }

  .filters,
  .export-buttons {
    width: 100%; /* Make them take full width */
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 10px;
  }

  .filter-input,
  .btn-export,
  .btn-template,
  .btn-import {
    width: 100%; /* Ensure full width on mobile */
  }

  .pagination {
    width: 100%;
  }
}

@media (max-width: 480px) {
  :root {
    --scale-factor: 0.7;
  }
  .transactions-container {
    padding: 10px;
  }
  .summary-item {
    font-size: 12px;
  }
  .pagination {
    width: 100%;
  }
}
</style>

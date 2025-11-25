<template>
  <div v-if="isLoadingData" class="loading-container">
    <div class="loading-spinner"></div>
  </div>

  <div class="page transactions-page">
    <PageHeader
      pill="Money movement"
      title="Transactions"
      subtitle="Review, filter, and share every inflow and outflow for your group."
    >
      <template #actions>
        <button class="btn-secondary" @click="downloadTemplate">
          Template
        </button>
        <button class="btn-primary" @click="openModal">
          + Add transaction
        </button>
      </template>
    </PageHeader>

    <section class="summary-grid">
      <StatCard
        label="Income"
        :value="`${currency} ${formatAmount(totalIncome)}`"
        helper="Tracked inflow"
        tone="positive"
      />
      <StatCard
        label="Expenses"
        :value="`${currency} ${formatAmount(totalExpense)}`"
        helper="Tracked outflow"
        tone="negative"
      />
      <StatCard
        label="Savings"
        :value="`${currency} ${formatAmount(totalSavings)}`"
        helper="Income - expenses"
      />
    </section>

    <BaseCard class="filters-panel">
      <div class="filters-grid">
        <label class="date-range-control">
          <span>Date range</span>
          <div class="range-picker" @click="toggleRangePicker">
            <span class="range-picker__value">
              {{ displayRange }}
            </span>
            <svg
              class="range-picker__icon"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M7 11l5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div v-if="rangePickerOpen" class="range-picker__panel">
            <div class="range-picker__grid">
              <label>
                <span>Start</span>
                <input type="date" v-model="startDate" @change="validateRange" />
              </label>
              <label>
                <span>End</span>
                <input type="date" v-model="endDate" @change="validateRange" />
              </label>
            </div>
            <div class="range-picker__actions">
              <button class="btn-outline" type="button" @click="resetRange">
                Reset
              </button>
              <button class="btn-primary" type="button" @click="applyRange">
                Apply
              </button>
            </div>
          </div>
        </label>
        <label>
          <span>Type</span>
          <select v-model="selectedType" @change="fetchTransactions">
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label>
          <span>Category</span>
          <select v-model="selectedCategory" @change="fetchTransactions">
            <option value="">All categories</option>
            <option
              v-for="category in filteredCategories"
              :key="category.id"
              :value="category.id"
            >
              {{
                selectedType === "" || selectedType === null
                  ? `${category.name} (${category.type})`
                  : category.name
              }}
            </option>
          </select>
        </label>
      </div>
      <div class="filters-actions">
        <button class="btn-outline" @click="exportTransactions">
          Export
        </button>
        <label class="btn-outline">
          Import
          <input
            type="file"
            ref="fileInput"
            @change="importTransactions"
            hidden
          />
        </label>
      </div>
    </BaseCard>

    <BaseCard class="table-card">
      <div class="section-label">Ledger</div>
      <div class="table-scroll">
        <table v-if="transactions.length > 0" class="responsive-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Category</th>
              <th>Actor</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in transactions" :key="transaction.id">
              <td>{{ transaction.description || "Untitled" }}</td>
              <td :class="transaction.type === 'expense' ? 'text-red' : 'text-green'">
                {{ currency }} {{ formatAmount(transaction.amount) }}
              </td>
              <td>{{ transaction.category.name }}</td>
              <td>{{ transaction.actor || "—" }}</td>
              <td>{{ transaction.transaction_time }}</td>
              <td class="table-actions">
                <button @click="editTransaction(transaction)" class="ghost-btn">Edit</button>
                <button @click="deleteTransaction(transaction.id)" class="ghost-btn danger">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-table">No transactions found</p>
      </div>
    </BaseCard>

    <BaseCard tag="div" surface class="pagination">
      <button v-if="page > 1" @click="prevPage">Previous</button>
      <template v-for="(p, index) in paginationPages" :key="index">
        <button
          v-if="typeof p === 'number'"
          :class="{ 'active-page': parseInt(transactionsMeta.current_page) === p }"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>
        <button v-else @click="showPageInput = true" class="pagination-ellipsis">
          ...
        </button>
      </template>
      <button v-if="transactionsMeta.next_page_url" @click="nextPage">
        Next
      </button>
    </BaseCard>

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
      <button @click="showPageInput = false" class="ml-2 btn-secondary">Cancel</button>
    </div>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showTransactionModal"
          class="modal-overlay"
          @click.self="closeModal"
        >
          <Transition name="modal-scale">
            <div class="modal-content modal-content--wide">
              <header class="modal-head">
                <div>
                  <p class="pill">{{ isEditing ? "Update entry" : "New entry" }}</p>
                  <h2>{{ isEditing ? "Edit transaction" : "Add transaction" }}</h2>
                  <p class="modal-subtitle">
                    Keep it short—just the essentials the team needs to reconcile.
                  </p>
                </div>
                <button type="button" class="btn-secondary" @click="closeModal">Close</button>
              </header>

              <form @submit.prevent="saveTransaction" ref="transactionForm" class="transaction-form">
                <div class="form-grid">
                  <label>
                    <span>Type</span>
                    <select v-model="formData.type" required class="input-field">
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                    </select>
                  </label>

                  <label>
                    <span>Category</span>
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
                  </label>

                  <label class="form-span">
                    <span>Description</span>
                    <input
                      type="text"
                      v-model="formData.description"
                      placeholder="Add a short note"
                      class="input-field"
                    />
                  </label>

                  <label>
                    <span>Amount ({{ currency }})</span>
                    <div class="input-group">
                      <input
                        type="text"
                        v-model="formData.formattedAmount"
                        placeholder="0.00"
                        required
                        class="input-field"
                      />
                      <span class="calculator-btn-wrapper">
                        <button type="button" class="calculator-btn px-4" @click="openCalculator">
                          Calc
                        </button>
                      </span>
                    </div>
                  </label>

                  <label>
                    <span>Actor</span>
                    <select v-model="selectedActor" class="input-field">
                      <option value="" disabled>Select actor</option>
                      <option
                        v-for="member in members"
                        :key="member.id"
                        :value="member.name"
                      >
                        {{ member.name }}
                      </option>
                      <option value="other">Other (type manually)</option>
                    </select>
                  </label>

                  <label v-if="selectedActor === 'other'">
                    <span>Custom actor</span>
                    <input
                      type="text"
                      v-model="manualActor"
                      placeholder="Enter actor name"
                      class="input-field"
                    />
                  </label>

                  <label>
                    <span>Date &amp; time</span>
                    <input
                      type="datetime-local"
                      v-model="formData.transaction_time"
                      required
                      class="input-field"
                      step="1"
                    />
                  </label>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn-secondary" @click="closeModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn-primary">
                    <span v-if="isLoading" class="spinner"></span>
                    <span v-else>{{ isEditing ? "Update" : "Create" }}</span>
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

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
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from "vue";
import api from "../services/api";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";
import PageHeader from "../components/layout/PageHeader.vue";
import BaseCard from "../components/layout/BaseCard.vue";
import StatCard from "../components/layout/StatCard.vue";

const appStore = useAppStore();
const { currentGroup } = storeToRefs(appStore);

const transactions = ref([]);
const categories = ref([]);
const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const formatDate = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
const startDate = ref(formatDate(startOfMonth));
const endDate = ref(formatDate(today));
const rangePickerOpen = ref(false);
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
const members = ref([]);
const selectedActor = ref("");
const manualActor = ref("");
const transactionsMeta = ref({ current_page: 1, last_page: 1 });
const currency = ref("Rp");
const fileInput = ref(null);
const focused = ref(false);
const showPageInput = ref(false);
const jumpPageInput = ref("");

const calculatorValue = computed(() => formatExpression(rawExpression.value));
const filteredCategories = computed(() =>
  categories.value.filter((category) => {
    if (!selectedType.value) {
      return true;
    }
    return category.type === selectedType.value;
  })
);

const displayRange = computed(() => {
  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(start)} — ${formatter.format(end)}`;
});

const formData = ref({
  type: "expense",
  category_id: null,
  group_id: null,
  amount: "",
  formattedAmount: "",
  description: "",
  actor: "",
  transaction_time: "",
  proof: null,
});

const paginationPages = computed(() => {
  const totalPages = transactionsMeta.value.last_page ?? 1;
  const current = parseInt(transactionsMeta.value.current_page ?? 1, 10);

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [1];

  if (current > 3) pages.push("prev-ellipsis");

  for (let i = current - 1; i <= current + 1; i++) {
    if (i > 1 && i < totalPages) {
      pages.push(i);
    }
  }

  if (current < totalPages - 2) pages.push("next-ellipsis");

  if (totalPages !== 1) pages.push(totalPages);

  return pages;
});

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(Number(amount ?? 0));

const applyCurrencyMask = (value) =>
  formatAmount(Number(value?.toString().replace(/[^\d.-]/g, "")));

const resetForm = () => {
  formData.value = {
    type: "expense",
    category_id: categories.value[0]?.id ?? null,
    group_id: currentGroup.value?.id ?? null,
    amount: "",
    formattedAmount: "",
    description: "",
    actor: "",
    transaction_time: new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
    )
      .toISOString()
      .slice(0, 16),
    proof: null,
  };
  selectedActor.value = "";
  manualActor.value = "";
};

const validateRange = () => {
  if (new Date(startDate.value) > new Date(endDate.value)) {
    endDate.value = startDate.value;
  }
};

const applyRange = () => {
  validateRange();
  rangePickerOpen.value = false;
  page.value = 1;
  fetchTransactions();
};

const resetRange = () => {
  startDate.value = formatDate(startOfMonth);
  endDate.value = formatDate(today);
  applyRange();
};

const toggleRangePicker = () => {
  rangePickerOpen.value = !rangePickerOpen.value;
};

const fetchTransactions = async () => {
  if (!currentGroup.value) return;
  isLoadingData.value = true;

  try {
    const response = await api.get("/transactions", {
      params: {
        group_id: currentGroup.value.id,
        page: page.value,
        type: selectedType.value || undefined,
        category_id: selectedCategory.value || undefined,
        start_date: startDate.value || undefined,
        end_date: endDate.value || undefined,
      },
    });

    const payload = response.data.transactions;
    transactions.value = payload?.data ?? payload ?? [];
    transactionsMeta.value = payload ?? { current_page: 1, last_page: 1 };
    totalIncome.value = response.data.total_income ?? 0;
    totalExpense.value = response.data.total_expense ?? 0;
    totalSavings.value = response.data.total_savings ?? 0;
  } catch (error) {
    console.error("Error fetching transactions:", error);
  } finally {
    isLoadingData.value = false;
  }
};

const fetchCategories = async () => {
  if (!currentGroup.value) return;

  try {
    const response = await api.get("/categories", {
      params: { group_id: currentGroup.value.id },
    });
    categories.value = response.data ?? [];
    if (!formData.value.category_id) {
      formData.value.category_id = categories.value[0]?.id ?? null;
    }
  } catch (error) {
    console.error("Failed to fetch categories", error);
  }
};

const fetchMembers = async () => {
  if (!currentGroup.value) return;
  try {
    const response = await api.get(
      `/groups/${currentGroup.value.id}/members`
    );
    members.value = response.data.data ?? response.data ?? [];
  } catch (error) {
    console.error("Failed to fetch members", error);
  }
};

const openModal = () => {
  isEditing.value = false;
  resetForm();
  showTransactionModal.value = true;
};

const closeModal = () => {
  showTransactionModal.value = false;
  resetForm();
};

const saveTransaction = async () => {
  if (!currentGroup.value) return;
  isLoading.value = true;

  try {
    formData.value.group_id = currentGroup.value.id;
    formData.value.actor =
      selectedActor.value === "other" ? manualActor.value : selectedActor.value;

    const payload = new FormData();
    Object.entries(formData.value).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        payload.append(key, value);
      }
    });

    if (isEditing.value) {
      await api.put(`/transactions/${formData.value.id}`, payload);
    } else {
      await api.post("/transactions", payload);
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
  formData.value = {
    id: transaction.id,
    type: transaction.type,
    category_id: transaction.category.id,
    group_id: currentGroup.value?.id ?? null,
    amount: transaction.amount.toString(),
    formattedAmount: formatAmount(transaction.amount),
    description: transaction.description || "",
    actor: transaction.actor || "",
    transaction_time: transaction.transaction_time,
    proof: transaction.proof || null,
  };

  const memberExists = members.value.some(
    (member) => member.name === transaction.actor
  );
  if (memberExists) {
    selectedActor.value = transaction.actor;
    manualActor.value = "";
  } else if (transaction.actor) {
    selectedActor.value = "other";
    manualActor.value = transaction.actor;
  } else {
    selectedActor.value = "";
    manualActor.value = "";
  }
};

const deleteTransaction = async (id) => {
  if (!confirm("Delete this transaction?")) return;

  try {
    await api.delete(`/transactions/${id}`, {
      data: { group_id: currentGroup.value.id },
    });
    fetchTransactions();
  } catch (error) {
    console.error("Failed to delete transaction", error);
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    fetchTransactions();
  }
};

const nextPage = () => {
  if (
    transactionsMeta.value.current_page <
    transactionsMeta.value.last_page
  ) {
    page.value++;
    fetchTransactions();
  }
};

const goToPage = (p) => {
  page.value = p;
  fetchTransactions();
};

const handleJumpPage = () => {
  const target = parseInt(jumpPageInput.value, 10);
  if (
    target >= 1 &&
    target <= (transactionsMeta.value.last_page ?? 1)
  ) {
    page.value = target;
    fetchTransactions();
    showPageInput.value = false;
  }
};

const exportTransactions = async () => {
  if (!currentGroup.value) return;
  isLoadingData.value = true;

  try {
    const response = await api.get("/transactions/export", {
      params: { group_id: currentGroup.value.id },
      responseType: "blob",
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
  if (!currentGroup.value) return;
  const file = event.target.files?.[0];
  if (!file) return;

  const payload = new FormData();
  payload.append("file", file);
  payload.append("group_id", currentGroup.value.id);

  isLoadingData.value = true;

  try {
    await api.post("/transactions/import", payload);
    fetchTransactions();
  } catch (error) {
    console.error("Failed to import transactions", error);
  } finally {
    isLoadingData.value = false;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
};

const openCalculator = () => {
  showCalculator.value = true;
  nextTick(() => {
    calculatorInput.value?.focus();
  });
};

const closeCalculator = () => {
  showCalculator.value = false;
  rawExpression.value = "";
};

const appendToCalculator = (char) => {
  rawExpression.value += char;
};

const deleteLastDigit = () => {
  rawExpression.value = rawExpression.value.slice(0, -1);
};

const clearCalculator = () => {
  rawExpression.value = "";
};

const evaluateExpression = (expression) => {
  try {
    return Function(`"use strict"; return (${expression})`)().toString();
  } catch (error) {
    console.error("Invalid expression", error);
    return "";
  }
};

const calculateResult = () => {
  const sanitized = formatExpression(rawExpression.value);
  rawExpression.value = evaluateExpression(sanitized);
};

const insertCalculatorValue = () => {
  if (!rawExpression.value) return;
  formData.value.formattedAmount = applyCurrencyMask(rawExpression.value);
  formData.value.amount = formData.value.formattedAmount.replace(/[^0-9.]/g, "");
  closeCalculator();
};

const handleKeydown = (event) => {
  const allowed = "0123456789+-*/.";
  if (allowed.includes(event.key)) {
    appendToCalculator(event.key);
    event.preventDefault();
  }
};

const formatExpression = (value) => value.replace(/[^0-9+\-*/.]/g, "");

const syncBodyScrollLock = () => {
  if (typeof document === "undefined") return;
  const shouldLock = showTransactionModal.value || showCalculator.value;
  document.body.classList.toggle("modal-open", shouldLock);
};

watch([showTransactionModal, showCalculator], syncBodyScrollLock, {
  immediate: true,
});

onBeforeUnmount(() => {
  if (typeof document !== "undefined") {
    document.body.classList.remove("modal-open");
  }
});

watch(
  () => formData.value.formattedAmount,
  (newVal) => {
    if (!newVal) return;
    formData.value.formattedAmount = applyCurrencyMask(newVal);
    formData.value.amount = formData.value.formattedAmount.replace(
      /[^0-9.]/g,
      ""
    );
  }
);

watch(
  () => currentGroup.value,
  async (group) => {
    if (!group) return;
    resetForm();
    await Promise.all([fetchCategories(), fetchTransactions(), fetchMembers()]);
  }
);

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchTransactions(), fetchMembers()]);
  resetForm();
});
</script>

<style scoped>
.transactions-page .page-subtitle {
  color: #94a3b8;
  margin-top: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.filters-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.date-range-control {
  position: relative;
}

.range-picker {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 12px;
  padding: 12px 14px;
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.range-picker:hover {
  border-color: #eab308;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.range-picker__value {
  font-size: 0.95rem;
}

.range-picker__icon {
  color: #eab308;
}

.range-picker__panel {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;
  margin-top: 8px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
  width: min(420px, 92vw);
}

.range-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.range-picker__grid label span {
  display: block;
  color: #94a3b8;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.range-picker__grid input[type="date"] {
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #f8fafc;
  padding: 10px 12px;
  border-radius: 10px;
}

.range-picker__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.filters-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #cbd5f5;
  font-size: 0.9rem;
}

.filters-grid input,
.filters-grid select {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  padding: 12px;
  color: #f8fafc;
}

.filters-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-card {
  padding: 0;
}

.table-card .section-label {
  padding: 24px 24px 0;
}

.table-scroll {
  overflow-x: auto;
  padding: 24px;
}

.responsive-table {
  width: 100%;
  border-collapse: collapse;
  color: #f8fafc;
}

.responsive-table th,
.responsive-table td {
  text-align: left;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
}

.table-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ghost-btn {
  background: rgba(148, 163, 184, 0.15);
  border: none;
  border-radius: 999px;
  color: #f8fafc;
  padding: 8px 14px;
  cursor: pointer;
}

.ghost-btn.danger {
  color: #fb7185;
}

.text-green {
  color: #34d399;
}

.text-red {
  color: #fb7185;
}

.pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.pagination button {
  background: transparent;
  border: 1px solid rgba(248, 250, 252, 0.3);
  color: #f8fafc;
  border-radius: 10px;
  padding: 8px 14px;
  cursor: pointer;
}

.pagination .active-page {
  background: #fbbf24;
  color: #0f172a;
  border-color: #fbbf24;
}

.pagination-ellipsis {
  border: none;
  background: transparent;
  color: #cbd5f5;
}

.empty-table {
  padding: 32px;
  text-align: center;
  color: #94a3b8;
}

.jump-page-modal {
  display: flex;
  align-items: center;
  margin-top: 12px;
}

.modal-content--wide {
  max-width: min(860px, 95vw);
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  text-align: left;
}

.modal-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.modal-head h2 {
  margin: 6px 0;
  color: #f8fafc;
}

.modal-subtitle {
  color: #94a3b8;
  margin: 0;
}

.transaction-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.form-grid label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #cbd5f5;
  font-size: 0.9rem;
}

.form-span {
  grid-column: span 2;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.input-field {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.915);
  border: 1px solid #eab308;
  border-radius: 12px;
  color: #1e293b;
  font-size: 1rem;
}

.calculator-content {
  background: rgba(15, 23, 42, 0.9);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #f8fafc;
}

.calculator-display {
  height: 3rem;
  font-size: 32px;
  border: 1px solid #eab308;
  border-radius: 8px;
  margin-bottom: 16px;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, minmax(60px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.calculator-buttons button {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.4);
  background: rgba(248, 250, 252, 0.05);
  color: #f8fafc;
  font-size: 1rem;
  cursor: pointer;
}

@media (max-width: 768px) {
  .form-span {
    grid-column: span 1;
  }

  .filters-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

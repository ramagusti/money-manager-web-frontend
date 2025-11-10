<template>
  <div v-if="isLoadingData" class="loading-container">
    <div class="loading-spinner"></div>
  </div>

  <div class="page dashboard-page">
    <PageHeader
      pill="Workspace overview"
      :title="currentGroup?.name || 'Your finances'"
      :subtitle="`A quick view of balances, goals, and activity for ${currentGroup?.name || 'your group'}.`"
    >
      <template #actions>
        <button
          v-if="userGroups?.length"
          class="btn-secondary"
          @click="showGoalModal = true"
        >
          Update goal
        </button>
        <button
          v-if="userGroups?.length"
          class="btn-primary"
          @click="navigateToTransactions"
        >
          + New transaction
        </button>
      </template>
    </PageHeader>

    <BaseCard
      v-if="!userGroups || userGroups.length === 0"
      tag="div"
      class="empty-state"
    >
      <h3>No groups yet</h3>
      <p>Create your first group to start tracking activity.</p>
      <button @click="showCreateGroupModal = true" class="btn-primary">
        Create group
      </button>
    </BaseCard>

    <template v-else>
      <section class="summary-grid">
        <StatCard
          v-for="tile in summaryTiles"
          :key="tile.label"
          :label="tile.label"
          :value="tile.value"
          :helper="tile.helper"
          :tone="tile.tone"
        />
      </section>

      <section class="insights-grid">
        <BaseCard class="stretch">
          <SavingGoals
            :goal="goal"
            :income="income"
            :expenses="expenses"
            :groupId="currentGroup?.id"
            @openGoalModal="showGoalModal = true"
          />
        </BaseCard>
        <BaseCard class="stretch">
          <IncomeExpenseChart :income="income" :expenses="expenses" />
        </BaseCard>
      </section>

      <section class="detail-grid">
        <BaseCard>
          <Summary :transactions="allTransactions" />
        </BaseCard>
        <BaseCard>
          <MonthlySummary :transactions="filteredTransactions" />
        </BaseCard>
      </section>

      <BaseCard>
        <div class="section-label">Recent activity</div>
        <RecentTransactions :transactions="allTransactions" />
      </BaseCard>

      <section class="extra-grid">
        <BaseCard>
          <div class="section-label">Category spotlight</div>
          <ul class="category-list">
            <li v-for="category in topExpenseCategories" :key="category.name">
              <span>
                <span class="dot dot--expense"></span>
                {{ category.name }}
              </span>
              <strong>{{ category.total }}</strong>
            </li>
            <li v-if="!topExpenseCategories.length" class="muted">
              Not enough expense data yet.
            </li>
          </ul>
        </BaseCard>
        <BaseCard>
          <div class="section-label">Cashflow trend</div>
          <div class="trend-list">
            <article v-for="month in cashflowTrend" :key="month.label">
              <div>
                <p class="trend-month">{{ month.label }}</p>
                <small>Net {{ formatCurrency(month.net) }}</small>
              </div>
              <div class="trend-values">
                <span class="trend-income">+{{ formatCurrency(month.income) }}</span>
                <span class="trend-expense">-{{ formatCurrency(month.expense) }}</span>
              </div>
            </article>
            <p v-if="!cashflowTrend.length" class="muted">
              Transactions will populate this view automatically.
            </p>
          </div>
        </BaseCard>
        <BaseCard>
          <div class="section-label">Action center</div>
          <ul class="action-list">
            <li v-for="item in actionItems" :key="item.title">
              <div>
                <p class="action-title">{{ item.title }}</p>
                <p class="action-body">{{ item.body }}</p>
              </div>
              <span :class="['action-pill', `action-pill--${item.accent}`]">
                {{ item.pill }}
              </span>
            </li>
          </ul>
        </BaseCard>
      </section>
    </template>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showCreateGroupModal"
          class="modal-overlay"
          @click.self="closeGroupModal"
        >
          <div class="modal-content">
            <h2 class="text-3xl font-semibold text-gold mb-6">
              Create New Group
            </h2>
            <form class="space-y-4" @submit.prevent="createGroup">
              <div class="input-group">
                <input
                  type="text"
                  v-model="groupName"
                  placeholder="Group Name"
                  class="input-field"
                  required
                />
              </div>
              <button
                @click="createGroup"
                class="btn-primary m-auto"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>Create Group</span>
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showGoalModal"
          class="modal-overlay"
          @click.self="closeGoalModal"
        >
          <div class="modal-content">
            <h2 class="text-3xl font-semibold text-gold mb-6">
              Set Savings Goal
            </h2>
            <form class="space-y-4" @submit.prevent="setGoal">
              <div class="input-group">
                <input
                  type="text"
                  v-model="formattedNewGoal"
                  placeholder="Enter goal amount"
                  class="input-field"
                />
              </div>
              <button
                type="submit"
                class="btn-primary m-auto"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>Set Goal</span>
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";
import RecentTransactions from "../components/RecentTransactions.vue";
import IncomeExpenseChart from "../components/IncomeExpenseChart.vue";
import Summary from "../components/Summary.vue";
import MonthlySummary from "../components/MonthlySummary.vue";
import SavingGoals from "../components/SavingGoals.vue";
import PageHeader from "../components/layout/PageHeader.vue";
import BaseCard from "../components/layout/BaseCard.vue";
import StatCard from "../components/layout/StatCard.vue";
import api from "../services/api";

const appStore = useAppStore();
const router = useRouter();
const { userGroups, currentGroup, showCreateGroupModal } =
  storeToRefs(appStore);

const groupName = ref("");
const isLoading = ref(false);
const isLoadingData = ref(true);
const balance = ref(0);
const allTransactions = ref([]);
const filteredTransactions = ref([]);
const income = ref(0);
const expenses = ref(0);
const goal = ref(0);
const newGoal = ref("");
const formattedNewGoal = ref("");
const showGoalModal = ref(false);

watch(
  () => formattedNewGoal.value,
  async (newVal) => {
    if (!newVal) return;

    formattedNewGoal.value = formatAmount(
      Number(newVal.toString().replace(/[^\d.-]/g, ""))
    );

    newGoal.value = formattedNewGoal.value.replace(/[^0-9.]/g, "");
  }
);

const formatAmount = (amount) => {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount ?? 0);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount ?? 0));
};

const currentSavings = computed(() => income.value - expenses.value);

const savingsRate = computed(() => {
  if (!income.value) return "0%";
  const rate = ((income.value - expenses.value) / income.value) * 100;
  return `${Math.max(0, rate).toFixed(1)}%`;
});

const goalGap = computed(() =>
  Math.max((goal.value || 0) - currentSavings.value, 0)
);

const summaryTiles = computed(() => [
  {
    label: "Available balance",
    value: formatCurrency(balance.value),
    helper: "Live total across the group",
    tone: "primary",
  },
  {
    label: "Income this month",
    value: formatCurrency(income.value),
    helper: "Tracked inflows",
    tone: "positive",
  },
  {
    label: "Expenses this month",
    value: formatCurrency(expenses.value),
    helper: "Tracked outflows",
    tone: "negative",
  },
  {
    label: "Savings rate",
    value: savingsRate.value,
    helper: "Income retained",
    tone: "neutral",
  },
]);

const navigateToTransactions = () => {
  router.push("/transactions");
};

const topExpenseCategories = computed(() => {
  const totals = {};
  (allTransactions.value || [])
    .filter((transaction) => transaction.type === "expense")
    .forEach((transaction) => {
      const key = transaction.category?.name || "Uncategorized";
      totals[key] = (totals[key] || 0) + Number(transaction.amount || 0);
    });

  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, total]) => ({
      name,
      total: formatCurrency(total),
    }));
});

const cashflowTrend = computed(() => {
  const buckets = {};
  (allTransactions.value || []).forEach((transaction) => {
    const date = new Date(transaction.transaction_time);
    if (Number.isNaN(date.getTime())) {
      return;
    }
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const label = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    if (!buckets[key]) {
      buckets[key] = { label, income: 0, expense: 0 };
    }
    if (transaction.type === "income") {
      buckets[key].income += Number(transaction.amount || 0);
    } else {
      buckets[key].expense += Number(transaction.amount || 0);
    }
  });

  return Object.entries(buckets)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([, value]) => ({
      ...value,
      net: value.income - value.expense,
    }));
});

const actionItems = computed(() => {
  const hasGoal = Boolean(goal.value);
  const recentTransactions = (allTransactions.value || []).filter(
    (transaction) => {
      const date = new Date(transaction.transaction_time);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return date >= sevenDaysAgo;
    }
  );

  return [
    hasGoal
      ? {
          title: "Goal progress",
          body:
            goalGap.value <= 0
              ? "Current savings have met this month's goal."
              : `${formatCurrency(goalGap.value)} to hit the goal.`,
          pill: `${Math.min(
            100,
            (currentSavings.value / goal.value) * 100 || 0
          ).toFixed(0)}%`,
          accent: goalGap.value <= 0 ? "positive" : "neutral",
        }
      : {
          title: "No monthly goal yet",
          body: "Set a target to keep the group aligned.",
          pill: "Add goal",
          accent: "neutral",
        },
    {
      title: "Savings this month",
      body: `${formatCurrency(currentSavings.value)} retained`,
      pill: "Savings",
      accent: "primary",
    },
    {
      title: "Recent activity",
      body: `${recentTransactions.length} entries in the past 7 days`,
      pill: "Watchlist",
      accent: "neutral",
    },
  ];
});

const setGoal = async () => {
  if (!newGoal.value || newGoal.value <= 0) {
    alert("Please enter a valid goal amount.");
    return;
  }

  isLoading.value = true;
  try {
    await api.post(`/groups/${currentGroup.value?.id}/goal`, {
      goal_amount: newGoal.value,
    });
    showGoalModal.value = false;
  } catch (error) {
    console.error("Failed to set goal", error);
  } finally {
    fetchDashboardData();
    isLoading.value = false;
    formattedNewGoal.value = "";
  }
};

watch(showCreateGroupModal, (newVal) => {
  if (!newVal) {
    groupName.value = "";
  }
});

const fetchDashboardData = async () => {
  if (!currentGroup.value) {
    isLoadingData.value = false;
    return;
  }

  isLoadingData.value = true;

  try {
    const [
      balanceResponse,
      transactionsResponse,
      incomeExpenseResponse,
      goalResponse,
    ] = await Promise.all([
      api.get("/groups/" + currentGroup.value?.id + "/balance"),
      api.get(`/dashboard-data?group_id=${currentGroup.value?.id}`),
      api.get("/groups/" + currentGroup.value?.id + "/incomeexpense"),
      api.get("/groups/" + currentGroup.value?.id + "/goal"),
    ]);

    balance.value = balanceResponse.data.balance;
    allTransactions.value = transactionsResponse.data.all_transactions;
    filteredTransactions.value = transactionsResponse.data.filtered_transactions;
    income.value = Number(incomeExpenseResponse.data.income);
    expenses.value = Number(incomeExpenseResponse.data.expense);
    goal.value = Number(goalResponse.data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
  } finally {
    isLoadingData.value = false;
  }
};

onMounted(async () => {
  try {
    if (userGroups.value?.length > 0 && !currentGroup.value) {
      appStore.setCurrentGroup(userGroups.value[0]);
    }

    await fetchDashboardData();
  } catch (error) {
    console.error("Error fetching groups:", error);
  }
});

const createGroup = async () => {
  if (!groupName.value.trim()) {
    alert("Group name is required.");
    return;
  }

  isLoading.value = true;
  try {
    const response = await api.post("/groups", { name: groupName.value });
    appStore.setUserGroups([...userGroups.value, response.data]);
    appStore.setCurrentGroup(response.data);
    appStore.setShowCreateGroupModal(false);
  } catch (error) {
    console.error("Failed to create group:", error);
  } finally {
    isLoading.value = false;
  }
};

const closeGroupModal = () => {
  appStore.setShowCreateGroupModal(false);
};

const closeGoalModal = () => {
  showGoalModal.value = false;
};
</script>

<style scoped>
.dashboard-page .page-subtitle {
  color: #94a3b8;
  margin-top: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.insights-grid,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stretch {
  min-height: 100%;
}

.empty-state {
  text-align: center;
}

.empty-state h3 {
  margin-bottom: 8px;
}

.empty-state p {
  color: #cbd5f5;
  margin-bottom: 16px;
}

.extra-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.category-list,
.action-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-list li,
.action-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 0.95rem;
  color: #cbd5f5;
}

.category-list strong {
  color: #f8fafc;
}

.trend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-list article {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.trend-list article:last-child {
  border-bottom: none;
}

.trend-month {
  margin: 0;
  font-weight: 600;
  color: #f8fafc;
}

.trend-values {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.trend-income {
  color: #34d399;
}

.trend-expense {
  color: #fb7185;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
  display: inline-flex;
}

.dot--expense {
  background: #fb7185;
}

.muted {
  color: #94a3b8;
  font-size: 0.9rem;
}

.action-title {
  margin: 0;
  font-weight: 600;
  color: #f8fafc;
}

.action-body {
  margin: 2px 0 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.action-pill {
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.action-pill--primary {
  color: #0f172a;
  background: linear-gradient(120deg, #fbbf24, #f97316);
  border-color: transparent;
}

.action-pill--positive {
  color: #0f172a;
  background: linear-gradient(120deg, #34d399, #22c55e);
  border-color: transparent;
}

.action-pill--neutral {
  color: #cbd5f5;
}

@media (max-width: 768px) {
  :deep(.stat-card__value) {
    font-size: 1.5rem;
  }

  :deep(.stat-card__helper) {
    font-size: 0.85rem;
  }
}

.input-field {
  width: 100%;
  padding: calc(12px * var(--scale-factor));
  background: rgba(255, 255, 255, 0.915);
  border: 1px solid #eab308;
  border-radius: 8px;
  color: rgb(70, 70, 70);
  font-size: calc(14px * var(--scale-factor));
  outline: none;
  transition: border-color 0.2s ease-in-out;
}
.input-field:focus {
  border-color: #facc15 !important;
}

@media (max-width: 768px) {
  .page-head {
    flex-direction: column;
  }
}
</style>

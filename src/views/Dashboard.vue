<template>
  <div v-if="isLoadingData" class="loading-container">
    <div class="loading-spinner"></div>
  </div>
  <div class="dashboard-container">
    <!-- <Sidebar /> -->

    <div class="dashboard-content">
      <div class="dashboard-header">
        <h2 class="font-bold text-white">💸 Dashboard</h2>
        <div>
          <BalanceCard class="p-2" :balance="balance" />
        </div>
      </div>

      <!-- No Group Found -->
      <div
        v-if="!userGroups || userGroups.length === 0"
        class="no-group-container"
      >
        <p class="no-group-title mb-2">You don't have any groups yet.</p>
        <p class="no-group-description mb-4">Create a group to start managing transactions.</p>
        <button @click="showCreateGroupModal = true" class="btn-primary">
          ➕ Create Group
        </button>
      </div>

      <div v-else>
        <SavingGoals
          class="mb-8"
          :goal="goal"
          :income="income"
          :expenses="expenses"
          :groupId="currentGroup?.id"
          @openGoalModal="showGoalModal = true"
        />

        <!-- Dashboard Widgets -->
        <div class="dashboard-widgets">
          <RecentTransactions :transactions="transactions" />
          <IncomeExpenseChart :income="income" :expenses="expenses" />
          <Summary :transactions="transactions" />
          <MonthlySummary :transactions="transactions" />
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
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

    <!-- Create Goal Modal -->
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
import { ref, onMounted, nextTick, watch } from "vue";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";
import Sidebar from "../components/Sidebar.vue";
import BalanceCard from "../components/BalanceCard.vue";
import RecentTransactions from "../components/RecentTransactions.vue";
import IncomeExpenseChart from "../components/IncomeExpenseChart.vue";
import Summary from "../components/Summary.vue";
import MonthlySummary from "../components/MonthlySummary.vue";
import SavingGoals from "../components/SavingGoals.vue";
import api from "../services/api";

const appStore = useAppStore();
const { userGroups, currentGroup, showCreateGroupModal } =
  storeToRefs(appStore);

const groupName = ref("");
const isLoading = ref(false);
const isLoadingData = ref(true);
const balance = ref(0);
const transactions = ref([]);
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

    newGoal.value = formattedNewGoal.value.replace(
      /[^0-9.]/g,
      ""
    );
  }
);

const formatAmount = (amount) => {
  return Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    useGrouping: true,
  }).format(amount);
};

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
    transactions.value = transactionsResponse.data.transactions;
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
    // const response = await api.get("/groups");
    // appStore.setUserGroups(response.data);

    if (userGroups.value?.length > 0 && !currentGroup.value) {
      appStore.setCurrentGroup(userGroups.value[0]);
    }

    await fetchDashboardData();
  } catch (error) {
    console.error("Error fetching groups:", error);
  }
});

// Create Group
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

watch(currentGroup, (newVal) => {
  if (newVal) {
    fetchDashboardData();
  }
});
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: calc(14px * var(--scale-factor, 1));
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(20px * var(--scale-factor, 1));
  font-size: calc(24px * var(--scale-factor, 1));
}

.dashboard-content {
  flex-grow: 1;
  /* padding: 24px; */
  margin-left: calc(80px * var(--scale-factor, 1));
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  font-size: calc(14px * var(--scale-factor, 1));
}

.no-group-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 60vh; /* Adjust height to make sure it is centered */
}

.no-group-title {
  font-size: calc(28px * var(--scale-factor, 1));
  font-weight: bold;
  color: #eab308;
}

.no-group-description {
  font-size: calc(20px * var(--scale-factor, 1));
  color: #d1d5db;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .dashboard-widgets {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>

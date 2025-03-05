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
        <h2>You don't have any groups yet.</h2>
        <p>Create a group to start managing transactions.</p>
        <button @click="showCreateGroupModal = true" class="btn-primary">
          ➕ Create Group
        </button>
      </div>

      <div v-else>
        <SavingGoals class="mb-8" :income="income" :expenses="expenses" />
        
        <!-- Dashboard Widgets -->
        <div class="dashboard-widgets">
          <!-- <BalanceCard :balance="balance" /> -->
          <RecentTransactions :transactions="transactions" />
          <IncomeExpenseChart :income="income" :expenses="expenses" />
          <!-- <SavingGoals :income="income" :expenses="expenses" /> -->
        </div>
      </div>
    </div>

    <!-- Create Group Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showCreateGroupModal"
          class="modal-overlay"
          @click.self="closeModal"
        >
          <div class="modal-content">
            <h2>Create a New Group</h2>
            <form @submit.prevent="createGroup">
              <input
                type="text"
                v-model="groupName"
                placeholder="Group Name"
                class="input-field"
                required
              />
              <button type="submit" class="btn-primary" :disabled="isLoading">
                <span v-if="isLoading" class="spinner"></span>
                <span v-else>Create</span>
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";
import Sidebar from "../components/Sidebar.vue";
import BalanceCard from "../components/BalanceCard.vue";
import RecentTransactions from "../components/RecentTransactions.vue";
import IncomeExpenseChart from "../components/IncomeExpenseChart.vue";
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
const savingGoals = ref([]);

const fetchDashboardData = async () => {
  try {
    const [balanceResponse, transactionsResponse, goalsResponse] =
      await Promise.all([
        // api.get("/balance"),
        [],
        api.get(`/transactions?limit=5&group_id=${currentGroup.value?.id}`),
        // api.get("/saving-goals"),
        [],
      ]);

    // balance.value = balanceResponse.data.balance;
    transactions.value = transactionsResponse.data.transactions.data;
    income.value = Number(transactionsResponse.data.total_income);
    expenses.value = Number(transactionsResponse.data.total_expense);
    // savingGoals.value = goalsResponse.data.goals;
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

// Close modal
const closeModal = () => {
  appStore.setShowCreateGroupModal(false);
};
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
  font-size: calc(28px * var(--scale-factor, 1));
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

/* Overlay Animation */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Modal Scale Animation */
.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: transform 0.3s ease-in-out;
}
.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.8);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 380px;
  text-align: center;
  overflow: hidden;
  transition: height 0.3s ease-in-out;
}

/* Input Field */
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

/* Buttons */
.btn-primary {
  background: #eab308;
  color: black;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary:hover {
  background: #facc15;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
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

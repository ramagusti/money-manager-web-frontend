<template>
  <div v-if="isLoadingData" class="loading-container">
    <div class="loading-spinner"></div>
  </div>
  <div class="dashboard-container">
    <!-- <Sidebar /> -->

    <div class="dashboard-content">
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

      <!-- Dashboard Widgets -->
      <div v-else class="dashboard-widgets">
        <BalanceCard :balance="balance" />
        <RecentTransactions :transactions="transactions" />
        <IncomeExpenseChart :income="income" :expenses="expenses" />
        <SpendingGoals :spendingGoals="spendingGoals" />
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
import SpendingGoals from "../components/SpendingGoals.vue";
import api from "../services/api";

const appStore = useAppStore();
const { isCollapsed, userGroups, currentGroup, showCreateGroupModal } =
  storeToRefs(appStore);

const groupName = ref("");
const isLoading = ref(false);
const errors = ref({ groupName: "" });
const modalBox = ref(null);
const isLoadingData = ref(true);
const balance = ref(0);
const transactions = ref([]);
const income = ref(0);
const expenses = ref(0);
const spendingGoals = ref([]);

const fetchBalances = async () => {
  try {
    const response = await api.get("/balance");
    balance.value = response.data.balance;
  } catch (error) {
    console.error("Failed to fetch balance:", error);
  }
};

const fetchRecentTransactions = async () => {
  try {
    const response = await api.get(
      `/transactions?limit=5&group_id=${currentGroup.value.id}`
    );
    transactions.value = response.data.transactions.data;
    income.value = Number(response.data.total_income);
    expenses.value = Number(response.data.total_expense);
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
  }
};

const fetchSpendingGoals = async () => {
  try {
    const response = await api.get("/spending-goals");
    spendingGoals.value = response.data.goals;
  } catch (error) {
    console.error("Failed to fetch spending goals:", error);
  }
};

onMounted(async () => {
  try {
    const response = await api.get("/groups");
    appStore.setUserGroups(response.data);

    if (userGroups.value?.length > 0 && !currentGroup.value) {
      appStore.setCurrentGroup(userGroups.value[0]);
    }

    await fetchBalances();
    await fetchRecentTransactions();
    await fetchSpendingGoals();
  } catch (error) {
    console.error("Error fetching groups:", error);
  } finally {
    appStore.setLoading(false);
    isLoadingData.value = false;
  }
});

// Create Group
const createGroup = async () => {
  if (!groupName.value.trim()) {
    errors.value.groupName = "Group name is required.";
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
    errors.value.groupName = "Failed to create group. Try again.";
  } finally {
    isLoading.value = false;
  }
};

// Clear error message
const clearError = () => {
  errors.value.groupName = "";
};

// Close modal
const closeModal = () => {
  appStore.setShowCreateGroupModal(false);
  errors.value.groupName = "";
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.dashboard-content {
  flex-grow: 1;
  padding: 24px;
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
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
}
</style>

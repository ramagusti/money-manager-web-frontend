<template>
  <div class="dashboard-container">
    <!-- <Sidebar /> -->

    <div
      class="dashboard-content"
    >
      <!-- If no groups exist, show "Create Group" UI -->
      <div
        v-if="!userGroups || userGroups?.length === 0"
        class="no-group-container text-white flex items-center justify-center h-screen"
      >
        <div class="text-center">
          <h2 class="text-3xl font-bold mb-2">You don't have any groups yet.</h2>
          <p class="mb-4 text-gray-300">
            Create a group to start managing transactions.
          </p>
          <button
            @click="showCreateGroupModal = true"
            class="btn-primary mx-auto max-w-max"
          >
            ➕ Create Group
          </button>
        </div>
      </div>

      <!-- Show Dashboard only if groups exist -->
      <div v-else class="dashboard-widgets">
        <BalanceCard />
        <RecentTransactions />
        <IncomeExpenseChart />
        <SpendingGoals />
      </div>
    </div>

    <!-- Styled Group Creation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showCreateGroupModal"
          class="modal-overlay"
          @click.self="closeModal"
        >
          <Transition name="modal-scale">
            <div class="modal-content" ref="modalBox">
              <h2 class="text-3xl font-semibold text-gold mb-4">
                Create a New Group
              </h2>
              <form @submit.prevent="createGroup" class="space-y-4">
                <div class="input-group">
                  <input
                    type="text"
                    v-model="groupName"
                    placeholder="Group Name"
                    class="input-field"
                    :class="{ 'border-red-500': errors.groupName }"
                    @focus="clearError"
                    required
                  />
                  <Transition name="fade">
                    <p
                      v-if="errors.groupName"
                      class="text-red-400 text-sm mt-1"
                    >
                      {{ errors.groupName }}
                    </p>
                  </Transition>
                </div>

                <button
                  type="submit"
                  class="btn-primary w-full"
                  :disabled="isLoading"
                >
                  <span v-if="isLoading" class="spinner"></span>
                  <span v-else> Create </span>
                </button>
                <!-- <button
                  @click="closeModal"
                  type="button"
                  class="btn-danger w-full"
                >
                  Cancel
                </button> -->
              </form>
            </div>
          </Transition>
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
const { isCollapsed, userGroups, currentGroup, showCreateGroupModal } = storeToRefs(appStore);

const groupName = ref("");
const isLoading = ref(false);
const errors = ref({ groupName: "" });
const modalBox = ref(null);

// // Fetch groups on mount
// onMounted(async () => {
//   try {
//     const response = await api.get("/groups");
//     appStore.setUserGroups(response.data);

//     if (userGroups.value?.length > 0 && !currentGroup.value) {
//       appStore.setCurrentGroup(userGroups.value[0]);
//     }
//   } catch (error) {
//     console.error("Error fetching groups:", error);
//   } finally {
//     appStore.setLoading(false);
//   }
// });

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
  min-height: 100vh;
  background-color: #111827; /* Deep dark background */
}

.dashboard-content {
  flex-grow: 1;
  padding: 24px;
}

.dashboard-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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
</style>

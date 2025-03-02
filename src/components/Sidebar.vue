<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <!-- Sidebar Toggle Button -->
      <button @click="toggleSidebar" class="toggle-btn">
        <span v-if="isCollapsed">➡️</span>
        <span v-else>⬅️</span>
      </button>

      <!-- Group Selection -->
      <div v-if="!isCollapsed">
        <select
          v-if="userGroups?.length > 0"
          v-model="selectedGroup"
          @change="updateGroup"
          class="group-select"
        >
          <option v-for="group in userGroups" :key="group.id" :value="group.id" class="text-black">
            {{ group.name }}
          </option>
          <option value="create-new" class="text-black">Create New Group</option>
        </select>
        <span v-else class="text-white">No Group</span>
      </div>
    </div>

    <!-- App Title -->
    <h2 v-if="!isCollapsed" class="sidebar-title mt-6">💰 Money Manager</h2>

    <!-- Navigation Links -->
    <nav class="mt-2">
      <router-link to="/dashboard" class="nav-link" active-class="active">
        🏠 <span v-if="!isCollapsed">Dashboard</span>
      </router-link>
      <router-link to="/transactions" class="nav-link" active-class="active">
        💳 <span v-if="!isCollapsed">Transactions</span>
      </router-link>
      <!-- <router-link to="/reports" class="nav-link" active-class="active">
        📊 <span v-if="!isCollapsed">Reports</span>
      </router-link>
      <router-link to="/settings" class="nav-link" active-class="active">
        ⚙️ <span v-if="!isCollapsed">Settings</span>
      </router-link> -->
    </nav>

    <!-- Logout Button -->
    <div class="logout-container">
      <button @click="logout" class="btn-danger w-full text-start">
        <span v-if="!isCollapsed">🚪 Logout</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useAuthStore } from "../stores/auth";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import api from "../services/api";

const authStore = useAuthStore();
const router = useRouter();
const appStore = useAppStore();
const selectedGroup = ref(null);

// Extract reactive state from the store as refs
const { appLoading, isCollapsed, userGroups, currentGroup } = storeToRefs(appStore);

watch(currentGroup, async () => {
  selectedGroup.value = currentGroup.value.id;
});

onMounted(async () => {
  selectedGroup.value = currentGroup.value.id;
});

// Method to toggle sidebar collapse
const toggleSidebar = () => {
  appStore.setCollapsed(!isCollapsed.value);
};

// Handle group change
const updateGroup = () => {
  if (selectedGroup.value === "create-new") {
    appStore.setShowCreateGroupModal(true);
    return;
  }
  appStore.setCurrentGroup(userGroups.value.find(g => g.id === selectedGroup.value));
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style scoped>
/* Sidebar */
.sidebar {
  width: 260px;
  height: 100vh;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
  padding: 24px;
  transition: width 0.3s ease-in-out;
}

.sidebar.collapsed {
  width: 90px;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Group Select */
.group-select {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px;
  border-radius: 6px;
  outline: none;
  font-size: 14px;
}

/* App Title */
.sidebar-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 24px;
  text-align: center;
  color: white;
}

/* Navigation Links */
.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-bottom: 6px;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  background-color: rgba(255, 255, 255, 0.15);
}

/* Toggle Button */
.toggle-btn {
  border: none;
  padding: 4px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
  align-self: flex-start;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Logout Button */
.logout-container {
  margin-top: auto;
}
</style>

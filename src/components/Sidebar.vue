<template>
  <aside
    class="sidebar"
    :class="{ collapsed: isCollapsed, 'mobile-open': isMobile }"
  >
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <!-- Sidebar Toggle Button -->
      <button @click="toggleSidebar" class="toggle-btn text-white">☰</button>

      <!-- Group Selection -->
      <div v-if="!isCollapsed">
        <select
          v-if="userGroups?.length > 0"
          v-model="selectedGroup"
          @change="updateGroup"
          class="group-select"
        >
          <option
            v-for="group in userGroups"
            :key="group.id"
            :value="group.id"
            class="text-black"
          >
            {{ group.name }}
          </option>
          <option value="create-new" class="text-black">
            Create New Group
          </option>
        </select>
        <span v-else class="text-white">No Group</span>
      </div>
    </div>

    <!-- App Title -->
    <div
      v-if="!isCollapsed"
      class="sidebar-title mt-6 flex flex-row items-center m-auto"
    >
      <img
        v-if="!isCollapsed"
        src="/images/PiggyBang.svg"
        alt="PiggyBang Logo"
        class="sidebar-logo w-8 h-8"
      />
      <span class="text-white ml-2"> PiggyBang </span>
    </div>

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

const authStore = useAuthStore();
const router = useRouter();
const appStore = useAppStore();
const selectedGroup = ref(null);
const isMobile = ref(window.innerWidth <= 768);

// Extract reactive state from the store as refs
const { isCollapsed, userGroups, currentGroup } = storeToRefs(appStore);

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
  appStore.setCurrentGroup(
    userGroups.value.find((g) => g.id === selectedGroup.value)
  );
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
  height: 100%;
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

/* Responsive Sidebar */
@media (max-width: 768px) {
  .sidebar {
    padding: 8px;
  }

  .sidebar.collapsed {
    width: 54px !important;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px;
  }

  .logout-container {
    width: 80%;
    margin: 0 auto;
  }
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

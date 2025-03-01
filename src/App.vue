<template>
  <div>
    <!-- Header (Only shown outside of dashboard & transactions) -->
    <Header
      v-if="!['/dashboard', '/transactions'].includes($route.path)"
    />

    <!-- Modals -->
    <LoginModal 
      :isOpen="showAuthModal && $route.path === '/login'" 
    />
    <SignupModal
      :isOpen="showAuthModal && $route.path === '/signup'"
    />

    <!-- Main Layout -->
    <div v-if="!appLoading" :class="isDashboard ? 'app-container' : ''">
      <!-- Sidebar (Persistent for Dashboard & Transactions) -->
      <Sidebar v-if="isDashboard" />

      <!-- Dynamic Content -->
      <div
        :class="isDashboard ? 'app-content' : ''"
        :style="isDashboard ? { 'margin-left': isCollapsed ? '90px' : '260px' } : {}"
      >
        <router-view />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex justify-center items-center h-screen">
      <span class="spinner"></span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { useAppStore } from "./stores/app";
import { storeToRefs } from "pinia";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import LoginModal from "./components/LoginModal.vue";
import SignupModal from "./components/SignupModal.vue";

const authStore = useAuthStore();
const appStore = useAppStore();
const { appLoading, isCollapsed, currentGroup } = storeToRefs(appStore);
const isLoginOpen = ref(false);
const isSignupOpen = ref(false);
const router = useRouter();
const isDashboard = computed(() => ['/dashboard', '/transactions'].includes(router.currentRoute.value.path));

const showAuthModal = computed(() => {
  return ['/login', '/signup'].includes(router.currentRoute.value.path);
});

// onMounted(async () => {
//   appStore.setLoading(true);
//   try {
//     await authStore.fetchUser();
//     await appStore.fetchGroups();
//   } catch (error) {
//     console.error("Failed to load user & groups:", error);
//   } finally {
//     appStore.setLoading(false);
//   }
// });
</script>

<style>
/* Global styles */
body {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #eab308;
}

body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("/patterns/dots.svg"); /* Subtle dot overlay */
  opacity: 0.1;
  pointer-events: none;
}

.text-gold {
  color: #eab308;
}

.bg-gold {
  background-color: #eab308;
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
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #eab308;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
}
.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-danger {
  background: #dc2626;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
}
.btn-danger:hover {
  background: #f64545;
}
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid white;
  border-top: 3px solid transparent;
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

.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #111827;
}

.app-content {
  flex-grow: 1;
  padding: 24px;
}
</style>


<template>
  <div>
    <!-- Header (Shown only outside dashboard & transactions) -->
    <Header v-if="!['/dashboard', '/transactions'].includes($route.path)" />

    <!-- Authentication Modals -->
    <LoginModal :isOpen="showAuthModal && $route.path === '/login'" />
    <SignupModal :isOpen="showAuthModal && $route.path === '/signup'" />

    <!-- Main Layout -->
    <div v-if="!appLoading" :class="isDashboard ? 'app-container' : ''">
      <!-- Sidebar (Persistent in Dashboard & Transactions) -->
      <Sidebar v-if="isDashboard" />

      <!-- Page Content -->
      <div
        :class="isDashboard ? 'app-content' : ''"
        :style="
          isDashboard ? { 'margin-left': isCollapsed ? '110px' : '240px' } : {}
        "
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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "./stores/app";
import { storeToRefs } from "pinia";
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import LoginModal from "./components/LoginModal.vue";
import SignupModal from "./components/SignupModal.vue";

const appStore = useAppStore();
const { appLoading, isCollapsed, currentGroup } = storeToRefs(appStore);
const router = useRouter();
const isDashboard = computed(() =>
  ["/dashboard", "/transactions"].includes(router.currentRoute.value.path)
);

const showAuthModal = computed(() => {
  return ["/login", "/signup"].includes(router.currentRoute.value.path);
});
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

/* App Layout */
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: #111827;
}

.app-content {
  flex-grow: 1;
  padding: 16px;
}

/* Responsive Sidebar */
@media (max-width: 768px) {
  .app-content {
    margin-left: 0 !important;
  }
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

/* Slide + Fade Transition for Content */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease, height 0.3s ease-in-out;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Fade transition for errors */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Base Styles */
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
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  transform: none;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(6px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.3);
  border-top-color: #eab308;
  border-radius: 50%;
  animation: spin 1s linear infinite;
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

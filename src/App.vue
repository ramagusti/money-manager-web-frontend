<template>
  <div class="app-container">
    <!-- Authentication Modals -->
    <LoginModal :isOpen="showAuthModal && $route.path === '/login'" />
    <SignupModal :isOpen="showAuthModal && $route.path === '/signup'" />
    <ForgotPasswordModal :isOpen="showAuthModal && $route.path === '/forgot-password'" />
    <ResetPasswordModal :isOpen="showAuthModal && $route.path === '/reset-password'" />

    <!-- Main Layout -->
    <div v-if="!appLoading" class="app-layout">
      <!-- Sidebar (Persistent in Dashboard & Transactions) -->
      <Sidebar v-if="isDashboard" />

      <!-- Page Content -->
      <div
        :class="{
          'app-content': isDashboard,
          collapsed: isDashboard && isCollapsed,
          'mobile-view': isMobile,
        }"
        style="overflow-y: auto"
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
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useAppStore } from "./stores/app";
import { storeToRefs } from "pinia";
import Sidebar from "./components/Sidebar.vue";
import LoginModal from "./components/LoginModal.vue";
import SignupModal from "./components/SignupModal.vue";
import ForgotPasswordModal from "./components/ForgotPasswordModal.vue";
import ResetPasswordModal from "./components/ResetPasswordModal.vue"; 

const appStore = useAppStore();
const { appLoading, isCollapsed, currentGroup } = storeToRefs(appStore);
const router = useRouter();
const isMobile = ref(window.innerWidth <= 768);
const scaleFactor = ref(1); // Controls dynamic scaling

const isDashboard = computed(() =>
  ["/dashboard", "/transactions", "/settings"].includes(router.currentRoute.value.path)
);

const showAuthModal = computed(() => {
  return ["/login", "/signup", "/forgot-password", "/reset-password"].includes(router.currentRoute.value.path);
});

// Update isMobile state on resize & scale elements accordingly
const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  scaleFactor.value = Math.max(0.75, window.innerWidth / 1440); // Scale UI down on smaller screens
  document.documentElement.style.setProperty("--scale-factor", scaleFactor.value);
  
  if (isMobile.value) {
    appStore.setCollapsed(true);
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

watch(isCollapsed, (newVal) => {
  document.documentElement.style.setProperty(
    "--sidebar-width",
    `${newVal ? 80 : 240 * scaleFactor.value}px`
  );
});
</script>

<style>
/* Scale UI elements based on screen width */
:root {
  --scale-factor: 1;
}

/* Global styles */
body {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #eab308;
  margin: 0;
  height: 100vh;
  overflow: hidden; /* Prevents scrolling */
  display: flex;
  flex-direction: column;
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
  padding: calc(12px * var(--scale-factor));
  border-radius: calc(8px * var(--scale-factor));
  font-size: calc(14px * var(--scale-factor));
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
  padding: calc(12px * var(--scale-factor));
  border-radius: calc(8px * var(--scale-factor));
  font-size: calc(14px * var(--scale-factor));
  font-weight: bold;
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
  padding: calc(12px * var(--scale-factor));
  border-radius: calc(8px * var(--scale-factor));
  font-size: calc(14px * var(--scale-factor));
  font-weight: bold;
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
  width: calc(24px * var(--scale-factor));
  height: calc(24px * var(--scale-factor));
  border: 3px solid white;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  z-index: 20;
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
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* Main Layout */
.app-layout {
  display: block;
  flex: 1;
  height: 100vh;
  overflow: auto;
}

/* Sidebar will stay fixed, content scrolls */
.app-content {
  flex-grow: 1;
  height: 100vh;
  padding: calc(16px * var(--scale-factor));
  transition: margin-left 0.3s ease-in-out;
  margin-left: calc(180px * var(--scale-factor));
}

/* Collapsed Sidebar */
.app-content.collapsed {
  margin-left: calc(40px * var(--scale-factor));
}

/* Mobile View */
.app-content.mobile-view {
  margin-left: 0;
}

/* Prevent overflow issues */
.app-layout::-webkit-scrollbar {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  width: calc(6px * var(--scale-factor));
}
.app-layout::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.app-content::-webkit-scrollbar {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  width: calc(6px * var(--scale-factor));
}
.app-content::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

/* Responsive Scaling */
@media (max-width: 1024px) {
  :root { --scale-factor: 0.9; }
}

@media (max-width: 768px) {
  :root { --scale-factor: 0.75; }
  .app-content { padding: 10px; }
  .app-content {
    margin-left: 0 !important;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  :root { --scale-factor: 0.65; }
  .app-content { padding: 8px; }
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
</style>

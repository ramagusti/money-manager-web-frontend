<template>
  <div class="app-container">
    <!-- Authentication Modals -->
    <LoginModal :isOpen="showAuthModal && $route.path === '/login'" />
    <SignupModal :isOpen="showAuthModal && $route.path === '/signup'" />
    <ForgotPasswordModal :isOpen="showAuthModal && $route.path === '/forgot-password'" />
    <ResetPasswordModal :isOpen="showAuthModal && $route.path === '/reset-password'" />

    <!-- Main Layout -->
    <div v-if="!appLoading" class="app-layout">
      <Sidebar
        v-if="isDashboard"
        v-model:mobileOpen="mobileSidebarOpen"
      />

      <div
        :class="[
          isDashboard ? 'app-content' : 'app-content--full',
          {
            collapsed: isDashboard && isCollapsed,
            'mobile-view': isMobile,
          },
        ]"
      >
        <button
          v-if="isDashboard"
          class="mobile-nav-trigger"
          @click="mobileSidebarOpen = true"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
          </svg>
          Menu
        </button>
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
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
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
const mobileSidebarOpen = ref(false);

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
  } else {
    mobileSidebarOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  handleResize();
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

watch(isCollapsed, (newVal) => {
  document.documentElement.style.setProperty(
    "--sidebar-width",
    `${newVal ? 80 : 240 * scaleFactor.value}px`
  );
});

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    mobileSidebarOpen.value = false;
  }
);
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
  min-height: 100vh;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.modal-open {
  overflow: hidden;
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
.btn-primary,
.btn-secondary,
.btn-outline,
.btn-danger {
  border-radius: 999px;
  padding: clamp(10px, 1.8vw, 14px) clamp(20px, 4vw, 32px);
  font-weight: 600;
  font-size: clamp(0.9rem, 1vw, 1rem);
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(120deg, #fbbf24, #f97316);
  color: #0f172a;
  box-shadow: 0 15px 30px rgba(249, 115, 22, 0.35);
}

.btn-secondary {
  background: linear-gradient(120deg, #22d3ee, #6366f1);
  color: #0f172a;
  box-shadow: 0 20px 40px rgba(14, 165, 233, 0.35);
  border: none;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(248, 250, 252, 0.6);
  color: #f8fafc;
}

.btn-danger {
  background: linear-gradient(130deg, #dc2626, #fb923c);
  color: #f8fafc;
}

.btn-primary:hover,
.btn-secondary:hover,
.btn-outline:hover,
.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.35);
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-outline:disabled,
.btn-danger:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  min-height: 100vh;
}

.app-layout {
  display: flex;
  flex: 1;
  min-height: 100vh;
  position: relative;
}

.app-content {
  flex-grow: 1;
  min-height: 100vh;
  padding: clamp(16px, 3vw, 32px);
  transition: margin-left 0.3s ease-in-out, padding 0.3s ease;
  margin-left: calc(180px * var(--scale-factor));
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.35);
}

.app-content--full {
  width: 100%;
  /* padding: clamp(16px, 4vw, 40px); */
}

.app-content.collapsed {
  margin-left: calc(80px * var(--scale-factor));
}

.app-content.mobile-view {
  margin-left: 0;
  padding: 20px 16px 80px;
}

.mobile-nav-trigger {
  display: none;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #f8fafc;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  width: max-content;
}

.page {
  display: flex;
  flex-direction: column;
  gap: clamp(32px, 5vw, 56px);
  color: #f8fafc;
  padding-bottom: clamp(32px, 6vw, 80px);
}

.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;
}

.page-head h1 {
  margin: 6px 0 0;
  font-size: clamp(2rem, 4vw, 2.75rem);
  color: #f8fafc;
}

.page-head__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.pill {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: #a5b4fc;
}

.base-card {
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(2, 6, 23, 0.7);
  padding: clamp(20px, 3vw, 32px);
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.45);
}

.base-card--surface {
  border-radius: 24px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.55);
  padding: clamp(18px, 2.5vw, 28px);
  box-shadow: none;
}

.base-card--stretch {
  height: 100%;
}

.section-label {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #94a3b8;
  margin-bottom: 8px;
}

.app-layout::-webkit-scrollbar,
.app-content::-webkit-scrollbar {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  width: calc(6px * var(--scale-factor));
}

.app-layout::-webkit-scrollbar-thumb,
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
  .app-content {
    margin-left: 0 !important;
    padding: 24px 16px 80px;
  }
  .mobile-nav-trigger {
    display: inline-flex;
  }
}

@media (max-width: 480px) {
  :root { --scale-factor: 0.65; }
  .app-content {
    padding: 20px 14px 64px;
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
  overflow-y: auto;
  padding: clamp(24px, 5vw, 48px) clamp(12px, 4vw, 32px);
  z-index: 100;
}
.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: min(420px, 92vw);
  text-align: center;
  max-height: 90vh;
  overflow-y: auto;
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

<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="brand">Money Manager</router-link>

      <!-- Mobile Menu Toggle -->
      <button class="menu-toggle" @click="toggleMenu">☰</button>

      <!-- Navigation -->
      <nav :class="{ 'nav-open': menuOpen }">
        <template v-if="authStore.isAuthenticated">
          <button @click="authStore.logout" class="btn-header">Logout</button>
        </template>
        <template v-else>
          <button @click="router.push('/login')" class="btn-header">
            Login
          </button>
          <button @click="router.push('/signup')" class="btn-primary">
            Sign Up
          </button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};
</script>

<style scoped>
/* Header */
.header {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  padding: 12px 20px;
  z-index: 1000;
}

/* Header container */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: auto;
}

/* Brand Name */
.brand {
  font-size: 1.5rem;
  color: #eab308;
}

/* Navigation */
nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Buttons */
.btn-header {
  background: black;
  color: #eab308;
  border: 1px solid #eab308;
  padding: 10px 14px;
  border-radius: 8px;
  transition: 0.3s;
}

.btn-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-primary {
  background: #eab308;
  color: black;
  padding: 10px 14px;
  border-radius: 8px;
  transition: 0.3s;
}

.btn-primary:hover {
  background: #facc15;
}

/* Mobile Menu */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.8rem;
  color: #eab308;
  cursor: pointer;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  nav {
    display: none;
    flex-direction: column;
    gap: 10px;
    position: absolute;
    top: 60px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    padding: 10px;
    border-radius: 10px;
  }

  .nav-open {
    display: flex;
  }

  .btn-header,
  .btn-primary {
    width: 100%;
    text-align: center;
  }
}
</style>

<template>
  <header class="header">
    <div class="header-container">
      <router-link to="/" class="brand">Money Manager</router-link>
      <nav>
        <template v-if="authStore.isAuthenticated">
          <button
            @click="authStore.logout"
            class="px-4 py-2 border border-gold bg-black text-gold rounded-lg"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <button
            @click="router.push('/login')"
            class="px-4 py-2 border border-gold bg-black text-gold rounded-lg"
          >
            Login
          </button>
          <button
            @click="router.push('/signup')"
            class="ml-3 px-4 py-2 bg-gold text-black rounded-lg border border-transparent hover:bg-[#facc15] hover:text-black"
          >
            Sign Up
          </button>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  padding: 10px;
  z-index: 100;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: auto;
  padding: 0 20px;
}

.brand {
  font-size: 1.5rem;
  color: #eab308;
}
</style>
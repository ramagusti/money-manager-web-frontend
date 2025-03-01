<template>
  <header class="top-navbar bg-opacity-25 backdrop-blur-md">
    <div class="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
      <router-link to="/" class="text-2xl font-bold text-white">
        Money Manager
      </router-link>
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
import router from "../router";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();
</script>

<style scoped>
.top-navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  justify-content: space-between;
  background: #1c2d56;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
}
</style>

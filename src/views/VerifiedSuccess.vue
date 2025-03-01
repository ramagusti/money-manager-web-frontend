<template>
  <div class="flex items-center justify-center h-screen text-center">
    <div class="glassmorphism p-8 max-w-md">
      <h2 class="text-3xl font-semibold text-gold">✅ Email Verified!</h2>
      <p class="text-gray-300 mt-4">You can now log in to your account.</p>
      <p class="text-sm text-gray-400 mt-4">
        Redirecting in {{ countdown }}s...
      </p>

      <button @click="redirectToLogin" class="btn-primary mt-4">
        Go to Login
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const countdown = ref(5);

const redirectToLogin = () => {
  router.push("/login");
};

onMounted(() => {
  const interval = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(interval);
      redirectToLogin();
    }
  }, 1000);
});
</script>

<style scoped>
.glassmorphism {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
}

.btn-primary {
  background: #eab308;
  color: black;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
  width: 100%;
  display: block;
}

.btn-primary:hover {
  background: #facc15;
}
</style>

<template>
  <div class="join-group-container">
    <div v-if="isLoading" class="loading">Joining group...</div>
    <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import api from "../services/api";

const router = useRouter();
const route = useRoute();
const isLoading = ref(true);
const errorMessage = ref("");

onMounted(async () => {
  const token = route.query.token;

  if (!token) {
    errorMessage.value = "Invalid or missing invitation token.";
    return;
  }

  try {
    await api.post("/groups/join", { token });
    router.push("/dashboard"); // Redirect to dashboard after joining
  } catch (error) {
    errorMessage.value = error.response?.data?.error || "Failed to join group.";
  } finally {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.join-group-container {
  text-align: center;
  margin-top: 50px;
}
.loading {
  font-size: 18px;
  font-weight: bold;
}
.error {
  color: red;
  font-size: 16px;
  margin-top: 20px;
}
</style>

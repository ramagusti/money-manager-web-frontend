<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="isOpen" class="modal-overlay" @click.self="close">
        <Transition name="modal-scale">
          <div v-if="isOpen" class="modal-content" ref="modalBox">
            <Transition
              name="fade-slide"
              mode="out-in"
              @before-enter="adjustHeight"
              @after-enter="resetHeight"
            >
              <div key="reset">
                <h2 class="text-3xl font-semibold text-gold mb-4">
                  Reset Password
                </h2>
                <form @submit.prevent="reset" class="space-y-4">
                  <input
                    type="password"
                    v-model="password"
                    placeholder="New Password"
                    class="input-field"
                    required
                  />
                  <input
                    type="password"
                    v-model="passwordConfirmation"
                    placeholder="Confirm Password"
                    class="input-field"
                    required
                  />
                  <button class="btn-primary w-full" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner"></span>
                    <span v-else>Reset Password</span>
                  </button>
                </form>

                <p class="text-sm text-green-400 mt-4" v-if="successMessage">
                  {{ successMessage }}
                </p>
                <p class="text-sm text-red-400 mt-4" v-if="errorMessage">
                  {{ errorMessage }}
                </p>
              </div>
            </Transition>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, defineProps, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "../services/api";

const props = defineProps({ isOpen: Boolean });

const modalBox = ref(null);
const isLoading = ref(false);
const password = ref("");
const passwordConfirmation = ref("");
const successMessage = ref("");
const errorMessage = ref("");

const route = useRoute();
const router = useRouter();

const reset = async () => {
  isLoading.value = true;
  try {
    await api.post("/reset-password", {
      email: route.query.email,
      token: route.query.token,
      password: password.value,
      password_confirmation: passwordConfirmation.value,
    });

    successMessage.value = "Password reset successful. Redirecting to login...";
    errorMessage.value = "";

    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (err) {
    successMessage.value = "";
    errorMessage.value = err.response?.data?.message || "Reset failed.";
  } finally {
    isLoading.value = false;
  }
};

const close = () => {
  router.push("/");
};

const adjustHeight = async () => {
  await nextTick();
  if (modalBox.value) {
    modalBox.value.style.height = `${modalBox.value.scrollHeight}px`;
  }
};

const resetHeight = () => {
  if (modalBox.value) {
    modalBox.value.style.height = "auto";
  }
};
</script>

<style scoped>
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

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
              <div key="forgot-password">
                <h2 class="text-3xl font-semibold text-gold mb-6">
                  Forgot Password
                </h2>
                <form @submit.prevent="submit" class="space-y-4">
                  <div class="input-group">
                    <input
                      v-model="email"
                      type="email"
                      placeholder="Enter your email"
                      class="input-field"
                      :class="{ 'border-red-500': errorMessage }"
                      @focus="clearError"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    class="btn-primary w-full"
                    :disabled="isLoading"
                  >
                    <span v-if="isLoading" class="spinner"></span>
                    <span v-else>Send Reset Link</span>
                  </button>
                </form>

                <p v-if="successMessage" class="text-sm text-green-400 mt-2">
                  {{ successMessage }}
                </p>
                <p v-if="errorMessage" class="text-sm text-red-400 mt-2">
                  {{ errorMessage }}
                </p>

                <p class="mt-4 text-gray-400 text-sm">
                  Remember your password?
                  <span
                    @click="router.push('/login')"
                    class="text-gold cursor-pointer hover:underline"
                    >Login</span
                  >
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
import { useRouter } from "vue-router";
import api from "../services/api";

const props = defineProps({ isOpen: Boolean });
const router = useRouter();
const email = ref("");
const successMessage = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const modalBox = ref(null);

const submit = async () => {
  isLoading.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    const res = await api.post("/forgot-password", { email: email.value });
    successMessage.value = res.data.message;
  } catch (err) {
    errorMessage.value = "Something went wrong. Please try again.";
  } finally {
    isLoading.value = false;
  }
};

const clearError = () => {
  errorMessage.value = "";
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
.border-red-500 {
  border-color: red !important;
}
</style>

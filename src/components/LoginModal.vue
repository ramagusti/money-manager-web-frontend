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
              <template v-if="authStore.isAuthenticated">
                <div key="success">
                  <h2 class="text-3xl font-semibold text-gold mb-4">
                    Welcome, {{ authStore.user?.name }} 🎉
                  </h2>
                  <p class="text-gray-300 text-sm">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </template>

              <template v-else>
                <div key="login">
                  <h2 class="text-3xl font-semibold text-gold mb-6">Login</h2>
                  <form @submit.prevent="handleLogin" class="space-y-4">
                    <div class="input-group">
                      <input
                        type="email"
                        v-model="email"
                        placeholder="Email"
                        class="input-field"
                        :class="{ 'border-red-500': errors.email }"
                        @focus="clearError('email')"
                        required
                      />
                      <Transition name="fade">
                        <p
                          v-if="errors.email"
                          class="text-red-400 text-sm mt-1"
                        >
                          {{ errors.email }}
                        </p>
                      </Transition>
                    </div>
                    <div class="input-group">
                      <input
                        type="password"
                        v-model="password"
                        placeholder="Password"
                        class="input-field"
                        :class="{ 'border-red-500': errors.password }"
                        @focus="clearError('password')"
                        required
                      />
                      <Transition name="fade">
                        <p
                          v-if="errors.password"
                          class="text-red-400 text-sm mt-1"
                        >
                          {{ errors.password }}
                        </p>
                      </Transition>
                    </div>
                    <!-- <Transition name="fade">
                      <p
                        v-if="errors.general"
                        class="text-red-400 text-sm text-center"
                      >
                        {{ errors.general }}
                      </p>
                    </Transition> -->
                    <button
                      type="submit"
                      class="btn-primary w-full"
                      :disabled="authStore.isLoading"
                    >
                      <span v-if="authStore.isLoading" class="spinner"></span>
                      <span v-else>Login</span>
                    </button>
                  </form>
                  <Transition name="fade">
                    <div v-if="errors.email" class="text-sm mt-2">
                      <p class="text-red-400">
                        {{ errors.email }}
                      </p>
                    </div>
                  </Transition>
                  <Transition name="fade">
                    <div v-if="errors.password" class="text-sm mt-2">
                      <p class="text-red-400">
                        {{ errors.password }}
                      </p>
                    </div>
                  </Transition>
                  <Transition name="fade">
                    <div v-if="errors.general" class="text-sm mt-2">
                      <p class="text-red-400">
                        {{ errors.general }}
                      </p>

                      <!-- Show the resend verification link only if the email is not resent -->
                      <p v-if="errors.general.includes('verify your email')" class="text-gray-400 mt-2">
                        Didn't receive an email?
                        <span
                          @click="resendVerification"
                          class="text-gold cursor-pointer hover:underline"
                        >
                          Resend
                        </span>
                      </p>
                    </div>
                  </Transition>
                  <p class="mt-4 text-gray-400 text-sm">
                    Don't have an account?
                    <span
                      @click="router.push('/signup')"
                      class="text-gold cursor-pointer hover:underline"
                      >Sign Up</span
                    >
                  </p>
                </div>
              </template>
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
import { useAuthStore } from "../stores/auth";
import api from "../services/api";

const email = ref("");
const password = ref("");
const isLoading = ref(false);
const modalBox = ref(null);
const errors = ref({ email: "", password: "", general: "" });
const authStore = useAuthStore();

const props = defineProps({ isOpen: Boolean });
const router = useRouter();

const handleLogin = async () => {
  isLoading.value = true;
  errors.value = { email: "", password: "", general: "" };
  
  try {
    await authStore.login(email.value, password.value);
    router.push("/dashboard");
  } catch (error) {
    const validationErrors = error.response.data.errors;
    errors.value.email = validationErrors?.email?.[0] || "";
    errors.value.password = validationErrors?.password?.[0] || "";
    if (error.response?.status === 422) {
      errors.value.general =
        validationErrors?.general || "Invalid email or password";
    } else if (error.response?.status === 403) {
      errors.value.general =
        validationErrors?.general ||
        "Please verify your email before logging in";
    } else {
      errors.value.general =
        validationErrors?.general || "Login failed. Please try again.";
    }
  } finally {
    isLoading.value = false;
  }
};

const resendVerification = async () => {
  try {
    await api.post("/email/resend", { email: email.value });

    // Change the message to inform the user that the email has been resent
    errors.value.general = "A new verification email has been sent. Please check your inbox.";
  } catch (error) {
    errors.value.general = "Failed to resend email. Please try again.";
  }
};

const clearError = (field) => {
  errors.value[field] = "";
};

const close = () => {
  router.push('/'); // Ensure route clears when closing
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

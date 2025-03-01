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
              <template v-if="isLoggedIn">
                <div key="success">
                  <h2 class="text-3xl font-semibold text-gold mb-4">
                    Welcome, {{ userName }} 🎉
                  </h2>
                  <p class="text-gray-300 text-sm">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </template>

              <template v-else>
                <div key="login">
                  <h2 class="text-3xl font-semibold text-gold mb-6">Login</h2>
                  <form @submit.prevent="login" class="space-y-4">
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
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading" class="spinner"></span>
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
                      @click="openSignup"
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
import { ref, defineProps, defineEmits, nextTick } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const email = ref("");
const password = ref("");
const userName = ref("");
const isLoggedIn = ref(false);
const isLoading = ref(false);
const modalBox = ref(null);
const router = useRouter();
const errors = ref({ email: "", password: "", general: "" });

const props = defineProps({ isOpen: Boolean });
const emit = defineEmits(["close", "openSignup"]);

const login = async () => {
  isLoading.value = true;
  errors.value = { email: "", password: "", general: "" };

  try {
    const response = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem("token", response.data.token);
    userName.value = response.data.user.name;
    isLoggedIn.value = true;

    setTimeout(() => {
      close();
      router.push("/dashboard");
    }, 2000);
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
  isLoggedIn.value = false;
  errors.value = { email: "", password: "", general: "" };
  emit("close");
};

const openSignup = () => {
  close();
  emit("openSignup");
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
.input-field {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.915);
  border: 1px solid #eab308;
  border-radius: 8px;
  color: rgb(70, 70, 70);
  font-size: 16px;
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

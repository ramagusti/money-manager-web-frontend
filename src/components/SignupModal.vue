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
              <template v-if="isSubmitted">
                <div key="success">
                  <h2 class="text-3xl font-semibold text-gold mb-4">
                    You're Almost There!
                  </h2>
                  <p class="text-gray-300 text-sm">
                    Thank you for signing up! Please check your email for a
                    verification link.
                  </p>
                  <button @click="close" class="btn-primary w-full mt-4">
                    Close
                  </button>
                </div>
              </template>

              <template v-else>
                <div key="signup">
                  <h2 class="text-3xl font-semibold text-gold mb-6">Sign Up</h2>
                  <form @submit.prevent="register" class="space-y-4">
                    <div class="input-group">
                      <input
                        type="text"
                        v-model="name"
                        placeholder="Full Name"
                        class="input-field"
                        :class="{ 'border-red-500': errors.name }"
                        @focus="clearError('name')"
                        required
                      />
                      <Transition name="fade">
                        <p
                          v-if="errors.name"
                          class="text-red-400 under-text mt-1"
                        >
                          {{ errors.name }}
                        </p>
                      </Transition>
                    </div>
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
                          class="text-red-400 under-text mt-1"
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
                          class="text-red-400 under-text mt-1"
                        >
                          {{ errors.password }}
                        </p>
                      </Transition>
                    </div>

                    <button
                      type="submit"
                      class="btn-primary w-full flex items-center justify-center"
                      :disabled="isLoading"
                    >
                      <span v-if="isLoading" class="spinner"></span>
                      <span v-else>Sign Up</span>
                    </button>
                  </form>

                  <Transition name="fade">
                    <div v-if="errors.general" class="under-text mt-2">
                      <p class="text-red-400">
                        {{ errors.general }}
                      </p>

                      <!-- Handle Email Already Registered But Not Verified -->
                      <p
                        v-if="errors.general.includes('verify your email')"
                        class="text-gray-400 mt-2"
                      >
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

                  <p class="mt-4 text-gray-400 under-text">
                    Already have an account?
                    <span
                      @click="router.push('/login')"
                      class="text-gold cursor-pointer hover:underline"
                      >Login</span
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
import { ref, defineProps, nextTick, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../services/api";

const props = defineProps({ isOpen: Boolean });
const router = useRouter();

const name = ref("");
const email = ref("");
const password = ref("");
const isSubmitted = ref(false);
const isLoading = ref(false);
const modalBox = ref(null);
const errors = ref({ name: "", email: "", password: "", general: "" });
const inviteToken = ref(router.currentRoute.value.query.token);

const recaptchaSiteKey = ref(import.meta.env.VITE_RECAPTCHA_SITE_KEY);

const register = async () => {
  isLoading.value = true;

  try {
    const recaptchaToken = await grecaptcha.execute(recaptchaSiteKey.value, {
      action: "register",
    });

    await api.post("/register", {
      name: name.value,
      email: email.value,
      password: password.value,
      invite_token: inviteToken.value,
      recaptcha_token: recaptchaToken,
    });

    isSubmitted.value = true; // Show the confirmation message
    resetForm();
  } catch (error) {
    const validationErrors = error.response?.data.errors;
    errors.value.name = validationErrors?.name?.[0] || "";
    errors.value.email = validationErrors?.email?.[0] || "";
    errors.value.password = validationErrors?.password?.[0] || "";

    if (error.response?.status === 422) {
      errors.value.general =
        validationErrors?.general ||
        "Invalid input. Please check your details.";
    } else if (error.response?.status === 403) {
      errors.value.general =
        validationErrors?.general ||
        "Please verify your email before logging in";
    } else {
      errors.value.general =
        validationErrors?.general || "Signup failed. Please try again.";
    }
  } finally {
    setTimeout(() => {
      isLoading.value = false; // Ensure spinner stops only after UI updates
    }, 500);
  }
};

const close = () => {
  router.push("/"); // Ensure route clears when closing
};

const clearError = (field) => {
  errors.value[field] = "";
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

const resetForm = () => {
  name.value = "";
  email.value = "";
  password.value = "";
};

onMounted(() => {
  if (!window.grecaptcha) {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey.value}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
});
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
  padding: calc(12px * var(--scale-factor));
  background: rgba(255, 255, 255, 0.915);
  border: 1px solid #eab308;
  border-radius: 8px;
  color: rgb(70, 70, 70);
  font-size: calc(14px * var(--scale-factor));
  outline: none;
}
.input-field:focus {
  border-color: #facc15;
}
.under-text {
  font-size: calc(14px * var(--scale-factor));
}
</style>

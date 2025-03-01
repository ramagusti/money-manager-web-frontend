<template>
  <div>
    <Header @openLogin="openLogin" @openSignup="openSignup" />
    <svg class="absolute top-0 left-0 w-full h-auto" viewBox="0 0 1440 320">
      <path
        fill="#1E3A8A"
        fill-opacity="1"
        d="M0,192L1440,320L1440,0L0,0Z"
      ></path>
    </svg>
    <Hero />
    <Features />
    <div>
      <LoginModal
        :isOpen="isLoginOpen"
        @close="closeModals"
        @openSignup="openSignup"
      />
    </div>
    <div>
      <SignupModal
        :isOpen="isSignupOpen"
        @close="closeModals"
        @openLogin="openLogin"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "../components/Header.vue";
import Hero from "../components/Hero.vue";
import Features from "../components/Features.vue";
import LoginModal from "../components/LoginModal.vue";
import SignupModal from "../components/SignupModal.vue";

const route = useRoute();
const router = useRouter();
const isLoginOpen = ref(false);
const isSignupOpen = ref(false);

const openLogin = () => {
  isLoginOpen.value = true;
  isSignupOpen.value = false;
  router.replace("/login"); // Updates URL without history stack
};

const openSignup = () => {
  isSignupOpen.value = true;
  isLoginOpen.value = false;
  router.replace("/signup");
};

const closeModals = () => {
  isLoginOpen.value = false;
  isSignupOpen.value = false;
  router.replace("/"); // Reset to homepage
};

// Ensure modals open when navigating to /login or /signup
watch(
  () => route.path,
  (newPath) => {
    if (newPath === "/login") openLogin();
    else if (newPath === "/signup") openSignup();
    else closeModals(); // Close if navigating elsewhere
  }
);

onMounted(() => {
  if (route.path === "/login") openLogin();
  if (route.path === "/signup") openSignup();
});
</script>

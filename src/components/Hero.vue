<template>
  <div class="hero-container">
    <div class="hero-overlay"></div>

    <!-- Hero Content -->
    <div class="hero-content">
      <h1 class="hero-title">
        Take Control of Your <span class="highlight">Piggybank</span>
      </h1>
      <p class="hero-description mt-6">
        A smart way to track your income, expenses, and investments.
      </p>
      <a :href="token ? '/dashboard' : '/login'" class="mt-6 btn-primary mx-auto max-w-max">
        Get Started
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";

const token = ref(localStorage.getItem("token"));

watchEffect(() => {
  token.value = localStorage.getItem("token");
});
</script>

<style scoped>
/* Hero Container */
.hero-container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px; /* Prevent text from touching the screen edges */
}

/* Background Overlay */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, black);
  opacity: 0.5;
}

/* Hero Content */
.hero-content {
  position: relative;
  z-index: 10;
  color: #eab308;
  max-width: 90%; /* Prevents text from being too wide */
}

/* Title */
.hero-title {
  font-size: calc(48px * var(--scale-factor));
  font-weight: bold;
  margin-bottom: 12px;
}

/* Highlight */
.highlight {
  color: #ff82ba;
}

/* Description */
.hero-description {
  font-size: calc(20px * var(--scale-factor));
  max-width: 600px;
  margin: 0 auto;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-description {
    font-size: 1rem;
  }
}
</style>

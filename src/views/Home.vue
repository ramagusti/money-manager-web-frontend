<template>
  <div class="home-container">
    <Header />

    <!-- Background Wave -->
    <svg class="background-wave" viewBox="0 0 1440 320">
      <path
        fill="#1E3A8A"
        fill-opacity="1"
        d="M0,192L1440,320L1440,0L0,0Z"
      ></path>
    </svg>

    <!-- Hero & Features -->
    <Hero />
    <Features />
  </div>
</template>

<script setup>
import Header from "../components/Header.vue";
import Hero from "../components/Hero.vue";
import Features from "../components/Features.vue";
</script>

<style scoped>
/* Home Container */
.home-container {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background: linear-gradient(135deg, #0f172a, #1e293b);
}

/* Background Wave */
.background-wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  z-index: -1;
}

/* Responsive Fix */
@media (max-width: 768px) {
  .background-wave {
    height: 120px;
  }
}
</style>

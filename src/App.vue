<template>
  <router-view />
</template>

<script setup>
import { RouterView } from "vue-router";
</script>

<style>
/* Global styles */
body {
  background: linear-gradient(135deg, #0f172a, #1e293b);
  color: #eab308;
}

body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('/patterns/dots.svg'); /* Subtle dot overlay */
  opacity: 0.1;
  pointer-events: none;
}

.text-gold {
  color: #eab308;
}

.bg-gold {
  background-color: #eab308;
}

/* Buttons */
.btn-primary {
  background: #eab308;
  color: black;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-primary:hover {
  background: #facc15;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Spinner */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
<template>
  <div class="flex items-center justify-center h-screen">
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gold">404</h1>
      <p class="text-gray-300 text-xl mt-2">Oops! Page not found.</p>
      <div class="mt-6">
        <router-link to="/" class="btn-primary">Go Back Home</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-gold {
  color: #eab308;
}

.btn-primary {
  background: #eab308;
  color: black;
  padding: 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  transition: background 0.2s ease-in-out;
  width: fit-content;
  display: block;
  margin: auto;
}

.btn-primary:hover {
  background: #facc15;
}
</style>

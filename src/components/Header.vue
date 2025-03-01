<template>
  <header
    class="fixed top-0 left-0 w-full bg-opacity-25 backdrop-blur-md shadow-lg z-50"
  >
    <div class="max-w-6xl mx-auto flex items-center justify-between p-4">
      <router-link to="/" class="text-2xl font-bold text-white"
        >Money Manager</router-link
      >
      <nav>
        <button
          @click="$emit('openLogin')"
          class="px-4 py-2 border border-gold bg-black text-gold rounded-lg"
        >
          Login
        </button>
        <button
          @click="$emit('openSignup')"
          class="ml-3 px-4 py-2 bg-gold text-black rounded-lg border border-transparent hover:bg-[#facc15] hover:text-black"
        >
          Sign Up
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
defineEmits(["openLogin", "openSignup"]);
</script>

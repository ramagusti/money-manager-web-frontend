<template>
  <div
    class="relative h-screen flex items-center justify-center overflow-hidden"
  >
    <div
      class="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-50"
    ></div>

    <!-- Hero Content -->
    <div class="relative text-center text-gold z-10">
      <h1 class="text-5xl font-bold mb-2 animate-fadeInUp">
        Take Control of Your <span style="color: #ff82ba">Piggybank</span>
      </h1>
      <p class="text-lg max-w-lg mx-auto animate-fadeInUp delay-200">
        A smart way to track your income, expenses, and investments.
      </p>
      <button
        class="mt-12 px-6 py-3 bg-gold text-black font-semibold rounded-lg hover:bg-yellow-500"
      >
        Get Started
      </button>
    </div>
  </div>
</template>

<style>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 1s ease-out;
}
</style>

<template>
  <section class="p-8">
    <div class="max-w-6xl mx-auto text-center glassmorphism p-6">
      <h2 class="text-4xl font-bold text-gold mb-10">
        Why Choose Money Manager?
      </h2>
      <div class="p-4">
        <TransitionGroup tag="div" class="grid md:grid-cols-3 gap-6" :css="false" @enter="onEnter">
          <div v-for="feature in features" :key="feature.title" ref="featureCards" class="glassmorphism">
            <div class="mb-4 flex justify-center">
              <svg
                v-if="feature.icon === 'budget'"
                class="w-12 h-12 text-gold animate-pulse"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h11M9 21V8m5-3a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <svg
                v-if="feature.icon === 'investment'"
                class="w-12 h-12 text-gold animate-pulse"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <svg
                v-if="feature.icon === 'security'"
                class="w-12 h-12 text-gold animate-pulse"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.314-2.686 6-6 6S0 14.314 0 11s2.686-6 6-6 6 2.686 6 6z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gold">{{ feature.title }}</h3>
            <p class="text-gray-300">{{ feature.description }}</p>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { animate } from "motion";

// Features Data
const features = ref([
  {
    title: "Smart Budgeting",
    description: "AI-powered insights to track income & expenses",
    icon: "budget",
  },
  {
    title: "Investment Tracking",
    description: "Monitor and grow your assets effortlessly",
    icon: "investment",
  },
  {
    title: "Secure & Private",
    description: "Bank-level encryption for ultimate security",
    icon: "security",
  },
]);

// Function to animate on enter
async function onEnter(el, done) {
  await animate(el, { opacity: 1, scale: [0.9, 1] }, { duration: 0.5 });
  done();
}
</script>

<style>
.glassmorphism {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 24px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes pulse {
  0% { opacity: 0.7; transform: scale(1); }
  100% { opacity: 1; transform: scale(1.1); }
}

.animate-pulse {
  animation: pulse 1.5s infinite alternate ease-in-out;
}
</style>

<template>
  <section class="features-container">
    <div class="features-content">
      <h2 class="features-title">Why Choose PiggyBang?</h2>
      <div class="features-grid">
        <TransitionGroup
          tag="div"
          class="features-items"
          :css="false"
          @enter="onEnter"
        >
          <div
            v-for="feature in features"
            :key="feature.title"
            class="feature-card"
          >
            <div class="feature-icon">
              <svg
                v-if="feature.icon === 'budget'"
                class="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h11M9 21V8m5-3a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
              <svg
                v-if="feature.icon === 'investment'"
                class="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              <svg
                v-if="feature.icon === 'security'"
                class="icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 11c0 3.314-2.686 6-6 6S0 14.314 0 11s2.686-6 6-6 6 2.686 6 6z"
                />
              </svg>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
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

<style scoped>
/* Features Container */
.features-container {
  padding: 50px 20px;
  text-align: center;
}

/* Content Wrapper */
.features-content {
  max-width: 1200px;
  margin: auto;
}

/* Title */
.features-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #eab308;
  margin-bottom: 20px;
}

/* Features Grid */
.features-items {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  justify-content: center;
}

/* Feature Card */
.feature-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease-in-out;
}

.feature-card:hover {
  transform: scale(1.05);
}

/* Feature Icon */
.feature-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

/* Icon */
.icon {
  width: 50px;
  height: 50px;
  color: #eab308;
  animation: pulse 1.5s infinite alternate ease-in-out;
}

/* Feature Title */
.feature-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #eab308;
  margin-bottom: 8px;
}

/* Feature Description */
.feature-description {
  font-size: 1rem;
  color: #d1d5db;
}

/* Animation */
@keyframes pulse {
  0% {
    opacity: 0.7;
    transform: scale(1);
  }
  100% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Responsive Fixes */
@media (max-width: 768px) {
  .features-title {
    font-size: 2rem;
  }

  .feature-title {
    font-size: 1.25rem;
  }

  .feature-description {
    font-size: 0.9rem;
  }
}
</style>

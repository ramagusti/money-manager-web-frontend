<template>
  <div class="home">
    <Header />

    <main class="home-body">
      <Hero />

      <section class="metrics-section">
        <div class="metrics-grid">
          <article v-for="metric in metrics" :key="metric.label" class="metric-card">
            <p class="metric-value">{{ metric.value }}</p>
            <p class="metric-label">{{ metric.label }}</p>
            <p class="metric-description">{{ metric.description }}</p>
          </article>
        </div>
      </section>

      <section class="product-strip">
        <div class="product-copy">
          <p class="eyebrow">Designed for modern finance teams</p>
          <h2>Clarity without the clutter.</h2>
          <ul>
            <li v-for="point in clarityPoints" :key="point">
              <span></span>{{ point }}
            </li>
          </ul>
        </div>
        <div class="product-card" aria-hidden="true">
          <div class="product-card__header">
            <p>Live company health</p>
            <strong>Q4 · Shared group workspace</strong>
          </div>
          <div class="product-card__body">
            <div v-for="trend in trends" :key="trend.title" class="trend-line">
              <div>
                <p class="trend-title">{{ trend.title }}</p>
                <small>{{ trend.subtitle }}</small>
              </div>
              <p :class="['trend-value', trend.delta > 0 ? 'trend-value--up' : 'trend-value--down']">
                {{ trend.delta > 0 ? '+' : '' }}{{ trend.delta }}%
              </p>
            </div>
          </div>
        </div>
      </section>

      <Features />

      <section class="cta-panel">
        <div class="cta-copy">
          <p class="eyebrow">Next step</p>
          <h2>Launch PiggyBang for your collective in minutes.</h2>
          <p>Bring transactions, goals, and investor-ready insights together under one calm interface.</p>
        </div>
        <div class="cta-actions">
          <a :href="token ? '/dashboard' : '/signup'" class="btn-primary">Start for free</a>
          <button class="btn-outline" @click="scrollToFeatures">See product details</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, watchEffect } from "vue";
import Header from "../components/Header.vue";
import Hero from "../components/Hero.vue";
import Features from "../components/Features.vue";

const token = ref(localStorage.getItem("token"));

watchEffect(() => {
  token.value = localStorage.getItem("token");
});

const metrics = [
  {
    value: "$42M+",
    label: "Tracked annually",
    description: "Captured across shared PiggyBang workspaces.",
  },
  {
    value: "98%",
    label: "Forecast confidence",
    description: "Teams say their data is investor-ready.",
  },
  {
    value: "<10 min",
    label: "Implementation",
    description: "From invite link to collaborative dashboard.",
  },
];

const clarityPoints = [
  "Shared workspaces keep every contributor aligned on spend.",
  "Goals, savings, and insights live in one minimalist hub.",
  "Audit trails and exports are ready whenever diligence calls.",
];

const trends = [
  { title: "Runway", subtitle: "18 months secured", delta: 12 },
  { title: "Recurring inflow", subtitle: "Group revenue", delta: 8 },
  { title: "Operational spend", subtitle: "Tracked vs plan", delta: -3 },
];

const scrollToFeatures = () => {
  const el = document.getElementById("features");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: radial-gradient(circle at top, #0f172a 0%, #020617 55%, #000 100%);
  color: #e5e7eb;
}

.home-body {
  max-width: 1200px;
  margin: 0 auto;
  padding: 120px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 72px;
  background-color: transparent;
}

.metrics-section header {
  max-width: 540px;
  margin-bottom: 32px;
}

.eyebrow {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #a5b4fc;
  margin-bottom: 8px;
}

.metrics-section h2,
.product-strip h2,
.cta-panel h2 {
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 600;
  color: #f8fafc;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.metric-card {
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 16px;
  padding: 24px;
  background: rgba(15, 23, 42, 0.35);
  box-shadow: 0 20px 45px rgba(2, 6, 23, 0.5);
}

.metric-value {
  font-size: 2rem;
  font-weight: 600;
  color: #fbbf24;
}

.metric-label {
  margin-top: 8px;
  font-weight: 500;
  color: #cbd5f5;
}

.metric-description {
  margin-top: 6px;
  color: #94a3b8;
  font-size: 0.95rem;
}

.product-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  align-items: center;
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: linear-gradient(130deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.4));
}

.product-strip ul {
  margin-top: 20px;
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.product-strip li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #cbd5f5;
  font-size: 1rem;
}

.product-strip li span {
  display: inline-flex;
  width: 10px;
  height: 10px;
  margin-top: 6px;
  border-radius: 50%;
  background: #fbbf24;
}

.product-card {
  border-radius: 24px;
  padding: 28px;
  background: rgba(2, 6, 23, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: inset 0 0 0 1px rgba(248, 250, 252, 0.05);
}

.product-card__header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 24px;
  color: #cbd5f5;
}

.product-card__header strong {
  color: #f8fafc;
  font-size: 1rem;
}

.trend-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
}

.trend-line:last-child {
  border-bottom: none;
}

.trend-title {
  font-weight: 600;
  color: #f8fafc;
}

.trend-line small {
  color: #94a3b8;
}

.trend-value {
  font-weight: 600;
  font-size: 1.1rem;
}

.trend-value--up {
  color: #34d399;
}

.trend-value--down {
  color: #fb7185;
}

#features {
  scroll-margin-top: 80px;
}

.cta-panel {
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: 28px;
  padding: 40px;
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  align-items: center;
  background: rgba(15, 23, 42, 0.55);
}

.cta-panel p {
  color: #cbd5f5;
  max-width: 520px;
}

.cta-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.btn-primary,
.btn-outline {
  border-radius: 999px;
  padding: 14px 32px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-primary {
  background: linear-gradient(120deg, #fbbf24, #f97316);
  color: #0f172a;
  box-shadow: 0 15px 30px rgba(249, 115, 22, 0.35);
  text-decoration: none;
}

.btn-outline {
  background: transparent;
  color: #f8fafc;
  border: 1px solid rgba(248, 250, 252, 0.35);
}

.btn-primary:hover,
.btn-outline:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 35px rgba(0, 0, 0, 0.35);
}

@media (max-width: 768px) {
  .home-body {
    padding: 100px 16px 60px;
  }

  .cta-panel {
    padding: 32px 24px;
  }

  .product-strip {
    padding: 24px;
  }
}
</style>

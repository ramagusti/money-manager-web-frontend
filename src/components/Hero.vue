<template>
  <section class="hero">
    <div class="hero-grid">
      <div class="hero-copy">
        <p class="hero-pill">Finance, handled with intention</p>
        <h1>Bring modern clarity to every shared piggy bank.</h1>
        <p class="hero-description">
          PiggyBang keeps collective finances structured—so you can answer investor questions,
          align contributors, and act fast without digging through spreadsheets.
        </p>
        <div class="hero-actions">
          <a :href="token ? '/dashboard' : '/signup'" class="hero-primary">Launch workspace</a>
          <button class="hero-ghost" @click="scrollToMetrics">Preview the product</button>
        </div>
        <div class="hero-stats">
          <div v-for="stat in heroStats" :key="stat.label">
            <p class="stat-value">{{ stat.value }}</p>
            <p class="stat-label">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <div class="hero-visual" aria-hidden="true">
        <div class="hero-visual__card">
          <div class="hero-visual__header">
            <p>Group Signals · October</p>
            <span>Live</span>
          </div>
          <div class="hero-visual__body">
            <div v-for="signal in heroSignals" :key="signal.title" class="signal-row">
              <div>
                <p class="signal-title">{{ signal.title }}</p>
                <small>{{ signal.subtitle }}</small>
              </div>
              <p :class="['signal-value', signal.trend === 'up' ? 'signal-up' : 'signal-down']">
                {{ signal.trend === 'up' ? '▲' : '▼' }} {{ signal.value }}
              </p>
            </div>
          </div>
        </div>
        <div class="hero-note">
          <p>“This is the calmest finance stack we demo to investors.”</p>
          <span>— Early PiggyBang collective</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, watchEffect } from "vue";

const token = ref(localStorage.getItem("token"));

watchEffect(() => {
  token.value = localStorage.getItem("token");
});

const heroStats = [
  { value: "320+", label: "shared groups onboarded" },
  { value: "4.9/5", label: "team satisfaction" },
  { value: "24/7", label: "live portfolio view" },
];

const heroSignals = [
  { title: "Savings momentum", subtitle: "Ahead of target", value: "12%", trend: "up" },
  { title: "Expense cadence", subtitle: "Under weekly baseline", value: "−8%", trend: "down" },
  { title: "Investment inflow", subtitle: "New capital logged", value: "$180K", trend: "up" },
];

const scrollToMetrics = () => {
  const el = document.querySelector(".metrics-section");
  el?.scrollIntoView({ behavior: "smooth", block: "start" });
};
</script>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  align-items: center;
  padding: 32px;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  background: linear-gradient(10deg, rgba(15, 23, 42, 0.9), rgba(30, 64, 175, 0.4));
}

.hero-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 48px;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 20px;
  z-index: 1;
}

.hero-pill {
  align-self: flex-start;
  padding: 6px 16px;
  border-radius: 999px;
  border: 1px solid rgba(248, 250, 252, 0.2);
  color: #cbd5f5;
  letter-spacing: 0.1em;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.hero h1 {
  font-size: clamp(2.75rem, 5vw, 3.5rem);
  color: #f8fafc;
  margin: 0;
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #cbd5f5;
}

.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.hero-primary,
.hero-ghost {
  border-radius: 999px;
  padding: 14px 32px;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-primary {
  background: linear-gradient(120deg, #fbbf24, #fb923c);
  color: #0f172a;
  box-shadow: 0 20px 40px rgba(251, 146, 60, 0.35);
  text-decoration: none;
}

.hero-ghost {
  background: transparent;
  color: #f8fafc;
  border: 1px solid rgba(248, 250, 252, 0.35);
}

.hero-primary:hover,
.hero-ghost:hover {
  transform: translateY(-2px);
}

.hero-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding-top: 12px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  color: #fef3c7;
}

.stat-label {
  color: #94a3b8;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
}

.hero-visual {
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-visual__card {
  border-radius: 28px;
  padding: 28px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.25);
  box-shadow: 0 30px 60px rgba(2, 6, 23, 0.6);
}

.hero-visual__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #cbd5f5;
  margin-bottom: 18px;
}

.hero-visual__header span {
  color: #34d399;
  font-weight: 600;
}

.signal-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.signal-row:last-child {
  border-bottom: none;
}

.signal-title {
  margin: 0;
  color: #f8fafc;
  font-weight: 600;
}

.signal-row small {
  color: #94a3b8;
}

.signal-value {
  font-weight: 600;
  font-size: 1rem;
}

.signal-up {
  color: #34d399;
}

.signal-down {
  color: #fb7185;
}

.hero-note {
  border-radius: 18px;
  padding: 20px;
  background: rgba(59, 7, 100, 0.4);
  border: 1px solid rgba(244, 114, 182, 0.3);
  color: #f8fafc;
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 360px;
}

.hero-note span {
  display: block;
  margin-top: 8px;
  color: #c084fc;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .hero {
    padding: 48px 28px;
  }

  .hero-stats {
    flex-direction: column;
  }
}
</style>

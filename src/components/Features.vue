<template>
  <section id="features" class="features">
    <TransitionGroup tag="div" class="features-grid" :css="false" @enter="onEnter">
      <article v-for="(feature, index) in features" :key="feature.title" class="feature-card">
        <div class="feature-card__head">
          <span class="feature-index">0{{ index + 1 }}</span>
          <h3>{{ feature.title }}</h3>
        </div>
        <p class="feature-description">{{ feature.description }}</p>
        <ul v-if="feature.bullets?.length">
          <li v-for="bullet in feature.bullets" :key="bullet">{{ bullet }}</li>
        </ul>
        <span class="feature-tag" v-if="feature.tag">{{ feature.tag }}</span>
      </article>
    </TransitionGroup>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { animate } from "motion";

const features = ref([
  {
    title: "Unified group workspaces",
    description: "Every group operates in a dedicated, distraction-free canvas with shared filters and permissions.",
    bullets: ["Role-based visibility for owners, admins, and members", "Real-time balances and goal tracking"],
    tag: "Collaboration",
  },
  {
    title: "Narrative-ready data",
    description: "Snapshots, exports, and saved timelines mean updates to investors and stakeholders stay consistent.",
    bullets: ["Download-ready XLS templates", "Automatic highlights for trends and anomalies"],
    tag: "Reporting",
  },
  {
    title: "Calm security posture",
    description: "Bank-grade encryption, audit-friendly logs, and privacy-first defaults keep sensitive numbers safe.",
    bullets: ["Optional proof uploads with lifecycle policies", "Granular deletions with soft-restore trails"],
    tag: "Trust",
  },
]);

async function onEnter(el, done) {
  await animate(el, { opacity: [0, 1], y: [16, 0] }, { duration: 0.4 });
  done();
}
</script>

<style scoped>
.features {
  width: 100%;
  box-sizing: border-box;
  border-radius: 28px;
  border: 1px solid rgba(148, 163, 184, 0.25);
  padding: 40px;
  background: rgba(15, 23, 42, 0.55);
  box-shadow: 0 25px 60px rgba(2, 6, 23, 0.55);
  display: flex;
  flex-direction: column;
  gap: 32px;
  scroll-margin-top: 80px;
}

.features__header {
  max-width: 620px;
}

.features__header h2 {
  font-size: clamp(2rem, 3vw, 2.5rem);
  color: #f8fafc;
}

.features__header p {
  color: #cbd5f5;
  margin-top: 10px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.feature-card {
  border-radius: 20px;
  padding: 28px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.5);
  box-shadow: 0 20px 40px rgba(2, 6, 23, 0.35);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.feature-index {
  font-family: "Space Mono", monospace;
  font-size: 0.95rem;
  color: #a5b4fc;
  letter-spacing: 0.15em;
}

.feature-card h3 {
  font-size: 1.35rem;
  color: #f8fafc;
  margin: 0;
}

.feature-description {
  color: #cbd5f5;
  line-height: 1.5;
}

.feature-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #94a3b8;
  font-size: 0.95rem;
}

.feature-card li::before {
  content: "—";
  margin-right: 8px;
  color: #fbbf24;
}

.feature-tag {
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  border: 1px solid rgba(248, 250, 252, 0.2);
  color: #f8fafc;
}

@media (max-width: 768px) {
  .features {
    padding: 28px;
  }
}

@media (max-width: 640px) {
  .feature-card {
    padding: 24px;
  }
}
</style>

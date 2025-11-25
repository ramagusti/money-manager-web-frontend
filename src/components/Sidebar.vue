<template>
  <div class="sidebar-shell">
    <div
      v-if="isMobile && mobileOpen"
      class="sidebar-overlay"
      @click="closeMobileNav"
    ></div>

    <aside
      class="sidebar"
      :class="{
        collapsed: !isMobile && isCollapsed,
        'sidebar--mobile-open': isMobile && mobileOpen,
      }"
    >
      <div class="sidebar__brand">
        <button @click="toggleSidebar" class="sidebar__toggle" aria-label="Toggle navigation">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
          </svg>
        </button>
        <div class="sidebar__logo" v-if="!isCollapsed || isMobile">
          <img src="/images/PiggyBang.svg" alt="PiggyBang Logo" />
          <span>PiggyBang</span>
        </div>
      </div>

      <div
        v-if="(!isCollapsed || isMobile) && userGroups?.length"
        class="sidebar__group"
      >
        <label class="sidebar__label">Workspace</label>
        <select
          v-model="selectedGroup"
          @change="updateGroup"
          class="group-select"
        >
          <option
            v-for="group in userGroups"
            :key="group.id"
            :value="group.id"
            class="text-black"
          >
            {{ group.name }}
          </option>
          <option value="create-new" class="text-black">Create new group</option>
        </select>
      </div>

      <nav class="sidebar__nav">
        <router-link
          v-for="link in navigation"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          active-class="active"
          :v-if="!link.requiresGroup || (userGroups?.length && currentGroup)"
          @click="closeMobileNav"
        >
          <span class="nav-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path :d="link.iconPath" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <span v-if="!isCollapsed || isMobile">{{ link.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar__footer" v-if="!isCollapsed || isMobile">
        <div class="sidebar__summary" v-if="currentGroup">
          <p class="sidebar__group-name">{{ currentGroup.name }}</p>
          <p class="sidebar__group-meta">Members {{ currentGroup?.members_count ?? "—" }}</p>
        </div>
        <button @click="logout" class="btn-danger w-full justify-center">
          Logout
        </button>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useAppStore } from "../stores/app";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";

const props = defineProps({
  mobileOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:mobileOpen"]);
const mobileOpen = computed(() => props.mobileOpen);

const authStore = useAuthStore();
const router = useRouter();
const appStore = useAppStore();
const selectedGroup = ref(null);
const isMobile = ref(window.innerWidth <= 768);

// Extract reactive state from the store as refs
const { isCollapsed, userGroups, currentGroup } = storeToRefs(appStore);

const navigation = computed(() => [
  {
    label: "Dashboard",
    to: "/dashboard",
    requiresGroup: false,
    iconPath: "M3 9.75a.75.75 0 0 1 .38-.65l8-4.5a.75.75 0 0 1 .72 0l8 4.5a.75.75 0 0 1 .38.65V19a.75.75 0 0 1-.75.75H3.75A.75.75 0 0 1 3 19z",
  },
  {
    label: "Transactions",
    to: "/transactions",
    requiresGroup: true,
    iconPath: "M4.75 5A1.75 1.75 0 0 0 3 6.75v10.5A1.75 1.75 0 0 0 4.75 19h14.5A1.75 1.75 0 0 0 21 17.25V6.75A1.75 1.75 0 0 0 19.25 5zm0 1.5h14.5c.138 0 .25.112.25.25v2h-15v-2c0-.138.112-.25.25-.25zm-.25 4h15v6.75c0 .138-.112.25-.25.25H4.75a.25.25 0 0 1-.25-.25z",
  },
  {
    label: "Settings",
    to: "/settings",
    requiresGroup: true,
    iconPath: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.065 2.572c.94 1.544-.827 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.065-2.572c-.94-1.544.827-3.31 2.37-2.37.996.607 2.285.07 2.573-1.066zm1.675 3.433a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5z",
  },
]);

watch(currentGroup, async () => {
  selectedGroup.value = currentGroup.value?.id;
});

onMounted(async () => {
  selectedGroup.value = currentGroup.value?.id;
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  if (!isMobile.value) {
    emit("update:mobileOpen", false);
  }
};

// Method to toggle sidebar collapse
const toggleSidebar = () => {
  if (isMobile.value) {
    emit("update:mobileOpen", !mobileOpen.value);
    return;
  }
  appStore.setCollapsed(!isCollapsed.value);
};

const closeMobileNav = () => {
  if (isMobile.value) {
    emit("update:mobileOpen", false);
  }
};

// Handle group change
const updateGroup = () => {
  if (selectedGroup.value === "create-new") {
    appStore.setShowCreateGroupModal(true);
    closeMobileNav();
    return;
  }
  appStore.setCurrentGroup(
    userGroups.value.find((g) => g.id === selectedGroup.value)
  );
  closeMobileNav();
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};

watch(
  () => router.currentRoute.value.fullPath,
  () => closeMobileNav()
);
</script>

<style scoped>
.sidebar-shell {
  position: relative;
  width: calc(3% * var(--scale-factor));
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 30;
}

.sidebar {
  width: 260px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px 20px;
  background: rgba(2, 6, 23, 0.85);
  border-right: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 20px 0 40px rgba(2, 6, 23, 0.6);
  backdrop-filter: blur(12px);
  z-index: 40;
  transition: width 0.25s ease, transform 0.3s ease;
}

.sidebar.collapsed {
  width: 90px;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar__toggle {
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: transparent;
  color: #f8fafc;
  border-radius: 999px;
  padding: 6px 12px;
  cursor: pointer;
}

.sidebar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f8fafc;
  font-weight: 600;
}

.sidebar__logo img {
  width: 26px;
  height: 26px;
}

.sidebar__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sidebar__label {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.7rem;
  color: #94a3b8;
}

.group-select {
  background: rgba(15, 23, 42, 0.8);
  color: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.3);
  padding: 10px;
  border-radius: 10px;
  outline: none;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  color: #cbd5f5;
  text-decoration: none;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.nav-link:hover,
.nav-link.active {
  background: rgba(148, 163, 184, 0.15);
  color: #f8fafc;
}

.nav-icon {
  width: 22px;
  text-align: center;
}

.sidebar__footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
}

.sidebar__group-name {
  margin: 0;
  font-weight: 600;
  color: #f8fafc;
}

.sidebar__group-meta {
  margin: 0;
  color: #94a3b8;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-110%);
    width: min(320px, 85vw);
    pointer-events: none;
  }

  .sidebar--mobile-open {
    transform: translateX(0);
    pointer-events: auto;
  }
}
</style>

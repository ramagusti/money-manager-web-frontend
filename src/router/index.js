import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { useAppStore } from "../stores/app";
import Home from "../views/Home.vue";
import Dashboard from "../views/Dashboard.vue";
import Transactions from "../views/Transactions.vue";
import VerifiedSuccess from "../views/VerifiedSuccess.vue";
import NotFound from "../views/NotFound.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/verified-success",
    component: VerifiedSuccess
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: "/transactions",
    name: "Transactions",
    component: Transactions,
    meta: { requiresAuth: true }
  },
  {
    path: "/login",
    name: "Login",
    component: Home,
  },
  {
    path: "/signup",
    name: "Signup",
    component: Home,
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: NotFound,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const appStore = useAppStore();

  appStore.setLoading(true);
  try {
    if (!authStore.user) {
      await authStore.fetchUser(); // Ensure session is loaded before checking access
    }
    if (authStore.token && !appStore.userGroups.length) {
      await appStore.fetchGroups();
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ path: "/login" }); // Redirect and open login modal
    } else {
      next();
    }
  } catch (error) {
    console.error("Error during beforeEach:", error);
    next({ path: "/" });
  } finally {
    appStore.setLoading(false);
  }
});

router.afterEach((to) => {
  document.title = to.meta.title || "Money Manager";
});

export default router;

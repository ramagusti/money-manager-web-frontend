import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import VerifiedSuccess from '../views/VerifiedSuccess.vue';
import NotFound from "../views/NotFound.vue";

const routes = [
  { 
    path: '/', 
    component: Home 
  },
  { 
    path: '/verified-success', 
    component: VerifiedSuccess 
  },
  {
    path: "/login",
    name: "Login",
    component: Home,
    props: { showLogin: true },
  },
  {
    path: "/signup",
    name: "Signup",
    component: Home,
    props: { showSignup: true },
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

export default router;

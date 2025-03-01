import { defineStore } from "pinia";
import { ref, computed } from "vue";
import api from "../services/api";

export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);
    const token = ref(localStorage.getItem("token") || null);
    const isLoading = ref(false);
    const isAuthenticated = computed(() => !!user.value && !!token.value);

    // Fetch user details
    const fetchUser = async () => {
        if (!token.value) return;
        try {
            const response = await api.get("/user", {
                headers: { Authorization: `Bearer ${token.value}` },
            });
            user.value = response.data;
        } catch (error) {
            logout();
        }
    };

    // Login function
    const login = async (email, password) => {
        isLoading.value = true;
        try {
            const response = await api.post("/login", { email, password });
            token.value = response.data.token;
            localStorage.setItem("token", token.value);
            await fetchUser();
        } catch (error) {
            throw error.response?.data?.message || "Login failed";
        } finally {
            isLoading.value = false;
        }
    };

    // Logout function
    const logout = () => {
        token.value = null;
        user.value = null;
        localStorage.removeItem("token");
    };

    // Resend verification email
    const resendVerification = async (email) => {
        try {
            await api.post("/email/resend", { email });
        } catch (error) {
            throw "Failed to resend verification email.";
        }
    };

    return {
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        logout,
        fetchUser,
        resendVerification
    };
});

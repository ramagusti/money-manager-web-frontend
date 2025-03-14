import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';
import { useAuthStore } from './auth';

export const useAppStore = defineStore('app', () => {
    const authStore = useAuthStore();

    const isCollapsed = ref(false);
    const showCreateGroupModal = ref(false);
    const appLoading = ref(true);
    const userGroups = ref([]);
    const currentGroup = ref(null);
    const userRole = ref(null);
    const isOwner = ref(false);
    const isAdmin = ref(false);

    const setLoading = (loading) => {
        appLoading.value = loading;
    };

    const setCollapsed = (collapsed) => {
        isCollapsed.value = collapsed;
    };

    const setUserGroups = (groups) => {
        userGroups.value = groups;
    };

    const setCurrentGroup = async (group) => {
        currentGroup.value = group;
        await fetchUserRole();
    };

    const setShowCreateGroupModal = (show) => {
        showCreateGroupModal.value = show;
    };

    const fetchGroups = async () => {
        try {
            const response = await api.get("/groups");
            userGroups.value = response.data;

            // Set the first group as the default if none is selected
            if (!currentGroup.value && userGroups.value.length > 0) {
                await setCurrentGroup(userGroups.value[0]);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const setGroup = (groupId) => {
        if (userGroups.value.find(g => g.id === groupId)) {
            currentGroup.value = groupId;
        }
    };

    const fetchUserRole = async () => {
        if (!currentGroup.value) return;

        try {
            while (!authStore.user) {
                console.warn("User is not available yet, waiting...");
                await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms before retrying
            }
            const response = await api.get(`/groups/${currentGroup.value.id}/members`);
            const member = response.data.data.find(m => m.id === authStore.user.id);
            userRole.value = member ? member.role : null;
            
            isOwner.value = userRole.value === 'owner';
            isAdmin.value = ['owner', 'admin'].includes(userRole.value);
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
    };

    return {
        appLoading,
        isCollapsed,
        showCreateGroupModal,
        userGroups,
        currentGroup,
        userRole,
        isOwner,
        isAdmin,
        setLoading,
        setCollapsed,
        setUserGroups,
        setCurrentGroup,
        fetchGroups,
        setGroup,
        setShowCreateGroupModal,
        fetchUserRole,
    };
});


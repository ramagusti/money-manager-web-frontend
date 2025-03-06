import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAppStore = defineStore('app', () => {
    const isCollapsed = ref(false);
    const userGroups = ref([]);
    const currentGroup = ref(null);
    const showCreateGroupModal = ref(false);
    const appLoading = ref(true);

    const setLoading = (loading) => {
        appLoading.value = loading;
    };

    const setCollapsed = (collapsed) => {
        isCollapsed.value = collapsed;
    };

    const setUserGroups = (groups) => {
        userGroups.value = groups;
    };

    const setCurrentGroup = (group) => {
        currentGroup.value = group;
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
                currentGroup.value = userGroups.value[0];
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

    return {
        appLoading,
        isCollapsed,
        userGroups,
        currentGroup,
        showCreateGroupModal,
        setLoading,
        setCollapsed,
        setUserGroups,
        setCurrentGroup,
        fetchGroups,
        setGroup,
        setShowCreateGroupModal,
    };
});


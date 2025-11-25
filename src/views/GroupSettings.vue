<template>
  <div v-if="isLoadingData" class="loading-container">
    <div class="loading-spinner"></div>
  </div>

  <div class="group-settings-container">
    <!-- Header -->
    <div class="group-settings-header">
      <h2 class="font-bold text-white">Group Settings</h2>
      <button
        class="btn-primary"
        @click="showInviteModal = true"
        v-if="appStore.isAdmin"
      >
        Invite Members
      </button>
    </div>

    <!-- Summary -->
    <div class="summary-cards">
      <div class="summary-item">
        <span class="label">Group Name</span>
        <span class="value">{{ appStore.currentGroup?.name }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Members</span>
        <span class="value">{{ members.length }}</span>
      </div>
      <div class="summary-item">
        <span class="label">Your Role</span>
        <span class="value">{{ roleDisplay(appStore.userRole) }}</span>
      </div>
    </div>

    <!-- Members List -->
    <div class="members-list">
      <h3 class="section-title">Group Members</h3>
      <table class="responsive-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th v-if="appStore.isAdmin">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="member in members" :key="member.id">
            <td>{{ member.name }}</td>
            <td>{{ member.email }}</td>
            <td>
              <span v-if="member.role === 'owner'">Owner {{ appStore.isOwner ? "(You)" : "" }}</span>
              <select
                v-else
                v-model="member.role"
                @change="updateRole(member)"
                :disabled="!appStore.isOwner"
                class="role-dropdown"
              >
                <option
                  v-for="role in [{name: 'Admin', value: 'admin'}, {name: 'Member', value: 'member'}]"
                  :value="role.value"
                  :key="role.value"
                  class="text-black"
                >
                  {{ role.name }}
                </option>
              </select>
            </td>
            <td v-if="appStore.isAdmin">
              <button
                @click="removeMember(member)"
                v-if="member.role !== 'owner'"
                class="btn-danger"
              >
                Remove
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="pagination">
      <button v-if="page > 1" @click="prevPage">Previous</button>

      <span v-for="link in membersMeta.links" :key="link.label">
        <button
          v-if="
            link.url &&
            !link.label.toLowerCase().includes('previous') &&
            !link.label.toLowerCase().includes('next')
          "
          :class="{ 'active-page': link.active }"
          @click="changePage(link.url)"
        >
          {{ link.label }}
        </button>
      </span>

      <button v-if="membersMeta.next_page_url" @click="nextPage">Next</button>
    </div>

    <!-- Invite User Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showInviteModal"
          class="modal-overlay"
          @click.self="closeInviteModal"
        >
          <div class="modal-content">
            <h2 class="text-3xl font-semibold text-gold mb-6">Invite Member</h2>
            <input
              v-model="inviteEmail"
              type="email"
              placeholder="Enter email"
              class="input-field"
              required
            />
            <button @click="inviteUser" class="btn-primary w-full">
              <span v-if="isLoading" class="spinner"></span>
              <span v-else>Send Invite</span>
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useAppStore } from "../stores/app";
import api from "../services/api";

const appStore = useAppStore();
const members = ref([]);
const showInviteModal = ref(false);
const inviteEmail = ref("");
const isLoading = ref(false);
const isLoadingData = ref(true);
const page = ref(1);
const membersMeta = ref({});

const fetchMembers = async () => {
  isLoadingData.value = true;
  try {
    const response = await api.get(
      `/groups/${appStore.currentGroup.id}/members`
    );
    members.value = response.data.data;
    membersMeta.value = response.data;
  } catch (error) {
    console.error("Failed to fetch members", error);
  } finally {
    isLoadingData.value = false;
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    fetchMembers();
  }
};

const nextPage = () => {
  page.value++;
  fetchMembers();
};

const updateRole = async (member) => {
  try {
    await api.put(`/groups/${appStore.currentGroup.id}/members/${member.id}`, {
      role: member.role,
    });
    alert("Role updated!");
  } catch (error) {
    console.error("Failed to update role", error);
  }
};

const removeMember = async (member) => {
  if (!confirm("Are you sure you want to remove this member?")) return;
  try {
    await api.delete(
      `/groups/${appStore.currentGroup.id}/members/${member.id}`
    );
    members.value = members.value.filter((m) => m.id !== member.id);
  } catch (error) {
    console.error("Failed to remove member", error);
  }
};

const inviteUser = async () => {
  isLoading.value = true;
  try {
    await api.post(`/groups/${appStore.currentGroup.id}/members/invite`, {
      email: inviteEmail.value,
    });
    alert("Invitation sent!");
    showInviteModal.value = false;
    inviteEmail.value = "";
  } catch (error) {
    console.error("Failed to invite user", error);
  } finally {
    isLoading.value = false;
  }
};

const closeInviteModal = () => {
  showInviteModal.value = false;
};

const roleDisplay = (role) => {
  switch (role) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "member":
      return "👤 Member";
    default:
      return "Unknown";
  }
};

onMounted(fetchMembers);
</script>

<style scoped>
.group-settings-container {
  padding: calc(20px * var(--scale-factor, 1));
  color: white;
  font-size: calc(16px * var(--scale-factor, 1));
  margin-left: calc(80px * var(--scale-factor, 1));
}
.group-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: calc(20px * var(--scale-factor, 1));
  font-size: calc(24px * var(--scale-factor, 1));
}

/* Summary Cards */
.summary-cards {
  display: flex;
  flex-wrap: wrap;
  gap: calc(10px * var(--scale-factor, 1));
  justify-content: space-between;
  margin-bottom: calc(20px * var(--scale-factor, 1));
}

.summary-item {
  flex: 1;
  padding: calc(8px * var(--scale-factor, 1));
  border-radius: calc(8px * var(--scale-factor, 1));
  background: rgba(255, 255, 255, 0.08);
  text-align: center;
  font-size: calc(14px * var(--scale-factor, 1));
}

.summary-item .label {
  font-weight: bold;
}

.summary-item .value {
  margin-top: 5px;
  display: block;
}

.members-list {
  margin-top: calc(20px * var(--scale-factor, 1));
}

.section-title {
  font-size: calc(24px * var(--scale-factor, 1));
  font-weight: bold;
  color: #eab308;
  margin-bottom: calc(10px * var(--scale-factor, 1));
}

/* Members Table */
.responsive-table {
  width: 100%;
  border-collapse: collapse;
  font-size: calc(14px * var(--scale-factor, 1));
}

.responsive-table th,
.responsive-table td {
  padding: calc(10px * var(--scale-factor, 1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  padding: 6px 12px;
  border: 1px solid #eab308;
  background: transparent;
  color: #eab308;
  border-radius: 5px;
  cursor: pointer;
}

.pagination button.active-page {
  background: #eab308;
  color: black;
  font-weight: bold;
}

.role-dropdown {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  padding: 6px;
  border-radius: 6px;
  color: white;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
}

.input-field {
  width: 100%;
  padding: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #eab308;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
}

.role-dropdown {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px;
  border-radius: 6px;
  outline: none;
  font-size: calc(14px * var(--scale-factor, 1));
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  :root {
    --scale-factor: 0.8;
  }
  .group-settings-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .summary-cards {
    flex-direction: column;
  }
  .responsive-table {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  :root {
    --scale-factor: 0.7;
  }
  .group-settings-container {
    padding: 10px;
  }
  .summary-item {
    font-size: 12px;
  }
}
</style>

<script>
// Import the users store.
import { useUsersStore } from '../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();

        return {
            usersStore,
            userDetailsStore
        };
    },
    data() {
        return {
            // Local tracking of which item is selected to ensure accurate UI rendering
            selectedItemId: null
        };
    },
    created() {
        // Initialize from the store
        this.selectedItemId = this.usersStore.selectedUserId;
    },
    methods: {
        selectUser(user) {
            // Set local value first for immediate UI response
            this.selectedItemId = user.id;

            // Then update the store without triggering the watcher again
            if (this.usersStore.selectedUserId !== user.id) {
                this.usersStore.selectedUserId = user.id;

                // Directly notify parent component without using a watch
                if (this.$parent && this.$parent.updateUserDetails) {
                    this.$parent.updateUserDetails(user);
                }
            }
        }
    }
};
</script>

<template>
    <div class="container mt-1">
        <!-- School Admins -->
        <div v-for="student in usersStore.studentsPerTenant" :key="student.id">
            <div class="d-flex bg-light rounded p-2">
                <img
                    class="user-avatars"
                    v-if="student.avatar != null"
                    :src="student.avatar"
                />
                <button
                    :class="
                        student.id === selectedItemId
                            ? 'isCurrentlyChoose'
                            : 'user-buttons'
                    "
                    @click="selectUser(student)"
                >
                    {{ student.username }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.user-avatars {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    border: 1px solid var(--primary-color);
    margin-right: 22px;
}

.user-buttons {
    font-family: 'Poppins', sans-serif;
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background-color: #c8d7da;
    color: black;
    overflow: hidden;
    padding: 16px, 28px, 16px, 28px;
    font-size: 1.25rem;
    font-weight: 400;
}

.user-buttons:hover {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

/* The style when the user button is currently choose to show information */
.isCurrentlyChoose {
    font-family: 'Poppins', sans-serif;
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background-color: var(--primary-color);
    overflow: hidden;
    color: white;
    padding: 16px, 28px, 16px, 28px;
    font-size: 1.25rem;
    font-weight: 400;
}
</style>

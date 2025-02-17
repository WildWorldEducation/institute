<script>
// Import the users store.
import { useUsersStore } from '../../stores/UsersStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();

        // Run the GET request.
        if (usersStore.users.length < 1) usersStore.getUsers();
        return {
            usersStore,
            userDetailsStore
        };
    },
    props: ['searchBarCurrentUserId'],
    data() {
        return {
            currentUserId: null
        };
    },
    async created() {},
    methods: {
        changeUserId(user) {
            this.currentUserId = user.id;
            this.$emit('changeUserId', user);
        }
    },
    watch: {
        searchBarCurrentUserId: {
            handler(newValue) {
                this.currentUserId = newValue;
            }
        }
    }
};
</script>

<template>
    <div class="container mt-4">
        <!-- Admins -->
        <div
            v-if="userDetailsStore.role == 'admin'"
            v-for="user in usersStore.users"
        >
            <div class="d-flex bg-light rounded p-2">
                <img
                    class="user-avatars"
                    v-if="user.avatar != null"
                    :src="user.avatar"
                />
                <button
                    :class="
                        user.id == currentUserId
                            ? 'isCurrentlyChoose'
                            : 'user-buttons'
                    "
                    @click="changeUserId(user)"
                >
                    {{ user.username }}
                </button>
            </div>
            <!-- divide line for pc and tablet view -->
            <hr class="border border-1 opacity-0 w-75 d-none d-md-block" />
            <!-- divide line for phone view specific -->
            <hr class="border border-1 opacity-0 w-100 d-block d-md-none" />
        </div>
        <!-- Instructors -->
        <div
            v-else-if="userDetailsStore.role == 'instructor'"
            v-for="student in $parent.students"
        >
            <div class="d-flex bg-light rounded p-2">
                <img
                    class="user-avatars"
                    v-if="student.avatar != null"
                    :src="student.avatar"
                />
                <button
                    :class="
                        student.id == currentUserId
                            ? 'isCurrentlyChoose'
                            : 'user-buttons'
                    "
                    @click="changeUserId(student)"
                >
                    {{ student.username }}
                </button>
            </div>
        </div>
        <RouterLink
            v-if="userDetailsStore.role == 'instructor'"
            to="/users/add-student"
            class="d-block mb-4 btn primary-btn"
        >
            Add Student
        </RouterLink>
        <!-- Editors -->
        <div
            v-if="userDetailsStore.role == 'editor'"
            v-for="editor in $parent.usersStore.editors"
        >
            <div class="d-flex bg-light rounded p-2">
                <img
                    class="user-avatars"
                    v-if="editor.avatar != null"
                    :src="editor.avatar"
                />
                <button
                    :class="
                        editor.id == currentUserId
                            ? 'isCurrentlyChoose'
                            : 'user-buttons'
                    "
                    @click="changeUserId(editor)"
                >
                    {{ editor.username }}
                </button>
            </div>
            <!-- divide line for pc and tablet view -->
            <hr class="border border-1 opacity-0 w-75 d-none d-md-block" />
            <!-- divide line for phone view specific -->
            <hr class="border border-1 opacity-0 w-100 d-block d-md-none" />
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

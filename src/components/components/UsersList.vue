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
    }
};
</script>

<template>
    <div class="container mt-4">
        <div
            v-if="userDetailsStore.role == 'admin'"
            v-for="user in usersStore.users"
        >
            <div class="d-flex">
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
            <hr class="border border-1 opacity-100 w-75 d-none d-md-block" />
            <!-- divide line for phone view specific -->
            <hr class="border border-1 opacity-100 w-100 d-block d-md-none" />
        </div>
        <div
            v-else-if="userDetailsStore.role == 'instructor'"
            v-for="student in $parent.students"
        >
            <div class="d-flex">
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
            <hr class="border border-1 opacity-100 w-75 d-none d-md-block" />
            <!-- divide line for phone view specific -->
            <hr class="border border-1 opacity-100 w-100 d-block d-md-none" />
        </div>
        <RouterLink
            v-if="userDetailsStore.role == 'instructor'"
            to="/users/add-student"
            class="d-block mb-4 btn purple-btn"
        >
            Add Student
        </RouterLink>
        <div
            v-if="userDetailsStore.role == 'editor'"
            v-for="editor in $parent.editors"
        >
            <div class="d-flex">
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
            <hr class="border border-1 opacity-100 w-75 d-none d-md-block" />
            <!-- divide line for phone view specific -->
            <hr class="border border-1 opacity-100 w-100 d-block d-md-none" />
        </div>
    </div>
</template>

<style scoped>
.user-avatars {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    border: 1px solid #7f56d9;
    margin-right: 22px;
}

.user-buttons {
    font-family: 'Poppins', sans-serif;
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid #7f56d9;
    background-color: #c8d7da;
    color: white;
    padding: 16px, 28px, 16px, 28px;
    font-size: 1.25rem;
    font-weight: 400;
}

.user-buttons:hover {
    background-color: #a48be6;
}

/* The style when the user button is currently choose to show information */
.isCurrentlyChoose {
    font-family: 'Poppins', sans-serif;
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid #7f56d9;
    background-color: #a48be6;
    color: white;
    padding: 16px, 28px, 16px, 28px;
    font-size: 1.25rem;
    font-weight: 400;
}
</style>

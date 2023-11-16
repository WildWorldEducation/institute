<script>
// Import the users store.
import { useUsersStore } from '../../stores/UsersStore'

export default {
    setup() {
        const usersStore = useUsersStore();
        // Run the GET request.
        if (usersStore.users.length < 1)
            usersStore.getUsers()
        return {
            usersStore
        }
    },
    data() {
        return {
        }
    },
    computed: {

    },
    methods: {
        changeUserId(userId) {
            this.$emit('changeUserId', userId)
        }
    }
}
</script>

<template>
    <div class="container mt-3">
        <div v-for="user in usersStore.users">
            <div class="d-flex">
                <img class="user-avatars" v-if="user.avatar != null" :src="user.avatar" height="40" />
                <button class="user-buttons" @click="changeUserId(user)">
                    {{ user.first_name }} {{ user.last_name }}
                </button>
            </div>
            <hr>
        </div>
    </div>
</template>


<style scoped>
.user-avatars {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid #7F56D9;
    margin-right: 22px;
}

.user-buttons {
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid #7F56D9;
    background-color: #C8D7DA;
    color: white;
}
</style>
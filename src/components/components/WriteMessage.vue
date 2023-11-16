<script>
// Import the users store.
import { useUsersStore } from '../../stores/UsersStore'

export default {
    props: ['userId'],
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
            message: ''
        }
    },
    computed: {
    },
    methods: {
        SendMessage(userId) {
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        message: this.message
                    })
            };

            var url = '/users/' + this.userId + '/edit-message';
            fetch(url, requestOptions)
                .then(() => {
                    this.message = ""
                    alert("Message sent")
                });
        } 
    }
}
</script>

<template>
    <div class="container mt-3">
        <h3>Personal Message</h3>
        <textarea v-model="message" class="form-control" rows="3"></textarea>
        <button class="btn green-btn" @click="SendMessage(userId)">Send</button>
    </div>
</template> 


<style scoped>
.green-btn {
    background-color: #36C1AF;
    color: white;
    border: 1px solid #2CA695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}
</style>
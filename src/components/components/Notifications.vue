<script>
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore'

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails()
        return {
            userDetailsStore
        }
    },
    data() {
        return {
            notifications: []
        }
    },
    computed: {
    },
    async created() {
        await this.getNotifications();
    },
    methods: {
        getNotifications() {
            fetch('/notifications/list')
                .then(function (response) {
                    return response.json();
                }).then(data => this.notifications = data)
        },
        SaveChange() {
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        notification1: this.notifications.notification_1,
                        notification2: this.notifications.notification_2,
                    })
            };
            var url = '/notifications/edit';
            fetch(url, requestOptions)
        }
    }
}
</script>

<template>
    <table class="table table-bordered">
        <thead>
            <tr>
                <th scope="col">Notifications</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td v-if="userDetailsStore.role != 'admin'">{{ notifications.notification_1 }} </td>
                <td v-else>
                    <textarea @change="SaveChange()" v-model="notifications.notification_1" class="form-control"
                        rows="3"></textarea>
                </td>
            </tr>
            <tr>
                <td v-if="userDetailsStore.role != 'admin'">{{ notifications.notification_2 }}</td>
                <td v-else>
                    <textarea @change="SaveChange()" v-model="notifications.notification_2" class="form-control"
                        rows="3"></textarea>
                </td>
            </tr>
        </tbody>
    </table>
</template>


<style scoped>
th {
    background-color: #56C5B6;
    border-color: #2FA894;
    color: #FFFFFF;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

td {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #667085;
}
</style>
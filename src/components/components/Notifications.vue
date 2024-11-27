<script>
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            notifications: []
        };
    },
    computed: {},
    async created() {
        await this.getNotifications();
    },
    methods: {
        getNotifications() {
            fetch('/notifications/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.notifications = data));
        },
        SaveChange() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notification1: this.notifications.notification_1,
                    notification2: this.notifications.notification_2
                })
            };
            var url = '/notifications/edit';
            fetch(url, requestOptions);
        }
    }
};
</script>

<template>
    <h2>Notifications</h2>
    <div class="table-div">
        <div class="border-bottom p-2" v-if="userDetailsStore.role != 'admin'">
            {{ notifications.notification_1 }}
        </div>
        <div v-else>
            <textarea
                @change="SaveChange()"
                v-model="notifications.notification_1"
                class="form-control border-bottom p-2"
                rows="3"
            ></textarea>
        </div>
        <div class="p-2" v-if="userDetailsStore.role != 'admin'">
            {{ notifications.notification_2 }}
        </div>
        <div v-else>
            <textarea
                @change="SaveChange()"
                v-model="notifications.notification_2"
                class="form-control p-2"
                rows="3"
            ></textarea>
        </div>
    </div>
    <!-- <table class="table table-bordered">
        <thead>
            <tr>
                <th scope="col" class="table-header">Notifications</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td v-if="userDetailsStore.role != 'admin'">
                    {{ notifications.notification_1 }}
                </td>
                <td v-else>
                    <textarea
                        @change="SaveChange()"
                        v-model="notifications.notification_1"
                        class="form-control"
                        rows="3"
                    ></textarea>
                </td>
            </tr>
            <tr>
                <td v-if="userDetailsStore.role != 'admin'">
                    {{ notifications.notification_2 }}
                </td>
                <td v-else>
                    <textarea
                        @change="SaveChange()"
                        v-model="notifications.notification_2"
                        class="form-control"
                        rows="3"
                    ></textarea>
                </td>
            </tr>
        </tbody>
    </table> -->
</template>

<style scoped>
.table-div {
    background-color: white;
    border-radius: 10px;
    padding: 5px;
    border: 1px solid black;
}
/*

th {
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

th:first-of-type {
    border-top-left-radius: 10px;
}
th:last-of-type {
    border-top-right-radius: 10px;
}
tr:last-of-type td:first-of-type {
    border-bottom-left-radius: 10px;
}
tr:last-of-type td:last-of-type {
    border-bottom-right-radius: 10px;
}

tr {
    border-color: #2fa894;
    border-width: 2px;
    border-collapse: collapse;
}

td {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #667085;
    font-size: 0.875rem;
    background-color: white;
} */
</style>

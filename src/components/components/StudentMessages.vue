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
        }
    },
    computed: {
    },
    methods: {

    }
}
</script>

<template>
    <table class="table table-bordered h-100">
        <thead>
            <tr>
                <th scope="col">My Messages</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>{{ userDetailsStore.message }}</td>
            </tr>
        </tbody>
    </table>
</template>


<style scoped>
th {
    background-color: #8F7BD6;
    border-color: #7058C2;
    color: #E8E2F9
}

td {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #667085;
}
</style>
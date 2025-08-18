<script>
import { useUsersStore } from '../../../stores/UsersStore';
export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {};
    },
    created() {
        this.usersStore.getPartners();
    },
    methods: {}
};
</script>

<template>
    <div class="container bg-light rounded">
        <h1 class="heading">Partners</h1>
        <ul>
            <li v-for="partner in usersStore.partners">
                <p>
                    <RouterLink :to="`/partners/${partner.id}`">{{
                        partner.username
                    }}</RouterLink>
                </p>
            </li>
        </ul>
    </div>
</template>

<style scoped></style>

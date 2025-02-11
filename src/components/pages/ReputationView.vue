<script lang="ts">
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import ReputationDetails from './reputation/ReputationDetails.vue';
import ReputationEvents from './reputation/ReputationEvents.vue';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {};
    },
    components: {
        ReputationDetails,
        ReputationEvents
    },
    methods: {}
};
</script>

<template>
    <div class="container pb-4 theme-background mt-2">
        <h2 class="secondary-heading h4">Reputation</h2>
        <ReputationDetails />
        <ReputationEvents
            v-if="
                userDetailsStore.role == 'student' ||
                userDetailsStore.role == 'instructor'
            "
        />
    </div>
</template>

<style scoped></style>

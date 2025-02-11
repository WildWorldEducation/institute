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
    <div class="container pb-4 theme-background mt-2 d-flex gap-2 row">
        <div>
            <h2 class="secondary-heading h4">Reputation</h2>
            <ReputationDetails />
        </div>
        <div>
            <h2 class="secondary-heading h4">Reputation Events</h2>
            <ReputationEvents
                v-if="
                    userDetailsStore.role == 'student' ||
                    userDetailsStore.role == 'instructor'
                "
            />
        </div>
    </div>
</template>

<style scoped></style>

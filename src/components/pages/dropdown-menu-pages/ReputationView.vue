<script lang="ts">
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import ReputationScore from '../../components/reputation/ReputationScore.vue';
import ReputationEvents from '../../components/reputation/ReputationEvents.vue';
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
        ReputationScore,
        ReputationEvents
    },
    methods: {}
};
</script>

<template>
    <div class="container pb-4 theme-background mt-2">
        <h2 class="secondary-heading h4">Reputation</h2>
        <ReputationScore />
        <ReputationEvents
            v-if="
                userDetailsStore.role == 'student' ||
                userDetailsStore.role == 'instructor'
            "
        />
    </div>
</template>

<style scoped></style>

<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            reputationScore: this.userDetailsStore.reputationScore
        };
    },
    created() {},
    async mounted() {
        await this.userDetailsStore.getUserDetails();
    },
    methods: {}
};
</script>

<template>
    <div class="container pb-4 theme-background mt-2">
        <h2 class="secondary-heading h4">Reputation Score</h2>
        {{ reputationScore }}
    </div>
</template>

<style scoped>
.themes {
    width: 300px;
}

.theme-background {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
}
</style>

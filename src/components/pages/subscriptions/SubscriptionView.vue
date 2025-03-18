<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    data() {
        return {
            tokenCount: null
        };
    },
    async mounted() {
        getTokenCount();
    },
    methods: {
        async getTokenCount() {
            const result = await fetch(
                '/user-tokens/' + this.userDetailsStore.userId
            );
        }
    },
    computed: {}
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Subscription</h1>
        <h2 class="heading">Monthly usage</h2>
        <ul>
            <li>Limit: {{ tokenCount }} tokens</li>
            <li>Current usage:</li>
        </ul>
        <button class="btn primary-btn">Buy tokens</button>
    </div>
</template>

<style scoped></style>

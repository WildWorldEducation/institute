<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    }
};
</script>
<template>
    <div class="container">
        <h1 class="heading">Payment Successful!</h1>
        <p>You now have {{ userDetailsStore.tokens }} tokens</p>
        <p>
            Continue your journey now! Jump to the
            <router-link to="/skill-tree">skill tree</router-link>,
            <router-link to="/goals">revisit your goals</router-link>, or
            <router-link to="/search"
                >search for a new skill to explore</router-link
            >. Subscribed by mistake? You can
            <router-link to="/subscriptions"
                >change your subscription here</router-link
            >.
        </p>
    </div>
</template>
<style scoped></style>

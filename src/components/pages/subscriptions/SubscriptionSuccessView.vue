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
        <p>
            You are now subscribed to the
            <strong>{{ userDetailsStore.subscriptionTier }}</strong> plan
        </p>
    </div>
</template>
<style scoped></style>

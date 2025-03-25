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
    </div>
</template>
<style scoped></style>

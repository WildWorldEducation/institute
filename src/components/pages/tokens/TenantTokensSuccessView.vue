<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useTenantStore } from '../../../stores/TenantStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const tenantStore = useTenantStore();

        return {
            userDetailsStore,
            tenantStore
        };
    },
    async created() {
        // Ensure the user details are loaded when the component is created
        await this.userDetailsStore.getUserDetails();
        await this.tenantStore.getTenantDetails(this.userDetailsStore.tenantId);
    }
};
</script>
<template>
    <div class="container">
        <h1 class="heading">Payment Successful!</h1>
        <p>
            Your school now has
            <strong>{{ tenantStore.tokens.toLocaleString() }}</strong>
            tokens.
        </p>
        <p>TODO</p>
    </div>
</template>
<style scoped></style>

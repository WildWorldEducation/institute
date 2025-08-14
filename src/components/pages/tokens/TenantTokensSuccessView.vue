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
        <p>Continue to:</p>
        <ul>
            <li><router-link to="/skill-tree">skill tree</router-link></li>
            <li>
                <router-link to="/tenant-students">student reports</router-link>
            </li>
            <li><router-link to="/classes">teacher reports</router-link></li>
            <li>
                <router-link
                    :to="'/engagement-report/' + this.userDetailsStore.tenantId"
                    >engagement reports</router-link
                >
            </li>
            <li>
                <router-link
                    :to="'/academic-report/' + this.userDetailsStore.tenantId"
                    >academic reports</router-link
                >
            </li>
            <li>
                <router-link
                    :to="'/cost-report/' + this.userDetailsStore.tenantId"
                    >cost reports</router-link
                >
            </li>
        </ul>
    </div>
</template>
<style scoped></style>

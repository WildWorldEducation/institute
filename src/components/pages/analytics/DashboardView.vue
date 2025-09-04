<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import SchoolAdminAnalyticsDashboard from '../../components/analytics/full-size/tenants/dashboard/SchoolAdminAnalyticsDashboard.vue';

export default {
    name: 'Dashboard',
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
        SchoolAdminAnalyticsDashboard
    },
    async created() {}
};
</script>

<template>
    <SchoolAdminAnalyticsDashboard
        v-if="userDetailsStore.role == 'school_admin'"
    />
</template>

<style scoped></style>

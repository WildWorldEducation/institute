<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import SchoolAdminDashboard from '../../components/analytics/full-size/tenants/dashboard/SchoolAdminDashboard.vue';
import TeacherAnalyticsDashboard from '../../components/analytics/full-size/cohorts/dashboard/TeacherAnalyticsDashboard.vue';

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
        SchoolAdminDashboard,
        TeacherAnalyticsDashboard
    },
    async created() {}
};
</script>

<template>
    <SchoolAdminDashboard v-if="userDetailsStore.role == 'school_admin'" />
    <TeacherAnalyticsDashboard
        v-if="
            userDetailsStore.role == 'instructor' ||
            userDetailsStore.role == 'partner'
        "
    />
</template>

<style scoped></style>

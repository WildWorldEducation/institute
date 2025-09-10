<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import SchoolAdminEngagementReport from '../../components/analytics/full-size/tenants/SchoolAdminEngagementReport.vue';
import TeacherTimeReport from '../../components/analytics/full-size/cohorts/TeacherTimeReport.vue';
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
        SchoolAdminEngagementReport,
        TeacherTimeReport
    },
    async created() {}
};
</script>

<template>
    <SchoolAdminEngagementReport v-if="userDetailsStore.role == 'school_admin'" />
    <TeacherTimeReport
        v-if="
            userDetailsStore.role == 'instructor' ||
            userDetailsStore.role == 'partner'
        "
    
    />
</template>

<style scoped></style>

<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import SchoolAdminProgressReport from '../../components/analytics/full-size/tenants/SchoolAdminProgressReport.vue';
import TeacherProgressReport from '../../components/analytics/full-size/cohorts/TeacherProgressReport.vue';
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
        SchoolAdminProgressReport,
        TeacherProgressReport
    },
    async created() {}
};
</script>

<template>
    <SchoolAdminProgressReport v-if="userDetailsStore.role == 'school_admin'" />
    <TeacherProgressReport
        v-if="
            userDetailsStore.role == 'instructor' ||
            userDetailsStore.role == 'partner'
        "
    
    />
</template>

<style scoped></style>

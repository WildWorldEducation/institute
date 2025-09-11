<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import SchoolAdminChallengesReport from '../../components/analytics/full-size/tenants/SchoolAdminChallengesReport.vue';
import TeacherChallengesReport from '../../components/analytics/full-size/cohorts/TeacherChallengesReport.vue';
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
        SchoolAdminChallengesReport,
        TeacherChallengesReport
    },
    async created() {}
};
</script>

<template>
    <SchoolAdminChallengesReport v-if="userDetailsStore.role == 'school_admin'" />
    <TeacherChallengesReport
        v-if="
            userDetailsStore.role == 'instructor' ||
            userDetailsStore.role == 'partner'
        "
    
    />
</template>

<style scoped></style>

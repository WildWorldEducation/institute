<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import StudentAvgTokensToMasterSkillsHorizontalBarChart from '../../../components/analytics/full-size/students/StudentAvgTokensToMasterSkillsHorizontalBarChart.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            userDetailsStore,
            userSkillsStore,
            analyticsStore
        };
    },
    components: {
        StudentAvgTokensToMasterSkillsHorizontalBarChart
    },
    data() {
        return {
            studentId: this.userDetailsStore.userId
        };
    },
    async created() {
        await this.analyticsStore.getAvgTokensToMasterSkills(this.studentId);
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <h2 class="h4 heading">Tokens per skill</h2>
            <StudentAvgTokensToMasterSkillsHorizontalBarChart
                class=""
                v-if="analyticsStore.studentTokensPerSkills.length > 0"
                :data="analyticsStore.studentTokensPerSkills"
                colour="darkgreen"
            />
            <p v-else>No data yet</p>
        </div>
    </div>
</template>

<style scoped></style>

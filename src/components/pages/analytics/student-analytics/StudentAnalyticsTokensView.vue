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
    <div class="container-fluid chart-page">
        <div class="row">
            <div class="col">
                <h2 class="h4 heading">AI usage per skill</h2>
                <StudentAvgTokensToMasterSkillsHorizontalBarChart class="chart-card"
                    v-if="analyticsStore.studentTokensPerSkills.length > 0"
                    :data="analyticsStore.studentTokensPerSkills" />
                <p v-else>You haven't used the AI yet</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-page {
    background-color: hsl(from var(--primary-color) h s l / 0.15);
    border-top: 1px solid var(--primary-color);
    height: calc(100vh - 72px);
    overflow: hidden;
}

.chart-card {
    border-radius: 5px;
    padding: 10px 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background-color: white;
}

@media (max-width: 600px) {
    .chart-page {
        height: calc(100vh - 50px);
        overflow: auto;
    }
}
</style>

<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import PassedAssessmentsTimelineChart from '../../../components/analytics/full-size/students/PassedAssessmentsTimelineChart.vue';
import AttemptedAssessmentsTimelineChart from '../../../components/analytics/full-size/students/AttemptedAssessmentsTimelineChart.vue';

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
        PassedAssessmentsTimelineChart,
        AttemptedAssessmentsTimelineChart
    },
    data() {
        return {
            studentId: this.userDetailsStore.userId
        };
    },
    async created() {
        await this.analyticsStore.getStudentAssessmentPasses(this.studentId);
        //  await this.analyticsStore.getStudentAssessmentAttempts(this.studentId);
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid chart-page">
        <div class="row">
            <div class="col">
                <h2 class="h4 heading">Passed Assessments</h2>
                <PassedAssessmentsTimelineChart class="chart-card"
                    v-if="analyticsStore.studentAssessmentPasses.length > 0"
                    :data="analyticsStore.studentAssessmentPasses" />
                <p v-else>You have not completed any assessments yet.</p>
            </div>
        </div>
        <!-- <hr class="mt-5 mb-5" /> -->
        <!-- <div class="row mb-5">
            <h2 class="h4 heading">Attempted</h2>
            <AttemptedAssessmentsTimelineChart
                class=""
                v-if="analyticsStore.studentAssessmentAttempts.length > 0"
                :data="analyticsStore.studentAssessmentAttempts"
            />
            <p v-else>This student has attempted any assessments yet.</p>
        </div> -->
    </div>
</template>

<style scoped>
.chart-card {
    border-radius: 5px;
    padding: 10px 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background-color: white;
}

.chart-page {
    height: calc(100vh - 72px);

    background-color: hsl(from var(--primary-color) h s l / 0.15);
    border-top: 1px solid var(--primary-color);
}

@media (max-width: 576px) {
    .chart-page {
        overflow: auto;
        height: calc(100vh - 50px);
    }
}
</style>

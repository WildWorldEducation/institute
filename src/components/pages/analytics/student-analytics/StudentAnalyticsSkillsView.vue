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
        await this.analyticsStore.getStudentAssessmentAttempts(this.studentId);
    },
    methods: {}
};
</script>

<template>
    <div class="container">
        <div class="row">
            <h2 class="h4 heading">Passed</h2>
            <PassedAssessmentsTimelineChart
                class=""
                v-if="analyticsStore.studentAssessmentPasses.length > 0"
                :data="analyticsStore.studentAssessmentPasses"
            />
            <p v-else>This student has not completed any assessments yet.</p>
        </div>
        <hr class="mt-5 mb-5" />
        <div class="row mb-5">
            <h2 class="h4 heading">Attempted</h2>
            <AttemptedAssessmentsTimelineChart
                class=""
                v-if="analyticsStore.studentAssessmentAttempts.length > 0"
                :data="analyticsStore.studentAssessmentAttempts"
            />
            <p v-else>This student has attempted any assessments yet.</p>
        </div>
    </div>
</template>

<style scoped></style>

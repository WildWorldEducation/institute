<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import PassedAssessmentsTimelineChart from '../../../components/analytics/full-size/students/PassedAssessmentsTimelineChart.vue';
import AttemptedAssessmentsTimelineChart from '../../../components/analytics/full-size/students/AttemptedAssessmentsTimelineChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../../components/analytics/full-size/students/FailedAssessmentsHorizontalBarChart.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const userSkillsStore = useUserSkillsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            userDetailsStore,
            teacherAnalyticsStore,
            userSkillsStore,
            analyticsStore
        };
    },
    components: {
        PassedAssessmentsTimelineChart,
        AttemptedAssessmentsTimelineChart,
        FailedAssessmentsHorizontalBarChart
    },
    data() {
        return {
            studentId: this.userDetailsStore.userId
        };
    },
    async created() {
        await this.analyticsStore.getStudentAssessmentPasses(this.studentId);
        await this.analyticsStore.getStudentAssessmentAttempts(this.studentId);
        await this.teacherAnalyticsStore.getStudentMultipleFails(
            this.studentId
        );
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <h2 class="h4 heading">Passed</h2>
            <PassedAssessmentsTimelineChart
                class=""
                v-if="analyticsStore.studentAssessmentPasses.length > 0"
                :data="analyticsStore.studentAssessmentPasses"
            />
            <p v-else>This student has not completed any assessments yet.</p>
        </div>
        <div class="row mt-5">
            <h2 class="h4 heading">Attempted</h2>
            <AttemptedAssessmentsTimelineChart
                class=""
                v-if="analyticsStore.studentAssessmentAttempts.length > 0"
                :data="analyticsStore.studentAssessmentAttempts"
            />
            <p v-else>This student has attempted any assessments yet.</p>
        </div>
        <div class="row mt-5">
            <h2 class="h4 heading">Failed multiple times</h2>
            <FailedAssessmentsHorizontalBarChart
                v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
                :data="teacherAnalyticsStore.studentMultipleFails"
                colour="darkred"
                class=""
            />
            <p v-else>
                This student has not failed any assessments more than once yet.
            </p>
        </div>
    </div>
</template>

<style scoped></style>

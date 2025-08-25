<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import StudentDurationPerDayLineChart from '../../components/analytics/full-size/students/StudentDurationPerDayLineChart.vue';
import TimePerSkillHorizontalBarChart from '../../components/analytics/full-size/students/TimePerSkillHorizontalBarChart.vue';
import StudentAvgTokensToMasterSkillsHorizontalBarChart from '../../components/analytics/full-size/students/StudentAvgTokensToMasterSkillsHorizontalBarChart.vue';
import PassedAssessmentsTimelineChart from '../../components/analytics/full-size/students/PassedAssessmentsTimelineChart.vue';
import AttemptedAssessmentsTimelineChart from '../../components/analytics/full-size/students/AttemptedAssessmentsTimelineChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../components/analytics/full-size/students/FailedAssessmentsHorizontalBarChart.vue';

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
        StudentDurationPerDayLineChart,
        TimePerSkillHorizontalBarChart,
        StudentAvgTokensToMasterSkillsHorizontalBarChart,
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
        await this.analyticsStore.getStudentDurationPerDay(this.studentId);
        await this.analyticsStore.getStudentSkillDurations(this.studentId);
        await this.analyticsStore.getAvgTokensToMasterSkills(this.studentId);
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
        <div class="charts-grid">
            <div class="chart">
                <h2 class="h6">Time per day</h2>
                <StudentDurationPerDayLineChart
                    v-if="analyticsStore.studentDurationsPerDay.length > 0"
                    :data="analyticsStore.studentDurationsPerDay"
                    colour="black"
                />
                <p v-else>No data yet</p>
            </div>
            <div class="chart">
                <h2 class="h6">Time per skill</h2>
                <TimePerSkillHorizontalBarChart
                    v-if="analyticsStore.studentSkillDurations.length > 0"
                    :data="analyticsStore.studentSkillDurations"
                    colour="purple"
                />
                <p v-else>No data yet</p>
            </div>
            <div class="chart">
                <h2 class="h6">Tokens per skill</h2>
                <StudentAvgTokensToMasterSkillsHorizontalBarChart
                    class=""
                    v-if="analyticsStore.studentTokensPerSkills.length > 0"
                    :data="analyticsStore.studentTokensPerSkills"
                    colour="darkgreen"
                />
                <p v-else>No data yet</p>
            </div>
            <div class="chart">
                <h2 class="h6">Passed</h2>
                <PassedAssessmentsTimelineChart
                    class=""
                    v-if="analyticsStore.studentAssessmentPasses.length > 0"
                    :data="analyticsStore.studentAssessmentPasses"
                />
                <p v-else>
                    This student has not completed any assessments yet.
                </p>
            </div>
            <div class="chart">
                <h2 class="h6">Attempted</h2>
                <AttemptedAssessmentsTimelineChart
                    class=""
                    v-if="analyticsStore.studentAssessmentAttempts.length > 0"
                    :data="analyticsStore.studentAssessmentAttempts"
                />
                <p v-else>This student has attempted any assessments yet.</p>
            </div>
            <div class="chart">
                <h2 class="h6">Failed multiple times</h2>
                <FailedAssessmentsHorizontalBarChart
                    v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
                    :data="teacherAnalyticsStore.studentMultipleFails"
                    colour="darkred"
                    class=""
                />
                <p v-else>
                    This student has not failed any assessments more than once
                    yet.
                </p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart {
    box-shadow: 5px 10px 5px lightblue;
}

.charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    grid-gap: 20px;
}
</style>
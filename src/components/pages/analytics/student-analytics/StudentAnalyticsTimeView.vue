<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import StudentDurationPerDayLineChart from '../../../components/analytics/full-size/students/StudentDurationPerDayLineChart.vue';
import TimePerSkillHorizontalBarChart from '../../../components/analytics/full-size/students/TimePerSkillHorizontalBarChart.vue';
import TimePerSubjectHorizontalBarChart from '../../../components/analytics/full-size/students/TimePerSubjectHorizontalBarChart.vue';

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
        StudentDurationPerDayLineChart,
        TimePerSkillHorizontalBarChart,
        TimePerSubjectHorizontalBarChart
    },
    data() {
        return {
            studentId: this.userDetailsStore.userId
        };
    },
    async created() {
        await this.analyticsStore.getStudentDurationPerDay(this.studentId);
        await this.analyticsStore.getStudentSkillDurations(this.studentId);
        await this.analyticsStore.getStudentSubjectTimeSpent(this.studentId);
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid chart-page">
        <!-- <div class="row">
            <h2 class="h6">Time per day</h2>
            <StudentDurationPerDayLineChart
                v-if="analyticsStore.studentDurationsPerDay.length > 0"
                :data="analyticsStore.studentDurationsPerDay"
                colour="black"
            />
            <p v-else>No data yet</p>
        </div> -->

        <div class="row">
            <div class="col">
                <h2 class="h4 heading">Time per subject</h2>
                <div id="subject-activity-chart-container" class="chart-card">
                    <TimePerSubjectHorizontalBarChart v-if="analyticsStore.subjectTimeSpent.length > 0"
                        :data="analyticsStore.subjectTimeSpent" colour="purple" />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <h2 class="h4 heading">Time per skill</h2>
                <TimePerSkillHorizontalBarChart v-if="analyticsStore.studentSkillDurations.length > 0"
                    :data="analyticsStore.studentSkillDurations" colour="purple" class="chart-card" />
                <p v-else>You haven't spent any time on skills yet.</p>
            </div>
        </div>
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
    overflow: auto;
}

@media (max-width: 576px) {
    .chart-page {
        overflow: auto;
        height: calc(100vh - 50px);
    }
}
</style>

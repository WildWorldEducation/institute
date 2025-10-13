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
    <div class="container">
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
            <h2 class="h4 heading">Time per subject</h2>
            <TimePerSubjectHorizontalBarChart
                v-if="analyticsStore.subjectTimeSpent.length > 0"
                :data="analyticsStore.subjectTimeSpent"
                colour="purple"
            />
        </div>
        <div class="row">
            <h2 class="h4 heading">Time per skill</h2>
            <TimePerSkillHorizontalBarChart
                v-if="analyticsStore.studentSkillDurations.length > 0"
                :data="analyticsStore.studentSkillDurations"
                colour="purple"
            />
            <p v-else>You haven't spent any time on skills yet.</p>
        </div>
        <p class="mt-5">
            TODO: Add time per subject bar chart (above this chart)
        </p>
    </div>
</template>

<style scoped></style>

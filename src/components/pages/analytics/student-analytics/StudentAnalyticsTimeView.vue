<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import StudentDurationPerDayLineChart from '../../../components/analytics/full-size/students/StudentDurationPerDayLineChart.vue';
import TimePerSkillHorizontalBarChart from '../../../components/analytics/full-size/students/TimePerSkillHorizontalBarChart.vue';

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
        TimePerSkillHorizontalBarChart
    },
    data() {
        return {
            studentId: this.userDetailsStore.userId
        };
    },
    async created() {
        await this.analyticsStore.getStudentDurationPerDay(this.studentId);
        await this.analyticsStore.getStudentSkillDurations(this.studentId);
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
            <h2 class="h4 heading">Time per skill</h2>
            <TimePerSkillHorizontalBarChart
                v-if="analyticsStore.studentSkillDurations.length > 0"
                :data="analyticsStore.studentSkillDurations"
                colour="purple"
            />
            <p v-else>No data yet</p>
        </div>
    </div>
</template>

<style scoped></style>

<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
import FailedAssessmentsHorizontalBarChart from '../../../components/analytics/full-size/students/FailedAssessmentsHorizontalBarChart.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            userDetailsStore,
            teacherAnalyticsStore
        };
    },
    components: {
        FailedAssessmentsHorizontalBarChart
    },
    data() {
        return {
            studentId: this.userDetailsStore.userId
        };
    },
    async created() {
        await this.teacherAnalyticsStore.getStudentMultipleFails(
            this.studentId
        );
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid chart-page">
        <div class="row h-100">
            <div class="col">
                <h2 class="h4 heading">Failed multiple times</h2>
                <div id="fails-by-skill-chart-container" class="chart-card">
                    <FailedAssessmentsHorizontalBarChart v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
                        :data="teacherAnalyticsStore.studentMultipleFails" colour="darkred" />
                    <p v-else>
                        You have not failed any assessments more than once
                        yet.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-page {
    height: calc(100vh - 72px);
    overflow: hidden;
    background-color: hsl(from var(--primary-color) h s l / 0.15);
    border-top: 1px solid var(--primary-color);
}

.chart-card {
    border-radius: 5px;
    padding: 10px 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background-color: white;
}

#fails-by-skill-chart-container {
    width: 100%;
}

@media (max-width: 600px) {
    .chart-page {
        height: calc(100vh - 50px);
        overflow: auto;
    }

}
</style>

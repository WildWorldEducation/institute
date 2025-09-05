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
        <p>TODO: add failed by subject chart</p>
        <div class="row h-100">
            <h2 class="h4 heading">Failed multiple times</h2>
            <div id="fails-by-skill-chart-container">
                <FailedAssessmentsHorizontalBarChart
                    v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
                    :data="teacherAnalyticsStore.studentMultipleFails"
                    colour="darkred"
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
.chart-page {
    height: calc(100vh - 88px);
    overflow: hidden;
}

#fails-by-skill-chart-container {
    height: 100%;
    width: 100%;
}
</style>

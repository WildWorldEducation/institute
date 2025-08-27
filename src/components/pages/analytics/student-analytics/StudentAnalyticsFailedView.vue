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
    <div class="container">
        <div class="row mt-5 mb-5">
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

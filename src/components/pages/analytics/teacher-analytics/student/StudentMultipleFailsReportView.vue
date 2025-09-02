<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useTeacherAnalyticsStore } from '../../../../../stores/TeacherAnalyticsStore';
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';
import StudentFailedAssessmentsByRootSubjectHorizontalBarChart from '../../../../components/analytics/full-size/students/StudentFailedAssessmentsByRootSubjectHorizontalBarChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../../../components/analytics/full-size/students/FailedAssessmentsHorizontalBarChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            usersStore,
            teacherAnalyticsStore,
            analyticsStore
        };
    },
    components: {
        FailedAssessmentsHorizontalBarChart,
        StudentFailedAssessmentsByRootSubjectHorizontalBarChart,
        DownloadCSVBtn
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null
            // multipleFails: []
        };
    },
    async created() {
        // Get student name
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        if (this.teacherAnalyticsStore.studentMultipleFails.length == 0) {
            await this.teacherAnalyticsStore.getStudentMultipleFails(
                this.studentId
            );
        }
        await this.analyticsStore.getStudentFailedAssessmentsBySubject(
            this.studentId
        );

        this.isLoaded = true;
    },
    methods: {}
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading h4">Multiple fails</h1>
            <h2 class="tertiary-heading h4">{{ studentName }}</h2>
        </span>
        <div class="row">
            <div class="col-md">
                <h3>By subject</h3>
                <StudentFailedAssessmentsByRootSubjectHorizontalBarChart
                    v-if="
                        analyticsStore.studentRootSubjectsFailedAssessments
                            .length > 0
                    "
                    :data="analyticsStore.studentRootSubjectsFailedAssessments"
                    colour="darkred"
                    class="mb-5"
                />
                <p v-else>No data yet</p>
            </div>

            <div class="col-md position-relative">
                <h3>By skill</h3>
                <DownloadCSVBtn
                    :data="teacherAnalyticsStore.studentMultipleFails"
                    :fileName="`Assessment Status Report - ${studentName}`"
                    toolTip="Download failed assessments data as CSV"
                    class="position-absolute download-btn"
                />
                <FailedAssessmentsHorizontalBarChart
                    v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
                    :data="teacherAnalyticsStore.studentMultipleFails"
                    colour="darkred"
                    class="mb-5"
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
.download-btn {
    right: 10px;
    top: 10px;
}
</style>

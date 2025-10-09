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
    <div class="container chart-page">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading h4">Multiple fails</h1>
            <h2 class="tertiary-heading h4">{{ studentName }}</h2>
        </span>
        <div class="row h-100">
            <div class="col-md">
                <h3 class="secondary-heading h5">By subject</h3>
                <div id="fails-by-subject-chart-container">
                    <StudentFailedAssessmentsByRootSubjectHorizontalBarChart
                        v-if="
                            analyticsStore.studentRootSubjectsFailedAssessments
                                .length > 0
                        "
                        :data="
                            analyticsStore.studentRootSubjectsFailedAssessments
                        "
                    />
                    <p v-else>This student has not failed any assessments more than
                        once yet.</p>
                </div>
            </div>

            <div class="col-md position-relative">
                <h3 class="secondary-heading h5">By skill</h3>
                <div id="fails-by-skill-chart-container">
                    <DownloadCSVBtn
                        :data="teacherAnalyticsStore.studentMultipleFails"
                        :fileName="`Assessment Status Report - ${studentName}`"
                        toolTip="Download failed assessments data as CSV"
                        class="position-absolute download-btn"
                    />
                    <FailedAssessmentsHorizontalBarChart
                        v-if="
                            teacherAnalyticsStore.studentMultipleFails.length >
                            0
                        "
                        :data="teacherAnalyticsStore.studentMultipleFails"
                        colour="darkred"
                    />

                    <p v-else>
                        This student has not failed any assessments more than
                        once yet.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-page {
    height: calc(100vh - 88px);
    overflow: hidden;
}

.chart-row {
    height: 50%;
}

#fails-by-subject-chart-container,
#fails-by-skill-chart-container {
    height: 80%;
}

.download-btn {
    right: 10px;
    top: 10px;
}
</style>

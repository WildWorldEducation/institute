<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useUserSkillsStore } from '../../../../../stores/UserSkillsStore';
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';
import StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart from '../../../../components/analytics/full-size/students/StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart.vue';
import AttemptedAssessmentsTimelineChart from '../../../../components/analytics/full-size/students/AttemptedAssessmentsTimelineChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userSkillsStore = useUserSkillsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            usersStore,
            userSkillsStore,
            analyticsStore
        };
    },
    components: {
        AttemptedAssessmentsTimelineChart,
        StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart,
        DownloadCSVBtn
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            assessmentAttempts: [],
            assessmentAttemptsDownloadData: []
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

        await this.getAssessmentAttempts();
        await this.analyticsStore.getStudentAttemptedAssessmentsBySubject(
            this.studentId
        );
    },
    methods: {
        async getAssessmentAttempts() {
            fetch(
                `/student-analytics/started-unmastered-assessments/${this.studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.assessmentAttempts = data.map((e) => {
                        return {
                            ...e,
                            url: `/skills/${e.url}`,
                            // labelName: `${e.rootParent} - ${e.name}`
                            labelName: `${e.name}`
                        };
                    });
                    this.assessmentAttemptsDownloadData =
                        this.assessmentAttempts.map((e) => {
                            return {
                                skill: e.name,
                                date: this.assessmentDate(e.date)
                            };
                        });
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        assessmentDate(date) {
            let jsDate = new Date(date);
            return jsDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
};
</script>

<template>
    <div class="container chart-page">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading h4">Attempted assessments</h1>
            <h2 class="tertiary-heading h4">{{ studentName }}</h2>
        </span>
        <div class="row chart-row">
            <h3 class="secondary-heading h5">Subject Comparison</h3>
            <div
                id="assessment-comparison-chart-container"
                class="position-relative h-100"
            >
                <StudentAttemptedAssessmentsByRootSubjectHorizontalBarChart
                    v-if="
                        analyticsStore.studentRootSubjectsAttemptedAssessments
                            .length > 0
                    "
                    :data="
                        analyticsStore.studentRootSubjectsAttemptedAssessments
                    "
                />
                <p v-else>No data yet</p>
            </div>
        </div>

        <div class="row mt-5 chart-row">
            <h3 class="secondary-heading h5">Timeline</h3>
            <div
                id="assessment-timeline-chart-container"
                class="position-relative"
            >
                <DownloadCSVBtn
                    :data="assessmentAttemptsDownloadData"
                    :fileName="`Attempted Assessments - ${studentName}`"
                    toolTip="Download attempted assessments data as CSV"
                    class="position-absolute download-btn"
                />

                <AttemptedAssessmentsTimelineChart
                    v-if="assessmentAttempts.length > 0"
                    :data="assessmentAttempts"
                />
                <p v-else>
                    This student has not attempted any assessments yet.
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

.chart-row {
    height: 50%;
}

#assessment-timeline-chart-container,
#assessment-comparison-chart-container {
    width: 100%;
    height: 100%;
}

.download-btn {
    right: 10px;
    top: 10px;
}
</style>

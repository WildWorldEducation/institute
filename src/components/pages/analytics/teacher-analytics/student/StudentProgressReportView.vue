<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../../../stores/UserSkillsStore';
import StudentProgressChart from '../../../../components/analytics/full-size/students/dashboard/StudentProgressChart.vue';
import StudentPassedAssessmentsByRootSubjectHorizontalBarChart from '../../../../components/analytics/full-size/students/StudentPassedAssessmentsByRootSubjectHorizontalBarChart.vue';
import PassedAssessmentsTimelineChart from '../../../../components/analytics/full-size/students/PassedAssessmentsTimelineChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';
export default {
    setup() {
        const usersStore = useUsersStore();
        const analyticsStore = useAnalyticsStore();
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            usersStore,
            userDetailsStore,
            analyticsStore,
            userSkillsStore
        };
    },
    components: {
        StudentProgressChart,
        DownloadCSVBtn,
        PassedAssessmentsTimelineChart,
        StudentPassedAssessmentsByRootSubjectHorizontalBarChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            progressData: {
                student: [],
                average: []
            },
            assessmentPasses: []
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

        // Get total progress data
        await this.analyticsStore.getStudentProgress(
            this.studentId,
            this.userDetailsStore.tenantId
        );
        await this.HandleProgressData();

        await this.analyticsStore.getStudentPassedAssessmentsBySubject(
            this.studentId
        );

        await this.getUserSkillMasteredHistory(this.studentId);

        this.assessmentPassesDownloadData = this.assessmentPasses.map((e) => {
            return {
                skill: e.name,
                date: this.assessmentDate(e.mastered_date)
            };
        });
    },
    methods: {
        async HandleProgressData() {
            // If "You" checked

            this.progressData.student = [];
            for (
                let i = 0;
                i < this.analyticsStore.progress.student.length;
                i++
            ) {
                this.progressData.student.push(
                    this.analyticsStore.progress.student[i]
                );
            }

            this.progressData.average = [];
            for (
                let i = 0;
                i < this.analyticsStore.progress.tenant.length;
                i++
            ) {
                this.progressData.average.push(
                    this.analyticsStore.progress.tenant[i]
                );
            }

            this.$nextTick(() => {
                if (this.$refs.progressChart) {
                    // Access the ref here
                    this.$refs.progressChart.createChart(this.progressData);
                }
            });
        },
        async getUserSkillMasteredHistory(studentId) {
            await this.userSkillsStore.getMasteredSkills(studentId);
            this.assessmentPasses = this.userSkillsStore.masteredSkills.map(
                (e) => {
                    return {
                        ...e,
                        url: `/skills/${e.url}`,
                        labelName: `${e.name}`
                    };
                }
            );
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
    <div class="container-fluid chart-page">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading h4">Progress</h1>
            <h2
                class="tertiary-heading h4 d-flex justify-content-end align-items-center"
            >
                <DownloadCSVBtn
                    :data="progressData"
                    :fileName="`Progress Report - ${studentName}`"
                    toolTip="Download progress data as CSV"
                />
                {{ studentName }}
            </h2>
        </span>
        <div class="row chart-row">
            <div class="col-lg-8 chart-col position-relative">
                <div id="progress-chart-container">
                    <StudentProgressChart
                        ref="progressChart"
                        v-if="
                            progressData.student.length > 0 ||
                            progressData.average.length > 0
                        "
                        :data="progressData"
                    />
                    <p v-else>There is no data to show yet.</p>
                </div>
            </div>
            <div class="col-lg-4 chart-col position-relative">
                <StudentPassedAssessmentsByRootSubjectHorizontalBarChart
                    v-if="
                        analyticsStore.studentRootSubjectsPassedAssessments
                            .length > 0
                    "
                    :data="analyticsStore.studentRootSubjectsPassedAssessments"
                    colour="darkgreen"
                    class="mb-5"
                />
                <p v-else>No data yet</p>
            </div>
        </div>
        <div class="row chart-row position-relative">
            <DownloadCSVBtn
                :data="assessmentPassesDownloadData"
                :fileName="`Passed Assessments - ${studentName}`"
                toolTip="Download passed assessments data as CSV"
                class="position-absolute download-btn"
            />

            <PassedAssessmentsTimelineChart
                class="mb-5"
                v-if="assessmentPasses.length > 0"
                :data="assessmentPasses"
            />
            <p v-else>This student has not completed any assessments yet.</p>
        </div>
    </div>
</template>

<style scoped>
.download-btn {
    right: 10px;
    top: 10px;
}

.chart-row {
    height: 50%;
}

.chart-col {
    height: 100%;
}

.chart-page {
    height: calc(100vh - 88px);
    overflow: hidden;
}

#progress-chart-container {
    height: calc(100% - 35px);
    width: 100%;
}

.download-btn {
    right: 10px;
    top: 10px;
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (max-width: 992px) {
    .chart-col {
        height: 50%;
    }
}
</style>

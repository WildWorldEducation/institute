<script>
import TenantProgressLineChart from '../../../components/analytics/full-size/tenants/TenantProgressLineChart.vue';
import TenantNumSkillsPassedPerNumStudentsHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantNumSkillsPassedPerNumStudentsHorizontalBarChart.vue';
import TenantPassedAssessmentsHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantPassedAssessmentsHorizontalBarChart.vue';
import TenantAssessmentsAttemptedHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantAssessmentsAttemptedHorizontalBarChart.vue';
import TenantFailedAssessmentsHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantFailedAssessmentsHorizontalBarChart.vue';
import TenantFailedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantFailedAssessmentsByRootSubjectHorizontalBarChart.vue';
import TenantPassedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantPassedAssessmentsByRootSubjectHorizontalBarChart.vue';
import TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart from '../../../components/analytics/full-size/tenants/TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart.vue';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        return { userDetailsStore, analyticsStore };
    },
    components: {
        TenantProgressLineChart,
        TenantNumSkillsPassedPerNumStudentsHorizontalBarChart,
        TenantPassedAssessmentsHorizontalBarChart,
        TenantAssessmentsAttemptedHorizontalBarChart,
        TenantFailedAssessmentsHorizontalBarChart,
        TenantFailedAssessmentsByRootSubjectHorizontalBarChart,
        TenantPassedAssessmentsByRootSubjectHorizontalBarChart,
        TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart
    },
    data() {
        return {
            tenantId: this.$route.params.tenantId,
            isDataWeekly: false,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            // showTutorialTip2: false,
            // showTutorialTip3: false,
            // showTutorialTip4: false,
            dataMode: 'total'
        };
    },
    async created() {
        // Check tutorial progress
        await this.checkIfTutorialComplete();
        if (this.analyticsStore.tenantProgress.length == 0)
            await this.getTenantProgress();
        if (this.analyticsStore.numSkillsPassedPerNumStudents.length == 0)
            await this.getNumSkillsPassedPerNumStudents();
        if (this.analyticsStore.passedAssessments.length == 0)
            await this.getPassedAssessments();
        if (this.analyticsStore.failedAssessments.length == 0)
            await this.getFailedAssessments();
        if (this.analyticsStore.rootSubjectsFailedAssessments.length == 0)
            await this.getFailedAssessmentsBySubject();
        if (this.analyticsStore.rootSubjectsPassedAssessments.length == 0)
            await this.getPassedAssessmentsBySubject();
        if (this.analyticsStore.rootSubjectsAttemptedAssessments.length == 0)
            await this.getAttemptedAssessmentsBySubject();
        if (this.analyticsStore.attemptedAssessments.length == 0)
            await this.getTenantAssessmentsAttempted();
    },
    methods: {
        // Tutorial methods
        async checkIfTutorialComplete() {
            const result = await fetch(
                `/users/check-tutorial-progress/school-report/${this.userDetailsStore.userId}`
            );
            const data = await result.json();
            if (data == 0) {
                this.isTutorialComplete = false;
                this.showTutorialTip1 = true;
            } else if (data == 1) {
                this.isTutorialComplete = true;
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                // this.showTutorialTip2 = true;
                this.markTutorialComplete();
            }
            // else if (step == 2) {
            //     this.showTutorialTip2 = false;
            //     this.showTutorialTip3 = true;
            // } else if (step == 3) {
            //     this.showTutorialTip3 = false;
            //     this.showTutorialTip4 = true;
            // } else if (step == 4) {
            //     this.showTutorialTip4 = false;
            //     this.markTutorialComplete();
            // }
        },
        restartTutorial() {
            this.isTutorialComplete = false;
            this.showTutorialTip1 = true;
            // this.showTutorialTip2 = false;
            // this.showTutorialTip3 = false;
            // this.showTutorialTip4 = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/school-report/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        // skipTutorial() {
        //     this.showTutorialTip1 = false;
        //     this.showTutorialTip2 = false;
        //     this.showTutorialTip3 = false;
        //     this.showTutorialTip4 = false;
        //     this.isTutorialComplete = true;
        //     this.markTutorialComplete();
        // },
        async getTenantProgress() {
            fetch(`/student-analytics/tenant-progress/${this.tenantId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.analyticsStore.tenantProgress = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getNumSkillsPassedPerNumStudents() {
            try {
                const response = await fetch(
                    `/student-analytics/num-skills-passed-per-num-students/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.numSkillsPassedPerNumStudents =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.numSkillsPassedPerNumStudents = [];
            }
        },
        async getPassedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/passed-assessments/tenant/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.passedAssessments = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.passedAssessments = [];
            }
        },
        async getTenantAssessmentsAttempted() {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments/tenant/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.attemptedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.attemptedAssessments = [];
            }
        },
        async getFailedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments/tenant/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.failedAssessments = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.failedAssessments = [];
            }
        },
        async getFailedAssessmentsBySubject() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments-by-subject/tenant/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.rootSubjectsFailedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.rootSubjectsFailedAssessments = [];
            }
        },
        async getPassedAssessmentsBySubject() {
            try {
                const response = await fetch(
                    `/student-analytics/passed-assessments-by-subject/tenant/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.rootSubjectsPassedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.rootSubjectsPassedAssessments = [];
            }
        },
        async getAttemptedAssessmentsBySubject() {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments-by-subject/tenant/${this.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.rootSubjectsAttemptedAssessments =
                    await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.rootSubjectsAttemptedAssessments = [];
            }
        },
        // Utilities
        downloadData(data, name) {
            const headers = Object.keys(data[0]);
            console.log(headers);
            const csvRows = [];
            csvRows.push(headers.join(','));
            for (const row of data) {
                const values = headers.map((h) => {
                    const val = row[h];
                    return `"${String(val).replace(/"/g, '""')}"`; // Escape quotes
                });
                csvRows.push(values.join(','));
            }
            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], {
                type: 'text/csv;charset=utf-8;'
            });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = name + '.csv';
            link.click();
        },
        async toggleWeeklyCumulativeData() {
            if (this.dataMode == 'total') this.dataMode = 'weekly';
            else this.dataMode = 'total';

            // await this.getTotalTokensPerDay();
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Academic Report</h1>
            <!-- Tutorial button -->
            <button class="btn me-1" @click="restartTutorial" aria-label="info">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 192 512"
                    width="20"
                    height="23"
                    class="primary-icon"
                >
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                    />
                </svg>
            </button>
        </span>

        <!-- Tutorial modal for initial introduction -->
        <div v-if="showTutorialTip1" class="modal">
            <div class="modal-content">
                <p class="modal-text">
                    The Academic Report provides comprehensive analytics on
                    student academic performance across your school, including
                    skill mastery progress, assessment results by subject areas,
                    completion rates, and detailed breakdowns of passed,
                    attempted, and failed assessments. All chart data can be
                    downloaded as CSV files using the download buttons next to
                    each chart for further analysis.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        close
                    </button>
                </div>
            </div>
        </div>

        <h4 class="d-flex justify-content-between">
            Skill mastery progress
            <button
                class="btn"
                @click="downloadData(analyticsStore.tenantProgress, 'Progress')"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantProgressLineChart
            v-if="analyticsStore.tenantProgress.length > 0"
            :data="analyticsStore.tenantProgress"
            colour="#5f31dd"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <h3 class="secondary-heading mt-5">Performance by Subject</h3>
        <h4 class="d-flex justify-content-between">
            Failed more than once
            <button
                class="btn"
                @click="
                    downloadData(
                        analyticsStore.rootSubjectsFailedAssessments,
                        'Subjects-failed'
                    )
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantFailedAssessmentsByRootSubjectHorizontalBarChart
            v-if="analyticsStore.rootSubjectsFailedAssessments.length > 0"
            :data="analyticsStore.rootSubjectsFailedAssessments"
            colour="darkred"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <h4 class="d-flex justify-content-between">
            Passed
            <button
                class="btn"
                @click="
                    downloadData(
                        analyticsStore.rootSubjectsPassedAssessments,
                        'Subjects-passed'
                    )
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantPassedAssessmentsByRootSubjectHorizontalBarChart
            v-if="analyticsStore.rootSubjectsPassedAssessments.length > 0"
            :data="analyticsStore.rootSubjectsPassedAssessments"
            colour="darkgreen"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <h4 class="d-flex justify-content-between">
            Attempted
            <button
                class="btn"
                @click="
                    downloadData(
                        analyticsStore.rootSubjectsAttemptedAssessments,
                        'Subjects-attempted'
                    )
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart
            v-if="analyticsStore.rootSubjectsAttemptedAssessments.length > 0"
            :data="analyticsStore.rootSubjectsAttemptedAssessments"
            colour="darkblue"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <h3 class="secondary-heading">Assessment Completion</h3>
        <h4 class="d-flex justify-content-between">
            Number of students who have passed a specific number of skills
            <button
                class="btn"
                @click="
                    downloadData(
                        analyticsStore.numSkillsPassedPerNumStudents,
                        'Number-skills-passed-per-number-of-students'
                    )
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantNumSkillsPassedPerNumStudentsHorizontalBarChart
            v-if="analyticsStore.numSkillsPassedPerNumStudents.length > 0"
            :data="analyticsStore.numSkillsPassedPerNumStudents"
            colour="darkgreen"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <h4 class="d-flex justify-content-between">
            Number of students who have passed a specific skill
            <button
                class="btn"
                @click="
                    downloadData(
                        analyticsStore.passedAssessments,
                        'Assessments-passed'
                    )
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantPassedAssessmentsHorizontalBarChart
            v-if="analyticsStore.passedAssessments.length > 0"
            :data="analyticsStore.passedAssessments"
            colour="darkgreen"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <h4 class="d-flex justify-content-between">
            Number of students who have attempted a specific skill assessment
            <button
                class="btn"
                @click="
                    downloadData(
                        analyticsStore.attemptedAssessments,
                        'Assessments-attempted'
                    )
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantAssessmentsAttemptedHorizontalBarChart
            v-if="analyticsStore.attemptedAssessments.length > 0"
            :data="analyticsStore.attemptedAssessments"
            colour="#5f31dd"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <h4 class="d-flex justify-content-between">
            Skills that have been failed more than once
            <button
                class="btn"
                @click="
                    downloadData(
                        analyticsStore.failedAssessments,
                        'Assessments-failed'
                    )
                "
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 384 512"
                    width="18"
                    height="18"
                >
                    <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z"
                    />
                </svg>
            </button>
        </h4>
        <TenantFailedAssessmentsHorizontalBarChart
            v-if="analyticsStore.failedAssessments.length > 0"
            :data="analyticsStore.failedAssessments"
            colour="darkred"
            class="mb-5"
        />
        <p v-else>No data yet</p>
    </div>
</template>

<style scoped>
/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Specific phone view css */
@media (max-width: 576px) {
    .modal-content {
        margin-top: 100%;
        width: 90%;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .modal-content {
        width: 70%;
    }

    .modal-btn {
        width: fit-content;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90% !important;
        margin: auto;
        margin-top: 30%;
    }
}
/* Main Tab Styling */
.tab-btn {
    background-color: #f8f9fa;
    color: #6c757d;
    border: 1px solid #dee2e6;
    border-bottom-color: transparent;
    font-weight: 500;
    opacity: 0.8;
    transition: all 0.3s ease;
    position: relative;
}

.tab-btn:hover {
    background-color: #e9ecef;
    color: #495057;
    opacity: 1;
    transform: translateY(-1px);
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
}

.tab-btn.active {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
    border-color: var(--primary-color) var(--primary-color) #fff;
    opacity: 1;
    /* box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25); */
}

/* Filter Button Styling */
.filter-btn {
    transition: all 0.2s ease;
}

.filter-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-check:checked + .filter-btn {
    background-color: #495057;
    border-color: #495057;
    color: white;
    box-shadow: 0 2px 6px rgba(73, 80, 87, 0.25);
}

/* Touch Device Optimizations */
@media (hover: none) and (pointer: coarse) {
    .tab-btn:hover,
    .filter-btn:hover {
        transform: none;
        box-shadow: none;
    }

    .tab-btn,
    .filter-btn {
        min-height: 44px;
    }
}

/* Mobile Responsive */
@media (max-width: 576px) {
    .nav.nav-tabs {
        flex-direction: column;
        border-bottom: none;
    }

    .tab-btn {
        width: 100%;
        margin-bottom: 0.25rem;
        border-radius: 0.5rem;
        border-bottom-color: #dee2e6;
        text-align: center;
    }

    .tab-btn.active {
        border-color: var(--primary-color);
    }
}

/* Tooltips */
.hovering-info-panel {
    position: absolute;
    z-index: 100;
    /* border-color: var(--primary-color);
    border-width: 2px;
    border-style: solid; */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: fit-content;
    margin-bottom: 0 !important; /* Remove any margin that might push content */
}

.narrow-info-panel {
    width: 300px;
}
</style>

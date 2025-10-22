<script>
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';
import TenantPassedAssessmentsByRootSubjectHorizontalBarChart from './TenantPassedAssessmentsByRootSubjectHorizontalBarChart.vue';
import TenantPassedAssessmentsHorizontalBarChart from './TenantPassedAssessmentsHorizontalBarChart.vue';
import TenantAssessmentsAttemptedHorizontalBarChart from './TenantAssessmentsAttemptedHorizontalBarChart.vue';
import TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart from './TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        return { userDetailsStore, analyticsStore };
    },
    components: {
        TenantPassedAssessmentsHorizontalBarChart,
        TenantAssessmentsAttemptedHorizontalBarChart,
        TenantPassedAssessmentsByRootSubjectHorizontalBarChart,
        TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart
    },
    data() {
        return {
            tenantId: this.userDetailsStore.tenantId,
            isDataWeekly: false,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            dataMode: 'total'
        };
    },
    async created() {
        // Check tutorial progress
        await this.checkIfTutorialComplete();
        if (this.analyticsStore.passedAssessments.length == 0)
            await this.getPassedAssessments();
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
                this.markTutorialComplete();
            }
        },
        restartTutorial() {
            this.isTutorialComplete = false;
            this.showTutorialTip1 = true;
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
    <div class="container-fluid chart-page">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading h4">School-wide Progress Report</h1>
            <!-- Tutorial button -->
            <button class="btn me-1" @click="restartTutorial" aria-label="info">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" width="20" height="23"
                    class="primary-icon">
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z" />
                </svg>
            </button>
        </span>
        <!-- Tutorial modal for initial introduction -->
        <div v-if="showTutorialTip1" class="modal">
            <div class="modal-content">
                <p class="modal-text">
                    The report shows data on passed and attempted assessments,
                    by subject and specific skill.
                </p>
                <div class="d-flex justify-content-between">
                    <button class="btn primary-btn" @click="progressTutorial(1)">
                        close
                    </button>
                </div>
            </div>
        </div>

        <div class="row chart-row">
            <h2 class="heading h5">Passed Assessments</h2>
            <div class="col-md chart-col position-relative">
                <div id="passed-subjects-chart" class="chart-card">
                    <button class="btn position-absolute download-btn" @click="
                        downloadData(
                            analyticsStore.rootSubjectsPassedAssessments,
                            'Subjects-passed'
                        )
                        ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18">
                            <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                            <path
                                d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z" />
                        </svg>
                    </button>
                    <TenantPassedAssessmentsByRootSubjectHorizontalBarChart v-if="
                        analyticsStore.rootSubjectsPassedAssessments
                            .length > 0
                    " :data="analyticsStore.rootSubjectsPassedAssessments" colour="darkgreen" class="" />
                    <p v-else>No data yet</p>
                </div>
            </div>
            <div class="col-md chart-col position-relative overflow-auto">
                <div id="passed-skills-chart" class="chart-card">
                    <button class="btn position-absolute download-btn" @click="
                        downloadData(
                            analyticsStore.passedAssessments,
                            'Assessments-passed'
                        )
                        ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18">
                            <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                            <path
                                d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z" />
                        </svg>
                    </button>

                    <TenantPassedAssessmentsHorizontalBarChart v-if="analyticsStore.passedAssessments.length > 0"
                        :data="analyticsStore.passedAssessments" colour="darkgreen" class="" />
                    <p v-else>No data yet</p>
                </div>
            </div>
        </div>
        <div class="row chart-row">
            <h2 class="heading h5">Attempted Assessments</h2>
            <div class="col-md chart-col position-relative">
                <div id="attempted-subjects-chart" class="chart-card">
                    <button class="btn position-absolute download-btn" @click="
                        downloadData(
                            analyticsStore.rootSubjectsAttemptedAssessments,
                            'Subjects-attempted'
                        )
                        ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18">
                            <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                            <path
                                d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z" />
                        </svg>
                    </button>

                    <TenantAttemptedAssessmentsByRootSubjectHorizontalBarChart v-if="
                        analyticsStore.rootSubjectsAttemptedAssessments
                            .length > 0
                    " :data="analyticsStore.rootSubjectsAttemptedAssessments" colour="darkblue" class="" />
                    <p v-else>No data yet</p>
                </div>
            </div>
            <div class="col-md chart-col position-relative overflow-auto">
                <div id="attempted-skills-chart" class="chart-card">
                    <button class="btn position-absolute download-btn" @click="
                        downloadData(
                            analyticsStore.attemptedAssessments,
                            'Assessments-attempted'
                        )
                        ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18">
                            <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                            <path
                                d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z" />
                        </svg>
                    </button>

                    <TenantAssessmentsAttemptedHorizontalBarChart v-if="analyticsStore.attemptedAssessments.length > 0"
                        :data="analyticsStore.attemptedAssessments" colour="#5f31dd" class="" />
                    <p v-else>No data yet</p>
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

/* Specific phone view css */
@media (min-width: 600px) {
    .chart-row {
        height: calc(50% - 20px);
    }

    .chart-col {
        height: 100%;
    }
}


#passed-subjects-chart,
#attempted-subjects-chart,
#passed-skills-chart,
#attempted-skills-chart {
    height: calc(100% - 35px);
    width: 100%;
}


@media (max-width: 599px) {
    .chart-page {
        height: calc(100vh - 50px);
        overflow: hidden;
    }

    #passed-subjects-chart,
    #attempted-subjects-chart,
    #passed-skills-chart,
    #attempted-skills-chart {
        min-height: 50px;
    }

}

.download-btn {
    right: 2px;
    top: 2px;
}

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

.btn-check:checked+.filter-btn {
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
    margin-bottom: 0 !important;
    /* Remove any margin that might push content */
}

.narrow-info-panel {
    width: 300px;
}
</style>

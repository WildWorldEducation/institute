<script>
import { useCohortsStore } from '../../../../stores/CohortsStore.js';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore.js';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore.js';
import CohortProgressLineChart from '/src/components/components/analytics/full-size/cohorts/CohortProgressLineChart.vue';

import CohortPercentageStudentsMasteredAtLeastOneSkillPieChart from '/src/components/components/analytics/full-size/cohorts/CohortPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
import CohortDurationPerDayLineChart from '/src/components/components/analytics/full-size/cohorts/CohortDurationPerDayLineChart.vue';
import CohortSkillActivityChart from '/src/components/components/analytics/full-size/cohorts/CohortSkillActivityChart.vue';
import CohortFailedAssessmentsByRootSubjectHorizontalBarChart from '/src/components/components/analytics/full-size/cohorts/CohortFailedAssessmentsByRootSubjectHorizontalBarChart.vue';
import CohortPassedAssessmentsByRootSubjectHorizontalBarChart from '/src/components/components/analytics/full-size/cohorts/CohortPassedAssessmentsByRootSubjectHorizontalBarChart.vue';
import CohortAttemptedAssessmentsByRootSubjectHorizontalBarChart from '/src/components/components/analytics/full-size/cohorts/CohortAttemptedAssessmentsByRootSubjectHorizontalBarChart.vue';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            cohortsStore,
            userDetailsStore,
            analyticsStore
        };
    },
    data() {
        return {
            teacherId: this.$route.params.teacherId,
            isMobileCheck: window.innerWidth,
            percentageStudentsMasteredOneSkill: [],
            isLoaded: false,
            classProgress: [],
            durationsPerDay: []
        };
    },
    async created() {
        await this.getTenantClassProgress();
        await this.getInstructorPercentageStudentsMasteredAtLeastOneSkill();
        await this.getTenantClassDurationPerDay();
        await this.analyticsStore.getTeacherClassSkillActivityReport(
            this.teacherId
        );
        await this.analyticsStore.getTeacherClassFailedAssessmentsBySubject(
            this.teacherId
        );
        await this.analyticsStore.getTeacherClassPassedAssessmentsBySubject(
            this.teacherId
        );
        await this.analyticsStore.getTeacherClassAttemptedAssessmentsBySubject(
            this.teacherId
        );
    },
    components: {
        CohortPercentageStudentsMasteredAtLeastOneSkillPieChart,
        CohortProgressLineChart,
        CohortDurationPerDayLineChart,
        CohortSkillActivityChart,
        CohortFailedAssessmentsByRootSubjectHorizontalBarChart,
        CohortPassedAssessmentsByRootSubjectHorizontalBarChart,
        CohortAttemptedAssessmentsByRootSubjectHorizontalBarChart
    },
    methods: {
        async getTenantClassProgress() {
            fetch(`/student-analytics/all-students-progress/${this.teacherId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.classProgress = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getInstructorPercentageStudentsMasteredAtLeastOneSkill() {
            try {
                const response = await fetch(
                    `/student-analytics/percentage-students-mastered-one-skill/instructor/${this.teacherId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.percentageStudentsMasteredOneSkill = Array.isArray(data)
                    ? data
                    : [];

                this.isLoaded = true;

                await this.$refs.cohortPercentageStudentsMasteredAtLeastOneSkillPieChart.generateChart();
            } catch (error) {
                console.error(
                    'Error fetching all students failed assessments:',
                    error
                );
                this.percentageStudentsMasteredOneSkill = [];
            }
        },
        async getTenantClassDurationPerDay() {
            fetch(
                `/student-analytics/all-students-duration-per-day/${this.teacherId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            data[i].quantity / (1000 * 60);
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.durationsPerDay = data;
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    }
};
</script>

<template>
    <div class="container bg-light">
        <!-- Row: Avatar, name and basic details -->
        <div class="row" v-if="isMobileCheck < 576">
            <!-- Name and basic details -->
            <h1 class="secondary-heading h3">
                {{ this.cohortsStore.selectedCohort.name }}
            </h1>
        </div>
        <div class="d-flex justify-content-between">
            <h1 class="heading">Teacher Report</h1>
            <button class="btn me-1" @click="$parent.restartTutorial">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 192 512"
                    width="20"
                    height="20"
                    class="primary-icon"
                >
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                    />
                </svg>
            </button>
        </div>

        <h2 class="secondary-heading">Engagement</h2>
        <h4>Time on platform</h4>
        <CohortDurationPerDayLineChart
            v-if="durationsPerDay.length > 0"
            :data="durationsPerDay"
            colour="#5f31dd"
            ref="cohortDurationPerDayLineChart"
        />
        <p v-else>No data available</p>

        <hr class="mt-5 mb-5" />

        <h4 class="mt-4">Skills visited</h4>
        <CohortSkillActivityChart
            v-if="analyticsStore.cohortSkillActivities.length > 0"
            :data="analyticsStore.cohortSkillActivities"
        />
        <p v-else>No skills visited by this student.</p>

        <hr class="mt-5 mb-5" />

        <h2 class="secondary-heading mt-5">Academics</h2>
        <h4>Skill mastery progress</h4>
        <CohortProgressLineChart
            v-if="classProgress.length > 0"
            :data="classProgress"
            colour="#5f31dd"
            ref="cohortProgressLineChart"
        />
        <p v-else>No data available</p>

        <hr class="mt-5 mb-5" />

        <h4 class="mt-4">
            Percentage of students who completed at least one skill
        </h4>
        <CohortPercentageStudentsMasteredAtLeastOneSkillPieChart
            ref="cohortPercentageStudentsMasteredAtLeastOneSkillPieChart"
            class="mb-5"
        />

        <hr class="mt-5 mb-5" />

        <h3 class="secondary-heading">By subject</h3>
        <h4 class="">Failed more than once</h4>
        <CohortFailedAssessmentsByRootSubjectHorizontalBarChart
            v-if="analyticsStore.cohortRootSubjectsFailedAssessments.length > 0"
            :data="analyticsStore.cohortRootSubjectsFailedAssessments"
            colour="darkred"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <hr class="mt-5 mb-5" />

        <h4 class="">Passed</h4>
        <CohortPassedAssessmentsByRootSubjectHorizontalBarChart
            v-if="analyticsStore.cohortRootSubjectsPassedAssessments.length > 0"
            :data="analyticsStore.cohortRootSubjectsPassedAssessments"
            colour="darkgreen"
            class="mb-5"
        />
        <p v-else>No data yet</p>

        <hr class="mt-5 mb-5" />

        <h4 class="">Attempted</h4>
        <CohortAttemptedAssessmentsByRootSubjectHorizontalBarChart
            v-if="
                analyticsStore.cohortRootSubjectsAttemptedAssessments.length > 0
            "
            :data="analyticsStore.cohortRootSubjectsAttemptedAssessments"
            colour="darkblue"
            class="mb-5"
        />
        <p v-else>No data yet</p>
    </div>
</template>

<style scoped>
.remove-student-btn {
    font-weight: 500;
}

.fit-content {
    max-width: fit-content;
}

.user-input-information {
    background-color: #fcfcfd !important;
    color: black;
    font-family: 'Poppins' sans-serif;
    font-weight: 400;
    font-size: 1rem;
    padding: 10px, 14px, 10px, 14px;
}

#user-function-btns-row {
    margin-top: 17;
    padding-left: 10px;
    padding-right: 10px;
}

.form-label {
    color: black;
    font-size: 0.875rem;
    font-weight: 600;
    font-family: 'Poppins' sans-serif;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.green-btn > svg {
    margin-left: 15px;
}

.green-btn:hover {
    background-color: #2ca695;
}

#close-popup-btn {
    border-radius: 20px;
    background-color: #36c1af;
    padding: 7px 10px;
}

/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
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

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}

/* Mobile */
@media (max-width: 480px) {
    #user-information {
        border-radius: 10px;
        padding-bottom: 0px;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    #user-information {
        padding-left: 10px;
        padding-right: 10px;
        padding-bottom: 15px;
        margin-right: 10px;
        margin-bottom: 10px;
    }

    #user-function-btns-row {
        margin-top: 17;
        padding-left: 10px;
        padding-right: 10px;
        flex-direction: column;
    }

    .green-btn {
        margin-left: 10px !important;
        margin-right: auto !important;
    }
}

@media (min-width: 1025px) {
    #user-information {
        margin-left: auto;
        margin-right: auto;
    }
}
</style>

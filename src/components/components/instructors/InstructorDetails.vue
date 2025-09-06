<script>
import { useCohortsStore } from '../../../stores/CohortsStore.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useAnalyticsStore } from '../../../stores/AnalyticsStore.js';
import CohortPercentageStudentsMasteredAtLeastOneSkillPieChart from './../analytics/full-size/cohorts/CohortPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
import CohortProgressLineChart from './../analytics/full-size/cohorts/CohortProgressLineChart.vue';
import CohortDurationPerDayLineChart from './../analytics/full-size/cohorts/CohortDurationPerDayLineChart.vue';
import CohortSkillActivityChart from './../analytics/full-size/cohorts/CohortSkillActivityChart.vue';
import CohortFailedAssessmentsByRootSubjectHorizontalBarChart from './../analytics/full-size/cohorts/CohortFailedAssessmentsByRootSubjectHorizontalBarChart.vue';
import CohortPassedAssessmentsByRootSubjectHorizontalBarChart from './../analytics/full-size/cohorts/CohortPassedAssessmentsByRootSubjectHorizontalBarChart.vue';
import CohortAttemptedAssessmentsByRootSubjectHorizontalBarChart from './../analytics/full-size/cohorts/CohortAttemptedAssessmentsByRootSubjectHorizontalBarChart.vue';

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
            this.$parent.selectedInstructor.id
        );
        await this.analyticsStore.getTeacherClassFailedAssessmentsBySubject(
            this.$parent.selectedInstructor.id
        );
        await this.analyticsStore.getTeacherClassPassedAssessmentsBySubject(
            this.$parent.selectedInstructor.id
        );
        await this.analyticsStore.getTeacherClassAttemptedAssessmentsBySubject(
            this.$parent.selectedInstructor.id
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
            fetch(
                `/student-analytics/all-students-progress/${this.$parent.selectedInstructor.id}`
            )
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
                    `/student-analytics/percentage-students-mastered-one-skill/instructor/${this.$parent.selectedInstructor.id}`
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
                `/student-analytics/all-students-duration-per-day/${this.$parent.selectedInstructor.id}`
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
    <div id="user-information" class="container mt-1 bg-light p-2">
        <div class="d-flex justify-content-between align-items-center">
            <!-- The X to close the user details popup windows when on phone view -->
            <div
                class="flex-row-reverse d-flex d-md-none align-items-end mb-2"
                @click="this.$emit('hideDetails')"
            >
                <div id="close-popup-btn">
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                            fill="white"
                        />
                    </svg>
                </div>
            </div>
            <!-- Row: Avatar, name and basic details -->
            <div class="row" v-if="isMobileCheck < 576">
                <!-- Name and basic details -->
                <h1 class="secondary-heading h3">
                    {{ this.cohortsStore.selectedCohort.name }}
                </h1>
            </div>
            <div class="d-flex info-button">
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
        </div>

        <h2 class="secondary-heading">Engagement</h2>
        <div>
            <h4>Time on platform</h4>
            <CohortDurationPerDayLineChart
                v-if="durationsPerDay.length > 0"
                :data="durationsPerDay"
                colour="#5f31dd"
                ref="cohortDurationPerDayLineChart"
            />
            <p v-else>No data available</p>

            <h4 class="mt-4">Skills visited</h4>
            <CohortSkillActivityChart
                v-if="analyticsStore.cohortSkillActivities.length > 0"
                :data="analyticsStore.cohortSkillActivities"
            />
            <p v-else>No skills visited by this student.</p>

            <h2 class="secondary-heading mt-5">Academics</h2>
            <h4>Skill mastery progress</h4>
            <CohortProgressLineChart
                v-if="classProgress.length > 0"
                :data="classProgress"
                colour="#5f31dd"
                ref="cohortProgressLineChart"
            />
            <p v-else>No data available</p>

            <h4 class="mt-4">
                Percentage of students who completed at least one skill
            </h4>
            <CohortPercentageStudentsMasteredAtLeastOneSkillPieChart
                ref="cohortPercentageStudentsMasteredAtLeastOneSkillPieChart"
                class="mb-5"
            />

            <h3 class="secondary-heading">By subject</h3>
            <h4 class="">Failed more than once</h4>
            <CohortFailedAssessmentsByRootSubjectHorizontalBarChart
                v-if="
                    analyticsStore.cohortRootSubjectsFailedAssessments.length >
                    0
                "
                :data="analyticsStore.cohortRootSubjectsFailedAssessments"
                colour="darkred"
                class="mb-5"
            />
            <p v-else>No data yet</p>

            <h4 class="">Passed</h4>
            <CohortPassedAssessmentsByRootSubjectHorizontalBarChart
                v-if="
                    analyticsStore.cohortRootSubjectsPassedAssessments.length >
                    0
                "
                :data="analyticsStore.cohortRootSubjectsPassedAssessments"
                colour="darkgreen"
                class="mb-5"
            />
            <p v-else>No data yet</p>

            <h4 class="">Attempted</h4>
            <CohortAttemptedAssessmentsByRootSubjectHorizontalBarChart
                v-if="
                    analyticsStore.cohortRootSubjectsAttemptedAssessments
                        .length > 0
                "
                :data="analyticsStore.cohortRootSubjectsAttemptedAssessments"
                colour="darkblue"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            <!-- 
            <h4 class="secondary-heading mt-4">Assessments attempted</h4>
            <AttemptedAssessmentsTimelineChart class="mb-5" v-if="assessmentAttempts.length > 0"
                :data="assessmentAttempts" />
            <p v-else>This student has attempted any assessments yet.</p>

        
            <h4 class="secondary-heading mt-4">Assessments passed</h4>
            <PassedAssessmentsTimelineChart class="mb-5" v-if="assessmentPasses.length > 0" :data="assessmentPasses" />
            <p v-else>
                This student has not completed any assessments yet.
            </p>
            <h4 class="secondary-heading mt-4">Assessments failed</h4>
            <FailedAssessmentsHorizontalBarChart v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
                :data="teacherAnalyticsStore.studentMultipleFails" colour="darkred" class="mb-5" />
            <p v-else>
                This student has not failed any assessments more than once
                yet.
            </p> -->
        </div>
    </div>
</template>

<style scoped>
.info-button {
    position: absolute;
    top: 10px;
    right: 10px;
}

.fit-content {
    max-width: fit-content;
}

#user-information {
    border: 1px solid var(--primary-color);
    border-radius: 12px;
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

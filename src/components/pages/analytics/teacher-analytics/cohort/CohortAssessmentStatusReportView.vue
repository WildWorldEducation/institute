<script>
import { useCohortsStore } from '../../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import CohortPassedAssessmentsHorizontalBarChart from '../../../../components/teacher-analytics/cohorts/CohortPassedAssessmentsHorizontalChart.vue';
import CohortAttemptedAssessmentsHorizontalChart from '../../../../components/teacher-analytics/cohorts/CohortAttemptedAssessmentsHorizontalChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../../../components/teacher-analytics/students/FailedAssessmentsHorizontalBarChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    components: {
        CohortPassedAssessmentsHorizontalBarChart,
        CohortAttemptedAssessmentsHorizontalChart,
        FailedAssessmentsHorizontalBarChart,
        DownloadCSVBtn
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            masteredSkillQuantities: [],
            failedAssessmentQuantities: [],
            attemptedAssessmentQuantities: [],
            masteredSkillQuantitiesDownloadData: [],
            attemptedAssessmentQuantitiesDownloadData: [],

            failedAssessmentQuantitiesDownloadData: []
        };
    },
    async created() {
        if (this.cohortId != 'all-students') {
            this.getCohortMasteredAssessments();
            this.getCohortAttemptedAssessments();
            this.getCohortFailedAssessments();
            if (this.cohortsStore.cohorts.length < 1) {
                await this.cohortsStore.getCohorts(
                    this.userDetailsStore.userId
                );
            }
            const foundObject = this.cohortsStore.cohorts.find(
                (cohort) => cohort.id == this.cohortId
            );
            if (foundObject) {
                this.cohortName = foundObject.name;
            }
        } else {
            this.getAllStudentsMasteredAssessments();
            this.getAllStudentsAttemptedAssessments();
            this.getAllStudentsFailedAssessments();
        }
    },
    methods: {
        async getCohortMasteredAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/mastered-skills/cohort/${this.cohortId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.masteredSkillQuantities = Array.isArray(data) ? data : [];
                this.masteredSkillQuantitiesDownloadData = data.map((item) => ({
                    student: item.name,
                    quantity: item.quantity
                }));
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.masteredSkillQuantities = [];
            }
        },

        async getAllStudentsMasteredAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/mastered-skills/all-students/${this.userDetailsStore.userId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.masteredSkillQuantities = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error(
                    'Error fetching all students mastered assessments:',
                    error
                );
                this.masteredSkillQuantities = [];
            }
        },

        async getCohortAttemptedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments/cohort/${this.cohortId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.attemptedAssessmentQuantities = Array.isArray(data)
                    ? data
                    : [];
                this.attemptedAssessmentQuantitiesDownloadData = data.map(
                    (item) => ({
                        student: item.name,
                        quantity: item.quantity
                    })
                );
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.attemptedAssessmentQuantities = [];
            }
        },

        async getAllStudentsAttemptedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/attempted-assessments/all-students/${this.userDetailsStore.userId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.attemptedAssessmentQuantities = Array.isArray(data)
                    ? data
                    : [];
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.attemptedAssessmentQuantities = [];
            }
        },

        async getCohortFailedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments/cohort/${this.cohortId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.failedAssessmentQuantities = Array.isArray(data)
                    ? data
                    : [];
            } catch (error) {
                console.error(
                    'Error fetching cohort failed assessments:',
                    error
                );
                this.failedAssessmentQuantities = [];
            }
        },

        async getAllStudentsFailedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments/all-students/${this.userDetailsStore.userId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.failedAssessmentQuantities = Array.isArray(data)
                    ? data
                    : [];
            } catch (error) {
                console.error(
                    'Error fetching all students failed assessments:',
                    error
                );
                this.failedAssessmentQuantities = [];
            }
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
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Assessment Status Report</h1>
            <h2 class="secondary-heading h3">{{ cohortName }}</h2>
        </span>
        <div class="mb-4">
            <h4
                class="secondary-heading d-flex justify-content-between mt-5 mb-2"
            >
                <span>Passed</span>
                <DownloadCSVBtn
                    :data="masteredSkillQuantitiesDownloadData"
                    :fileName="`${cohortName}-passed-assessments.csv`"
                />
            </h4>
            <CohortPassedAssessmentsHorizontalBarChart
                v-if="masteredSkillQuantities.length > 0"
                :data="masteredSkillQuantities"
                colour="darkgreen"
                class="mb-4"
            />
        </div>

        <div class="mb-4">
            <h4 class="secondary-heading d-flex justify-content-between">
                <span>Attempted</span>
                <DownloadCSVBtn
                    :data="attemptedAssessmentQuantitiesDownloadData"
                    :fileName="`${cohortName}-attempted-assessments.csv`"
                />
            </h4>
            <CohortAttemptedAssessmentsHorizontalChart
                v-if="attemptedAssessmentQuantities.length > 0"
                :data="attemptedAssessmentQuantities"
                colour="darkblue"
                class="mb-4"
            />
        </div>

        <div class="mb-4">
            <h4 class="secondary-heading d-flex justify-content-between">
                <span>Failed multiple times</span>
                <DownloadCSVBtn
                    :data="failedAssessmentQuantities"
                    :fileName="`${cohortName}-failed-assessments.csv`"
                />
            </h4>
            <FailedAssessmentsHorizontalBarChart
                v-if="failedAssessmentQuantities.length > 0"
                :data="failedAssessmentQuantities"
                colour="darkred"
            />
        </div>
    </div>
</template>

<style></style>

<script>
import { useCohortsStore } from '../../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import CohortProgressLineChart from '../../../../components/analytics/full-size/cohorts/CohortProgressLineChart.vue';
import CohortPassedAssessmentsHorizontalBarChart from '../../../../components/analytics/full-size/cohorts/CohortPassedAssessmentsHorizontalChart.vue';
import CohortAttemptedAssessmentsHorizontalChart from '../../../../components/analytics/full-size/cohorts/CohortAttemptedAssessmentsHorizontalChart.vue';
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
        CohortProgressLineChart,
        CohortPassedAssessmentsHorizontalBarChart,
        CohortAttemptedAssessmentsHorizontalChart,
        DownloadCSVBtn
    },
    data() {
        return {

            cohortProgress: [],
            cohortProgressDownloadData: [],
            masteredSkillQuantities: [],

            attemptedAssessmentQuantities: [],
            masteredSkillQuantitiesDownloadData: [],
            attemptedAssessmentQuantitiesDownloadData: [],
        };
    },
    async created() {
        this.getAllStudentsMasteredAssessments();
        this.getAllStudentsAttemptedAssessments();

        await this.getAllStudentsProgress();

    },
    methods: {

        async getAllStudentsProgress() {
            fetch(
                `/student-analytics/all-students-progress/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.cohortProgress = data;
                    this.cohortProgressDownloadData = data.map((item) => ({
                        date: item.date,
                        skillsMastered: item.quantity
                    }));
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
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
                this.masteredSkillQuantitiesDownloadData = data.map((item) => ({
                    student: item.name,
                    quantity: item.quantity
                }));
            } catch (error) {
                console.error(
                    'Error fetching all students mastered assessments:',
                    error
                );
                this.masteredSkillQuantities = [];
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
            <h1 class="heading">Progress Report</h1>
            <div class="d-flex align-items-center">
                <h2 class="secondary-heading h3 mt-1">{{ cohortName }}</h2>
                <DownloadCSVBtn :data="cohortProgressDownloadData" :fileName="`${cohortName ? cohortName : 'All Students'
                    }-progress.csv`" />
            </div>
        </span>
        <CohortProgressLineChart v-if="cohortProgress.length > 0" :data="cohortProgress" colour="#5f31dd" />
        <p v-else>There is no data to show yet.</p>

        <h4 class="secondary-heading d-flex justify-content-between mt-5 mb-2">
            <span>Passed</span>
            <DownloadCSVBtn :data="masteredSkillQuantitiesDownloadData"
                :fileName="`${cohortName}-passed-assessments.csv`" />
        </h4>
        <CohortPassedAssessmentsHorizontalBarChart v-if="masteredSkillQuantities.length > 0"
            :data="masteredSkillQuantities" colour="darkgreen" class="mb-4" />

        <h4 class="secondary-heading d-flex justify-content-between">
            <span>Attempted</span>
            <DownloadCSVBtn :data="attemptedAssessmentQuantitiesDownloadData"
                :fileName="`${cohortName}-attempted-assessments.csv`" />
        </h4>
        <CohortAttemptedAssessmentsHorizontalChart v-if="attemptedAssessmentQuantities.length > 0"
            :data="attemptedAssessmentQuantities" colour="darkblue" class="mb-4" />
    </div>
</template>

<style></style>

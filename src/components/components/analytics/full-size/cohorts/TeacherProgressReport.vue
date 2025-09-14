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
            attemptedAssessmentQuantitiesDownloadData: []
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
    <div class="container-fluid chart-page">
        <h1 class="heading h4">Progress Report</h1>

        <div class="row chart-row position-relative">
            <div id="progress-chart-container">
                <DownloadCSVBtn
                    :data="cohortProgressDownloadData"
                    :fileName="`${
                        cohortName ? cohortName : 'All Students'
                    }-progress.csv`"
                    class="download-btn position-absolute btn"
                />
                <CohortProgressLineChart
                    v-if="cohortProgress.length > 0"
                    :data="cohortProgress"
                   
                />
                <p v-else>There is no data to show yet.</p>
            </div>
        </div>

        <div class="row chart-row">
            <div class="col-md chart-col position-relative position-relative">
                <div id="progress-bar-chart-container">
                    <DownloadCSVBtn
                        :data="masteredSkillQuantitiesDownloadData"
                        :fileName="`${cohortName}-passed-assessments.csv`"
                        class="download-btn position-absolute btn"
                    />
                    <CohortPassedAssessmentsHorizontalBarChart
                        v-if="masteredSkillQuantities.length > 0"
                        :data="masteredSkillQuantities"
                        colour="darkgreen"
                    />
                </div>
                <figcaption>Passed</figcaption>
            </div>

            <div class="col-md chart-col position-relative position-relative">
                <div id="attempted-bar-chart-container">
                    <DownloadCSVBtn
                        :data="attemptedAssessmentQuantitiesDownloadData"
                        :fileName="`${cohortName}-attempted-assessments.csv`"
                        class="download-btn position-absolute btn"
                    />
                    <CohortAttemptedAssessmentsHorizontalChart
                        v-if="attemptedAssessmentQuantities.length > 0"
                        :data="attemptedAssessmentQuantities"
                        colour="darkblue"
                    />
                </div>
                <figcaption>Attempted</figcaption>
            </div>
        </div>
    </div>
</template>

<style scoped>
.download-btn {
    right: 10px;
    top: 10px;
}

.chart-row {
    height: calc(50% - 10px);
}

.chart-col {
    height: 100%;
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (min-width: 600px) {
    .chart-page {
        height: calc(100vh - 88px);
        overflow: hidden;
    }
}

#progress-chart-container,
#attempted-bar-chart-container,
#progress-bar-chart-container {
    height: calc(100% - 35px);
    width: 100%;
}

@media (max-width: 600px) {
    #progress-chart-container,
    #attempted-bar-chart-container,
    #progress-bar-chart-container {
        height: 200px;
    }
}
</style>

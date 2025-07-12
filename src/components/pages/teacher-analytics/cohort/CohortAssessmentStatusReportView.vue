<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import CohortPassedAssessmentsHorizontalBarChart from '../../../components/teacher-analytics/cohorts/CohortPassedAssessmentsHorizontalChart.vue';

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
        CohortPassedAssessmentsHorizontalBarChart
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            masteredSkillQuantities: []
        };
    },
    async created() {
        if (this.cohortId != 'all-students') {
            this.getCohortMasteredAssessments();
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
            this.getAllStudentsAssessments();
        }
    },
    methods: {
        async getCohortMasteredAssessments() {
            fetch(`/student-analytics/mastered-skills/cohort/${this.cohortId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.masteredSkillQuantities = data;
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        async getAllStudentsAssessments() {
            fetch(
                `/student-analytics/mastered-skills/all-students/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.masteredSkillQuantities = data;
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
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Assessment Status Report</h1>
            <h2 class="secondary-heading h3">{{ cohortName }}</h2>
        </span>
        <h2 class="secondary-heading">Passed</h2>
        <CohortPassedAssessmentsHorizontalBarChart
            v-if="masteredSkillQuantities.length > 0"
            :data="masteredSkillQuantities"
            colour="darkgreen"
        />
        <h2 class="secondary-heading">Attempted</h2>
        <h2 class="secondary-heading">Failed multiple times</h2>
    </div>
</template>

<style></style>

<script>
import { useCohortsStore } from '../../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import CohortSkillActivityChart from '../../../../components/analytics/full-size/cohorts/CohortSkillActivityChart.vue';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            visitedSkills: [],
            skillActivities: []
        };
    },
    components: {
        CohortSkillActivityChart
    },
    async created() {
        if (this.cohortsStore.cohorts.length < 1) {
            await this.cohortsStore.getCohorts(this.userDetailsStore.userId);
        }
        const foundObject = this.cohortsStore.cohorts.find(
            (cohort) => cohort.id == this.cohortId
        );
        if (foundObject) {
            this.cohortName = foundObject.name;
            await this.getCohortSkillActivityReport();
        } else if (this.cohortId === 'all-students') {
            this.cohortName = 'All Students';
            await this.getAllStudentsSkillActivityReport();
        } else {
            console.error('Cohort not found for ID:', this.cohortId);
        }
        this.skillActivities = this.skillActivities.map((skill) => {
            return {
                ...skill,
                quantity: this.millisecondsToHours(skill.quantity, 2)
            };
        });
    },
    mounted() {},

    methods: {
        async getCohortSkillActivityReport() {
            try {
                const response = await fetch(
                    `/student-analytics/cohort-skill-activity-report/${this.cohortId}`
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                this.skillActivities = await response.json();
            } catch (error) {
                console.error('Error fetching skill activity report:', error);
            }
        },
        async getAllStudentsSkillActivityReport() {
            try {
                const response = await fetch(
                    `/student-analytics/all-student-cohort-activity/instructor/${this.userDetailsStore.userId}`
                );
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                this.skillActivities = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching skill activity report for all students:',
                    error
                );
            }
        },
        visitedDate(date) {
            let jsDate = new Date(date);
            return jsDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        },
        millisecondsToHours(milliseconds, precision) {
            const msPerHour = 60 * 60 * 1000;
            const hours = milliseconds / msPerHour;
            // Round to specified decimal places
            return hours.toFixed(precision);
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Skill Activity Report</h1>
            <h2 class="secondary-heading h3">{{ cohortName }}</h2>
        </span>

        <div v-if="this.skillActivities.length > 0" class="mb-4">
            <!-- The cohort skill activity chart -->
            <CohortSkillActivityChart
                :data="skillActivities"
                colour="#4CAF50"
            />
        </div>
        <div v-else>
            <p>No skills visited by this cohort.</p>
        </div>
    </div>
</template>

<style></style>

<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import CohortSkillActivityChart from '../../../components/teacher-analytics/cohorts/CohortSkillActivityChart.vue';

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
            console.log(
                'Cohort name found: ',
                this.cohortName,
                'Cohort ID: ',
                this.cohortId
            );
            await this.getCohortSkillActivityReport();
            console.log(
                'Skill activities fetched for cohort:',
                this.skillActivities
            );
        } else if (this.cohortId === 'all-students') {
            console.log('Cohort ID is "all-students", fetching all cohorts');
            this.cohortName = 'All Students';
            await this.getAllCohortSkillActivityReport();
        } else {
            console.error('Cohort not found for ID:', this.cohortId);
        }
    },
    mounted() {
        fetch(
            `/student-analytics/all-students-total-durations/${this.userDetailsStore.userId}`
        )
            .then((response) => response.json())
            .then((data) => {
                this.skillActivities;
            })
            .catch((error) => {
                console.error('Error fetching visited skills:', error);
            });
    },

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
        async getAllCohortSkillActivityReport() {
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
        <p>
            Gantt chart, time of all students (summed together), for each skills
        </p>

        <div v-if="this.skillActivities.length > 0" class="mb-4">
            <!-- The cohort skill activity chart -->
            <CohortSkillActivityChart
                :data="skillActivities"
                colour="#4CAF50"
            />

            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date first visited</th>
                    <th>Date last visited</th>
                </tr>
                <tr
                    v-for="skill in skillActivities"
                    :key="skill.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + skill.url"
                            >{{ skill.name }}</router-link
                        >
                    </td>
                    <td>
                        {{ visitedDate(skill.startDate) }}
                    </td>
                    <td>
                        {{ visitedDate(skill.endDate) }}
                    </td>
                </tr>
            </table>
        </div>
        <div v-else>
            <p>No skills visited by this cohort.</p>
        </div>
    </div>
</template>

<style></style>

<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import CohortTimeHorizontalChart from '../../../components/teacher-analytics/cohorts/CohortTimeHorizontalChart.vue';
import TimePerSkillHorizontalBarChart from '../../../components/teacher-analytics/students/TimePerSkillHorizontalBarChart.vue';

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
        CohortTimeHorizontalChart,
        TimePerSkillHorizontalBarChart
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            timeData: [],
            isDataLoaded: false,
            isLoading: false,
            error: null,
            skillDurations: [], // For individual student data if needed
            allSkillsDuration: 0 // For total duration if needed
        };
    },
    async created() {
        // Handle both specific cohorts and "all-students"
        if (this.cohortId !== 'all-students') {
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
            this.cohortName = 'All Students';
        }

        // Load the time data
        await this.loadTimeData();
    },
    methods: {
        async loadTimeData() {
            this.isLoading = true;
            this.error = null;

            try {
                const url = `/student-analytics/total-time-skills/cohort/${this.cohortId}`;

                const response = await fetch(url, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    this.timeData = data;
                    this.isDataLoaded = true;
                } else if (response.status === 404) {
                    this.timeData = [];
                    this.isDataLoaded = true;
                } else {
                    const errorText = await response.text();
                    console.error('HTTP error response:', errorText);
                    throw new Error(
                        `HTTP error! status: ${response.status} - ${errorText}`
                    );
                }
            } catch (error) {
                console.error('Error loading time data:', error);
                this.error = `Failed to load time data: ${error.message}`;
                this.timeData = [];
                this.isDataLoaded = true;
            } finally {
                this.isLoading = false;
            }
        },

        // Time formatting method for potential future use
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Time Report</h1>
            <h2 class="secondary-heading h3">{{ cohortName }}</h2>
        </span>

        <div class="mt-4">
            <h2 class="secondary-heading">
                Total time on skills, comparing students
            </h2>

            <div v-if="isLoading" class="text-center p-4">
                <div class="spinner-border" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading time data...</p>
            </div>

            <div v-else-if="error" class="alert alert-danger">
                {{ error }}
                <button
                    @click="loadTimeData"
                    class="btn btn-sm btn-outline-danger ms-2"
                >
                    Retry
                </button>
            </div>

            <div v-else-if="isDataLoaded">
                <CohortTimeHorizontalChart
                    :data="timeData"
                    :colour="'#4A90E2'"
                />

                <div v-if="timeData.length === 0" class="alert alert-info mt-3">
                    No time data available for students in this cohort.
                </div>
            </div>
        </div>

        <!-- Future features section -->
        <!-- maybe later:
        <ul>
            <li><em>allow change of order</em></li>
            <li><em>Choose by day, week etc</em></li>
        </ul> -->

        <h2 class="secondary-heading">
            Total time on platform, comparing students
        </h2>
        <ul>
            <li><em>Time on platform, comparing students</em></li>
            <li><em>bar chart</em></li>
            <li><em>allow change of order</em></li>
            <li><em>Choose by day, week etc</em></li>
        </ul>

        <h2 class="secondary-heading">
            Total time on platform, comparing time
        </h2>
        <ul>
            <li><em>Time on platform, comparing students</em></li>
            <li><em>line chart, over days</em></li>
            <li>
                <em>Would have to record the time each day</em>
            </li>
            <li><em>Choose by day, week etc</em></li>
        </ul>

        <!-- Individual student data section - for future implementation -->

        <div v-if="isDataLoaded && skillDurations && skillDurations.length > 0">
            <h2 class="secondary-heading">All skills</h2>
            <p>{{ millisToMinutesAndSeconds(this.allSkillsDuration) }}</p>
            <h2 class="secondary-heading">Minutes per skill</h2>
            <TimePerSkillHorizontalBarChart
                v-if="skillDurations.length > 0"
                :data="skillDurations"
                colour="darkgreen"
            />
            <div v-if="this.skillDurations.length > 0" class="mb-4">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Skill</th>
                            <th>Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-for="skillDuration in skillDurations"
                            :key="skillDuration.id"
                            class="table-rows"
                        >
                            <td>
                                <router-link
                                    target="_blank"
                                    :to="'/skills/' + skillDuration.url"
                                    >{{ skillDuration.name }}</router-link
                                >
                            </td>
                            <td>
                                {{
                                    millisToMinutesAndSeconds(
                                        skillDuration.quantity
                                    )
                                }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else>
                <p>No skills visited by this student.</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    padding: 20px;
}

.heading {
    color: #333;
    font-weight: bold;
}

.secondary-heading {
    color: #666;
    font-weight: normal;
}

.spinner-border {
    width: 3rem;
    height: 3rem;
}
</style>

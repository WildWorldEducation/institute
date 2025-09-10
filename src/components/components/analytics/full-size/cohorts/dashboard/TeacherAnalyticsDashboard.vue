<script>
import { useAnalyticsStore } from '../../../../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../../../../stores/UsersStore';
import TeacherProgressChart from './TeacherProgressChart.vue';
import TeacherTimeChart from './TeacherTimeChart.vue';
import TeacherCostChart from './TeacherCostChart.vue';
import TenantFailedAssessmentsByRootSubjectHorizontalBarChart from '../../../../../components/analytics/full-size/tenants/TenantFailedAssessmentsByRootSubjectHorizontalBarChart.vue';


export default {
    name: 'Teacher-Analytics-Dashboard',
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        const usersStore = useUsersStore();
        return {
            userDetailsStore,
            analyticsStore,
            usersStore
        };
    },
    data() {
        return {
            // Chart variables
            progressChartMode: 'teacher', // school or teacher              
        };
    },
    components: {
        TeacherProgressChart,
        TeacherTimeChart,
        TeacherCostChart,
        TenantFailedAssessmentsByRootSubjectHorizontalBarChart
    },
    async created() {
        await this.getProgressData();
        await this.getTimeData();
        await this.getCostData();

        await this.getChallengesData();
    },
    methods: {
        // Progress chart
        async getProgressData() {
            await this.analyticsStore.getSchoolProgress(
                this.userDetailsStore.tenantId
            );

            await this.analyticsStore.getClassProgress(
                this.userDetailsStore.userId
            );

            this.$nextTick(() => {
                if (this.$refs.progressChart) {
                    // Access the ref here
                    this.$refs.progressChart.createChart(this.analyticsStore.progress);
                }
            });
        },
        async getTimeData() {
            await this.analyticsStore.getClassTime(this.userDetailsStore.userId);
            await this.analyticsStore.getSchoolTime(
                this.userDetailsStore.tenantId
            );

            this.$nextTick(() => {
                if (this.$refs.timeChart) {
                    // Access the ref here
                    this.$refs.timeChart.createChart(
                        this.analyticsStore.time
                    );
                }
            });
        },
        async getCostData() {
            await this.analyticsStore.getClassCost(this.userDetailsStore.userId, 'weekly');
            await this.analyticsStore.getSchoolCost(
                this.userDetailsStore.tenantId, 'weekly'
            );

            this.$nextTick(() => {
                if (this.$refs.costChart) {
                    // Access the ref here
                    this.$refs.costChart.createChart(
                        this.analyticsStore.cost.class
                    );
                }
            });
        },
        async getComparisonData() {
            try {
                const response = await fetch(
                    `/student-analytics/passed-assessments-by-subject/tenant/${this.userDetailsStore.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.rootSubjectsPassedAssessments =
                    await response.json();

                this.$nextTick(() => {
                    if (this.$refs.comparisonChart) {
                        // Access the ref here
                        this.$refs.comparisonChart.createChart(
                            this.analyticsStore.rootSubjectsPassedAssessments
                        );
                    }
                });
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.rootSubjectsPassedAssessments = [];
            }
        },
        async getChallengesData() {
            await this.analyticsStore.getTeacherClassFailedAssessmentsBySubject(this.userDetailsStore.userId);
        }
    }
};
</script>

<template>
    <div class="dashboard">
        <div class="container-fluid">
            <div class="row top-row">
                <div class="col-sm top-row-text">
                    <strong>Skills Mastered: </strong>
                    <span>10</span>
                </div>
                <div class="col-sm top-row-text">
                    <strong>Students: </strong>
                    <span>5</span>
                </div>
                <div class="col-sm top-row-text"></div>
                <div class="col-sm top-row-text"></div>
            </div>
            <!-- This is where charts / dashboard cards go -->
            <div class="dash-row row">
                <div class="col-md h-100">
                    <RouterLink to="/reports/academics" class="">
                        <h2 class="heading h5">Progress</h2>
                    </RouterLink>
                    <div id="progress-chart-container" class="position-relative">
                        <TeacherProgressChart ref="progressChart" v-if="
                            analyticsStore.progress.tenant.length > 0 ||
                            analyticsStore.progress.class.length > 0
                        " />
                    </div>
                </div>
                <div class="col-md h-100">
                    <h2 class="heading h5">Challenges</h2>

                    <div id="failed-chart-container">
                        <TenantFailedAssessmentsByRootSubjectHorizontalBarChart
                            v-if="analyticsStore.cohortRootSubjectsFailedAssessments.length > 0"
                            :data="analyticsStore.cohortRootSubjectsFailedAssessments" />
                    </div>
                </div>
            </div>
            <div class="dash-row row">
                <div class="col-md position-relative h-100">
                    <RouterLink to="/reports/cost" class="chart-heading">
                        <h2 class="heading h5">Cost</h2>
                    </RouterLink>
                    <div id="cost-chart-container">
                        <TeacherCostChart ref="costChart" v-if="
                            analyticsStore.cost.tenant.length > 0 ||
                            analyticsStore.cost.class.length > 0
                        " />
                    </div>
                </div>
                <div class="col-md position-relative h-100">
                    <RouterLink to="/reports/engagement" class="chart-heading">
                        <h2 class="heading h5">Engagement</h2>
                    </RouterLink>
                    <div id="time-chart-container">
                        <TeacherTimeChart ref="timeChart" v-if="
                            analyticsStore.time.tenant.length > 0 ||
                            analyticsStore.time.class.length > 0
                        " />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.top-row {
    height: 8%;
    text-align: center;
    font-size: 1.2rem;
    font-family: 'Poppins';
}

.dash-row {
    height: 45%;
}

#comparison-chart-container {
    height: 100%;
    width: 100%;
}

#progress-chart-container,
#time-chart-container,
#cost-chart-container,
#failed-chart-container {
    height: calc(100% - 35px);
    width: 100%;
}

.dashboard {
    display: flex;
    height: calc(100vh - 88px);
    overflow: hidden;
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (max-width: 599px) {
.dashboard {
    overflow: auto;
}

    .top-row {
        height: unset;
        text-align: left;
    }

    .dash-row {
        height: unset;
    }

    #progress-chart-container,
    #time-chart-container,
#cost-chart-container,
#failed-chart-container {
        height: 200px;
    }

    .main {
        overflow-y: auto;
    }

    .row {
        margin-bottom: 1rem;
    }

    /* .dashboard {
        overflow: auto;
        height: unset;
    } */

    .col-md {
        min-height: 100px;
        margin-bottom: 1rem;
    }
}

.top-row-text {
    font-weight: 500;
}

/* Accordions */
.accordion-button {
    background-color: #2c3e50;
    color: white;
    border-radius: 0px !important;
}

.chart-heading {
    top: 5px;
    left: 12px;
}

/* Sidebar */
.sidebar {
    width: 220px;
    background: #2c3e50;
    color: white;
    padding: 1rem;
    box-sizing: border-box;
    transition: width 0.3s ease, opacity 0.3s ease;
}

.sidebar.hidden {
    width: 0;
    opacity: 0;
    padding: 0;
    overflow: hidden;
}

.sidebar h2 {
    margin-top: 0;
}

.sidebar ul {
    list-style: none;
    padding: 0;
}

.sidebar li {
    margin: 0.5rem 0;
}

.sidebar a {
    color: blue;
}

/* Main section */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
}

.header {
    background: #f5f5f5;
    padding: 0.5rem 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>

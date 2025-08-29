<script>
import { RouterLink } from 'vue-router';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../../stores/UsersStore';
import SchoolProgressChart from '../../../components/analytics/full-size/tenants/dashboard/SchoolProgressChart.vue';
import SchoolComparisonChart from '../../../components/analytics/full-size/tenants/dashboard/SchoolComparisonChart.vue';
import SchoolTimeChart from '../../../components/analytics/full-size/tenants/dashboard/SchoolTimeChart.vue';

export default {
    name: 'School-Admin-Dashboard',
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
            // hide for mobile phones
            showSidebar: true,
            screenWidth: screen.width,
            // Sidebar variables
            isEveryone: true,
            isSchoolData: false,
            isLanguageData: false,
            isMathData: false,
            isHistoryData: false,
            isLifeData: false,
            isCSData: false,
            isSAndIData: false,
            isDIData: false,
            // copy of data from store
            progressData: {
                school: []
            },
            // Notifications
            isAboveTheCurve: false
        };
    },
    components: {
        SchoolProgressChart,
        SchoolComparisonChart,
        SchoolTimeChart
    },
    async created() {
        // Student progress
        await this.analyticsStore.getSchoolProgress(
            this.userDetailsStore.tenantId
        );

        // Subject comparison
        if (this.analyticsStore.rootSubjectsPassedAssessments.length == 0)
            await this.getComparisonData();

        await this.getProgressData();
        await this.getTimeData();
    },
    methods: {
        async getProgressData() {
            // If "Everyone" checked
            this.progressData.school = [];
            for (
                let i = 0;
                i < this.analyticsStore.progress.tenant.length;
                i++
            ) {
                this.progressData.school.push(
                    this.analyticsStore.progress.tenant[i]
                );
            }

            this.$nextTick(() => {
                if (this.$refs.progressChart) {
                    // Access the ref here
                    this.$refs.progressChart.createChart(this.progressData);
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
        async getTimeData() {
            this.analyticsStore.durationPerDay = [];
            let url = `/student-analytics/tenant-duration-per-day/weekly/${this.userDetailsStore.tenantId}`;
            fetch(url)
                .then((response) => response.json())
                .then(async (data) => {
                    this.analyticsStore.durationPerDay = [];
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                        data[i].minutes = data[i].milliseconds / (1000 * 60);
                        this.analyticsStore.durationPerDay.push(data[i]);
                    }
                    this.analyticsStore.durationPerDay.sort(
                        (a, b) => a.date - b.date
                    );

                    this.$nextTick(() => {
                        if (this.$refs.timeChart) {
                            // Access the ref here
                            this.$refs.timeChart.createChart(
                                this.analyticsStore.durationPerDay
                            );
                        }
                    });
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        }
    }
};
</script>

<template>
    <div class="dashboard">
        <!-- Main Content -->

        <div class="container">
            <div class="row top-row">
                <div class="col-sm">
                    <h2 class="h5 heading m-0">Avg # Skills Mastered</h2>
                    <span class="top-row-text">10</span>
                </div>
                <div class="col-sm">
                    <h2 class="h5 heading m-0">Students</h2>
                    <span class="top-row-text">35</span>
                </div>
                <div class="col-sm">
                    <h2 class="h5 heading m-0">Teachers</h2>
                    <span class="top-row-text">5</span>
                </div>
                <div class="col-sm">
                    <h2 class="h5 heading m-0">AI Tutor Usage</h2>
                    <span class="top-row-text">$500</span>
                </div>
            </div>

            <!-- This is where charts / dashboard cards go -->
            <div class="dash-row row">
                <div
                    id="progress-chart-container"
                    class="col-md position-relative"
                >
                    <RouterLink
                        to="/reports/academics"
                        class="me-2 position-absolute chart-heading"
                    >
                        <h2 class="heading h5">Student progress</h2>
                    </RouterLink>
                    <SchoolProgressChart
                        ref="progressChart"
                        v-if="progressData.school.length > 0"
                    />
                </div>
                <div class="col-md">
                    <h2 class="heading chart-heading h5">Subject comparison</h2>
                    <SchoolComparisonChart
                        v-if="
                            analyticsStore.rootSubjectsPassedAssessments
                                .length > 0
                        "
                        :colour="'#5f31dd'"
                        ref="comparisonChart"
                    />
                </div>
            </div>

            <div class="dash-row row mt-2 mb-2">
                <div class="col-md position-relative">
                    <RouterLink
                        to="/reports/cost"
                        class="me-2 position-absolute chart-heading"
                    >
                        <h2 class="heading h5">Cost By Subject</h2>
                    </RouterLink>
                </div>
                <div class="col-md position-relative">
                    <div id="time-chart-container">
                        <RouterLink
                            to="/reports/engagement"
                            class="position-absolute chart-heading"
                        >
                            <h2 class="heading h5">Student Engagement</h2>
                            <SchoolTimeChart
                                v-if="analyticsStore.durationPerDay.length > 0"
                                ref="timeChart"
                            />
                        </RouterLink>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.top-row {
    height: 15%;
    text-align: center;
}

.dash-row {
    height: 38%;
}

#progress-chart-container,
#comparison-chart-container,
#time-chart-container {
    height: 100%;
    width: 100%;
}

.dashboard {
    display: flex;
    height: calc(100vh - 88px);
    overflow: hidden;
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (max-width: 599px) {
    .top-row {
        height: unset;
        text-align: left;
    }

    .dash-row {
        height: unset;
    }

    #progress-chart-container {
        height: 200px;
    }

    .main {
        overflow-y: auto;
    }

    .row {
        margin-bottom: 1rem;
    }

    .dashboard {
        overflow: auto;
        height: unset;
    }

    .col-md {
        min-height: 100px;
        margin-bottom: 1rem;
    }
}

.top-row-text {
    font-size: 2.5rem;
    font-family: 'Poppins';
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

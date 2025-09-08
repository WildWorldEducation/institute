<script>
import { RouterLink } from 'vue-router';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../../stores/UsersStore';
import InstructorsList from '../../../components/instructors/InstructorsList.vue';
import SchoolProgressChart from '../../../components/analytics/full-size/tenants/dashboard/SchoolProgressChart.vue';
import SchoolComparisonChart from '../../../components/analytics/full-size/tenants/dashboard/SchoolComparisonChart.vue';
import SchoolTimeChart from '../../../components/analytics/full-size/tenants/dashboard/SchoolTimeChart.vue';

export default {
    name: 'School-Admin-Class-Dashboard',
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
            progressChartMode: 'school', // school or teacher
            // Notifications
            isAboveTheCurve: false,
            teachers: [],
            selectedTeacher: {},
            isSchoolSelected: true
        };
    },
    components: {
        SchoolProgressChart,
        SchoolComparisonChart,
        SchoolTimeChart,
        InstructorsList
    },
    async created() {
        // Get teachers
        if (this.teachers.length < 1) {
            await this.getTeachers(this.userDetailsStore.tenantId);
        }

        // Subject comparison
        if (this.analyticsStore.rootSubjectsPassedAssessments.length == 0)
            await this.getComparisonData();

        await this.getSchoolData();
    },
    methods: {
        async getTeachers(tenantId) {
            const result = await fetch('/tenants/instructors/' + tenantId);
            const data = await result.json();
            for (let i = 0; i < data.length; i++) {
                data[i].type = 'teacher';
            }
            this.teachers = data;
        },
        async selectElement(element) {
            this.clearCharts();
            if (element.type === 'teacher') {
                this.selectedTeacher = element;
                this.isSchoolSelected = false;
                await this.getClassData();
            } else if (element === 'school') {
                this.isSchoolSelected = true;
                this.selectedTeacher = {};
                await this.getSchoolData();
            }
        },
        clearCharts() {
            // Reset the arrays
            this.analyticsStore.progress.class = [];
            this.analyticsStore.durationPerDay = [];
            // Clear existing charts
            let parentDiv = document.getElementById('progress-chart-container');
            let svgElement = parentDiv.querySelector('svg');
            if (svgElement) {
                // Check if the SVG element exists
                svgElement.remove();
            }
            parentDiv = document.getElementById('time-chart-container');
            svgElement = parentDiv.querySelector('svg');
            if (svgElement) {
                // Check if the SVG element exists
                svgElement.remove();
            }
        },
        async getSchoolData() {
            this.progressChartMode = 'school';
            await this.getSchoolProgressData();
            await this.getSchoolTimeData();
        },
        async getClassData() {
            this.progressChartMode = 'teacher';
            await this.getClassProgressData(this.selectedTeacher.id);
            await this.getClassTimeData();
        },
        // Progress chart
        async getSchoolProgressData() {
            await this.analyticsStore.getSchoolProgress(
                this.userDetailsStore.tenantId
            );

            this.$nextTick(() => {
                if (this.$refs.progressChart) {
                    // Access the ref here
                    this.$refs.progressChart.createChart(
                        this.analyticsStore.progress.tenant
                    );
                }
            });
        },
        // Time chart
        async getSchoolTimeData() {
            await this.analyticsStore.getSchoolTime(
                this.userDetailsStore.tenantId
            );

            this.$nextTick(() => {
                if (this.$refs.timeChart) {
                    // Access the ref here
                    this.$refs.timeChart.createChart(
                        this.analyticsStore.time.tenant
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
        async getClassProgressData() {
            await this.analyticsStore.getClassProgress(this.selectedTeacher.id);

            this.$nextTick(() => {
                if (this.$refs.progressChart) {
                    // Access the ref here
                    this.$refs.progressChart.createChart(
                        this.analyticsStore.progress.class
                    );
                }
            });
        },
        async getClassTimeData() {
            await this.analyticsStore.getClassTime(this.selectedTeacher.id);

            this.$nextTick(() => {
                if (this.$refs.timeChart) {
                    // Access the ref here
                    this.$refs.timeChart.createChart(
                        this.analyticsStore.time.class
                    );
                }
            });
        }
    }
};
</script>

<template>
    <div class="dashboard">
        <!-- Left column -->
        <div class="col-lg-1 col-md-2">
            <div class="d-flex bg-light rounded p-2">
                <button
                    :class="
                        isSchoolSelected
                            ? 'isCurrentlySelected'
                            : 'side-buttons'
                    "
                    @click="selectElement('school')"
                >
                    school
                </button>
            </div>
            <div v-for="teacher in teachers" :key="teacher.id">
                <div class="d-flex bg-light rounded p-2">
                    <button
                        :class="
                            teacher.id === selectedTeacher.id
                                ? 'isCurrentlySelected'
                                : 'side-buttons'
                        "
                        @click="selectElement(teacher)"
                    >
                        {{ teacher.username }}
                    </button>
                </div>
            </div>
        </div>
        <!-- Right column -->
        <div class="col-lg-11 col-md-10 dashboard">
            <div class="container-fluid">
                <!-- Top row -->
                <div class="row top-row text-start">
                    <div class="col-sm top-row-text">
                        <strong>Students: </strong>
                        <span>10</span>
                    </div>
                    <div class="col-sm top-row-text"></div>
                    <div class="col-sm top-row-text">
                        <strong>Skills Mastered: </strong>
                        <span>10</span>
                    </div>
                    <div class="col-sm top-row-text">
                        <strong>Cost: </strong>
                        <span>$0</span>
                    </div>
                </div>

                <!-- This is where charts / dashboard cards go -->
                <div class="dash-row row">
                    <div class="col-md h-100">
                        <RouterLink
                            to="/reports/academics"
                            class=""
                            target="_blank"
                        >
                            <h2 class="heading h5">Progress</h2>
                        </RouterLink>
                        <div id="progress-chart-container">
                            <SchoolProgressChart
                                ref="progressChart"
                                v-if="
                                    analyticsStore.progress.tenant.length > 0 ||
                                    analyticsStore.progress.class.length > 0
                                "
                            />
                            <p v-else>No data</p>
                        </div>
                    </div>
                    <div class="col-md">
                        <h2 class="heading h5">Subject comparison</h2>
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
                            target="_blank"
                        >
                            <h2 class="heading h5">Cost By Subject</h2>
                        </RouterLink>
                    </div>
                    <div class="col-md h-100">
                        <RouterLink to="/reports/engagement" target="_blank">
                            <h2 class="heading h5">Weekly engagement</h2>
                        </RouterLink>
                        <div id="time-chart-container">
                            <SchoolTimeChart
                                v-if="
                                    analyticsStore.time.tenant.length > 0 ||
                                    analyticsStore.time.class.length > 0
                                "
                                ref="timeChart"
                            />
                            <p v-else>No data</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.dashboard {
    display: flex;
    height: calc(100vh - 88px);
    overflow: hidden;
}

.isCurrentlySelected {
    font-family: 'Poppins', sans-serif;
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background-color: var(--primary-color);
    color: white;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
}

.side-buttons {
    font-family: 'Poppins', sans-serif;
    width: 100%;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background-color: #c8d7da;
    color: black;
    font-weight: 400;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
}

.dashboard {
    display: flex;
    height: calc(100vh - 88px);
    overflow: hidden;
}

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
#time-chart-container {
    height: calc(100% - 35px);
    width: 100%;
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

<script>
import { RouterLink } from 'vue-router';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';

import StudentProgressChart from '../../../components/analytics/full-size/students/dashboard/StudentProgressChart.vue';
import StudentTimeChart from '../../../components/analytics/full-size/students/dashboard/StudentTimeChart.vue';
import StudentComparisonChart from '../../../components/analytics/full-size/students/dashboard/StudentComparisonChart.vue';

export default {
    name: 'Student-Dashboard',
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();

        return {
            userDetailsStore,
            analyticsStore,
            teacherAnalyticsStore
        };
    },
    data() {
        return {
            // hide for mobile phones
            showSidebar: true,
            screenWidth: screen.width,
            // Sidebar variables
            isStudentData: true,
            isSchoolData: true,
            isLanguageData: false,
            isMathData: false,
            isHistoryData: false,
            isLifeData: false,
            isCSData: false,
            isSAndIData: false,
            isDIData: false,
            // copy of data from store
            progressData: {
                student: [],
                average: []
            },
            // Notifications
            isAboveTheCurve: false,
            // dynamic stats
            totalSkillsPassed: null,
            totalTimeSpent: null,
            totalAIUsage: null
        };
    },
    components: {
        StudentProgressChart,
        StudentComparisonChart,
        StudentTimeChart
    },
    async created() {
        // Get total progress data
        await this.analyticsStore.getStudentProgress(
            this.userDetailsStore.userId,
            this.userDetailsStore.tenantId
        );

        // Get Total Time Spent on Data
        await this.analyticsStore.getStudentTotalTimeSpent(
            this.userDetailsStore.userId
        );
        this.totalTimeSpent =
            this.analyticsStore.studentTotalTimeSpent + ' hrs';

        // Get total subjects passed assessments
        await this.analyticsStore.getStudentTotalSubjectsPassedAssessments(
            this.userDetailsStore.userId
        );

        this.totalSkillsPassed =
            this.analyticsStore.studentTotalSubjectsPassedAssessments;

        // Get subject comparison data
        await this.analyticsStore.getStudentPassedAssessmentsBySubject(
            this.userDetailsStore.userId
        );

        // Get time data
        await this.analyticsStore.getStudentTime(
            this.userDetailsStore.userId,
            this.userDetailsStore.tenantId
        );

        // Get total tokens spent
        await this.analyticsStore.getStudentTotalTokensSpent(
            this.userDetailsStore.userId
        );
        this.totalAIUsage =
            this.analyticsStore.studentTotalTokensSpent + ' tokens';

        // Get data for "super challenging"
        await this.teacherAnalyticsStore.getStudentMultipleFails(
            this.userDetailsStore.userId
        );

        if (
            this.analyticsStore.progress.student.length > 0 ||
            this.analyticsStore.progress.tenant.length > 0
        ) {
            // Notifications
            if (
                this.analyticsStore.progress.student[
                    this.analyticsStore.progress.student.length - 1
                ].quantity >
                this.analyticsStore.progress.tenant[
                    this.analyticsStore.progress.tenant.length - 1
                ].quantity
            ) {
                this.isAboveTheCurve = true;
            }
        }

        await this.HandleProgressData();
        await this.HandleComparisonData();
        await this.HandleTimeData();
    },
    methods: {
        async HandleProgressData() {
            // If "You" checked
            if (this.isStudentData) {
                this.progressData.student = [];
                for (
                    let i = 0;
                    i < this.analyticsStore.progress.student.length;
                    i++
                ) {
                    this.progressData.student.push(
                        this.analyticsStore.progress.student[i]
                    );
                }
            } else {
                this.progressData.student = [];
            }

            if (this.isSchoolData) {
                this.progressData.average = [];
                for (
                    let i = 0;
                    i < this.analyticsStore.progress.tenant.length;
                    i++
                ) {
                    this.progressData.average.push(
                        this.analyticsStore.progress.tenant[i]
                    );
                }
            } else {
                this.progressData.average = [];
            }

            this.$nextTick(() => {
                if (this.$refs.progressChart) {
                    // Access the ref here
                    this.$refs.progressChart.createChart(this.progressData);
                }
            });
        },
        async HandleComparisonData() {
            this.$nextTick(() => {
                if (this.$refs.comparisonChart) {
                    // Access the ref here
                    this.$refs.comparisonChart.createChart(
                        this.analyticsStore.studentRootSubjectsPassedAssessments
                    );
                }
            });
        },
        async HandleTimeData() {
            this.$nextTick(() => {
                if (this.$refs.timeChart) {
                    // Access the ref here
                    this.$refs.timeChart.createChart(this.analyticsStore.time);
                }
            });
        },
        // toggleSidebar() {
        //     this.showSidebar = !this.showSidebar;
        // }
    }
};
</script>

<template>
    <div class="dashboard">
        <!-- Main Content -->
        <div class="main">
            <div class="content container-fluid">
                <!-- This is where charts / dashboard cards go -->
                <div class="dash-row row">
                    <div class="col-md-6 h-100 position-relative chart-card">
                        <RouterLink to="/my-progress/skills" class="" target="_blank">
                            <h2 class="heading h5">Progress over time</h2>
                        </RouterLink>
                        <figcaption v-if="
                            progressData.student.length > 0 ||
                            progressData.average.length > 0
                        " class="">
                            <span style="color: green">You</span> vs
                            <span style="color: #ff7f0e">school average</span>
                        </figcaption>
                        <div id="progress-chart-container">
                            <StudentProgressChart ref="progressChart" v-if="
                                progressData.student.length > 0 ||
                                progressData.average.length > 0
                            " />
                            <p v-else>No progress yet</p>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div id="comparison-chart-container" class="chart-card">
                            <h2 class="heading h5 mt-1">Progress comparison</h2>
                            <StudentComparisonChart ref="comparisonChart" v-if="
                                analyticsStore
                                    .studentRootSubjectsPassedAssessments
                                    .length > 0
                            " :data="analyticsStore.studentRootSubjectsPassedAssessments
                                " :colour="'#5f31dd'" />
                            <p v-else>No progress yet</p>
                        </div>
                    </div>
                </div>

                <div class="dash-row row">
                    <div class="col-md h-100 position-relative chart-card">
                        <RouterLink to="/my-progress/time" target="_blank">
                            <h2 class="heading h5">Study time</h2>
                        </RouterLink>
                        <figcaption>
                            <span style="color: blue">You</span> vs
                            <span style="color: #ff7f0e">school average</span>
                        </figcaption>
                        <div id="time-chart-container">
                            <StudentTimeChart ref="timeChart" v-if="
                                analyticsStore.time.student.length > 0 ||
                                analyticsStore.time.tenant.length > 0
                            " />
                            <p v-else>No data available</p>
                        </div>
                    </div>

                    <div class="col-md position-relative">
                        <div class="row">
                            <div class="col-md">
                                <div class="chart-card">

                                    <RouterLink to="/my-progress/super-challenging" class="col" target="_blank">
                                        <h2 class="h5 heading">
                                            Consider asking for help
                                        </h2>
                                    </RouterLink>
                                    <ul v-if="
                                        teacherAnalyticsStore
                                            .studentMultipleFails.length > 0
                                    ">
                                        <li class="failed-skills"
                                            v-for="skill in teacherAnalyticsStore.studentMultipleFails" :key="skill.id">
                                            <RouterLink :to="'/skills/' + skill.url" target="_blank">{{ skill.name }}
                                            </RouterLink>
                                        </li>
                                    </ul>
                                    <p v-else>Nothing to worry about yet</p>
                                </div>
                            </div>
                            <div class="col-md">
                                <div class="chart-card">
                                    <h2 class="h5 heading">Stats</h2>
                                    <ul>
                                        <li>
                                            <strong>Skills passed:</strong>
                                            {{ totalSkillsPassed }}
                                        </li>
                                        <li>
                                            <strong>Total time spent:</strong>
                                            {{ totalTimeSpent }}
                                        </li>
                                        <li>
                                            <RouterLink to="/my-progress/tokens" target="_blank"><strong>AI
                                                    usage:</strong>
                                                {{ totalAIUsage }}</RouterLink>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <!-- <div
                            v-if="isAboveTheCurve"
                            class="alert alert-success"
                            role="alert"
                        >
                            Nice going, you're above the curve!
                        </div>
                        <div v-else class="alert alert-warning" role="alert">
                            You're below the curve, keep trying!
                        </div> -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-card {
    border-radius: 5px;
    padding: 10px 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background-color: white;

}

.failed-skills a {
    color: darkred;
    text-decoration: none;
}

.chart-heading {
    top: 5px;
    left: 12px;
}

#comparison-chart-container {
    height: 100%;
    width: 100%;
}

#progress-chart-container,
#time-chart-container {
    height: calc(100% - 56px);
    width: 100%;
}

.dash-row {
    height: 50%;
    padding: 5px;
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (max-width: 599px) {
    .dash-row {
        height: unset;
    }

    #progress-chart-container,
    #time-chart-container {
        height: 200px;
    }

    .main {
        overflow-y: auto;
    }

    .col-md,
    .row {
        margin-bottom: 1rem;
    }

    .dashboard {
        height: 100%;
    }
}

.chart-container {
    border: 1px solid black;
    height: 100%;
}

.dashboard {
    display: flex;
    height: calc(100vh - 72px);
    overflow: hidden;
    background-color: hsl(from var(--primary-color) h s l / 0.15);
    border-top: 1px solid var(--primary-color);
}

/* Sidebar */
.sidebar {
    width: 200px;
    background: #2c3e50;
    color: white;
    padding: 1rem;
    box-sizing: border-box;
    transition: width 0.3s ease, opacity 0.3s ease;
    height: 100%;
    overflow-y: auto;
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
    color: white;
    text-decoration: none;
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

.content {
    flex: 1;
    height: 100%;
}
</style>

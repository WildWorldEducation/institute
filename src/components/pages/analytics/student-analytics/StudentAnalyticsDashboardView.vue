<script>
import { RouterLink } from 'vue-router';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';

import StudentProgressChart from '../../../components/analytics/full-size/students/dashboard/StudentProgressChart.vue';
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
            isAboveTheCurve: false
        };
    },
    components: {
        StudentProgressChart,
        StudentComparisonChart
    },
    async created() {
        // Get total progress data
        await this.analyticsStore.getStudentProgress(
            this.userDetailsStore.userId,
            this.userDetailsStore.tenantId
        );

        // Get subject comparison data
        await this.analyticsStore.getStudentPassedAssessmentsBySubject(
            this.userDetailsStore.userId
        );

        // Get data for "super challenging"
        await this.teacherAnalyticsStore.getStudentMultipleFails(
            this.userDetailsStore.userId
        );

        console.log(this.teacherAnalyticsStore.studentMultipleFails);

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

        await this.HandleProgressData();
        await this.HandleComparisonData();
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

            // If "School average" checked
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
        toggleSidebar() {
            this.showSidebar = !this.showSidebar;
        }
    }
};
</script>

<template>
    <div class="dashboard">
        <!-- Main Content -->
        <div class="main">
            <div class="content container">
                <!-- This is where charts / dashboard cards go -->
                <div class="dash-row row">
                    <div class="col-md-6 h-100 p-0 position-relative">
                        <div id="progress-chart-container">
                            <div class="position-absolute chart-heading">
                                <RouterLink to="/my-progress/skills" class=""
                                    ><h2 class="heading h5">
                                        Progress over time
                                    </h2>
                                </RouterLink>

                                <span style="color: #5f31dd">
                                    <strong>You</strong></span
                                ><br />
                                <span style="color: #ff7f0e"
                                    ><strong>School average</strong></span
                                >
                            </div>

                            <StudentProgressChart
                                ref="progressChart"
                                v-if="
                                    progressData.student.length > 0 ||
                                    progressData.average.length > 0
                                "
                            />
                        </div>
                    </div>

                    <div class="col-md-6 position-relative">
                        <h2 class="heading chart-heading h5 mt-1">
                            Subject comparison
                        </h2>
                        <p><em>TODO: different color for each subject</em></p>
                        <StudentComparisonChart
                            ref="comparisonChart"
                            v-if="
                                analyticsStore
                                    .studentRootSubjectsPassedAssessments
                                    .length > 0
                            "
                            :data="
                                analyticsStore.studentRootSubjectsPassedAssessments
                            "
                            :colour="'#5f31dd'"
                        />
                    </div>
                </div>
                <div class="dash-row row">
                    <div class="col-md p-0 position-relative">
                        <div class="position-absolute chart-heading">
                            <RouterLink to="/my-progress/time">
                                <h2 class="heading h5">Study time</h2>
                            </RouterLink>
                        </div>
                    </div>
                    <div class="col-md p-0 position-relative">
                        <div class="row">
                            <div class="col">
                                <RouterLink
                                    to="/my-progress/super-challenging"
                                    class="col"
                                >
                                    <h2 class="h5 heading">
                                        Super challenging skills
                                    </h2>
                                </RouterLink>
                                <ul
                                    v-if="
                                        teacherAnalyticsStore
                                            .studentMultipleFails.length > 0
                                    "
                                >
                                    <li
                                        class="failed-skills"
                                        v-for="skill in teacherAnalyticsStore.studentMultipleFails"
                                        :key="skill.id"
                                    >
                                        <RouterLink
                                            :to="'/skills/' + skill.url"
                                            target="_blank"
                                            >{{ skill.name }}</RouterLink
                                        >
                                    </li>
                                </ul>
                                <p v-else>Nothing to worry about yet</p>
                            </div>
                            <div class="col">
                                <h2 class="h5 heading">Stats</h2>
                                <ul>
                                    <li><strong>Skills passed:</strong> 25</li>
                                    <li>
                                        <strong>Total time spent:</strong> 5:00
                                    </li>
                                    <li>
                                        <RouterLink to="/my-progress/tokens"
                                            ><strong>Tokens used:</strong>
                                            10,000</RouterLink
                                        >
                                    </li>
                                </ul>
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
.failed-skills a {
    color: darkred;
    text-decoration: none;
}

.chart-heading {
    top: 5px;
    left: 5px;
}

#progress-chart-container {
    height: 100%;
    width: 100%;
}

.dash-row {
    height: 50%;
}

.chart-container {
    border: 1px solid black;
    height: 100%;
}

.dashboard {
    display: flex;
    height: calc(100vh - 88px);
    overflow: hidden;
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

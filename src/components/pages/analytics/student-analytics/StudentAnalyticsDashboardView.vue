<script>
import { RouterLink } from 'vue-router';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';

import ProgressChart from '../../../components/analytics/full-size/dashboard/ProgressChart.vue';
export default {
    name: 'Student-Dashboard',
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            userDetailsStore,
            analyticsStore
        };
    },
    data() {
        return {
            // hide for mobile phones
            showSidebar: true,
            screenWidth: screen.width,
            // Sidebar variables
            isStudentData: true,
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
                student: [],
                average: []
            },
            // Notifications
            isAboveTheCurve: false
        };
    },
    components: {
        ProgressChart
    },
    async created() {
        await this.analyticsStore.getStudentProgress(
            this.userDetailsStore.userId,
            this.userDetailsStore.tenantId
        );

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
        toggleSidebar() {
            this.showSidebar = !this.showSidebar;
        }
    }
};
</script>

<template>
    <div class="dashboard">
        <!-- Sidebar -->
        <!-- dont show on mobile -->
        <div
            v-if="screenWidth > 768"
            class="sidebar"
            :class="{ hidden: !showSidebar }"
        >
            <!-- filters - student and / or school average -->
            <h1 class="h2">Who</h1>
            <p>
                <label class="control control-checkbox">
                    <input
                        type="checkbox"
                        v-model="isStudentData"
                        @change="HandleProgressData"
                    />
                    You
                </label>
            </p>
            <p>
                <label class="control control-checkbox">
                    <input
                        type="checkbox"
                        v-model="isSchoolData"
                        @change="HandleProgressData"
                    />
                    School average
                </label>
            </p>

            <h1 class="h2">Subjects</h1>
            <ul>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isLanguageData"
                        />
                        Language
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isMathData"
                        />
                        Math
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isHistoryData"
                        />
                        History
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isLifeData"
                        />
                        Life
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isCSData"
                        />
                        Computer Science
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isSAndIData"
                        />
                        Science & Invention
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input
                            type="checkbox"
                            value="true"
                            v-model="isDIData"
                        />
                        Dangerous Ideas
                    </label>
                </li>
            </ul>
        </div>

        <!-- Main Content -->
        <div class="main">
            <!-- <header class="header">
                <button class="btn primary-btn" @click="toggleSidebar">
                    {{ showSidebar ? 'Hide Sidebar' : 'Show Sidebar' }}
                </button>
                <h1>Dashboard</h1>
            </header> -->

            <div class="content container-fluid">
                <!-- This is where charts / dashboard cards go -->
                <div class="dash-row row">
                    <RouterLink
                        to="/my-progress/skills"
                        id="progress-chart-container"
                        class="col-md chart-container p-0 position-relative"
                    >
                        <h2 class="position-absolute chart-heading h5">
                            Skills mastered
                        </h2>
                        <ProgressChart
                            ref="progressChart"
                            v-if="
                                progressData.student.length > 0 ||
                                progressData.average.length > 0
                            "
                        />
                    </RouterLink>
                    <div class="col-md chart-container p-0">
                        <div
                            v-if="isAboveTheCurve"
                            class="alert alert-success"
                            role="alert"
                        >
                            Nice going, you're above the curve!
                        </div>
                        <div v-else class="alert alert-warning" role="alert">
                            You're below the curve, keep trying!
                        </div>
                    </div>
                </div>
                <div class="dash-row row">
                    <RouterLink
                        to="/my-progress/time"
                        class="col-md chart-container p-0 position-relative"
                    >
                        <h2 class="position-absolute chart-heading h5">
                            Time spent
                        </h2>
                    </RouterLink>
                    <RouterLink
                        to="/my-progress/tokens"
                        class="col-md chart-container p-0 position-relative"
                    >
                        <h2 class="position-absolute chart-heading h5">
                            Tokens used
                        </h2>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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
}

.dashboard {
    display: flex;
    height: calc(100vh - 88px);
    font-family: sans-serif;
    overflow: hidden;
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

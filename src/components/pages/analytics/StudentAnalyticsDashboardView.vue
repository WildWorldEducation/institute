<script>
import { useAnalyticsStore } from '../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

import ProgressChart from '../../components/analytics/full-size/students/dashboard/ProgressChart.vue';
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

        };
    },
    components: {
        ProgressChart
    },
    async created() {
        await this.analyticsStore.getStudentProgress(this.userDetailsStore.userId, this.userDetailsStore.tenantId);
        console.log(this.analyticsStore.progress)
    },

    methods: {
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
        <div v-if="screenWidth > 768" class="sidebar" :class="{ hidden: !showSidebar }">
            <!-- filters - student and / or school average -->
            <h1 class="h2">Who</h1>
            <p>
                <label class="control control-checkbox">
                    <input type="checkbox" value="true" v-model="isStudentData" />
                    You
                </label>
            </p>
            <p>
                <label class="control control-checkbox">
                    <input type="checkbox" value="true" v-model="isSchoolData" />
                    School average
                </label>
            </p>

            <h1 class="h2">Subjects</h1>
            <ul>
                <li>
                    <label class="control control-checkbox">
                        <input type="checkbox" value="true" v-model="isLanguageData" />
                        Language
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input type="checkbox" value="true" v-model="isMathData" />
                        Math
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input type="checkbox" value="true" v-model="isHistoryData" />
                        History
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input type="checkbox" value="true" v-model="isLifeData" />
                        Life
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input type="checkbox" value="true" v-model="isCSData" />
                        Computer Science
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input type="checkbox" value="true" v-model="isSAndIData" />
                        Science & Invention
                    </label>
                </li>
                <li>
                    <label class="control control-checkbox">
                        <input type="checkbox" value="true" v-model="isDIData" />
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
                    <div id="progress-chart-container" class="col-md chart-container p-0">
                        <ProgressChart v-if="analyticsStore.progress.student.length > 0"
                            :data="analyticsStore.progress" colour="purple" />
                        <p v-else>No data yet</p>
                    </div>
                    <div class="col-md chart-container p-0">2</div>
                </div>
                <div class="dash-row row">
                    <div class="col-md chart-container p-0">3</div>
                    <div class="col-md chart-container p-0">4</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
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

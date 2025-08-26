<script>
import { RouterLink } from 'vue-router';
import { useAnalyticsStore } from '../../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../../stores/UsersStore';
import ProgressChart from '../../../components/analytics/full-size/dashboard/ProgressChart.vue';

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
        ProgressChart
    },
    async created() {
        await this.analyticsStore.getSchoolProgress(
            this.userDetailsStore.tenantId
        );

        // Get teachers
        await this.usersStore.getInstructorsByTenant(
            this.userDetailsStore.tenantId
        );
        // Get students
        await this.usersStore.getStudentsPerTenant(
            this.userDetailsStore.tenantId
        );

        //        await this.HandleProgressData();
    },
    methods: {
        async HandleProgressData() {
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
            <label class="control control-checkbox mb-2">
                <input
                    type="checkbox"
                    v-model="isEveryone"
                    @change="HandleProgressData"
                />
                Everyone
            </label>

            <!-- Teachers' classes -->
            <div class="accordion accordion-flush" id="classesAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne">
                        <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#classes"
                            aria-expanded="false"
                            aria-controls="classes"
                        >
                            <strong>Classes</strong>
                        </button>
                    </h2>
                    <div
                        id="classes"
                        class="accordion-collapse collapse"
                        aria-labelledby="headingOne"
                        data-bs-parent="#classesAccordion"
                    >
                        <div class="accordion-body">
                            <p>
                                <label
                                    v-for="teacher in usersStore.instructors"
                                    class="control control-checkbox"
                                >
                                    <input
                                        type="checkbox"
                                        @change="HandleProgressData"
                                    />
                                    <RouterLink
                                        :to="`/reports/class/${teacher.id}`"
                                        >{{ teacher.username }}'s
                                        class</RouterLink
                                    >
                                </label>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Students -->
            <div class="accordion accordion-flush" id="studentAccordion">
                <div class="accordion-item">
                    <h2 class="accordion-header" id="headingOne">
                        <button
                            class="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#students"
                            aria-expanded="false"
                            aria-controls="students"
                        >
                            <strong>Students</strong>
                        </button>
                    </h2>
                    <div
                        id="students"
                        class="accordion-collapse collapse"
                        aria-labelledby="headingOne"
                        data-bs-parent="#studentAccordion"
                    >
                        <div class="accordion-body">
                            <p>
                                <label
                                    v-for="student in usersStore.studentsPerTenant"
                                    class="control control-checkbox"
                                >
                                    <input
                                        type="checkbox"
                                        @change="HandleProgressData"
                                    />
                                    <RouterLink
                                        :to="`/reports/student/${student.id}`"
                                        >{{ student.username }}</RouterLink
                                    >
                                </label>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <h1 class="h2 mt-3">Subjects</h1>
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
            <div class="content container-fluid">
                <!-- This is where charts / dashboard cards go -->
                <div class="dash-row row">
                    <RouterLink
                        to="/reports/academics"
                        id="progress-chart-container"
                        class="col-md chart-container p-0 position-relative"
                    >
                        <h2 class="position-absolute chart-heading h5">
                            Academics
                        </h2>
                        <ProgressChart
                            ref="progressChart"
                            v-if="progressData.school.length > 0"
                        />
                    </RouterLink>
                    <div class="col-md chart-container p-0 position-relative">
                        <h2 class="position-absolute chart-heading h5">
                            Notifications
                        </h2>
                    </div>
                </div>
                <div class="dash-row row">
                    <RouterLink
                        to="/reports/engagement"
                        class="col-md chart-container p-0 position-relative"
                    >
                        <h2 class="position-absolute chart-heading h5">
                            Engagement
                        </h2>
                    </RouterLink>
                    <RouterLink
                        to="/reports/cost"
                        class="col-md chart-container p-0 position-relative"
                    >
                        <h2 class="position-absolute chart-heading h5">Cost</h2>
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Accordions */
.accordion-button {
    background-color: #2c3e50;
    color: white;
    border-radius: 0px !important;
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

.content {
    flex: 1;
    height: 100%;
}
</style>
